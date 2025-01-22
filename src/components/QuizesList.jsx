import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/quizesList.css';
import { useImperativeHandle, useState, forwardRef, useLayoutEffect, useEffect, useRef, useContext, useReducer } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where, doc, updateDoc } from "firebase/firestore"
import { QuizContext, ClassContext, AppContext, QuizResponseContext } from '../AppContext';
import AddQuizDialog from './AddQuizDialog';
import { Avatar, Badge, Box, Chip, colors, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { QuizView } from './QuizView';
import { ViewActivityResponsesDialog } from './ViewActivityResponsesDialog';
import { ActivityReviewDialog } from './ActivityReviewDialog';

function QuizesList() {
    const [userId, setUserId] = useState('');
    const period = useRef('prelim');
    const { openedClass } = useContext(ClassContext);
    const { setSnackbarOpen, setSnackbarMsg, currentUserData } = useContext(AppContext);
    const [openDialog, setDialogOpen] = useState(false);
    const [activityItemToViewResponses, setActivityItemToViewResponses] = useState({});
    const [activityToReview, setActivityToReview] = useState({});
    const [quizOpenDialog, setQuizOpenDialog] = useState(false);
    const [quizOpenData, setQuizOpenData] = useState({});
    const [activityResponsesDialog, setActivityResponsesDialogOpen] = useState(false);
    const [openReviewActivityDialog, setOpenReviewActivityDialog] = useState(false);
    const [responses, setResponses] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [toEditQuizDraft, setToEditQuizDraft] = useState([]);
    const [quizes, dispathQuizes] = useReducer((currentQuizes, action) => {
        if (action.type == 'setQuizes') {
            if (openedClass.classRole == 'teacher')
                return action.data;
            else
                return action.data.filter(item => item.status == 'publish')
        }
        else if (action.type == 'updateQuizStatus') {
            const foundItem = currentQuizes.find(item => item.id == action.item.id);
            if (foundItem) {
                foundItem.status = action.value;
                const newQuizes = [...currentQuizes];
                newQuizes[currentQuizes.indexOf(action.item)] = foundItem;
                return newQuizes;
            } else {
                console.log('Quiz not found');
            }

        }
        else
            return [];
    }, []);
    useEffect(() => {
        getActivities();
        getMyActivityResopnses();
    }, [quizOpenData, openDialog, activityResponsesDialog]);
    const getActivities = async () => {
        const quizRef = collection(db, 'quizes');
        const filteredQuery = query(quizRef,
            where('period', '==', period.current),
            where('classId', '==', openedClass.classId),
            where('status', '!=', 'archived')
        );
        try {
            const querySnapshot = await getDocs(filteredQuery);
            const quizList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            dispathQuizes({
                type: 'setQuizes',
                data: quizList
            });
            // console.log('quiz list', quizList);
        } catch (error) {
            console.log(error);
        }
    }
    // const getMidtermQuizes = async () => {
    //     const classRef = doc(db, 'classes', openedClass.classId);
    //     const quizRef = collection(db, 'quizes');
    //     const filteredQuery = query(quizRef, where('period', '==', 'midterm'), where('classId', '==', openedClass.classId));
    //     try {
    //         const querySnapshot = await getDocs(filteredQuery);
    //         const quizList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    //         dispathQuizes({
    //             type: 'setQuizes',
    //             data: quizList
    //         });
    //         // console.log('quiz list', quizList);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    // const getFinalsQuizes = async () => {
    //     const classRef = doc(db, 'classes', openedClass.classId);
    //     const quizRef = collection(db, 'quizes');
    //     const filteredQuery = query(quizRef, where('period', '==', 'final'), where('classId', '==', openedClass.classId));
    //     try {
    //         const querySnapshot = await getDocs(filteredQuery);
    //         const quizList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    //         dispathQuizes({
    //             type: 'setQuizes',
    //             data: quizList
    //         });
    //         // console.log('quiz list', quizList);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    const handleTabChange = (index) => {
        if (index == 0)
            period.current = 'prelim';
        else if (index == 1)
            period.current = 'midterm';
        else if (index == 2)
            period.current = 'finals';
        getActivities();
        getMyActivityResopnses();
    }
    const onQuizStatusChange = async (e, item) => {
        // const classRef = doc(db, 'classes', openedClass.classId);
        const quizesRef = collection(db, 'quizes');
        const quizDoc = doc(quizesRef, item.id);
        console.log('status', e.target.value);
        dispathQuizes({
            type: 'updateQuizStatus',
            item: item,
            value: e.target.value
        });
        try {
            await updateDoc(quizDoc, {
                status: e.target.value
            });
            setSnackbarOpen(true);
            setSnackbarMsg('Quiz updated');
        } catch (error) {
            setSnackbarOpen(true);
            setSnackbarMsg(error.message);
            console.log(error);

        }
    }
    const handleArchive = async (quizItem) => {
        if (confirm('Are you sure you want to archive this item? This will no longer be visible in your class unless reactivated by Admin'))
            try {
                let foundItem = quizes.find(item => item.id === quizItem.id);
                console.log('found item', foundItem);
                // return;

                const quizesRef = collection(db, 'quizes');
                const quizDoc = doc(quizesRef, quizItem.id);
                await updateDoc(quizDoc, {
                    status: 'archived'
                });
                setSnackbarOpen(true);
                setSnackbarMsg('Quiz archived');
                getActivities();
                getMyActivityResopnses();
            } catch (error) {
                setSnackbarOpen(true);
                setSnackbarMsg(error.message);
                console.log(error);
            }
    }
    const startQuiz = (quizItem) => {
        console.log('open', quizOpenDialog);
        setQuizOpenDialog(true);
        setQuizOpenData(quizItem);
    }
    const editQuiz = (quizItem) => {
        console.log('to edit quiz', quizItem);
        setDialogOpen(true);
        setEditMode(true);
        setToEditQuizDraft(quizItem);
    }
    const viewResponses = (actItem) => {
        setActivityResponsesDialogOpen(true);
        setActivityItemToViewResponses(actItem);
    }
    const getMyActivityResopnses = async () => {
        let gotResponses = [];
        try {
            // console.log('user', currentUserData);

            const quizRef = collection(db, 'QuizResponses');
            const classQuery = query(quizRef, where('classId', '==', openedClass.id), where('uid', '==', currentUserData.uid));
            const queryResult = await getDocs(classQuery);
            // console.log('query result: ' + queryResult);

            gotResponses = queryResult.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResponses(gotResponses);
            // queses = gotResponses;
            console.log('Responses got: ', gotResponses);

        } catch (error) {
            console.log('error getting responses', error);
        }
    };
    const viewResponseUser = (activityItem) => {
        // console.log('wtf');
        setUserId(currentUserData.uid);
        setActivityToReview(activityItem);
        setOpenReviewActivityDialog(true);
    }
    return (
        <>
            <QuizContext.Provider value={{
                openDialog,
                setDialogOpen,
                quizOpenDialog,
                setQuizOpenDialog,
                quizOpenData,
                setQuizOpenData,
                activityResponsesDialog,
                setActivityResponsesDialogOpen,
                activityItemToViewResponses,
                setActivityItemToViewResponses,
                openReviewActivityDialog,
                setOpenReviewActivityDialog,
                activityToReview,
                setActivityToReview,
                userId,
                setUserId,
                editMode, setEditMode,
            }}>

                <div className="quiz-tab-container" style={{ position: 'sticky' }}>

                    <md-tabs class="quiz-tabs">
                        <md-secondary-tab selected inline-icon onClick={() => handleTabChange(0)}>
                            {/* <md-icon slot="icon">edit</md-icon> */}
                            Prelim
                        </md-secondary-tab>
                        <md-secondary-tab inline-icon onClick={() => handleTabChange(1)}>
                            {/* <md-icon slot="icon">people</md-icon> */}
                            Midterm
                        </md-secondary-tab>
                        <md-secondary-tab inline-icon onClick={() => handleTabChange(2)}>
                            {/* <md-icon slot="icon">score</md-icon> */}
                            Finals
                        </md-secondary-tab>
                    </md-tabs>
                </div>
                <Box sx={{ m: 2 }}>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {quizes.map((item, index) => {
                            let responded = false;
                            const startActProps = {};
                            console.log('startdate', item.expectedStartDateTime);
                            console.log('enddate', item.expectedEndDateTime);

                            startActProps.disabled = dayjs() < dayjs(item.expectedStartDateTime) || (item.expectedEndDateTime != '' && dayjs() > dayjs(item.expectedEndDateTime));
                            const foundResponse = responses.find(response => response.quizId == item.id);
                            if (foundResponse) {
                                responded = true;
                            }
                            return (
                                <ListItem sx={{ minHeight: '150px', borderRadius: '24px', cursor: 'pointer' }} button={true} key={item.id} onClick={() => { }} alignItems="flex-start"
                                    secondaryAction={openedClass.classRole == 'teacher' ?
                                        <Stack className='quiz-actions'>
                                            {/* <Chip sx={{ alignSelf: 'center' }} size='small' label='View Responses' onClick={() => { }} variant='outlined' /> */}
                                            <FormControl sx={{ minWidth: '100px' }} variant='standard' >
                                                <InputLabel id="demo-simple-select-label">Status</InputLabel>
                                                <Select
                                                    size='small'
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={item.status}
                                                    onChange={(e) => { onQuizStatusChange(e, item); console.log("stats", e) }}
                                                    label="Status"
                                                >
                                                    <MenuItem value={'draft'}>Draft</MenuItem>
                                                    <MenuItem value={'publish'}>Publish</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <Tooltip title='View Responses'>
                                                <IconButton onClick={() => viewResponses(item)} size='small' sx={{ width: '25px', height: '25px', alignSelf: 'center' }} edge="end" aria-label="save">
                                                    <span style={{ fontSize: '18px' }} className='material-symbols-rounded'>visibility</span>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='Edit'>
                                                <IconButton onClick={() => editQuiz(item)} size='small' sx={{ width: '25px', height: '25px', alignSelf: 'center' }} edge="end" aria-label="save">
                                                    <span style={{ fontSize: '18px' }} className='material-symbols-rounded'>edit</span>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='Archive'>
                                                <IconButton onClick={() => { handleArchive(item) }} size='small' sx={{ width: '25px', height: '25px', alignSelf: 'center' }} edge="end" aria-label="save">
                                                    <span style={{ fontSize: '18px' }} className='material-symbols-rounded'>archive</span>
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                        :
                                        openedClass.classRole == 'student' ?
                                            <>
                                                {!responded ?
                                                    <Chip label='Start Quiz' {...startActProps} onClick={(e) => startQuiz(item)} variant='outlined' />
                                                    :
                                                    <Chip label='View Response' onClick={() => viewResponseUser(item)} variant='outlined' />
                                                }
                                            </>
                                            :
                                            <></>
                                    }>
                                    {item.status == 'draft' ?
                                        <ListItemAvatar>
                                            <Avatar>
                                                <span className='material-symbols-rounded'>other_admission</span>
                                            </Avatar>
                                        </ListItemAvatar> :
                                        <ListItemIcon>
                                            <span style={{ fontSize: '30px' }} className='material-symbols-outlined'>history_edu</span>
                                        </ListItemIcon>}
                                    <ListItemText
                                        primary={
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                sx={{ color: 'text.primary', display: 'inline' }}>
                                                {item.title}&nbsp;
                                                {(item.expectedEndDateTime != '' && dayjs() > dayjs(item.expectedEndDateTime)) && <Chip color='error' sx={{ fontSize: '11px' }} size='small' label='Ended' variant='outlined' />}
                                            </Typography>}
                                        secondary={
                                            <>
                                                <div style={{}}> type: {item.category}</div>
                                                <div style={{ maxWidth: '500px', lineClamp: '2' }}>{item.description}</div>
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    sx={{ color: 'text.seconday', display: 'inline' }}>
                                                    Starts at {dayjs(item.expectedStartDateTime).format('MMMM D, YYYY hh:mm a')}
                                                </Typography> <br />
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    sx={{ color: 'text.seconday', display: 'inline' }}>
                                                    {(item.expectedEndDateTime != '' ? 'to ' + dayjs(item.expectedEndDateTime).format('MMMM D, YYYY hh:mm a') : '')}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Divider variant="inset" component="li" />
                                </ListItem>

                            )
                        })}

                    </List>
                </Box>
                {
                    openedClass.classRole == 'teacher' &&
                    <>
                        <md-fab onClick={() => {
                            setDialogOpen(!openDialog);
                            setEditMode(false);
                            setToEditQuizDraft({});
                        }} class='add-quiz-fab' label="Add quiz" variant="primary" aria-label="Edit">
                            <md-icon slot="icon">add</md-icon>
                        </md-fab>
                        <ViewActivityResponsesDialog></ViewActivityResponsesDialog>
                        <AddQuizDialog toEditQuizDraft={toEditQuizDraft} ></AddQuizDialog>
                    </>}
                {(openedClass.classRole == 'student') && <QuizView ></QuizView>}
                <ActivityReviewDialog />
            </QuizContext.Provider >
        </>
    );
}

export default QuizesList;