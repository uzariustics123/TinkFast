import React, { forwardRef, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Input, Select, MenuItem, Slide, AppBar, Toolbar, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, IconButton, Card, CardContent, CardActions, Typography, Button, Alert, Avatar, Divider, colors } from '@mui/material';
import { collection, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from './Firebase';
import { ClassContext, QuizContext } from '../AppContext';
import { setUserId } from 'firebase/analytics';
const xTransition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
export const ViewActivityResponsesDialog = () => {
    const { activityResponsesDialog, setActivityResponsesDialogOpen, activityItemToViewResponses, activityToReview, openReviewActivityDialog, setOpenReviewActivityDialog, setActivityToReview, userId, setUserId } = useContext(QuizContext);
    const { openedClass } = useContext(ClassContext);
    const [participantes, setParticipantes] = useState([{}]);
    const [responses, setResponses] = useState([]);
    useEffect(() => {
        console.log('activityItemToViewResponses', activityItemToViewResponses);

        getActivityResopnses();
        getClassStudents();
    }, [activityItemToViewResponses, openReviewActivityDialog]);
    const getActivityResopnses = async () => {
        let gotResponses = [];
        try {
            const responseRef = collection(db, 'QuizResponses');
            const responseQuery = query(responseRef, where('classId', '==', openedClass.id), where('quizId', '==', activityItemToViewResponses.id));
            const queryResult = await getDocs(responseQuery);
            // console.log('query result: ' + queryResult);

            gotResponses = queryResult.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResponses(gotResponses);
            // queses = gotResponses;
            console.log('Responses got: ', gotResponses);

        } catch (error) {
            console.log('error getting responses', error);
        }
    };
    const getClassStudents = async () => {
        console.log('getting students');
        const participants = [];
        let participantsUIDs = [];
        // let participantsList = [];
        let participantsMembershipData = [];
        try {
            const filteredQuery = query(collection(db, 'classMembers'), where('classId', '==', openedClass.id),
                where('classRole', '!=', 'teacher'),
                where('status', '==', 'accepted'));

            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.forEach((doc) => {
                participantsUIDs.push(doc.data().uid);
                if (doc.data().classRole !== 'teacher')
                    participantsMembershipData.push({ membershipDoc: doc.id, ...doc.data() });
                else {
                }
                // console.log('class role: ' + doc.data().classRole);
            });
            let startingItem = 0;
            const getUserData = async () => {
                try {
                    const usersToBeGet = participantsUIDs.slice(startingItem, 30);
                    const userQuery = query(collection(db, 'users'), where('uid', 'in', usersToBeGet));
                    const queryResult = await getDocs(userQuery);
                    queryResult.forEach((doc) => {
                        let foundMembershipData = participantsMembershipData.find(foundItem => foundItem.uid === doc.data().uid);
                        participants.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                    });
                } catch (error) {
                    console.log('error getting users ', error);
                }
            }
            await getUserData();
        } catch (error) {
            console.log('1error getting users ', error);
        }
        setParticipantes(participants);
        // console.log('teachers', participantsUIDs);
    };
    const reviewActivity = (activityResponseItem) => {
        setActivityToReview(activityItemToViewResponses);
        setUserId(activityResponseItem.uid);
        setOpenReviewActivityDialog(true);
        console.log('res item', activityResponseItem);

        // setActivityResponsesDialogOpen(false);
        // setInterval(
        // , 1000);
    }
    return (
        <>
            <Dialog
                fullScreen
                open={activityResponsesDialog}
                onClose={() => { }}
                TransitionComponent={xTransition}>
                <AppBar sx={{ borderRadius: '25px', marginTop: '.2rem', backgroundColor: 'white', position: 'sticky', boxShadow: 'none' }}>

                    <Toolbar>
                        <IconButton
                            edge="start"
                            color={'#000'}
                            onClick={() => { setActivityResponsesDialogOpen(false) }}
                            aria-label="close">
                            <md-icon>arrow_back</md-icon>
                        </IconButton>
                        <Typography sx={{ color: '#000', ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="h6" component="div">
                            Responses
                        </Typography>
                    </Toolbar>

                </AppBar>
                <Box sx={{ m: 2 }}>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>

                        {responses.map((response, index) => {
                            const userFound = participantes.find(participant => participant.uid === response.uid);
                            const performanceIndicatorStyles = {};
                            console.log('id: ' + response.id);

                            const scorePercentage = response.score != 0 ? (response.score / response.totalScore) * 100 : 0;
                            let performanceIndicatorText = '';
                            if ((scorePercentage >= 75 && scorePercentage < 85)) {
                                performanceIndicatorText = 'developing';
                                performanceIndicatorStyles.color = colors.red[600];
                                performanceIndicatorStyles.border = '1px solid ' + colors.red[600];
                            }
                            else if (scorePercentage >= 85 && scorePercentage <= 89) {
                                performanceIndicatorText = 'Great';
                                performanceIndicatorStyles.color = colors.green[500];
                                performanceIndicatorStyles.border = '1px solid ' + colors.green[500];
                            }
                            else if (scorePercentage >= 90) {
                                performanceIndicatorText = 'Outstanding';
                                performanceIndicatorStyles.color = colors.green[600];
                                performanceIndicatorStyles.border = '2px solid ' + colors.green[600];
                            } else {
                                performanceIndicatorText = 'Poor';
                                performanceIndicatorStyles.color = colors.grey[600];
                                performanceIndicatorStyles.border = '1px solid ' + colors.grey[600];
                            }
                            return (
                                <>
                                    <ListItem sx={{ minHeight: '150px', borderRadius: '24px', cursor: 'pointer' }} button={true} key={response.uid} onClick={() => { }} alignItems="flex-start"
                                        secondaryAction={openedClass.classRole == 'teacher' ?
                                            <Stack className='quiz-actions'>
                                                <Chip sx={{ alignSelf: 'center' }} size='small' label='Review' onClick={() => { reviewActivity(response) }} variant='outlined' />
                                            </Stack>
                                            : <></>
                                        }>
                                        <ListItemAvatar>
                                            <Avatar src={userFound?.imgUrl ?? ''}>
                                                <span className='material-symbols-rounded'>other_admission</span>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{ color: 'text.primary', display: 'inline' }}>
                                                    {`${userFound?.firstname ?? ''} ${userFound?.lastname ?? ''}`}
                                                </Typography>}
                                            secondary={
                                                <>
                                                    <div style={{ maxWidth: '500px', lineClamp: '2' }}>performance: <Chip sx={{
                                                        fontSize: '11px',
                                                        ...performanceIndicatorStyles
                                                    }} size='small' label={
                                                        performanceIndicatorText
                                                    } variant='outlined' /></div>
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{ color: 'text.seconday', display: 'inline' }}>
                                                        Status: <strong>{response.status}</strong>
                                                    </Typography> <br />
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{ color: 'text.seconday', display: 'inline' }}>
                                                        Score: <strong>{response.score + '/' + response.totalScore}</strong>
                                                    </Typography>
                                                </>
                                            }
                                        />
                                        <Divider variant="inset" component="li" />
                                    </ListItem>
                                </>
                            )
                        })}
                    </List>
                </Box>
                {responses.length == 0 &&
                    <>
                        <Box direction='row' sx={{ m: 2 }}><Alert severity={'info'}>No responses yet</Alert></Box>
                    </>}
            </Dialog>
        </>
    )
}
