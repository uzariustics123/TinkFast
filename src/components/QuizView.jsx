import React, { forwardRef, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Input, Select, MenuItem, Slide, AppBar, Toolbar, IconButton, Card, CardContent, CardActions, Typography, Button, Alert } from '@mui/material';
import { AppContext, ClassContext, QuizContext, QuizResponseContext } from '../AppContext';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { collection, addDoc, query, getDoc, getDocs, where, doc, updateDoc } from "firebase/firestore"
import './styles/quizView.css';
import { db } from './Firebase';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-cards';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { Controller, Navigation, Pagination } from 'swiper/modules';
import { EffectCards } from 'swiper/modules';
import Essay from './QuizTypes/Essay';
import MultiChoice from './QuizTypes/MultiChoice';
import SingleChoice from './QuizTypes/SingleChoice';
import MatchingType from './QuizTypes/MatchingType';
import { getQuizScore, getQuizTotalPoints } from '../Utils';
import { FileAttachment } from './QuizTypes/FileAttachment';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
export const QuizView = () => {

    const swiperRef = useRef(null);
    const swiper = useSwiper();
    const { openedClass } = useContext(ClassContext);
    const { setSnackbarOpen, setSnackbarMsg, currentUserData, setBackdropOpen } = useContext(AppContext);
    const { quizOpenDialog, setQuizOpenDialog, quizOpenData, setQuizOpenData } = useContext(QuizContext);
    const [activeQIndex, setActiveQIndex] = useState(0);


    const [quizQuiestions, dispatchQuestion] = useReducer((currentQuestions, action) => {
        if (action.type === 'setQuestions') {
            return action.questions;
        }
        return currentQuestions;
    }, []);

    const [quizResponse, dispatchResponse] = useReducer((currentResponse, action) => {
        const question = action.question;
        const responseData = { ...currentResponse };
        const userResponse = action.data;
        switch (action.type) {
            case 'setSingleChoiceResponse':
                responseData.questionResponse[question.id] = userResponse;
                return responseData;
            case 'setMultipleChoiceResponse':
                responseData.questionResponse[question.id] = userResponse;
                return responseData;
            case 'setMatchingTypeResponse':
                responseData.questionResponse[question.id] = userResponse;
                return responseData;
            case 'setEssayResponse':
                responseData.questionResponse[question.id] = userResponse;
                return responseData;
            case 'setFileUpResponse':
                responseData.questionResponse[question.id] = userResponse;
                return responseData;
            case 'reset':
                const resetData = {
                    score: 0,
                    status: 'partial',
                    category: quizOpenData.category,
                    quizId: quizOpenData.id,
                    uid: currentUserData.uid,
                    classId: openedClass.classId,

                    questionResponse: {}
                }
                return resetData;
            default:
                return currentResponse;
        }

    }, {
        score: 0,
        status: 'partial',
        category: 'quiz',
        uid: currentUserData.uid,
        classId: openedClass.classId,
        questionResponse: {}
    });
    const [cheatingAttempts, setCheatingAttempt] = useState(0);
    // page iactivity detection

    useEffect(() => {
        let cheatLimits = cheatingAttempts;
        const openPanel = quizOpenDialog;
        const handleVisibilityChange = () => {
            if (document.hidden && quizOpenDialog) {
                setCheatingAttempt(cheatLimits += 1);
                console.log('cheating dialog', quizOpenDialog);
            }
            console.log('cheating attempt ', document.hidden);

        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [quizOpenDialog]);
    // first load
    useEffect(() => {
        getQuestions();
        setActiveQIndex(0);
        dispatchResponse({
            type: 'reset'
        });
        setCheatingAttempt(0);
    }, [quizOpenData]);

    const getQuestions = async () => {
        // const classRef = doc(db, 'classes', openedClass.classId);
        // const quizesRef = collection(classRef, 'quizes');
        // const quizDoc = doc(quizesRef, quizOpenData.id);
        const questionRefs = collection(db, 'questions');
        try {
            const filteredQuery = query(questionRefs, where('quizId', '==', quizOpenData.id), where('classId', '==', openedClass.classId));
            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.docs.forEach((item) => {
                console.log(item.data());

            });
            const questionlist = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            dispatchQuestion({
                type: 'setQuestions',
                questions: questionlist
            });
            // console.log('questionslist', questionlist);
        } catch (error) {
            console.log(error);
        }
    }
    const saveQuizResponse = () => {
        const responseRef = collection(db, 'QuizResponses');
        setBackdropOpen(false);
        try {
            const finalData = { ...quizResponse };
            finalData.score = getQuizScore(finalData.questionResponse);
            finalData.totalScore = getQuizTotalPoints(quizQuiestions);
            const saveResult = addDoc(responseRef, finalData);
            // console.log('finaldata', finalData);
            setSnackbarMsg('Your response has been saved');
            setSnackbarMsg(true);
            setQuizOpenDialog(false);

        } catch (error) {
            console.log('error', quizResponse);
            console.log(error);
            setSnackbarMsg(error.message);
            setSnackbarOpen(true);
        }
        setBackdropOpen(false);
    }
    const SlideNextButton = (props) => {
        const newprop = { ...props };
        const item = props.item;
        const type = item.type;
        const index = quizQuiestions.indexOf(item);
        const swiper = useSwiper();
        const foundResponse = quizResponse.questionResponse[item.id];
        newprop.disabled = foundResponse == undefined;
        if (foundResponse != undefined)
            switch (type) {
                case 'essay':
                    // newprop.disabled = foundResponse.;
                    break;
                case 'multiChoice':
                    newprop.disabled = foundResponse.response.length < 1;
                    break;
                case 'singleChoice':
                    break;
                case 'matchingType':
                    newprop.disabled = Object.keys(foundResponse.response).length < 1;
                    break;
                default:
                    break;
            }
        const clickbtn = (e) => {
            console.log('index of ', item.question, quizQuiestions.indexOf(item));
            if (index == (quizQuiestions.length - 1)) {
                // save response
                saveQuizResponse();
            }
            swiper.slideNext()
        }
        return <Button {...newprop} onClick={clickbtn}>{(index == (quizQuiestions.length - 1)) ? 'Save' : 'Next'}</Button>;
    }
    const SlidePrevButton = (props) => {
        const newprop = { ...props };
        const item = props.item;
        const type = item.type;
        const index = quizQuiestions.indexOf(item);
        const swiper = useSwiper();
        switch (type) {
            case 'essay':
                break;
            case 'multiChoice':
                break;
            case 'singleChoice':
                break;
            case 'matchingType':
                break;

            default:
                break;
        }

        newprop.disabled = index == 0;
        const clickbtn = (e) => {
            console.log('index of ', item.question, quizQuiestions.indexOf(item));
            swiper.slidePrev()
        }
        return <Button {...newprop} onClick={clickbtn}>Previous</Button>;
    }
    const onSlideChange = (swiper) => {
        // console.log('active item', swiper.activeIndex);
        setActiveQIndex(swiper.activeIndex);
    }

    /**
     * @main
     */
    return (
        <>
            <QuizResponseContext.Provider value={{ quizResponse, dispatchResponse }}>

                <Dialog
                    fullScreen
                    open={quizOpenDialog}
                    onClose={() => { }}
                    TransitionComponent={Transition}>
                    <AppBar sx={{ borderRadius: '25px', marginTop: '.2rem', backgroundColor: 'white', position: 'sticky', boxShadow: 'none' }}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color={'#000'}
                                onClick={() => { setQuizOpenDialog(false) }}
                                aria-label="close">
                                <md-icon>arrow_back</md-icon>
                            </IconButton>
                        </Toolbar>

                    </AppBar>
                    <div className='quizPager' style={{
                    }}>
                        {cheatingAttempts > 0 && <Box direction='row' sx={{ m: 2 }}><Alert severity={cheatingAttempts > 2 ? "error" : 'warning'}>{
                            cheatingAttempts == 1 ? `Warning! Cheating attempt detected. Please avoid switching tabs/apps when taking a quiz. \nCheat attempts: ${cheatingAttempts}` :
                                cheatingAttempts == 2 ? 'Take this seriously! Attempts ' + cheatingAttempts + '/3' :
                                    cheatingAttempts > 2 ? `Quiz won't be recorded! Attempts 3/3` :
                                        <></>}</Alert></Box>}
                        <Swiper
                            // useRef={swiperRef}
                            spaceBetween={1}
                            effect="cards"
                            modules={[EffectCards]}
                            slidesPerView={1}
                            onSlideChange={onSlideChange}
                            onSwiper={(swiper) => { swiperRef.current = swiper }}
                            allowSlideNext={true}
                            noSwiping={true}
                            noSwipingClass="swiper-no-swiping" // Default class for no swiping
                            slideShadows={false}
                            style={{ width: '80%', minHeight: '25rem' }}
                        >

                            {quizQuiestions.map((quiz, index) => {

                                return (<SwiperSlide key={quiz.id}>
                                    <Card className="swiper-no-swiping" variant="outlined">
                                        <CardContent>
                                            asdf{swiperRef.current.activeIndex}
                                            {quiz.type == 'essay' && <Essay questionData={quiz} />}
                                            {quiz.type == 'fileUpload' && <FileAttachment composeMode={false} questionData={quiz} />}
                                            {quiz.type == 'multiChoice' && <MultiChoice questionData={quiz} choices={quiz.choices} />}
                                            {quiz.type == 'singleChoice' && <SingleChoice questionData={quiz} choices={quiz.choices} />}
                                            {quiz.type == 'matchingType' && <MatchingType questionData={quiz} choices={quiz.choices} />}

                                        </CardContent>
                                        <CardActions>
                                            {activeQIndex == index &&
                                                <>
                                                    <SlidePrevButton item={quiz} />
                                                    <SlideNextButton item={quiz} />
                                                </>
                                            }
                                        </CardActions>
                                    </Card>
                                </SwiperSlide>)
                            })}
                        </Swiper>
                    </div>
                </Dialog>
            </QuizResponseContext.Provider >
        </>
    )
}
