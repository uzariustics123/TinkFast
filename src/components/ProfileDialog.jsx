import React, { useContext, useEffect, useState } from 'react'
import './styles/profileDialog.css';
import { AppContext } from '../AppContext';
import { Button, colors, Dialog, DialogActions, DialogTitle, styled } from '@mui/material';
import { IconButton } from 'ui-neumorphism';
import { supabase } from './Supabase';
import { collection, doc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore'
import { db } from './Firebase';
import '@material/web/all';

export const ProfileDialog = () => {
    const { currentUserData, profileDialog, setProfileDialog, setCurrentUserData } = useContext(AppContext);
    const [acts, setActs] = useState([]);
    const [classes, setClasses] = useState([]);
    const [classParticipants, setClassParticipants] = useState([]);
    const [filePath, setfilepath] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setloading] = useState(false);
    // console.log('us', currentUserData);
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            getClasses().then(classess => {
                console.log('called', isMounted);

                setClasses(classess);
                fetchAllUsers(classess, 30).then(allUsers => {
                    console.log("Users fetched successfully:", allUsers.length);
                    setClassParticipants(allUsers);
                    // Store allUsers in a variable or state for later use
                });
                getActivities(classess, 30).then((activities) => {
                    setActs(activities);
                });
            })
        }
        return () => {
            isMounted = false;
        };
    }, []);
    const getActivities = async (classes, pageSize = 30) => {
        const quizRef = collection(db, 'quizes');
        let actsList = [];
        let classIds = classes.map(item => item.id);
        let lastVisible = null;
        let hasMore = true;
        try {
            while (hasMore) {
                // Define the query
                let actsQuery = query(quizRef, where('classId', 'in', classIds), limit(pageSize));
                if (lastVisible) {
                    actsQuery = query(quizRef, where('classId', 'in', classIds), startAfter(lastVisible), limit(pageSize));
                }
                // Fetch the current batch of users
                const querySnapshot = await getDocs(actsQuery);
                // Add users to the list
                console.log('users dos', querySnapshot.docs);

                const users = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                actsList = [...actsList, ...users];
                // Check if we have more documents
                if (querySnapshot.docs.length < pageSize) {
                    hasMore = false;
                } else {
                    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                }
            }

            // console.log("All acts:", actsList);
            return actsList; // Return the full list of users
        } catch (error) {
            console.error("Error fetching all activities:", error);
        }
    }
    async function fetchAllUsers(classess, pageSize = 30) {
        const usersCollectionRef = collection(db, "classMembers");
        let usersList = [];
        console.log('classes', classess);
        let classIds = classess.map(item => item.id);

        let lastVisible = null;
        let hasMore = true;
        try {
            while (hasMore) {
                // Define the query
                let usersQuery = query(usersCollectionRef, where('classId', 'in', classIds), limit(pageSize));
                if (lastVisible) {
                    usersQuery = query(usersCollectionRef, where('classId', 'in', classIds), startAfter(lastVisible), limit(pageSize));
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
    const getClasses = async () => {
        const currentUser = currentUserData;
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
            console.log('classes we got', itemsData);
            return itemsData;
        } catch (error) {
            console.log(error);
            return [];
            // setClasses([]);
        }
    }
    const uploadSupabase = async (file) => {
        const filePath = 'uploads/' + currentUserData.uid;
        const { data, error } = await supabase
            .storage
            .from('tinkfast-public-bucket')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });
        console.log('error supabase', error);
        const { data: url } = supabase.storage
            .from('tinkfast-public-bucket')
            .getPublicUrl(filePath);
        return url;

    }
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setfilepath(URL.createObjectURL(file));
        setFile(file);
    }
    const handleUpload = async () => {
        setloading(true);
        try {
            const formData = new FormData();
            formData.append('uploadedFile', file);
            const fileUrl = await uploadSupabase(file);
            // setfilepath(fileUrl.publicUrl);
            console.log('filepath', fileUrl);
            const quizesRef = collection(db, 'users');
            const userDoc = doc(quizesRef, currentUserData.id);
            await updateDoc(userDoc, {
                imgUrl: fileUrl.publicUrl
            });
            setFile(null);
            setCurrentUserData({ ...currentUserData, imgUrl: fileUrl.publicUrl });
        } catch (error) {
            console.log(error);

        }
        setloading(false);

    }
    return (
        <>
            <Dialog
                open={profileDialog}
                onClose={() => { }}
            >
                <DialogTitle>Profile</DialogTitle>
                {loading && <md-linear-progress indeterminate></md-linear-progress>}
                <div style={{ padding: '1rem' }} className='prof-outer'>

                    <div className='prof-con'>
                        <div className="img-lo">

                            <img src={filePath == '' ? currentUserData?.imgUrl : filePath} style={{ borderRadius: '50px', border: `4px solid ${colors.blue[600]}`, width: '100px', height: '100px', justifySelf: 'center' }} />
                        </div>
                        <Button
                            component="label"
                            role={undefined}
                            variant="outlined"
                            size='small'
                            tabIndex={-1}
                        >
                            change photo
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleFileChange}
                                multiple
                            />
                        </Button>
                        <h3>{currentUserData?.firstname} {currentUserData?.lastname}</h3>
                        <p style={{ color: colors.green[900], textTransform: 'capitalize' }}>{currentUserData.role}</p>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: colors.green[900] }}>{currentUserData.email}</p>
                        <div className="summaries">
                            <div className="item-sum">
                                <p className='sum-item-title'>
                                    Classes
                                </p>
                                <p className='sum-item-desc'>
                                    {classes.length ?? 0}
                                </p>
                            </div>
                            <div className="mydivider"></div>
                            <div className="item-sum">
                                <p className='sum-item-title'>
                                    Activities
                                </p>
                                <p className='sum-item-desc'>
                                    {acts.length ?? 0}
                                </p>
                            </div>
                            <div className="mydivider"></div>
                            <div className="item-sum">
                                <p className='sum-item-title'>
                                    Students
                                </p>
                                <p className='sum-item-desc'>
                                    {classParticipants.length ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <br />
                </div>
                <Button sx={{ m: 1 }} loading={loading} variant='contained' disabled={file == null} onClick={() => { handleUpload() }} > Save</Button>
                <Button sx={{ m: 1 }} variant='outlined' onClick={() => { setProfileDialog(false) }} > Close </Button>
                {/* <DialogActions>
                    <Button onClick={() => { setProfileDialog(false) }} >Cancel</Button>
                    <Button onClick={() => { setProfileDialog(false) }}>OK</Button>
                </DialogActions> */}
            </Dialog>
        </>
    )
}
