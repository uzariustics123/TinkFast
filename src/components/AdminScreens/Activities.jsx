import React, { useContext, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore'
import { db } from '../Firebase';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { AppContext } from '../../AppContext';
import { popMessage } from '../../Utils';
import '@material/web/all';
import { Button, Chip, colors, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import dayjs from 'dayjs';

export const Activities = (props) => {
    const [classes, setClasses] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [viewDetailDialog, setViewDetailDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState({});
    const [selectedClassMembers, setSelectedClassMembers] = useState([]);
    const { setSnackbarMsg, setSnackbarOpen, setBackdropOpen } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    let userz = [{}];
    const [rows, setRows] = useState([]);
    const viewMemberChip = (params) => {
        const chipStyle = {
            color: colors.blue[900],
            border: `1px solid ${colors.blue[900]}`
        }
        let quizData = params?.value;
        return <Chip sx={{ ...chipStyle }} label='View' onClick={() => { viewClassdetails(quizData) }} size='small' variant='outlined'></Chip>
    }
    const viewClassdetails = (quizData) => {
        setLoading(true);
        setSelectedClassMembers([]);
        setSelectedClass({});
        setViewDetailDialog(true);
        // setSelectedClass(classData);
        fetchClassData(quizData.classId).then(classData => {
            setSelectedClass(classData);
            fetchClassMembers(classData.id).then(participantsList => {
                setSelectedClassMembers(participantsList);
                setLoading(false);
            });
        });
    }
    const fetchClassData = async (classId) => {
        const classRef = doc(db, "classes", classId);
        const classData = await getDoc(classRef);
        if (classData.exists()) {
            return classData.data();
        } else {
            console.log("No such document!", classId);
            return null;
        }
    }
    async function fetchClassMembers(classId, pageSize = 30) {
        const classMemberColref = collection(db, "classMembers");
        let membersList = [];
        let lastVisible = null;
        let hasMore = true;
        try {
            while (hasMore) {
                // Define the query
                let classMembersQuery = query(classMemberColref, where('classId', '==', classId), limit(pageSize));
                if (lastVisible) {
                    classMembersQuery = query(classMemberColref, where('classId', '==', classId), startAfter(lastVisible), limit(pageSize));
                }
                // Fetch the current batch of users
                const querySnapshot = await getDocs(classMembersQuery);

                const members = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                membersList = [...membersList, ...members];
                // Check if we have more documents

                if (querySnapshot.docs.length < pageSize) {
                    hasMore = false;
                } else {
                    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                }
            }

            console.log("All Members:", membersList);
            return membersList; // Return the full list of users
        } catch (error) {
            console.error("Error fetching all members:", error);
        }
    }
    useEffect(() => {
        fetchAllActivities().then(allActivities => {
            console.log("Activities fetched successfully:", allActivities.length);
            setRows(allActivities.map(row => (({
                ...row,
                quizdetails: row
            }))));
        });
        fetchAllClasses().then(allClasses => {
            console.log("Classes fetched successfully:", allClasses.length);
            setClasses(allClasses);
        });
        fetchAllUsers().then(allUsers => {
            setUsersList(allUsers);
        });
    }, []);
    async function fetchAllClasses(pageSize = 30) {
        const classesCollectionRef = collection(db, "classes");
        let classesList = [];
        let lastVisible = null;
        let hasMore = true;
        try {
            while (hasMore) {
                // Define the query
                let classesQuery = query(classesCollectionRef, limit(pageSize));
                if (lastVisible) {
                    classesQuery = query(classesCollectionRef, startAfter(lastVisible), limit(pageSize));
                }
                // Fetch the current batch of classes
                const querySnapshot = await getDocs(classesQuery);
                // Add classes to the list
                console.log('classes dos', querySnapshot.docs);

                const classes = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                classesList = [...classesList, ...classes];
                // Check if we have more documents
                console.log('classeslist', classesList);

                if (querySnapshot.docs.length < pageSize) {
                    hasMore = false;
                } else {
                    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                }
            }

            console.log("All classes:", classesList);
            return classesList; // Return the full list of classes
        } catch (error) {
            console.error("Error fetching all classes:", error);
        }
    }
    async function fetchAllUsers(pageSize = 30) {
        const usersCollectionRef = collection(db, "users");
        let usersList = [];
        let lastVisible = null;
        let hasMore = true;
        try {
            while (hasMore) {
                // Define the query
                let usersQuery = query(usersCollectionRef, limit(pageSize));
                if (lastVisible) {
                    usersQuery = query(usersCollectionRef, startAfter(lastVisible), limit(pageSize));
                }
                // Fetch the current batch of users
                const querySnapshot = await getDocs(usersQuery);
                // Add users to the list
                console.log('users dos', querySnapshot.docs);

                const users = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                usersList = [...usersList, ...users];
                // Check if we have more documents
                console.log('userslist', usersList);

                if (querySnapshot.docs.length < pageSize) {
                    hasMore = false;
                } else {
                    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                }
            }

            console.log("All Users:", usersList);
            return usersList; // Return the full list of users
        } catch (error) {
            console.error("Error fetching all users:", error);
        }
    }
    async function fetchAllActivities(pageSize = 30) {
        const activitiesCollectionRef = collection(db, "quizes");
        let activitiesList = [];
        let lastVisible = null;
        let hasMore = true;
        try {
            while (hasMore) {
                // Define the query
                let activitiesQuery = query(activitiesCollectionRef, limit(pageSize));
                if (lastVisible) {
                    activitiesQuery = query(activitiesCollectionRef, startAfter(lastVisible), limit(pageSize));
                }
                // Fetch the current batch of activities
                const querySnapshot = await getDocs(activitiesQuery);
                // Add activities to the list
                console.log('activities dos', querySnapshot.docs);

                const activities = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                activitiesList = [...activitiesList, ...activities];
                // Check if we have more documents
                console.log('activitieslist', activitiesList);

                if (querySnapshot.docs.length < pageSize) {
                    hasMore = false;
                } else {
                    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                }
            }

            console.log("All activities:", activitiesList);
            return activitiesList; // Return the full list of classes
        } catch (error) {
            console.error("Error fetching all classes:", error);
        }
    }
    const xcolumns = [
        { field: 'title', headerName: 'Activity Title', width: 200, editable: true },
        { field: 'description', headerName: 'Description', width: 200, editable: true },
        { field: 'category', headerName: 'Type', width: 200, type: 'singleSelect', editable: true, valueOptions: ['quiz', 'performance task', 'exam'] },
        {
            field: 'expectedStartDateTime', headerName: 'Start Date', width: 200, editable: true,
        },
        { field: 'expectedEndDateTime', headerName: 'End Date', width: 200, editable: true },
        { field: 'period', headerName: 'Term', width: 200, type: 'singleSelect', editable: true, valueOptions: ['prelim', 'midterm', 'final'] },
        { field: 'status', headerName: 'Status', width: 200, editable: true, type: 'singleSelect', valueOptions: ['publish', 'draft', 'archived'] },
        { field: 'quizdetails', headerName: 'Originated From', width: 200, type: 'number', editable: false, renderCell: viewMemberChip },
        // ...[...userz].map((user, index) => ({
        //     field: user.uid,
        //     headerName: user.firstname,
        //     width: 200,
        //     editable: false,
        //     description: user.lastname,
        // })),
    ];

    const updateRow = async (newData) => {
        setBackdropOpen(true);
        try {
            const docRef = doc(db, "quizes", newData.id);
            await updateDoc(docRef, newData);
            setSnackbarMsg('updated successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Eror ", error);
        }
        setBackdropOpen(false);
    }
    return (
        <>
            <DataGrid
                rows={rows}
                columns={xcolumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                // checkboxSelection
                disableSelectionOnClick
                // disableColumnSelector
                slots={{
                    toolbar: GridToolbar,
                }}
                processRowUpdate={(updatedRow, originalRow) => {
                    // mySaveOnServerFunction(updatedRow);
                    if (originalRow !== updatedRow)
                        updateRow(updatedRow);
                    return updatedRow;
                }}
                onProcessRowUpdateError={(e) => {
                    console.log('error', e);

                }}
            // rowHeight={25}
            // columnGroupingModel={xcolumnGroupingModel}
            />
            <Dialog
                // keepMounted
                open={viewDetailDialog}
            // onClose={() => { setSelectedClassMembers([]) }}
            >
                <DialogTitle>Class: {selectedClass?.className}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        With participants:
                    </DialogContentText>
                    {loading && <md-linear-progress indeterminate></md-linear-progress>}
                    {selectedClassMembers.map((member) => {
                        const foundUser = usersList.find(user => user.uid == member.uid);
                        // console.log('found user', member.id);

                        return (
                            <List key={member.uid}>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => { }}>
                                        <ListItemIcon>
                                            <span className="material-symbols-outlined">person</span>
                                        </ListItemIcon>
                                        <ListItemText primary={`${foundUser?.firstname} ${foundUser?.lastname}`} secondary={<span style={{ textTransform: 'uppercase' }}>{member.classRole + (selectedClass.classOwner == member.uid ? ' | Creator' : '')} </span>} />
                                    </ListItemButton>
                                </ListItem>
                                <Divider />
                            </List>
                        )
                    })}

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setViewDetailDialog(false) }} >Cancel</Button>
                    <Button onClick={() => { setViewDetailDialog(false) }}>OK</Button>
                    {/* <Button type="submit">Join</Button> */}
                </DialogActions>
            </Dialog>
        </>
    )
}
