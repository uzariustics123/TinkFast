import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "./Firebase";
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import './styles/classlist.css';
import { Store } from 'react-notifications-component';

function ClassList({ selectedClassCallback }) {
    const updateClassDescRef = useRef(null);
    const updateClassTitleRef = useRef(null);
    const editDialogElem = useRef(null);

    const [updatableClassDoc, setUpdatableClassDoc] = useState(null);
    const [deletableClassDoc, setDeletableClassDoc] = useState(null);
    const [updateClassTitle, setUpdateClassTitle] = useState('');
    const [updateClassDesc, setUpdateClassDesc] = useState('');
    const [dialogLoaderStypeVal, setDialogLoaderVal] = useState('none');
    const [classes, setClasses] = useState([]);

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
        console.log('No changes were made');
        if (updatableClassDoc.className == updateClassTitleTF.value && updatableClassDoc.classDesc == updateClassDescTF.value) {
            console.log('no changes made');
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
    const getClasses = async () => {
        const currentUser = auth.currentUser;
        const filteredQuery = query(classDBRef, where('classOwner', '==', currentUser.uid));
        try {
            const querySnapshot = await getDocs(filteredQuery);
            // querySnapshot.forEach((doc) => {
            //     console.log(`${doc.id} => ${doc.data()}`);
            // });22
            const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClasses(itemsData);
        } catch (error) {
            console.log(error);

        }
    }
    const confirmDeleteClass = (classData) => {
        document.getElementById('delete-class-dialog').show();
    }
    const deleteClassDocument = async () => {
        try {
            const docRef = doc(db, "classes", deletableClassDoc.id);
            await deleteDoc(docRef);
            console.log("Class successfully deleted!");
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
                selectedClassCallback(item)
                console.log("Viewing class:", item.className);
                // Add logic to view the class
                break;
            case "edit":
                console.log("Editing class:", item.className);
                editClassPrompt(item);
                // Add logic to edit the class
                break;
            case "delete":
                console.log("Deleting class:", item.className);
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
            <div className="classlist-container">
                {classes.map((item, index) => (
                    <div key={item.id} className="class-item">
                        <div className="class-img" style={{ backgroundImage: `url('anims/default-class-bg.png')` }}>
                            <span className="class-img-filter"></span>
                        </div>
                        <p className="class-title">{item.className}</p>
                        <p style={{ fontSize: '13px' }} className="class-desc md-typescale-body-small">{item.classDesc}</p>
                        <div className="class-item-actions">
                            <md-chip-set>
                                <md-assist-chip onClick={() => handleChipClick(item, "view")} label="View">
                                    <md-icon slot="icon">open_run</md-icon>
                                </md-assist-chip>
                                <md-assist-chip onClick={() => handleChipClick(item, "edit")} label="Edit">
                                    <md-icon slot="icon">edit</md-icon>
                                </md-assist-chip>
                                <md-assist-chip class="trash-class" onClick={() => handleChipClick(item, "delete")} label="Delete">
                                    <md-icon slot="icon">delete</md-icon>
                                </md-assist-chip>
                            </md-chip-set>
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
        </>
    );
}
export default ClassList;