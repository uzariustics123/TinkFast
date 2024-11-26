import React, { forwardRef, useContext, useEffect, useReducer, useRef } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Input, Select, MenuItem, Slide, AppBar, Toolbar, IconButton, Card, CardContent, CardActions, Typography, Button } from '@mui/material';
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

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
export const QuizView = () => {

    const swiperRef = useRef(null);
    const swiper = useSwiper();
    const { openedClass } = useContext(ClassContext);
    const { setSnackbarOpen, setSnackbarMsg } = useContext(AppContext);
    const { quizOpenDialog, setQuizOpenDialog, quizOpenData, setQuizOpenData } = useContext(QuizContext);

    const [quizQuiestions, dispatchQuestion] = useReducer((currentQuestions, action) => {
        if (action.type === 'setQuestions') {
            return action.questions;
        }
        return currentQuestions;
    }, []);
    const [quizResponse, dispatchResponse] = useReducer((currentResponse, action) => {

    }, [{}]);
    useEffect(() => {
        getQuestions();
    }, [quizOpenData]);

    const getQuestions = async () => {
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizesRef = collection(classRef, 'quizes');
        const quizDoc = doc(quizesRef, quizOpenData.id);
        const questionRefs = collection(quizDoc, 'questions');
        try {
            const querySnapshot = await getDocs(questionRefs);
            querySnapshot.docs.forEach((item) => {
                console.log(item.data());

            });
            const questionlist = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            dispatchQuestion({
                type: 'setQuestions',
                questions: questionlist
            });
            console.log('questionslist', questionlist);
        } catch (error) {
            console.log(error);
        }
    }
    const nextSlide = (e) => {
        if (swiperRef.current) {
            swiperRef.current.slideNext(); // Navigate to the next slide
        } else {
            console.log(swiperRef.current);
            console.log('swps', swiper);

        }
    }
    function SlideNextButton() {
        const swiper = useSwiper();
        const clickbtn = (e) => {
            swiper.slideNext()
        }
        return <Button onClick={clickbtn}>Next Question</Button>;
    }
    function SlidePrevButton() {
        const swiper = useSwiper();
        const clickbtn = (e) => {
            swiper.slidePrev()
        }
        return <Button onClick={clickbtn}>Previous Question</Button>;
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
                                onClick={() => { setQuizOpenDialog(!quizOpenDialog) }}
                                aria-label="close">
                                <md-icon>arrow_back</md-icon>
                            </IconButton>
                        </Toolbar>

                    </AppBar>
                    <div className='quizPager' style={{
                    }}>
                        <Swiper
                            useRef={swiperRef}
                            spaceBetween={1}
                            effect="cards"
                            modules={[EffectCards]}
                            slidesPerView={1}
                            onSlideChange={() => console.log('slide change')}
                            onSwiper={(swiper) => { swiperRef.current = swiper }}
                            allowSlideNext={true}
                            noSwiping={true}
                            noSwipingClass="swiper-no-swiping" // Default class for no swiping
                            slideShadows={false}
                            style={{ width: '80%', minHeight: '25rem' }}
                        >

                            {quizQuiestions.map((quiz, index) => (

                                <SwiperSlide key={quiz.id}>
                                    <Card className="swiper-no-swiping" variant="outlined">
                                        <CardContent>
                                            {quiz.type == 'essay' && <Essay questionData={quiz} />}
                                            {quiz.type == 'multiChoice' && <MultiChoice questionData={quiz} choices={quiz.choices} />}
                                            {quiz.type == 'singleChoice' && <SingleChoice questionData={quiz} choices={quiz.choices} />}
                                            {quiz.type == 'matchingType' && <MatchingType questionData={quiz} choices={quiz.choices} />}
                                            {/* <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                            Word of the Day
                                        </Typography> */}
                                            {/* <Typography variant="h5" component="div">
                                            benevolent
                                        </Typography> */}
                                            {/* <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography> */}
                                            {/* <Typography variant="body2">
                                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Hic voluptatibus ipsam harum exercitationem doloribus magni repellendus repellat veniam molestiae! Voluptatem asperiores consequuntur non sed ab atque molestiae quisquam repellat. Corporis! Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi quod excepturi quos esse. Quisquam voluptas ut libero vitae. Ratione, quas? Quisquam consequuntur sit odio commodi debitis modi exercitationem sequi minima. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perferendis debitis modi assumenda quam exercitationem impedit eligendi alias id veritatis excepturi blanditiis soluta, dolorum dolorem ipsa quaerat praesentium, accusantium ea inventore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, voluptatum? Modi itaque suscipit, debitis, inventore enim illum architecto dignissimos sequi hic quaerat perferendis libero dolore corporis ipsa. Dolorem, est nemo! Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium error deserunt doloribus aliquid numquam non doloremque repellendus enim soluta magni, tenetur cum quae, dolore veritatis. Ducimus laboriosam est quae ipsam!
                                        </Typography> */}

                                        </CardContent>
                                        <CardActions>
                                            {/* <Button onClick={nextSlide} size="small">Next</Button> */}
                                            <SlidePrevButton />
                                            <SlideNextButton />
                                        </CardActions>
                                    </Card>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </Dialog>
            </QuizResponseContext.Provider >
        </>
    )
}
