import { Player, Controls } from '@lottiefiles/react-lottie-player';
import '@material/web/all';
import '@material/web/typography/md-typescale-styles.css';
import './styles/peopleList.css'
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { auth, db } from '../components/Firebase';
import { collection, addDoc, query, getDoc, getDocs, where } from "firebase/firestore";
import { Store } from 'react-notifications-component';

function PeopleList(props) {
    const [classTeachers, setClassTeachers] = useState([]);
    const [userData, setUserData] = useState(props.userData);
    const [classData, setClassData] = useState(props.classData);
    const [peopleToAdd, setPeopleToAdd] = useState([]);
    useEffect(() => {
        // setUserData(props.userData);
        // setClassData(props.classData);
        // setClassTeachers([]);
        getTeachers();
        try {

        } catch (error) {

        }
    }, []);

    const getTeachers = async () => {
        console.log('classData', classData);
        const filteredQuery = query(collection(db, 'classMembers'), where('classRole', '==', 'teacher'), where('classId', '==', classData.id));

        try {
            const querySnapshot = await getDocs(filteredQuery);
            let teachersUIDs = querySnapshot.docs.map(doc => (doc.data().uid));
            let startingItem = 0;
            let teachersPeople = [];
            const getTeachersUserInfos = async () => {
                try {
                    const newUsersBatch = [];
                    const usersToBeGet = teachersUIDs.slice(startingItem, 30);
                    // console.log('usersToBeGet', usersToBeGet);
                    const filteredQuery = query(collection(db, 'users'), where('uid', 'in', usersToBeGet));
                    const querySnapshot = await getDocs(filteredQuery);
                    // teachersUIDs.push(doc.data().uid);
                    querySnapshot.forEach((doc) => {
                        newUsersBatch.push({ doc: doc.id, ...doc.data() });
                    });
                    console.log('new users', newUsersBatch);

                    if ((usersToBeGet.length - 30) > 0) {
                        console.log('users length', usersToBeGet.length - 30 < 1);
                        startingItem += 30;
                        getTeachersUserInfos();
                    }
                    setClassTeachers([...teachersPeople, ...newUsersBatch]);
                } catch (error) {
                    console.log('get teacher user info ', error);

                }
            }
            getTeachersUserInfos();

        } catch (error) {
            console.log(error);
        }

    };

    const getStuents = async () => {
        console.log('classData', classData);
        const filteredQuery = query(collection(db, 'classMembers'), where('classRole', '==', 'teacher'), where('classId', '==', classData.id));
        let studentUIDs = [];
        try {
            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.forEach((doc) => {
                studentUIDs.push(doc.data().uid);
            });
            let startingItem = 0;
            const getTeachersUserInfos = async () => {
                try {
                    const newUsersBatch = [];
                    const usersToBeGet = studentUIDs.slice(startingItem, 30);
                    // console.log('usersToBeGet', usersToBeGet);
                    const filteredQuery = query(collection(db, 'users'), where('uid', 'in', usersToBeGet));
                    const querySnapshot = await getDocs(filteredQuery);
                    // studentUIDs.push(doc.data().uid);
                    querySnapshot.forEach((doc) => {
                        newUsersBatch.push({ doc: doc.id, ...doc.data() });
                    });
                    console.log('new users', newUsersBatch);

                    if ((usersToBeGet.length - 30) > 0) {
                        console.log('users length', usersToBeGet.length - 30 < 1);
                        startingItem += 30;
                        getTeachersUserInfos();
                    }
                    setClassTeachers([...classTeachers, ...newUsersBatch]);
                } catch (error) {
                    console.log('get teacher user info ', error);

                }
            }
            getTeachersUserInfos();

        } catch (error) {
            console.log(error);
        }
        console.log('teachers', studentUIDs);

    };


    return (
        <>
            {props.userData === null || props.classData === null ?
                <></>
                :
                classTeachers === null ?
                    <md-linear-progress indeterminate></md-linear-progress>
                    :
                    <div className='class-people-container'>
                        <div className='people-item-container'>
                            <div className="people-list-title">
                                <h1 className="md-typescale-display-small">Teachers</h1>
                                <div className="people-list-actions">
                                    {classData.classRole == 'teacher' ?
                                        <md-icon-button>
                                            <md-icon>person_add</md-icon>
                                        </md-icon-button> : <></>
                                    }
                                </div>
                            </div>
                            {/* <md-divider></md-divider> */}
                            <ul className='people-list'>
                                {classTeachers.map((item, index) => (
                                    <li key={item.uid} className="people-item">
                                        <div className="user-info">
                                            <div className="user-details">
                                                <span className='user-image' style={{ backgroundImage: `url(` + item.imgUrl + `)` }}></span>
                                                <p className='md-typescale-body-large user-name'>{item.firstname} {item.lastname} {item.uid == userData.uid ? '(You)' : <></>}</p>
                                            </div>
                                        </div>
                                        <div className="user-actions">
                                            {!item.uid == userData.uid && classData.classRole == 'teacher' ?
                                                <md-icon-button>
                                                    <md-icon>remove</md-icon>
                                                </md-icon-button>
                                                : <></>
                                            }


                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <br />
                            <br />
                            <div className="people-list-title">
                                <h1 className="md-typescale-display-small">Students</h1>
                                <div className="people-list-actions">
                                    {classData.classRole == 'teacher' ?
                                        <md-icon-button onClick={() => { document.getElementById('add-people-dialog').show() }}>
                                            <md-icon>person_add</md-icon>
                                        </md-icon-button> : <></>
                                    }
                                </div>
                            </div>
                            <ul className='people-list'>
                                {classTeachers.map((item, index) => (
                                    <li key={item.uid} className="people-item">
                                        <div className="user-info">
                                            <div className="user-details">
                                                <span className='user-image' style={{ backgroundImage: `url(` + item.imgUrl + `)` }}></span>
                                                <p className='md-typescale-body-large user-name'>{item.firstname} {item.lastname} {item.uid == userData.uid ? '(You)' : <></>}</p>
                                            </div>
                                        </div>
                                        <div className="user-actions">
                                            {!item.uid == userData.uid && classData.classRole == 'teacher' ?
                                                <md-icon-button>
                                                    <md-icon>remove</md-icon>
                                                </md-icon-button>
                                                : <></>
                                            }


                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div >
            }



            <md-dialog id="add-people-dialog" >
                <div slot="headline" style={{ fontFamily: 'Open Sans' }}>
                    Invite students in class
                </div>
                <form slot="content" id="create-dialog-id" method="dialog">
                    <div className="create-dialog">
                        <input placeholder='Enter a name or email' type="text" className='input-student' onChange={handlePeopleInput} />
                        <md-chip-set class='input-class-people' aria-label="Actions">
                            {peopleToAdd.map((item, index) => (
                                <md-input-chip disabled avatar label='Input chip with avatar'>
                                    <img
                                        slot="icon"
                                        src="https://lh3.googleusercontent.com/a/default-user=s48" />
                                </md-input-chip>
                            ))}
                            <md-input-chip avatar label='Input chip with avatar' remove={() => { console.log('closed') }}>
                                <img
                                    slot="icon"
                                    src="https://lh3.googleusercontent.com/a/default-user=s48" />
                            </md-input-chip>
                        </md-chip-set>
                    </div>
                </form>
                <div slot="actions">
                    <md-text-button type='button' onClick={() => document.getElementById('add-people-dialog').close()} value='cancel'>Cancel</md-text-button>
                    <md-text-button>Invite</md-text-button>
                </div>
            </md-dialog >
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