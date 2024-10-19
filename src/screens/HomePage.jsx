import './styles/homepage.css';
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc } from "firebase/firestore";
import { Store } from 'react-notifications-component';
import ClassList from '../components/ClassList';

function HomePage({ selectedClassCallback }) {
    const currentUser = auth.currentUser;
    const classListRef = useRef(null);
    const classTitleRef = useRef(null); // Reference to the web component
    const classDescRef = useRef(null);
    const [classTitle, setClassTitle] = useState('');
    const [classDesc, setClassDesc] = useState('');
    const classDBRef = collection(db, "classes");
    const classMemberDBRef = collection(db, "classMembers");

    useEffect(() => {
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
            });
            try {
                const classMemberInsertion = await addDoc(classMemberDBRef, {
                    classId: classCreation.id,
                    classRole: 'teacher',
                    uid: currentUser.uid,
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
            console.error("Error adding user: ", e);
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
                    <md-text-button type='button' onClick={() => document.getElementById('create-class-dialog').close()} value='cancel'>Cancel</md-text-button>
                    <md-filled-button type='submit' form="create-dialog-id">Create</md-filled-button>
                </div>
            </md-dialog>


            <div className="home-banner">
                <h1 className='banner-greet'>TinkFast </h1>
                <p className='banner-msg'>Join a class, start a quiz or engage with others by sharing your thoughts. Join the fun of learning!</p>
                <Player className='home-anim' autoplay loop src="/anims/home-anim.json" />
                <div className="banner-actions">
                    <md-filled-button onClick={createClassPrompt} >
                        <span slot='icon' className="material-symbols-outlined">add</span>
                        Create Class
                    </md-filled-button>
                    <md-outlined-button>
                        <span slot='icon' className="material-symbols-outlined">group_add</span>
                        Join Class
                    </md-outlined-button>
                </div>
            </div>
            <ClassList ref={classListRef} selectedClassCallback={selectedClassCallback} />
        </>
    );
}

export default HomePage;