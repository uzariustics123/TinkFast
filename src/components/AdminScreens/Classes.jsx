import React, { useContext, useEffect, useState } from 'react'
import { collection, doc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore'
import { db } from '../Firebase';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { AppContext } from '../../AppContext';
import '@material/web/all';
import { Button, Chip, colors, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

export const Classes = (props) => {
    // const [ClassesList, setClassesList] = useState([{}]);
    const [usersList, setUsersList] = useState([]);
    const [viewDetailDialog, setViewDetailDialog] = useState(false);
    const { setSnackbarMsg, setSnackbarOpen, setBackdropOpen } = useContext(AppContext);
    const [selectedClass, setSelectedClass] = useState({});
    const [selectedClassMembers, setSelectedClassMembers] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const viewMemberChip = (params) => {
        let classData = params?.value;
        const chipStyle = {
            color: colors.blue[900],
            border: `1px solid ${colors.blue[900]}`
        }
        return <Chip sx={{ ...chipStyle }} label='View' onClick={() => { viewClassdetails(classData) }} size='small' variant='outlined'></Chip>
    }
    const viewClassdetails = (classData) => {
        setLoading(true);
        setViewDetailDialog(true);
        setSelectedClass(classData);
        setSelectedClassMembers([]);
        fetchClassMembers(classData.id).then(participantsList => {
            setSelectedClassMembers(participantsList);
            setLoading(false);
        });
    }
    useEffect(() => {
        fetchAllClasses().then(allClasses => {
            console.log("Classes fetched successfully:", allClasses.length);
            let classRow =
                setRows(allClasses.map(row => (({
                    ...row,
                    classdetails: row
                }))));
            // Store allClasses in a variable or state for later use
        });
        fetchAllUsers().then(allUsers => {
            setUsersList(allUsers);
        });
    }, []);
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
    async function fetchAllUsers(classess, pageSize = 30) {
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
    async function fetchAllClasses(classess, pageSize = 30) {
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
    const xcolumns = [
        { field: 'classId', headerName: 'Class ID', width: 200 },
        { field: 'className', headerName: 'Class Name', width: 200, editable: true },
        { field: 'classDesc', headerName: 'Class Description', width: 200, editable: true },
        { field: 'ptRate', headerName: 'Performance task rate', width: 200, type: 'number', editable: true },
        { field: 'quizRate', headerName: 'Quizzes rate', width: 200, type: 'number', editable: true },
        { field: 'examRate', headerName: 'Exams rate', width: 200, type: 'number', editable: true },
        { field: 'classdetails', headerName: 'Participants', description: 'Participants', width: 100, type: 'number', editable: false, renderCell: viewMemberChip },
        // ...[...userz].map((user, index) => ({
        //     field: user.uid,
        //     headerName: user.firstname,
        //     width: 200,
        //     editable: false,
        //     description: user.lastname,
        // })),
    ];
    const xgetGridRows = () => {
        let griddata = rows.map((row) => {
            const rowData = {
                id: row.id,
                classId: row.id,
                className: row.className,
                classDesc: row.classDesc,
                ptRate: row?.ptRate ?? 0.40,
                examRate: row.examRate ?? 0.30,
                quizRate: row?.quizRate ?? 0,

            };
            // rowData.performance = gainedScor e;
            return rowData;
        });
        return griddata;
    };
    const updateRow = async (newData) => {
        setBackdropOpen(true);
        try {
            const docRef = doc(db, "classes", newData.id);
            await updateDoc(docRef, newData);
            // setBackdropOpen(false);
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
                processRowUpdate={(updatedRow, originalRow) => {
                    // mySaveOnServerFunction(updatedRow);
                    if (originalRow !== updatedRow)
                        updateRow(updatedRow);
                    return updatedRow;
                }}
                onProcessRowUpdateError={(e) => {
                    console.log('error', e);

                }}
                slots={{
                    toolbar: GridToolbar,
                }}
            // rowHeight={25}
            // columnGroupingModel={xcolumnGroupingModel}
            />
            <Dialog
                open={viewDetailDialog}
                disableBackdropClick="true"
            // onClose={() => { setSelectedClassMembers([]) }}
            >
                <DialogTitle>{selectedClass?.className}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Class participants
                    </DialogContentText>
                    {loading && <md-linear-progress indeterminate></md-linear-progress>}
                    {selectedClassMembers.map((member) => {
                        const foundUser = usersList.find(user => user.uid == member.uid);
                        console.log('found user', member.id);

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
