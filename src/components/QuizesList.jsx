import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/quizesList.css';
import { useImperativeHandle, useState, forwardRef, useLayoutEffect, useEffect, useRef, useContext, useReducer } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where, doc } from "firebase/firestore"
import { QuizContext, ClassContext } from '../AppContext';
import AddQuizDialog from './AddQuizDialog';
import { Avatar, Box, Chip, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, MenuItem, Select, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

function QuizesList() {
    const { openedClass } = useContext(ClassContext);
    const [openDialog, setDialogOpen] = useState(false);
    const [quizes, dispathQuizes] = useReducer((currentQuizes, action) => {
        if (action.type == 'setQuizes') {
            if (openedClass.classRole == 'teacher')
                return action.data;
            else
                return action.data.filter(item => item.status == 'publish')
        } else
            return [];
    }, []);
    useEffect(() => {
        getPrelimQuizes();
    }, []);
    const getPrelimQuizes = async () => {
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizRef = collection(classRef, 'quizes');
        const filteredQuery = query(quizRef, where('period', '==', 'prelim'));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            const quizList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            dispathQuizes({
                type: 'setQuizes',
                data: quizList
            });
            console.log('quiz list', quizList);
        } catch (error) {
            console.log(error);
        }
    }
    const getMidtermQuizes = async () => {
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizRef = collection(classRef, 'quizes');
        const filteredQuery = query(quizRef, where('period', '==', 'midterm'));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            const quizList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            dispathQuizes({
                type: 'setQuizes',
                data: quizList
            });
            console.log('quiz list', quizList);
        } catch (error) {
            console.log(error);
        }
    }
    const getFinalsQuizes = async () => {
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizRef = collection(classRef, 'quizes');
        const filteredQuery = query(quizRef, where('period', '==', 'midterm'));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            const quizList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            dispathQuizes({
                type: 'setQuizes',
                data: quizList
            });
            console.log('quiz list', quizList);
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
    return (
        <>
            <QuizContext.Provider value={{ openDialog, setDialogOpen }}>

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
                            <ListItem sx={{ borderRadius: '24px', cursor: 'pointer' }} button={true} key={item.id} onClick={() => { }} alignItems="flex-start"
                                secondaryAction={openedClass.classRole == 'teacher' ?
                                    <Stack spacing={1} direction={'row'}>
                                        <FormControl sx={{ minWidth: '100px' }} variant='standard' >
                                            <InputLabel id="demo-simple-select-label">Status</InputLabel>
                                            <Select
                                                size='small'
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={item.status}
                                                label="Status"
                                            >
                                                <MenuItem value={'draft'}>Draft</MenuItem>
                                                <MenuItem value={'publish'}>Publish</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <IconButton size='small' sx={{ minWidth: '50px' }} edge="end" aria-label="save">
                                            <span style={{ fontSize: '24px' }} className='material-symbols-rounded'>check</span>
                                        </IconButton>
                                        {/* <Chip label='Save' onClick={() => { }} variant='outlined' /> */}
                                    </Stack>
                                    :
                                    openedClass.classRole == 'student' ?
                                        <Chip label='Start Quiz' onClick={() => { }} variant='outlined' /> : <></>
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
                                                Starts at {dayjs(item.expectedStartDateTime).format('MMMM d, YYYY hh:mm a') + (item.expectedEndDateTime != '' ? dayjs(item.expectedEndDateTime).format('MMMM d, YYYY hh:mm a') : '')}
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
            </QuizContext.Provider >
        </>
    );
}

export default QuizesList;