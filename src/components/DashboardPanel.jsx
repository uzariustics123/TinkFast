import { Box, colors, Stack, Typography } from '@mui/material'
import './styles/dashboardPanel.css';
import React, { useEffect, useState } from 'react'
import { Player } from '@lottiefiles/react-lottie-player';
import { LineChart, PieChart } from '@mui/x-charts';
import { collection, doc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore'
import { db } from './Firebase';
import { AppContext, ClassContext } from '../AppContext';
import { useContext } from 'react';
import {
  blueberryTwilightPalette,
  mangoFusionPalette,
  cheerfulFiestaPalette,
} from '@mui/x-charts/colorPalettes';

export const DashboardPanel = () => {

  const [acts, setActs] = useState([]);
  const [classes, setClasses] = useState([]);
  const { openedClass } = useContext(ClassContext);
  const { currentUserData } = useContext(AppContext);
  const [classParticipants, setClassParticipants] = useState([]);
  useEffect(() => {
    getClasses().then(classess => {
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

      console.log("All acts:", actsList);
      return actsList; // Return the full list of users
    } catch (error) {
      console.error("Error fetching all activities:", error);
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
  const classNames = classes.map(item => item.className);

  const getLineEntries = () => {
    const studentEntries = { data: [], label: 'People', color: colors.green[900], area: false, };
    const actsEntries = { data: [], label: 'Activities', color: colors.cyan[900], area: false, };
    classes.forEach((klasi, index) => {
      const filteredStudents = classParticipants.filter(parti => parti.classId == klasi.id);
      const filteredActs = acts.filter(act => act.classId == klasi.id);
      studentEntries.data[index] = filteredStudents.length;
      actsEntries.data[index] = filteredActs.length;
    })
    return [studentEntries, actsEntries];
  }

  const getPieEntries = () => {
    const entries = []
    // const studentEntries = { data: [], label: 'Students', color: colors.green[900] };
    // const actsEntries = { data: [], label: 'Activities', color: colors.cyan[900] };
    classes.forEach((klasi, index) => {
      const filteredStudents = classParticipants.filter(parti => parti.classId == klasi.id);
      const filteredActs = acts.filter(act => act.classId == klasi.id);
      let value = { id: index, value: filteredStudents.length, label: 'Class ' + klasi.className }
      // studentEntries.data[index] = filteredStudents.length;
      // actsEntries.data[index] = filteredActs.length;
      entries.push(value);
    })
    return entries;
  }

  return (
    <>
      <div className="header-db" style={{ backgroundImage: 'url("/illustrations/people-having-fun.jpg")', height: '250px', width: '100%' }}>
        <PieChart
          colors={cheerfulFiestaPalette}
          // slotProps={{ legend: { hidden: true } }}
          series={[
            {
              data: getPieEntries(),
              cornerRadius: 15,
              innerRadius: 10,
              paddingAngle: 6
            },
          ]}
          width={500}
          height={200}
        />
      </div>
      <br />
      <div className='dash-header-container'>
        {/* <Stack direction={'row'} spacing={2}> */}

        <div style={{ overflow: 'hidden' }} className="card-item">
          <Typography className='tp' component="span" variant="caption" sx={{ color: colors.green[900], display: 'inline', fontSize: '18px' }}>
            <strong> {classParticipants.length ?? 0} &nbsp; </strong>total people engaged with
          </Typography>
          <Player style={{ marginTop: '-2rem' }} className='anim-db-item' autoplay loop src="/anims/lottie-people-setting.json" />
        </div>
        <div className="card-item">
          <Typography className='tp' component="span" variant="caption" sx={{ color: colors.green[900], display: 'inline', fontSize: '18px' }}>
            <strong> {classNames.length} &nbsp; </strong> Classes
          </Typography>
          <Player style={{ height: '150px' }} className='anim-db-item' autoplay loop src="/anims/people-anim.json" />
        </div>
        <div className="card-item">
          <Typography className='tp' component="span" variant="caption" sx={{ color: colors.green[900], display: 'inline', fontSize: '18px' }}>
            <strong>
              {acts.length ?? 0} &nbsp;
            </strong>
            Activities
          </Typography>
          <Player style={{ height: '170px' }} className='anim-db-item' autoplay loop src="/anims/networked-user-anim.json" />
        </div>
        {/* </Stack> */}
      </div>
      <br />
      <div className="chartbar" style={{ height: '500px', width: '100%' }}>
        <LineChart
          series={getLineEntries() ??
          {
            data: [], label: 'Students', color: colors.green[900],
          }
          }
          xAxis={[
            { scaleType: 'point', data: classNames },
          ]}
        />
      </div>
    </>
  )
}
