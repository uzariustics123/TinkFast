import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/peopleList.css'
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where, WriteBatch, writeBatch, doc, deleteDoc } from "firebase/firestore";
import { Store } from 'react-notifications-component';
import PeopleSelection from './PeopleSelection';


function PeopleList(props) {
    const [classParticipants, setClassParticipants] = useState([]);
    const [userData, setUserData] = useState(props.userData);
    const [classData, setClassData] = useState(props.classData);
    const [peopleToAdd, setPeopleToAdd] = useState([]);
    const [participantToDelete, setParticipantToDelete] = useState(null);
    const teacherSelectionDialog = useRef(null);
    const studentsSelectionDialog = useRef(null);
    const removeParticipantDialog = useRef(null);
    useEffect(() => {
        // setUserData(props.userData);
        // setClassData(props.classData);
        // setClassTeachers([]);
        // getTeachers();
        getClassParticipants();
        try {

        } catch (error) {

        }
    }, []);

    const getClassParticipants = async () => {
        // console.log('classData', classData);
        const filteredQuery = query(collection(db, 'classMembers'), where('classId', '==', classData.id));
        let participantsUIDs = [];
        let participantsList = [];
        let participantsMembershipData = [];
        try {
            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.forEach((doc) => {
                participantsUIDs.push(doc.data().uid);
                participantsMembershipData.push({ membershipDoc: doc.id, ...doc.data() });
            });
            let startingItem = 0;
            const getUserData = async () => {
                try {
                    const usersToBeGet = participantsUIDs.slice(startingItem, 30);
                    // console.log('usersToBeGet', usersToBeGet);
                    const filteredQuery = query(collection(db, 'users'), where('uid', 'in', usersToBeGet));
                    const querySnapshot = await getDocs(filteredQuery);
                    // participantsUIDs.push(doc.data().uid);
                    querySnapshot.forEach((doc) => {
                        let foundMembershipData = participantsMembershipData.find(foundItem => foundItem.uid === doc.data().uid);
                        participantsList.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                        // if (foundMembershipData && foundMembershipData.classRole == 'teacher')
                        //     teachersList.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                        // else if (foundMembershipData && foundMembershipData.classRole == 'student')
                        //     studentsList.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                    });

                    if ((usersToBeGet.length - 30) > 0) {
                        // console.log('users length', usersToBeGet.length - 30 < 1);
                        startingItem += 30;
                        getUserData();
                    }
                    // participantsUserData = [...participantsUserData, ...newUsersBatch];
                } catch (error) {
                    console.log('get teacher user info ', error);

                }
            }
            await getUserData();
            setClassParticipants(participantsList);
            // setClassStudents(studentsList);
            // setClassTeachers(teachersList);

        } catch (error) {
            console.log(error);
        }
        // console.log('teachers', participantsUIDs);

    };

    const addSelectedStudents = (selections) => {
        const selctionDialog = studentsSelectionDialog.current;
        selctionDialog.showLoading();
        if (selections.length > 0)
            try {
                const batch = writeBatch(db);
                selections.forEach((studentUserData) => {
                    const docRef = doc(collection(db, 'classMembers'));

                    batch.set(docRef, {
                        classId: classData.id,
                        classRole: 'student',
                        status: 'invited',
                        uid: studentUserData.uid
                    });
                });
                batch.commit().then(function () {
                    // ...
                    console.log('done student added');

                    selctionDialog.hideLoading();

                });
            } catch (error) {
                console.log('save error', error);
                selctionDialog.hideLoading();

            }
        else
            console.log('no selection', selections);
        console.log('selection dialog hidden');
        getClassParticipants();
        selctionDialog.closeDialog();

    }
    const removeParticipantPrompt = (item) => {
        console.log('classParticipants', classParticipants);

        let foundParticipantToDel = classParticipants.find(foundItem => foundItem.uid === item.uid);
        console.log('foundParticipantToDel', foundParticipantToDel);

        setParticipantToDelete({ classMemberDoc: foundParticipantToDel.doc, ...item });
        removeParticipantDialog.current.show();

    }
    const removeClassParticipant = async () => {

        try {
            console.log(participantToDelete);

            const docRef = doc(db, 'classMembers', participantToDelete.membershipDoc);
            const deleteRes = await deleteDoc(docRef);
            console.log('deleteres', deleteRes);

            Store.addNotification({
                title: "Class participant removed",
                message: `${participantToDelete.firstname} ${participantToDelete.lastname} was removed from this class`,
                type: "info",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeInRight"],
                animationOut: ["animate__animated", "animate__fadeOutRight"],
                dismiss: {
                    duration: 4000,
                    onScreen: true
                }
            });

            // getTeachers();
            getClassParticipants();
            removeParticipantDialog.current.close();
        } catch (error) {
            console.log('Error removing student', error);
            Store.addNotification({
                title: "Oh snap! ",
                message: "Try again later",
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
    }

    return (
        <>
            {props.userData === null || props.classData === null ?
                <></>
                :
                classParticipants === null ?
                    <md-linear-progress indeterminate></md-linear-progress>
                    :
                    <div className='class-people-container'>
                        <div className='people-item-container'>
                            <div className="people-list-title">
                                <h1 className="md-typescale-display-small">Teachers</h1>
                                <div className="people-list-actions">
                                    {classData.classRole == 'teacher' ?
                                        <md-icon-button onClick={() => { teacherSelectionDialog.current.showDialog(); }}>
                                            <md-icon>person_add</md-icon>
                                        </md-icon-button> : <></>
                                    }
                                </div>
                            </div>
                            {/* <md-divider></md-divider> */}
                            <ul className='people-list'>
                                {classParticipants.map((item, index) => (
                                    item.classRole == 'teacher' ?
                                        <li key={item.uid} className="people-item">
                                            <div className="user-info">
                                                <div className="user-details">
                                                    <span className='user-image' style={{ backgroundImage: `url(` + item.imgUrl + `)` }}></span>
                                                    <p className='md-typescale-body-large user-name'>{item.firstname} {item.lastname} {item.uid == userData.uid ? '(You)' : ''} {item.status == 'invited' ? '(Invited)' : ''} </p>
                                                </div>
                                            </div>
                                            <div className="user-actions">
                                                {!item.uid == userData.uid && classData.classRole == 'teacher' ?
                                                    <md-icon-button onClick={() => { removeParticipantPrompt(item) }}>
                                                        <md-icon>remove</md-icon>
                                                    </md-icon-button>
                                                    : <></>
                                                }


                                            </div>
                                        </li>
                                        :
                                        <></>
                                ))}
                            </ul>
                            <br />
                            <br />
                            <div className="people-list-title">
                                <h1 className="md-typescale-display-small">Students</h1>
                                <div className="people-list-actions">
                                    {classData.classRole == 'teacher' ?
                                        <md-icon-button onClick={() => { studentsSelectionDialog.current.showDialog() }}>
                                            <md-icon>person_add</md-icon>
                                        </md-icon-button> : <></>
                                    }
                                </div>
                            </div>
                            <ul className='people-list'>
                                {classParticipants.map((item, index) => (
                                    item.classRole == 'student' ?
                                        <li key={item.uid} className="people-item">
                                            <div className="user-info">
                                                <div className="user-details">
                                                    <span className='user-image' style={{ backgroundImage: `url(` + item.imgUrl + `)` }}></span>
                                                    <p className='md-typescale-body-large user-name'>{item.firstname} {item.lastname} {item.uid == userData.uid ? '(You)' : ''} {item.status == 'invited' ? '(Invited)' : ''}</p>
                                                </div>
                                            </div>
                                            <div className="user-actions">
                                                {item.uid != userData.uid && classData.classRole == 'teacher' ?
                                                    <md-icon-button onClick={() => { removeParticipantPrompt(item) }} >
                                                        <md-icon>remove</md-icon>
                                                    </md-icon-button>
                                                    : <></>
                                                }


                                            </div>
                                        </li>
                                        :
                                        <></>
                                ))}
                            </ul>
                        </div>

                        <PeopleSelection participantsList={classParticipants} ref={teacherSelectionDialog} selectionTitle={"Invite Teachers in your class"} cancelLabel="Cancel" onCancelEvent={() => {
                            console.log('canceled');
                        }} saveLabel="Invite" />
                        <PeopleSelection participantsList={classParticipants} selectionTitle={'Invite students in your class'} ref={studentsSelectionDialog} onSaveSelectionEvent={addSelectedStudents} cancelLabel="Cancel" onCancelEvent={() => {
                            console.log('canceled');
                        }} saveLabel="Invite" />
                    </div >
            }
            <md-dialog id='remove-participant-dialog' ref={removeParticipantDialog}>
                <form slot="content" method="dialog">
                    <div className="create-dialog">
                        {/* <md-divider></md-divider> */}
                        <center>
                            <img style={{ width: '250px', height: '100px', }} src='./illustrations/logout-illu.svg' className="img-display"></img>
                        </center>
                        <br />
                        <p className="md-typescale-body-medium"> {participantToDelete ? `Are you sure you want remove ${participantToDelete.firstname} ${participantToDelete.lastname} from this class?` : ''}</p>
                    </div>
                </form>
                <div slot="actions">
                    <md-text-button onClick={() => { removeParticipantDialog.current.close() }} value="cancel">Cancel</md-text-button>
                    <md-text-button onClick={removeClassParticipant} value="ok">Remove</md-text-button>
                </div>
            </md-dialog>
        </>
    );
}

const handlePeopleInput = (event) => {
    console.log(event.target.value);
    try {

    } catch (error) {

    }
}
export default PeopleList;
{/* <DotLottieReact
      src="path/to/animation.lottie"
      loop
      autoplay
    /> */}