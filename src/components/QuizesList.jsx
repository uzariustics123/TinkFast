import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/quizesList.css';
import { useImperativeHandle, useState, forwardRef, useLayoutEffect, useEffect, useRef, useContext, useReducer } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where, doc, updateDoc } from "firebase/firestore"
import { QuizContext, ClassContext, AppContext, QuizResponseContext } from '../AppContext';
import AddQuizDialog from './AddQuizDialog';
import { Avatar, Box, Chip, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, MenuItem, Select, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { QuizView } from './QuizView';

function QuizesList() {
    const { openedClass } = useContext(ClassContext);
    const { setSnackbarOpen, setSnackbarMsg } = useContext(AppContext);
    const [openDialog, setDialogOpen] = useState(false);
    const [quizOpenDialog, setQuizOpenDialog] = useState(false);
    const [quizOpenData, setQuizOpenData] = useState({});
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
        getPrelimQuizes();
    }, []);
    const getPrelimQuizes = async () => {
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizRef = collection(db, 'quizes');
        const filteredQuery = query(quizRef, where('period', '==', 'prelim'), where('classId', '==', openedClass.classId));
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
    const getMidtermQuizes = async () => {
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizRef = collection(db, 'quizes');
        const filteredQuery = query(quizRef, where('period', '==', 'midterm'), where('classId', '==', openedClass.classId));
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
    const getFinalsQuizes = async () => {
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizRef = collection(db, 'quizes');
        const filteredQuery = query(quizRef, where('period', '==', 'final'), where('classId', '==', openedClass.classId));
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
    const handleTabChange = (index) => {
        if (index == 0)
            getPrelimQuizes();
        else if (index == 1)
            getMidtermQuizes();
        else if (index == 2)
            getFinalsQuizes();
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
            setSnackbarMsg('Class updated');
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

    }
    return (
        <>
            <QuizContext.Provider value={{ openDialog, setDialogOpen, quizOpenDialog, setQuizOpenDialog, quizOpenData, setQuizOpenData }}>

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
                        {quizes.map((item, index) => (
                            <ListItem sx={{ minHeight: '150px', borderRadius: '24px', cursor: 'pointer' }} button={true} key={item.id} onClick={() => { }} alignItems="flex-start"
                                secondaryAction={openedClass.classRole == 'teacher' ?
                                    <Stack className='quiz-actions'>
                                        <Chip sx={{ alignSelf: 'center' }} size='small' label='View Responses' onClick={() => { }} variant='outlined' />
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
                                        <IconButton onClick={() => editQuiz(item)} size='small' sx={{ width: '25px', height: '25px', alignSelf: 'center' }} edge="end" aria-label="save">
                                            <span style={{ fontSize: '18px' }} className='material-symbols-rounded'>edit</span>
                                        </IconButton>
                                    </Stack>
                                    :
                                    openedClass.classRole == 'student' ?
                                        <Chip label='Start Quiz' onClick={(e) => startQuiz(item)} variant='outlined' /> : <></>
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
                                            {item.title}
                                        </Typography>}
                                    secondary={
                                        <>
                                            <div style={{ maxWidth: '500px', lineClamp: '2' }}>{item.description}</div>
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                sx={{ color: 'text.seconday', display: 'inline' }}>
                                                Starts at {dayjs(item.expectedStartDateTime).format('MMMM d, YYYY hh:mm a')}
                                            </Typography> <br />
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                sx={{ color: 'text.seconday', display: 'inline' }}>
                                                {(item.expectedEndDateTime != '' ? 'to ' + dayjs(item.expectedEndDateTime).format('MMMM d, YYYY hh:mm a') : '')}
                                            </Typography>
                                        </>
                                    }
                                />
                                <Divider variant="inset" component="li" />
                            </ListItem>

                        ))}

                    </List>
                </Box>
                {
                    openedClass.classRole == 'teacher' &&
                    <>
                        <md-fab onClick={() => { setDialogOpen(!openDialog) }} class='add-quiz-fab' label="Add quiz" variant="primary" aria-label="Edit">
                            <md-icon slot="icon">add</md-icon>
                        </md-fab>
                        <AddQuizDialog></AddQuizDialog>
                    </>}
                {(openedClass.classRole == 'student') && <QuizView ></QuizView>}
            </QuizContext.Provider >
        </>
    );
}

export default QuizesList;