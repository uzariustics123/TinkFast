import React, { useContext, useEffect, useState } from 'react'
import { AppContext, DraftQuiz, QuizContext } from '../AppContext';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import { Dialog, DialogContent, DialogTitle, DialogActions, List, ListItem, ListItemButton, ListItemIcon, ListItemText, DialogContentText, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from './Firebase';
import '@material/web/all';

export const ImportQuestionDialog = () => {
    const [loading, setLoading] = useState(false);
    const { openedClass, currentUserData } = useContext(AppContext);
    const [classes, setClasses] = useState([]);
    const [activities, setActivities] = useState([]);
    const { quizDraft, importQDialog, setImportQDialog, setQuizDraft } = useContext(DraftQuiz);
    const [mode, setMode] = useState('selectClass');
    const [selectedAct, setSelectedAct] = useState(null);
    useEffect(() => {
        if (importQDialog) {
            getClasses();
        }
    }, [importQDialog])
    const getClasses = async () => {
        setLoading(true);
        const currentUser = currentUserData;
        const filteredQuery = query(collection(db, 'classMembers'), where('uid', '==', currentUser.uid));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            // const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const classIDs = querySnapshot.docs.map(doc => (doc.data().classId));
            const classRoles = new Map();
            const classMembershipData = [];
            querySnapshot.docs.forEach((doc) => {
                classRoles.set(doc.data().classId, doc.data().classRole);
                classMembershipData.push({ membershipDoc: doc.id, ...doc.data() });
            });
            // console.log('class ids ', classIDs);
            let startingItem = 0;
            let itemsData = [];
            const getAdditionalClasses = async () => {
                try {
                    const newBatchClass = [];
                    const classesToGet = classIDs.slice(startingItem, 30);
                    // console.log('classes to get', classesToGet);
                    const classQuery = query(collection(db, 'classes'), where('__name__', 'in', classesToGet));
                    const querySnapshot = await getDocs(classQuery);

                    querySnapshot.forEach((doc) => {
                        let foundMembershipData = classMembershipData.find(foundItem => foundItem.classId === doc.id);
                        newBatchClass.push({ id: doc.id, classRole: classRoles.get(doc.id), ...doc.data(), ...foundMembershipData });
                    });

                    if ((classesToGet.length - 30) > 0) {
                        startingItem += 30;
                        getAdditionalClasses();
                    }
                    itemsData = [...itemsData, ...newBatchClass];
                    // console.log('classes we got', itemsData);
                } catch (error) {
                    console.log('get teacher user info ', error);
                }
            }
            await getAdditionalClasses();
            console.log('classes we got', itemsData);
            setClasses(itemsData);
        } catch (error) {
            console.log(error);
            // setClasses([]);
        }
        setLoading(false);
    }

    const getActivities = async (classId) => {
        setLoading(true);
        const quizRef = collection(db, 'quizes');
        const filteredQuery = query(quizRef, where('classId', '==', classId));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            const quizList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setActivities(quizList);
            // console.log('quiz list', quizList);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }
    const classChosen = (classItem) => {
        getActivities(classItem.id);
        setMode('selectActivity');
        setClasses([]);
    }
    const resetClose = () => {
        setImportQDialog(false);
        setMode('selectClass');
        setActivities([]);
        setClasses([]);
        setSelectedAct(null);
    }
    const importQuestions = async () => {
        const questionRefs = collection(db, 'questions');
        try {
            // console.log('activityToReview', activityToReview);
            const filteredQuery = query(questionRefs, where('quizId', '==', selectedAct.id));
            const querySnapshot = await getDocs(filteredQuery);
            const questionlist = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, status: 'editable' }));
            // setQuestions(questionlist);
            console.log('Qs grabbed', questionlist);
            setQuizDraft([...quizDraft, ...questionlist]);
            resetClose();
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <Dialog
                open={importQDialog}
                onClose={() => { }}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        const classId = formJson.classId;
                        importQuestions();
                        // console.log(classId);
                        // handleClose();
                    },
                }}
            >
                <DialogTitle>{mode == 'selectClass' ? 'Select from your class' : mode == 'selectActivity' ? 'Select question set' : ''}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {mode == 'selectClass' ? 'Select a class that has a set of questions you wanted to import here' : mode == 'selectActivity' ? 'Now choose which activity with the questions set you wanted to import' : ''}
                    </DialogContentText>
                    {loading && <md-linear-progress indeterminate></md-linear-progress>}
                    {classes.map((classItem) => {
                        return (
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => classChosen(classItem)}>
                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">school</span>
                                        </ListItemIcon>
                                        <ListItemText primary={classItem.className} secondary={classItem.classDesc} />
                                    </ListItemButton>
                                </ListItem>
                                <Divider />
                            </List>
                        )
                    })}
                    {activities.map((activity) => {
                        return (
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton selected={activity == selectedAct} onClick={() => { setSelectedAct(activity) }}>
                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">contract_edit</span>
                                        </ListItemIcon>
                                        <ListItemText primary={activity.title} secondary={activity.period} />
                                    </ListItemButton>
                                </ListItem>
                                <Divider />
                            </List>
                        )
                    })}

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { resetClose(); }} >Cancel</Button>
                    <Button disabled={mode != 'selectQuestions' && selectedAct == null} type="submit" >Import</Button>
                    {/* <Button type="submit">Join</Button> */}
                </DialogActions>
            </Dialog>
        </>
    )
}
