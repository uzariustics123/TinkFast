import React, { forwardRef, useContext, useReducer, useState } from 'react'
import { AppContext } from '../AppContext'
import { AppBar, Box, Button, Chip, Dialog, Divider, IconButton, Slide, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { db } from './Firebase';
import { popMessage } from '../Utils';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const xTransition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
export const Settings = () => {
    const { settingsDialog, setSettingsDialog, currentUserData, setBackdropOpen } = useContext(AppContext);
    const [showLoading, hideLoading] = useState(false);
    const [changes, setChanges] = useState(false);
    const [userData, dispatchUserData] = useReducer((currentData, action) => {
        switch (action.type) {
            case 'firstname': {
                return { ...currentData, firstname: action.data };
            }
            case 'lastname': {
                return { ...currentData, lastname: action.data };
            }
            case 'middlename': {
                return { ...currentData, middlename: action.data };
            }
            case 'studentID': {
                return { ...currentData, studentID: action.data };
            }
            default:
                return currentData;
        }
    }, currentUserData);
    const onfnchange = (e) => {
        setChanges(true);
        dispatchUserData({
            type: 'firstname',
            data: e.target.value
        })
    }
    const onlnchange = (e) => {
        setChanges(true);
        dispatchUserData({
            type: 'lastname',
            data: e.target.value
        })
    }
    const onmnchange = (e) => {
        setChanges(true);
        dispatchUserData({
            type: 'middlename',
            data: e.target.value
        })
    }
    const onsidchange = (e) => {
        setChanges(true);
        dispatchUserData({
            type: 'studentID',
            data: e.target.value
        })
    }
    const updateSettings = async () => {
        setBackdropOpen(true);
        delete userData.currentUser;
        try {
            const usersRef = collection(db, 'users');
            const userDoc = doc(usersRef, currentUserData.id);
            await updateDoc(userDoc, userData);
            popMessage('Great! ', 'Settings has been updated');
            setChanges(false);

        } catch (error) {
            console.log('error', error);
            console.log('asdf', userData);

        }
        setBackdropOpen(false);
    }
    const resetPassword = async () => {
        const email = currentUserData.email;
        if (confirm('Send a password reset link to your email ' + email + '?')) {
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
    return (
        <>
            <Dialog
                fullScreen
                open={settingsDialog}
                onClose={() => { }}
                TransitionComponent={xTransition}>
                <AppBar sx={{ borderRadius: '25px', marginTop: '.2rem', backgroundColor: 'white', position: 'sticky', boxShadow: 'none' }}>

                    <Toolbar>
                        <IconButton
                            edge="start"
                            color={'#000'}
                            onClick={() => { setSettingsDialog(false) }}
                            aria-label="close">
                            <md-icon>arrow_back</md-icon>
                        </IconButton>
                        <Typography sx={{ color: '#000', ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="h6" component="div">
                            Settings
                        </Typography>
                    </Toolbar>
                    {showLoading && <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>}
                </AppBar>
                <Box sx={{ m: 2 }}>
                    <Divider textAlign="left">Personal Information</Divider>
                    <br />
                    <Stack direction={'column'} spacing={2}>

                        <TextField
                            label="First Name"
                            fullWidth
                            defaultValue={currentUserData?.firstname}
                            onChange={onfnchange}
                        />
                        <TextField
                            label="Middle Name"
                            fullWidth
                            defaultValue={currentUserData?.middlename}
                            onChange={onmnchange}
                        />
                        <TextField
                            label="Last Name"
                            fullWidth
                            defaultValue={currentUserData?.lastname}
                            onChange={onlnchange}
                        />
                        <TextField
                            label="School ID"
                            fullWidth
                            defaultValue={currentUserData?.studentID}
                            onChange={onsidchange}
                        />
                        <Divider>
                            <Chip disabled={!changes} label="Save Changes" size="small" onClick={() => { updateSettings() }} />
                        </Divider>
                    </Stack>
                    <br />
                    <br />
                    <Divider textAlign="left">Account</Divider>
                    <br />
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>

                        <Button variant='outlined' onClick={resetPassword} size='small'>Request Password Reset Link via email</Button>
                    </div>
                    <br />
                    <br />
                    {/* <Button fullWidth sx={{ m: 1 }} variant='outlined' onClick={() => { console.log('test', userData) }} > Save Changes </Button> */}
                </Box>
            </Dialog>
        </>
    )
}
