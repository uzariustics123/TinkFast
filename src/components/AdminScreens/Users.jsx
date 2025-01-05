import React, { useEffect, useState } from 'react'
import { collection, doc, getDocs, query } from "firebase/firestore";
import { db } from '../Firebase';

export const Users = (props) => {
    const [usersList, setUsersList] = useState([{}]);
    let userz = [{}];
    const [rows, setRows] = useState([{}]);
    useEffect(() => {
        getUsers();
    }, []);
    const getUsers = async () => {
        try {
            const usersCollection = collection(db, 'users');
            // const usersQuery = query(usersCollection);
            const users = await getDocs(usersCollection);
            const usersnaps = users.docs.map(doc => doc.data());
            setUsersList(usersnaps);
            userz = usersnaps;
            console.log('usersnaps', usersnaps);
        } catch (error) {
            console.log('Error: ', error);
        }

        setRows(userz);
    }
    const xcolumns = [
        { field: 'userid', headerName: 'ID number', width: 100 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'name', headerName: 'Name', width: 200 },
        // ...[...userz].map((user, index) => ({
        //     field: user.uid,
        //     headerName: user.firstname,
        //     width: 200,
        //     editable: false,
        //     description: user.lastname,
        // })),
    ];
    const xgetGridRows = () => {
        let griddata = rows.map((row) => {
            let gainedScore = 0;
            let totalScore = 0;
            const rowData = {
                id: row.uid,
                userid: row.studentID,
                name: `${row.firstname} ${row.lastname}`,
                performance: [],
                grade: 0,
            };

            [...acts.quizes, ...acts.pt, ...acts.exams].forEach((quiz) => {
                const response = responses.find(item => item.uid === row.uid && item.quizId === quiz.id);
                rowData[quiz.id] = response ? response.score + ' / ' + response.totalScore : '- -';
                gainedScore += response ? response.score : 0;
                totalScore += response ? response.totalScore : 0;
                rowData.performance.push(response ? Math.round((response.score / response.totalScore) * 100) : 0);
            });
            rowData.grade = Math.round((gainedScore / totalScore) * 100);
            // rowData.performance = gainedScor e;
            return rowData;
        });
        return griddata;
    };
    return (
        <>
            <div>users</div>
            {/* <DataGrid
                rows={xgetGridRows()}
                columns={xcolumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                // checkboxSelection
                disableSelectionOnClick
                disableColumnSelector
                // rowHeight={25}
                columnGroupingModel={xcolumnGroupingModel}
            /> */}
        </>
    )
}
