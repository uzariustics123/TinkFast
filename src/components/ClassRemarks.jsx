import React, { useContext, useEffect, useState } from 'react'
import { ReactGrid } from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'
import { collection, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from './Firebase';
import { AppContext, ClassContext } from '../AppContext';
const ClassRemarks = () => {
    const { openedClass } = useContext(ClassContext);
    const [rows, setRows] = useState([
        { studentID: 1, firstname: 'John', lastname: 'Doe' },
        { studentID: 2, firstname: 'Jane', lastname: 'Boston' },
        // Add more rows as needed
    ]);

    const getClassStudents = async () => {
        console.log('getting students');
        const participants = [];

        let participantsUIDs = [];
        let participantsList = [];
        let participantsMembershipData = [];
        try {
            const filteredQuery = query(collection(db, 'classMembers'), where('classId', '==', openedClass.id),
                where('classRole', '!=', 'teacher'),
                where('status', '==', 'accepted'));
            console.log('log');

            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.forEach((doc) => {
                participantsUIDs.push(doc.data().uid);
                if (doc.data().classRole !== 'teacher')
                    participantsMembershipData.push({ membershipDoc: doc.id, ...doc.data() });
                else {
                }
                console.log('class role: ' + doc.data().classRole);
            });
            console.log('query snap', querySnapshot);
            let startingItem = 0;
            const getUserData = async () => {
                try {
                    const usersToBeGet = participantsUIDs.slice(startingItem, 30);
                    const userQuery = query(collection(db, 'users'), where('uid', 'in', usersToBeGet));
                    const queryResult = await getDocs(userQuery);
                    queryResult.forEach((doc) => {
                        let foundMembershipData = participantsMembershipData.find(foundItem => foundItem.uid === doc.data().uid);
                        participants.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                    });
                } catch (error) {
                    console.log('error getting users ', error);
                }
            }
            await getUserData();
        } catch (error) {
            console.log('1error getting users ', error);
        }

        setRows(participants);
        // console.log('teachers', participantsUIDs);

    };

    useEffect(() => {
        getClassStudents();

    }, [])
    const columns = [
        { columnId: 'studentID', width: 100 },
        { columnId: 'firstname', width: 200 },
        { columnId: 'lastname', width: 200 },
    ]

    const getGridData = () => {


        return [
            {
                rowId: 'header',
                cells: [
                    { type: 'header', text: 'ID number' },
                    { type: 'header', text: 'First Name' },
                    { type: 'header', text: 'Last Name' },
                ],
            },
            ...rows.map((row) => ({
                rowId: row.id,
                cells: [
                    { type: 'text', text: row.studentID.toString() },
                    { type: 'text', text: row.firstname },
                    { type: 'text', text: row.lastname },
                ],
            })),
        ]
    }

    const handleChanges = (changes) => {
        setRows((prevRows) => {
            const newRows = [...prevRows]
            changes.forEach((change) => {
                const rowIndex = newRows.findIndex((row) => row.id === change.rowId)
                if (rowIndex !== -1) {
                    newRows[rowIndex] = {
                        ...newRows[rowIndex],
                        [change.columnId]: change.newCell.text,
                    }
                }
            })
            return newRows
        })
    }
    return (
        <div style={{ height: 'auto', width: '100%', color: 'black' }}>
            <ReactGrid
                rows={getGridData()}
                columns={columns}
                onCellsChanged={handleChanges}
            />
        </div>
    )
}

export default ClassRemarks
