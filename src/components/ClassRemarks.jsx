import React, { useContext, useEffect, useReducer, useState } from 'react'
import { collection, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from './Firebase';
import { DataGrid, GRID_STRING_COL_DEF } from '@mui/x-data-grid';
import { AppContext, ClassContext } from '../AppContext';
import { renderProgress } from './progress';
import { SparkLineChart } from '@mui/x-charts';
const ClassRemarks = () => {
    const { openedClass } = useContext(ClassContext);
    const [acts, setActs] = useReducer((currentQuizes, action) => {
        console.log('called', action);
        const type = action.type;
        switch (type) {
            case 'setQuizes':
                const newData =
                {
                    quizes: [...action.data.filter(item => item.category == 'quiz')],
                    pt: [...action.data.filter(item => item.category == 'performance task')],
                    exams: [...action.data.filter(item => item.category == 'exam')]
                };
                console.log('data ', newData);
                return newData;

            default:
        }
        return currentQuizes;
    }, {
        pt: [],
        quizes: [],
        exams: []
    });
    const [rows, setRows] = useState([]);
    const [responses, setResponses] = useState([]);
    const fetchData = async () => {
        await getQuizes();
        await getResponseQuizes();
        await getClassStudents();
    };
    useEffect(() => {
        fetchData();
    }, []);
    const getQuizes = async () => {
        let quizesGot = [];
        try {
            const quizRef = collection(db, 'quizes');
            const classQuery = query(quizRef, where('classId', '==', openedClass.id), where('status', '==', 'publish'));
            const queryResult = await getDocs(classQuery);
            console.log('query result: ' + queryResult);

            quizesGot = queryResult.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActs({
                type: 'setQuizes',
                data: quizesGot
            });
            // queses = quizesGot;
            console.log('Quizes got: ', quizesGot);

        } catch (error) {
            console.log('error getting quizes', error);
        }
    }
    const getResponseQuizes = async () => {
        let gotResponses = [];
        try {
            const quizRef = collection(db, 'QuizResponses');
            const classQuery = query(quizRef, where('classId', '==', openedClass.id));
            const queryResult = await getDocs(classQuery);
            // console.log('query result: ' + queryResult);

            gotResponses = queryResult.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResponses(gotResponses);
            // queses = gotResponses;
            console.log('Responses got: ', gotResponses);

        } catch (error) {
            console.log('error getting responses', error);
        }
    }
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

            const querySnapshot = await getDocs(filteredQuery);
            querySnapshot.forEach((doc) => {
                participantsUIDs.push(doc.data().uid);
                if (doc.data().classRole !== 'teacher')
                    participantsMembershipData.push({ membershipDoc: doc.id, ...doc.data() });
                else {
                }
                console.log('class role: ' + doc.data().classRole);
            });
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
    function GridSparklineCell(props) {
        if (props.value == null) {
            return null;
        }

        return (
            <SparkLineChart
                data={props.value}
                width={props.colDef.computedWidth}
                plotType={props.plotType}
                showTooltip={true}
                colors={['red', 'yellow', 'green']}
            />
        );
    }
    const sparklineColumnType = {
        ...GRID_STRING_COL_DEF,
        type: 'custom',
        resizable: false,
        filterable: false,
        sortable: false,
        editable: false,
        groupable: false,
        display: 'flex',
        renderCell: (params) => <GridSparklineCell {...params} />,
    };
    const xcolumns = [
        { field: 'studentID', headerName: 'ID number', width: 100 },
        { field: 'name', headerName: 'Name', width: 200 },
        ...[...acts.quizes, ...acts.pt, ...acts.exams].map((quiz, index) => ({
            field: quiz.id.toString(),
            headerName: (quiz.category == 'quiz' ? 'Quiz ' : quiz.category == 'performance task' ? 'PT ' : quiz.category == 'exam' ? 'Exam ' : '') + (index + 1),
            width: quiz.category == 'performance task' ? 200 : 100,
            editable: false,
            description: quiz.title + ' - ' + quiz.description,
        })),
        {
            field: 'grade',
            headerName: 'Grade',
            renderCell: renderProgress,
            width: 200,
            type: 'number',
            editable: false,
        },
        {
            field: 'performance',
            headerName: 'Performance Chart',
            ...sparklineColumnType,
            width: 200,
            editable: false,
        },
    ];
    const xgetGridRows = () => {
        let griddata = rows.map((row) => {
            let gainedScore = 0;
            let totalScore = 0;
            const rowData = {
                id: row.uid,
                studentID: row.studentID,
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
    const xcolumnGroupingModel = [
        {
            groupId: 'Student Info',
            description: '',
            children: [
                { field: 'studentID' },
                { field: 'name' },
            ],
        },
        {
            groupId: 'Activities',
            children: [
                {
                    groupId: 'Quizzes',
                    children: [
                        ...acts.quizes.map((quiz) => ({
                            field: quiz.id.toString()
                        })),
                    ]
                },
                {
                    groupId: 'Performance Tasks',
                    children: [
                        ...acts.pt.map((quiz) => ({
                            field: quiz.id.toString()
                        })),
                    ]
                },
                {
                    groupId: 'Exams',
                    children: [
                        ...acts.exams.map((quiz) => ({
                            field: quiz.id.toString()
                        })),
                    ]
                },
            ],
        },
        {
            groupId: 'Rating',
            children: [
                { field: 'grade' },
                { field: 'performance' },
            ]
        },
    ];


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
        <>
            <DataGrid
                rows={xgetGridRows()}
                columns={xcolumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                // checkboxSelection
                disableSelectionOnClick
                disableColumnSelector
                // rowHeight={25}
                columnGroupingModel={xcolumnGroupingModel}
            />
        </>
        // <div style={{ height: 'auto', width: '100%', color: 'black' }}>
        //     <ReactGrid
        //         rows={getGridData()}
        //         columns={columns}
        //         onCellsChanged={handleChanges} 
        //         enableGroupIdRender={true}
        //         stickyLeftColumns={1}
        //     />

        // </div>
    )
}

export default ClassRemarks
