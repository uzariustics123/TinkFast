import React, { useContext, useEffect, useState } from 'react'
import { collection, doc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore'
import { db } from '../Firebase';
import { DataGrid, GridCellEditStopReasons, GridToolbar } from '@mui/x-data-grid';
import { AppContext } from '../../AppContext';
import { Chip, colors } from '@mui/material';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export const Users = (props) => {
    const [usersList, setUsersList] = useState([{}]);
    const { setSnackbarMsg, setSnackbarOpen, setBackdropOpen } = useContext(AppContext);
    let userz = [{}];
    const [rows, setRows] = useState([]);
    const [xrows, setxRows] = useState([]);
    const [xcols, setxcols] = useState([]);
    const resetPassChip = (params) => {
        const chipStyle = {
            color: colors.red[900],
            border: `1px solid ${colors.red[900]}`
        }
        let email = params?.value;
        return <Chip label='Reset Password' sx={{ ...chipStyle }} onClick={() => { resetPassword(email) }} size='small' variant='outlined'></Chip>
    }
    useEffect(() => {
        fetchAllUsers().then(allUsers => {
            console.log("Users fetched successfully:", allUsers.length);
            setRows(allUsers.map(row => ({ ...row, password: crypto.randomUUID(), passreset: row.email })));
        });
    }, []);
    const resetPassword = async (email) => {
        if (confirm('Send a password reset link to email of user ' + email + '?')) {
            setBackdropOpen(true);
            const auth = getAuth();
            try {
                await sendPasswordResetEmail(auth, email);
                alert("Password reset email sent!");
            } catch (error) {
                console.error("Error sending password reset email:", error);
                alert(error.message);
            }
            setBackdropOpen(false);
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
    const xcolumns = [
        { field: 'uid', headerName: 'Unique System ID', width: 200 },
        { field: 'firstname', headerName: 'First Name', width: 200, editable: true },
        { field: 'middlename', headerName: 'Middle Name', width: 200, editable: true },
        { field: 'lastname', headerName: 'Last Name', width: 200, editable: true },
        { field: 'email', headerName: 'Email', width: 250 },
        {
            field: 'password',
            headerName: 'Password (hashed)',
            width: 200,
            description: `This is a hashed password and should not be viewed by anyone as a privacy policy and standards to most systems. Your users might be using this passowrd for their other personal credentials.`,
        },
        { field: 'passreset', headerName: 'Reset Password', width: 150, renderCell: resetPassChip },
        { field: 'role', headerName: 'Role', width: 100, type: 'singleSelect', valueOptions: ['student', 'teacher'], editable: true },
    ];


    const updateUser = async (newData) => {
        setBackdropOpen(true);
        try {
            const docRef = doc(db, "users", newData.id);
            await updateDoc(docRef, newData);
            setSnackbarMsg('Record updated');
            setSnackbarOpen(true);
            // setRows(rows.map((row) => (row.id === newRow.id ? newRow : row)));
            // setxRows(xgetGridRows());
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
                // pageSize={5}
                rowsPerPageOptions={[5]}
                // checkboxSelection
                disableSelectionOnClick
                // disableColumnSelector
                // rowHeight={25}
                // columnGroupingModel={xcolumnGroupingModel}
                // onCellEditStop={(params, event) => {
                //     console.log('params', params);
                //     if (params.field === 'role') {

                //     }
                // }}
                processRowUpdate={(updatedRow, originalRow) => {
                    // mySaveOnServerFunction(updatedRow);
                    console.log('updatedRow', updatedRow);
                    console.log('originalRow', originalRow);
                    if (originalRow != updatedRow)
                        updateUser(updatedRow);
                    return updatedRow;
                }}
                onProcessRowUpdateError={(e) => {
                    console.log('error', e);
                }}
                slots={{
                    toolbar: GridToolbar,
                }}
                slotProps={{
                    toolbar: { setRows },
                }}
                initialState={{
                    columns: {
                        columnVisibilityModel: {
                            uid: false, // Column 'email' will be hidden
                            password: false,
                        },
                    },
                }}

            />
        </>
    )
}
