import './styles/homepage.css';
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import { useState, useLayoutEffect, useEffect, useRef, useContext } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, where, getDoc, getDocs, doc } from "firebase/firestore";
import { Store } from 'react-notifications-component';
import ClassList from '../components/ClassList';
import { Button, Snackbar, Dialog, DialogContent, DialogActions, DialogContentText, DialogTitle, TextField, Chip, colors } from "@mui/material";
import { AppContext, ClassContext } from '../AppContext';
import { sendEmailVerification } from 'firebase/auth';

function HomePage({ selectedClassCallback }) {
    const currentUser = auth.currentUser;
    const classListRef = useRef(null);
    const classTitleRef = useRef(null); // Reference to the web component
    const classDescRef = useRef(null);
    const [joinLoading, setJoinLoading] = useState(false);
    const { openedClass, setOpenedClass } = useContext(ClassContext);
    const { currentUserData, setCurrentUserData, backdropOpen, setBackdropOpen, openSnackbar, setSnackbarOpen, snackbarMsg, setSnackbarMsg } = useContext(AppContext);

    const [joinClassDialogOpen, setJoinClassDialogOpen] = useState(false);
    const [classTitle, setClassTitle] = useState('');
    const [classDesc, setClassDesc] = useState('');
    const classDBRef = collection(db, "classes");
    const classMemberDBRef = collection(db, "classMembers");

    useEffect(() => {
        console.log('currentUserData', currentUserData);

        const classTitleTF = classTitleRef.current;
        const classDescTF = classTitleRef.current;
        // Adding the native event listener for input changes
        const createClassChangeEvent = (event) => {
            setClassTitle(event.target.value);
        };
        const classDescChangeEvent = (event) => {
            setClassDesc(event.target.value);
        };
        if (classTitleTF)
            classTitleTF.addEventListener('input', createClassChangeEvent);
        if (classTitleTF)
            classDescTF.addEventListener('input', classDescChangeEvent);

        return () => {
            // Cleanup event listener
            if (classTitleTF)
                classTitleTF.removeEventListener('input', createClassChangeEvent);
            if (classDescTF)
                classDescTF.removeEventListener('input', classDescChangeEvent);
        };
    }, []);

    const sendVerificationEmail = () => {
        const user = auth.currentUser;
        setBackdropOpen(true);
        if (user) {
            sendEmailVerification(user)
                .then(() => {
                    console.log("Verification email sent!");
                    alert("A verification email has been sent to your email address.");
                })
                .catch((error) => {
                    console.error("Error sending email verification:", error);
                });
        } else {
            console.log("No user is signed in.");
        }
        setBackdropOpen(false);
    };

    // class creation
    const createNewClass = async () => {
        if (classTitle == null || classTitle.trim() == '') {
            Store.addNotification({
                title: "Nope!",
                message: "Class name cannot be empty ",
                type: "danger",
                container: "top-center",
                animationIn: ["animate__animated", "animate__tada"],
                // animationIn: ["animate__animated", "animate__rubberBand"],
                animationOut: ["animate__animated", "animate__backOutDown"],
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
            return;
        }
        try {
            const classCreation = await addDoc(classDBRef, {
                className: classTitle,
                classDesc: classDesc,
                classOwner: currentUser.uid,
                ptRate: 0.40,
                examRate: 0.30,
                quizRate: 0.30,
            });
            try {
                const classMemberInsertion = await addDoc(classMemberDBRef, {
                    classId: classCreation.id,
                    classRole: 'teacher',
                    uid: currentUser.uid,
                    status: 'accepted'
                });
                Store.addNotification({
                    title: "Nice!",
                    message: "New Class created",
                    type: "success",
                    container: "top-center",
                    // animationIn: ["animate__animated", "animate__tada"],
                    animationIn: ["animate__animated", "animate__rubberBand"],
                    animationOut: ["animate__animated", "animate__backOutDown"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                // console.log(classListRef.current);

                classListRef.current.getClasses();
            } catch (error) {
                Store.addNotification({
                    title: "Error: " + error.code,
                    message: error.message,
                    type: "danger",
                    container: "top-center",
                    animationIn: ["animate__animated", "animate__tada"],
                    // animationIn: ["animate__animated", "animate__rubberBand"],
                    animationOut: ["animate__animated", "animate__backOutDown"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
            }

        } catch (e) {
            // console.error("Error adding user: ", e);
            Store.addNotification({
                title: "Error: " + e.code,
                message: e.message,
                type: "danger",
                container: "top-center",
                animationIn: ["animate__animated", "animate__tada"],
                // animationIn: ["animate__animated", "animate__rubberBand"],
                animationOut: ["animate__animated", "animate__backOutDown"],
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        }
    }

    const createClassPrompt = (event) => {
        event.preventDefault();
        document.getElementById('create-class-dialog').show();
        classTitleRef.current.value = '';
        classDescRef.current.value = '';
        setClassDesc('');
        setClassTitle('');
    };
    const joinClass = async (classID) => {
        setJoinLoading(true);

        try {
            const classRef = doc(db, 'classes', classID);
            const classGot = await getDoc(classRef);
            const existingMembership = query(collection(db, 'classMembers'), where('uid', '==', currentUser.uid), where('classId', '==', classID));
            const result = await getDocs(existingMembership);
            // console.log('check class exist',);

            // return;
            if (!classGot.exists()) {
                setSnackbarMsg(`This class does not exist`);
                setSnackbarOpen(true);
                classListRef.current.getClasses();
            }
            else if (result.docs.length < 1) {
                // console.log('doc size', result.docs.length);
                const joinRequest = await addDoc(collection(db, 'classMembers'), {
                    classId: classID,
                    classRole: 'student',
                    uid: currentUser.uid,
                    status: 'accepted'
                });
                // console.log('joinRequest', joinRequest);

                setSnackbarMsg(`You've joined a class`);
                setSnackbarOpen(true);
                setJoinClassDialogOpen(false);
                classListRef.current.getClasses();
            } else {
                setSnackbarMsg('Could not find a class with this ID');
                setSnackbarOpen(true);
            }

        } catch (error) {
            // console.log('Error trying to find existing class', error);
            setSnackbarMsg('Could not find a class with this ID');
            setSnackbarOpen(true);
        }

        setJoinLoading(false);

    }
    return (
        <>


            <md-dialog id="create-class-dialog" >
                <div slot="headline">
                    Create a new Class
                </div>
                <form slot="content" id="create-dialog-id" onSubmit={createNewClass} method="dialog">
                    <div className="create-dialog">
                        <md-outlined-text-field
                            required
                            style={{ width: '100%' }}
                            type="text"
                            ref={classTitleRef}
                            label="Class Name">
                            <md-icon slot="leading-icon">school</md-icon>
                        </md-outlined-text-field>
                        <br />
                        <br />
                        <md-outlined-text-field
                            type="textarea"
                            row="5"
                            ref={classDescRef}
                            style={{ width: '100%' }}
                            label="Class Description">
                            {/* <md-icon slot="leading-icon">description</md-icon> */}
                        </md-outlined-text-field>
                    </div>
                </form>
                <div slot="actions">
                    <md-text-button onClick={() => document.getElementById('create-class-dialog').close()} value='cancel'>Cancel</md-text-button>
                    <md-filled-button type='submit' form="create-dialog-id">Create</md-filled-button>
                </div>
            </md-dialog>


            <div className="home-banner">
                <h1 className='banner-greet'>TinkFast </h1>
                <p className='banner-msg'>
                    {(currentUserData.currentUser.emailVerified || false) ? 'Join a class, start a quiz or engage with others by sharing your thoughts. Join the fun of learning!' : 'Verify email your address to start creating or joining a class'}
                </p>
                <Player className='home-anim' autoplay loop src="/anims/home-anim.json" />
                <div className="banner-actions">

                    <>
                        {currentUserData.role == 'teacher' && < Chip sx={{ borderColor: colors.green[900], color: colors.green[800], fontWeight: 'bold' }} variant='outlined' onClick={createClassPrompt} icon={<span slot='icon' className="material-symbols-outlined">add</span>} label='Create Class'>
                        </Chip>}
                        <Chip className='join-chip' sx={{ p: 1, backgroundColor: colors.green[900], color: colors.green[500], fontWeight: 'bold' }} onClick={() => { setJoinClassDialogOpen(!joinClassDialogOpen) }} label='Join Class' icon={<span style={{ color: colors.green[500] }} slot='icon' className="material-symbols-outlined">group_add</span>}>
                        </Chip>
                    </>

                    {/* <>
                            <Chip className='join-chip' sx={{ p: 1, backgroundColor: colors.green[900], color: colors.green.A100, fontWeight: 'bold' }} onClick={() => { sendVerificationEmail() }} label='Verify my email address' icon={<span style={{ color: colors.green[500] }} slot='icon' className="material-symbols-outlined">email</span>}>
                            </Chip>
                        </> */}


                </div>
            </div >
            <ClassList ref={classListRef} selectedClassCallback={selectedClassCallback} />
            <Dialog
                open={joinClassDialogOpen}
                onClose={() => { }}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        const classId = formJson.classId;
                        joinClass(classId);
                        // console.log(classId);
                        // handleClose();
                    },
                }}
            >
                <DialogTitle>Join a class</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To join a class, please enter the ID of the class here. Ask the teacher of the Class for a Class ID.
                        Copy the Class ID and paste it here.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="classId"
                        label="Enter Class ID"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                    {joinLoading && <md-linear-progress indeterminate></md-linear-progress>}
                </DialogContent>
                <DialogActions>
                    <md-text-button onClick={() => { setJoinClassDialogOpen(!joinClassDialogOpen) }} >Cancel</md-text-button>
                    <md-text-button type="submit" >Join</md-text-button>
                    {/* <Button type="submit">Join</Button> */}
                </DialogActions>
            </Dialog>


        </>
    );
}

export default HomePage;
