import React, { forwardRef, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Input, Select, MenuItem, Slide, AppBar, Toolbar, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, IconButton, Card, CardContent, CardActions, Typography, Button, Alert, Avatar, Divider, colors, FormGroup, Checkbox, LinearProgress } from '@mui/material';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from './Firebase';
import { AppContext, ClassContext, QuizContext } from '../AppContext';
import { calculatePoints, calculateQuestionTotalPoints, getQuestionScore } from '../Utils';

const xTransition = forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});
export const ActivityReviewDialog = (props) => {
    const [questions, setQuestions] = useState([]);
    const [userResponse, setUserResponse] = useState({});
    const [showLoading, setShowLoading] = useState(false);
    const { openReviewActivityDialog, setOpenReviewActivityDialog, activityToReview, setActivityToReview, userId, setUserId } = useContext(QuizContext);
    const { setSnackbarOpen, setSnackbarMsg, currentUserData, setBackdropOpen } = useContext(AppContext);
    const { openedClass } = useContext(ClassContext);
    useEffect(() => {
        getQuestions();
        getActivityResponse();
    }, [activityToReview]);
    const getQuestions = async () => {
        const questionRefs = collection(db, 'questions');
        try {
            console.log('activityToReview', activityToReview);

            const filteredQuery = query(questionRefs, where('quizId', '==', activityToReview.id), where('classId', '==', openedClass.classId));
            const querySnapshot = await getDocs(filteredQuery);
            const questionlist = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setQuestions(questionlist);
            // console.log('questionslist', questionlist);
        } catch (error) {
            console.log(error);
        }
    }
    const getActivityResponse = async () => {
        let gotResponses = [];
        try {
            const responseRef = collection(db, 'QuizResponses');
            const responseQuery = query(responseRef, where('classId', '==', openedClass.id), where('quizId', '==', activityToReview.id), where('uid', '==', userId));
            const queryResult = await getDocs(responseQuery);


            gotResponses = queryResult.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserResponse(gotResponses[0]);
            // queses = gotResponses;
            console.log('Response to review: ', gotResponses[0]);

        } catch (error) {
            console.log('error getting responses', error);
        }
    };
    const writeFeedOnchange = (e, questionId) => {
        const userres = { ...userResponse };
        const feed = e.target.value;
        userres.feedback = feed;
        setUserResponse(userres);

    }
    const allocPointsEssaySelction = (event, questionId) => {
        event.preventDefault();
        const foundQuestin = questions.find(q => q.id === questionId);
        const userres = { ...userResponse };
        let points = Number(event.target.value);
        if (points < 0) {
            event.target.value = 0;
            points = 0;
        } else if (points > calculateQuestionTotalPoints(foundQuestin)) {
            event.target.value = Number(calculateQuestionTotalPoints(foundQuestin));
            points = Number(calculateQuestionTotalPoints(foundQuestin));
        }
        userres.questionResponse[questionId].points = points;
        userres.score = calculatePoints(userres.questionResponse);
        setUserResponse(userres);
    }
    const saveResponse = async () => {
        const userreponse = { ...userResponse };
        userreponse.status = 'final';
        setShowLoading(true);
        try {
            const docRef = doc(db, "QuizResponses", userResponse.id);
            await updateDoc(docRef, userreponse);
            setOpenReviewActivityDialog(false);
        } catch (e) {
            console.log('error updating response', e);

        }
        setShowLoading(false);
    }
    return (
        <>
            <Dialog
                fullScreen
                open={openReviewActivityDialog}
                onClose={() => { }}
                TransitionComponent={xTransition}>
                <AppBar sx={{ borderRadius: '25px', marginTop: '.2rem', backgroundColor: 'white', position: 'sticky', boxShadow: 'none' }}>

                    <Toolbar>
                        <IconButton
                            edge="start"
                            color={'#000'}
                            onClick={() => { setOpenReviewActivityDialog(false) }}
                            aria-label="close">
                            <md-icon>arrow_back</md-icon>
                        </IconButton>
                        <Typography sx={{ color: '#000', ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="h6" component="div">
                            Response Review
                        </Typography>
                        <Tooltip title='Score onbtained'>
                            <Typography
                                component="span"
                                variant="body"
                                sx={{ color: 'text.primary', display: 'inline' }}>
                                score: {userResponse.score} / {userResponse.totalScore}
                            </Typography>
                        </Tooltip>
                    </Toolbar>
                    {showLoading && <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>}
                </AppBar>
                <Box sx={{ m: 2 }}>
                    <Typography
                        component="span"
                        variant="body"
                        sx={{ color: 'text.primary', display: 'inline' }}>
                        Title:  {activityToReview.title}
                    </Typography>
                    <br />
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'text.primary', display: 'inline' }}>
                        Description: {activityToReview.description}
                    </Typography>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>

                        {/* ------------------------------------------------------------------------------------------- */}
                        {questions.map((question, index) => {
                            let responseFound = userResponse.questionResponse ? userResponse.questionResponse[question.id] : null;
                            // const [points, setPoints] = useState(responseFound.score || 0);
                            // console.log('reponse found: ', userResponse);
                            const checkIndicator = { color: colors.green.A100, backgroundColor: colors.green[800] };
                            const qlables = {
                                'matchingType': 'Matching Type',
                                'singleChoice': 'Single Choice',
                                'multiChoice': 'Multiple Choice',
                                'fileUpload': 'File Attachment',
                                'essay': 'Essay',
                            }

                            if (responseFound)
                                return (
                                    <ListItem sx={{ minHeight: '150px', borderRadius: '24px', cursor: 'pointer' }} button={true} key={question.id} onClick={() => { }} alignItems="flex-start"
                                        secondaryAction={openedClass.classRole == 'teacher' ?
                                            <Stack className='quiz-actions'>
                                                {/* <Chip sx={{ alignSelf: 'center' }} size='small' label='Set Final Score' onClick={() => { }} variant='outlined' /> */}
                                                <TextField label="Update score" sx={{ width: '8rem' }} onChange={(e) => allocPointsEssaySelction(e, question.id)} defaultValue={responseFound.points} type='number' variant="filled" />
                                            </Stack>
                                            : <></>
                                        }>
                                        <ListItemAvatar>
                                            <Avatar sx={{ ...checkIndicator }}>
                                                <span className="material-symbols-rounded">checklist</span>
                                            </Avatar>

                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{ color: 'text.primary', display: 'inline' }}>
                                                    {question.question}
                                                </Typography>}
                                            secondary={
                                                <>
                                                    <div style={{ maxWidth: '500px', lineClamp: '2' }}> {qlables[question.type]}
                                                    </div>
                                                    {question.type == 'essay' &&
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{ color: 'text.seconday', display: 'inline' }}>
                                                            Answer: <strong>{responseFound.response}</strong>
                                                        </Typography>}
                                                    {question.type == 'fileUpload' &&
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{ color: 'text.seconday', display: 'inline' }}>
                                                            Answer: <strong><a href={responseFound.response} target="_blank">{responseFound.response}</a></strong>
                                                        </Typography>}
                                                    {question.type == 'singleChoice' &&
                                                        <FormControl>
                                                            <RadioGroup

                                                                aria-labelledby="demo-radio-buttons-group-label"
                                                                defaultValue={responseFound.response}
                                                                name="radio-buttons-group"
                                                            >
                                                                {
                                                                    question.choices.map(choice => {
                                                                        return (<>
                                                                            <FormControlLabel disabled='true' value={choice.value} control={<Radio />} label={choice.value} />
                                                                        </>)
                                                                    })
                                                                }
                                                            </RadioGroup>
                                                        </FormControl>
                                                    }
                                                    {question.type == 'multiChoice' &&
                                                        <FormControl>
                                                            <FormLabel>Selected answer</FormLabel>
                                                            <FormGroup>
                                                                {
                                                                    question.choices.map(choice => {
                                                                        return (<>
                                                                            <FormControlLabel
                                                                                checked={responseFound.response.includes(choice.value)}
                                                                                disabled='true'
                                                                                key={choice.value} control={<Checkbox />}
                                                                                label={choice.value} />
                                                                        </>)
                                                                    })
                                                                }
                                                            </FormGroup>
                                                        </FormControl>
                                                    }
                                                    {question.type == 'matchingType' &&
                                                        question.choices.map(choice => {
                                                            return (<>
                                                                <br />
                                                                <Typography
                                                                    component="span"
                                                                    variant="title"
                                                                    sx={{ color: 'text.seconday', display: 'inline' }}>
                                                                    {choice.value}: <strong><u>{responseFound.response[choice.value]}</u></strong>
                                                                </Typography>
                                                            </>)
                                                        })
                                                    }
                                                    < br />
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{ color: 'text.seconday', display: 'inline' }}>
                                                        points: <strong>{responseFound.points}/{calculateQuestionTotalPoints(question)}</strong>
                                                    </Typography>
                                                </>
                                            }
                                        />
                                        <Divider variant="inset" component="li" />
                                    </ListItem>
                                )
                            else
                                return (<></>)
                        })}
                    </List>
                    <TextField
                        // onPaste={onpasteHandler}
                        onChange={writeFeedOnchange}
                        sx={{ width: '100%' }}
                        id="filled-multiline-static"
                        label="Teacher's feedback"
                        defaultValue={userResponse.feedback}
                        multiline
                        disabled={openedClass.classRole == 'student'}
                        minRows={2}
                        maxRows={5}
                        variant="outlined" />
                    {openedClass.classRole == 'teacher' && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', m: 2 }}>

                        <Button sx={{ alignSelf: 'center', m: 2 }} size='large' onClick={saveResponse} variant="contained">Save response</Button>
                    </Box>}
                </Box>

            </Dialog>
        </>
    )
}
