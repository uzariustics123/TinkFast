import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { auth, db } from "./Firebase";
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import './styles/classlist.css';
import { Store } from 'react-notifications-component';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { Button, Snackbar, Dialog, DialogContent, DialogActions, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { AppContext, ClassContext } from "../AppContext";


const ClassList = forwardRef((props, ref) => {
    const selectedClassCallback = props.selectedClassCallback;
    const updateClassDescRef = useRef(null);
    const updateClassTitleRef = useRef(null);
    const editDialogElem = useRef(null);
    const { openedClass, setOpenedClass } = useContext(ClassContext);

    const { backdropOpen, setBackdropOpen, openSnackbar, setSnackbarOpen, snackbarMsg, setSnackbarMsg } = useContext(AppContext);
    // const [openSnackbar, setSnackbarOpen] = useState(false);
    // const [snackbarMsg, setSnackbarMsg] = useState('');
    const [updatableClassDoc, setUpdatableClassDoc] = useState(null);
    const [deletableClassDoc, setDeletableClassDoc] = useState(null);
    const [updateClassTitle, setUpdateClassTitle] = useState('');
    const [updateClassDesc, setUpdateClassDesc] = useState('');
    const [dialogLoaderStypeVal, setDialogLoaderVal] = useState('none');
    const [classes, setClasses] = useState(null);

    const classDBRef = collection(db, "classes");
    const classMemberDBRef = collection(db, "classMembers");

    let updateClassTitleTF = updateClassTitleRef.current;
    let updateClassDescTF = updateClassDescRef.current;

    // refs and event assignments
    useEffect(() => {
        updateClassTitleRef.current;
        updateClassDescTF = updateClassDescRef.current;
        // Adding the native event listener for input changes
        const updateClassTitleChangeEvent = (event) => {
            setUpdateClassTitle(event.target.value);
        };
        const updateClassDescChangeEvent = (event) => {
            setUpdateClassDesc(event.target.value);
        };
        if (updateClassTitleTF)
            updateClassTitleTF.addEventListener('input', updateClassTitleChangeEvent);
        if (updateClassDescTF)
            updateClassDescTF.addEventListener('input', updateClassDescChangeEvent);

        return () => {
            // Cleanup event listener
            if (updateClassTitleTF)
                updateClassTitleTF.removeEventListener('input', updateClassTitleChangeEvent);
            if (updateClassDescTF)
                updateClassDescTF.removeEventListener('input', updateClassDescChangeEvent);
        };
    }, []);
    // get classes on first load
    useEffect(() => {
        if (auth.currentUser !== null)
            getClasses();
    }, [auth.currentUser]);
    // expose functions to parent
    useImperativeHandle(ref, () => ({
        getClasses,
    }));
    const editClassPrompt = (classData) => {
        document.getElementById('edit-class-dialog').show();
        setUpdatableClassDoc(classData);
        setUpdateClassTitle(classData.classTitle);
        setUpdateClassDesc(classData.classDesc);
        updateClassTitleTF.value = classData.className;
        updateClassDescTF.value = classData.classDesc;
    };
    const updateClassCommit = async () => {
        setDialogLoaderVal('block');
        updateClassDescTF.disabled = true;
        updateClassTitleTF.disabled = true;
        // console.log('No changes were made');
        if (updatableClassDoc.className == updateClassTitleTF.value && updatableClassDoc.classDesc == updateClassDescTF.value) {
            // console.log('no changes made');
            return;
        } else {
            const docRef = doc(db, "classes", updatableClassDoc.id);
            try {
                await updateDoc(docRef, {
                    className: updateClassTitleTF.value,
                    classDesc: updateClassDescTF.value
                });
                Store.addNotification({
                    title: "Class updated!",
                    message: "Successfully updated a class",
                    type: "success",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeInRight"],
                    animationOut: ["animate__animated", "animate__fadeOutRight"],
                    dismiss: {
                        duration: 4000,
                        onScreen: true
                    }
                });
                console.log('sukses');

            } catch (error) {
                console.error("Error updating document: ", error);
            }
            setDialogLoaderVal('none');
            updateClassDescTF.disabled = false;
            updateClassTitleTF.disabled = false;
            document.getElementById('edit-class-dialog').close();
        }
    }
    const acceptClassInvitation = async (classItemData) => {
        setBackdropOpen(true);
        try {
            const docRef = doc(db, "classMembers", classItemData.membershipDoc);
            await updateDoc(docRef, {
                status: 'accepted'
            });
            setBackdropOpen(false);
            setSnackbarMsg('Class invitation accepted');
            setSnackbarOpen(true);
            // console.log('accepted');
            getClasses();
        } catch (error) {
            console.error("Error accepting class: ", error);
        }
    }
    const declineClassInvitation = async (classItemData) => {
        setBackdropOpen(true);
        try {
            const docRef = doc(db, "classMembers", classItemData.membershipDoc);
            await deleteDoc(docRef);
            setBackdropOpen(false);
            setSnackbarMsg('Class invitation declined');
            setSnackbarOpen(true);
            getClasses();
        } catch (error) {
            console.error("Error declining class: ", error);
        }
    }
    const getClasses = async () => {
        const currentUser = auth.currentUser;
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
            setClasses(itemsData);

        } catch (error) {
            console.log(error);
            setClasses([]);
        }
    }
    const confirmDeleteClass = (classData) => {
        document.getElementById('delete-class-dialog').show();
    }
    const deleteClassDocument = async () => {
        try {
            const docRef = doc(db, "classes", deletableClassDoc.id);
            await deleteDoc(docRef);
            // console.log("Class successfully deleted!");
            Store.addNotification({
                title: "Class deleted!",
                message: "Successfully deleted a class",
                type: "success",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeInRight"],
                animationOut: ["animate__animated", "animate__fadeOutRight"],
                dismiss: {
                    duration: 4000,
                    onScreen: true
                }
            });
            document.getElementById('delete-class-dialog').close();
        } catch (error) {
            console.error("Error removing document: ", error);
            Store.addNotification({
                title: "Class Deletion Failed!",
                message: "Failed to delete a class",
                type: "danger",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeInRight"],
                animationOut: ["animate__animated", "animate__fadeOutRight"],
                dismiss: {
                    duration: 4000,
                    onScreen: true
                }
            });
        }
        getClasses();
    };


    const handleChipClick = (item, action) => {

        switch (action) {
            case "view":
                props.selectedClassCallback(item);
                setOpenedClass(item);
                // console.log("Viewing class:", item.className);
                // Add logic to view the class
                break;
            case "edit":
                // console.log("Editing class:", item.className);
                editClassPrompt(item);
                // Add logic to edit the class
                break;
            case "delete":
                // console.log("Deleting class:", item.className);
                setDeletableClassDoc(item);
                confirmDeleteClass(item);
                // Add logic to delete the class
                break;
            default:
                break;
        }
    };

    return (
        <>
            {classes == null ?
                <md-linear-progress indeterminate></md-linear-progress>
                : (classes.length < 1) ?
                    <><center><p style={{ fontSize: '13px', color: 'grey', marginTop: '5rem' }} className="class-desc md-typescale-body-small">No classes found. Join or Create one.</p></center></>
                    :
                    <>
                        <div className="classlist-container">
                            {classes.map((item, index) => (
                                <div key={item.id} className="class-item">
                                    <div className="class-img" style={{ backgroundImage: `url("./illustrations/working-illu.jpg")` }}>
                                        <span className="class-img-filter"></span>
                                    </div>
                                    <p className="class-title">{item.className}</p>
                                    <p style={{ fontSize: '13px' }} className="class-desc md-typescale-body-small">{item.classDesc}</p>
                                    <div className="class-item-actions">
                                        {
                                            item.status == 'invited' ?
                                                <Stack direction="row" spacing={1}>
                                                    <Chip onClick={() => acceptClassInvitation(item)} label="Accept" color="success" variant="outlined" />
                                                    <Chip onClick={() => { declineClassInvitation(item) }} label='Decline' color="info" variant="outlined" />
                                                </Stack> :

                                                <md-chip-set>
                                                    <md-assist-chip onClick={() => handleChipClick(item, "view")} label='Open'>
                                                        <md-icon slot="icon">open_run</md-icon>
                                                    </md-assist-chip>
                                                    <md-assist-chip onClick={() => handleChipClick(item, "edit")} label="Edit">
                                                        <md-icon slot="icon">edit</md-icon>
                                                    </md-assist-chip>
                                                    <md-assist-chip class="trash-class" onClick={() => handleChipClick(item, "delete")} label="Delete">
                                                        <md-icon slot="icon">delete</md-icon>
                                                    </md-assist-chip>
                                                </md-chip-set>

                                        }

                                    </div>
                                </div>
                            ))}
                        </div>



                        <md-dialog id="edit-class-dialog" >
                            <div slot="headline">
                                Update class
                            </div>
                            <form slot="content" id="edit-class-form" method="dialog">
                                <div className="create-dialog">
                                    <md-outlined-text-field
                                        required
                                        style={{ width: '100%' }}
                                        type="text"
                                        ref={updateClassTitleRef}
                                        label="Class Name">
                                        <md-icon slot="leading-icon">school</md-icon>
                                    </md-outlined-text-field>
                                    <br />
                                    <br />
                                    <md-outlined-text-field
                                        type="textarea"
                                        row="5"
                                        ref={updateClassDescRef}
                                        style={{ width: '100%' }}
                                        label="Class Description">
                                        {/* <md-icon slot="leading-icon">description</md-icon> */}
                                    </md-outlined-text-field>
                                </div>
                                <md-linear-progress style={{ display: dialogLoaderStypeVal }} indeterminate></md-linear-progress>
                            </form>
                            <div slot="actions">
                                <md-text-button type='button' onClick={() => document.getElementById('edit-class-dialog').close()} value='cancel'>Cancel</md-text-button>
                                <md-text-button type='submit' onClick={updateClassCommit} >Update</md-text-button>
                            </div>
                        </md-dialog>

                        <md-dialog id="delete-class-dialog" >
                            <div slot="headline">
                                <div className="material-symbols-outlined" style={{ color: 'red', fontSize: '25px' }}>info</div>
                                <br />
                                <p>Delete Class</p>
                            </div>
                            <form slot="content" id="delete-class-dialog-id" method="dialog">
                                <div className="create-dialog">
                                    {/* <md-divider></md-divider> */}

                                    <p className="md-typescale-body-medium">Are you sure you want to delete "{deletableClassDoc !== null ? deletableClassDoc.className : ''}"</p>
                                </div>
                            </form>
                            <div slot="actions">
                                <md-text-button form="delete-class-dialog-id" value="cancel">Cancel</md-text-button>
                                <md-text-button id="deleteClassBtn" onClick={deleteClassDocument} value="ok">Delete</md-text-button>
                            </div>
                        </md-dialog>
                    </>}

        </>
    );

});
export default ClassList;