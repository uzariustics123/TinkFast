import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { collection, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from './Firebase';
import { DataGrid, GRID_STRING_COL_DEF } from '@mui/x-data-grid';
import { AppContext, ClassContext } from '../AppContext';
import { renderProgress } from './progress';
import { SparkLineChart } from '@mui/x-charts';
import { Box, Chip, IconButton, Tab, Tabs } from '@mui/material';
const ExcelJS = require('exceljs');
// import XLSX from 'xlsx';
// import * as XLSX from "xlsx";
const ClassRemarks = (props) => {
    const { openedClass } = useContext(ClassContext);
    const {currentUserData} = useContext(AppContext);
    const [curtab, setTab] = useState(0);
    let periods = ['prelim', 'midterm', 'finals'];
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
    }, [curtab]);
    const getQuizes = async () => {
        let quizesGot = [];
        try {
            const quizRef = collection(db, 'quizes');
            const classQuery = query(quizRef,
                where('classId', '==', openedClass.id),
                where('status', '==', 'publish'),
                where('period', '==', periods[curtab])
            );
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
        // let participantsList = [];
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
                // console.log('class role: ' + doc.data().classRole);
            });
            let startingItem = 0;
            const getUserData = async () => {
                try {
                    const usersToBeGet = participantsUIDs.slice(startingItem, 30);
                    const userQuery = query(collection(db, 'users'), where('uid', 'in', usersToBeGet));
                    const queryResult = await getDocs(userQuery);
                    queryResult.forEach((doc) => {
                        let foundMembershipData = participantsMembershipData.find(foundItem => foundItem.uid === doc.data().uid);
                        if( openedClass.classRole == 'student' && foundMembershipData.uid == currentUserData.uid) {
                            
                            participants.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                        }else if( openedClass.classRole == 'teacher'){
                            participants.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                        }
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
    const xcolumns = () => {
        const xgridColumn = [
            { field: 'studentID', headerName: 'ID number', width: 100 },
            { field: 'name', headerName: 'Name', width: 200 },
            ...[...acts.quizes, ...acts.pt, ...acts.exams].map((quiz, index) => ({
                field: quiz.id.toString(),
                headerName: (quiz.category == 'quiz' ? 'Quiz ' : quiz.category == 'performance task' ? 'PT ' : quiz.category == 'exam' ? 'Exam ' : '') + (index + 1),
                width: quiz.category == 'performance task' ? 200 : 100,
                editable: false,
                description: quiz.title + ' - ' + quiz.description,
            })),
        ];
        if (openedClass.classRole == 'teacher'){
            xgridColumn.push(
                {
                    field: 'grade',
                    headerName: 'Grade',
                    renderCell: renderProgress,
                    width: 200,
                    type: 'number',
                    editable: false,
                },
            );
        }
        xgridColumn.push(
            {
                field: 'performance',
                headerName: 'Performance Chart',
                ...sparklineColumnType,
                width: 200,
                editable: false,
            }
        )
        return xgridColumn;
    };
    const xgetGridRows = () => {
        const categoryWeights = {
            performanceTask: 0.40,
            exam: 0.30,
            quiz: 0.30,
        };
        let griddata = rows.map((row) => {
            let rowSheet = {};
            let gainedScore = 0;
            let totalScore = 0;
            let ptScore = 0;
            let ptTotalScore = 0;
            let examScore = 0;
            let examTotalScore = 0;
            let quizScore = 0;
            let quizTotalScore = 0;
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
                if (response) {
                    gainedScore += response ? response.score : 0;
                    ptScore += quiz.category == 'performance task' ? response.score : 0;
                    examScore += quiz.category == 'exam' ? response.score : 0;
                    quizScore += quiz.category == 'quiz' ? response.score : 0;
                    ptTotalScore += quiz.category == 'performance task' ? response.totalScore : 0;
                    examTotalScore += quiz.category == 'exam' ? response.totalScore : 0;
                    quizTotalScore += quiz.category == 'quiz' ? response.totalScore : 0;
                    totalScore += response ? response.totalScore : 0;
                    rowData.performance.push(response.score != 0 ? Math.round((response.score / response.totalScore) * 100) : 0);
                }
            });
            console.log('pt: ', ptScore, '/', ptTotalScore);
            console.log('exam: ', examScore, '/', examTotalScore);
            console.log('quiz:', quizScore, '/', quizTotalScore);
            let ptGrade = (ptScore != 0 && ptTotalScore != 0) ? ((ptScore / ptTotalScore) * 100) * categoryWeights.performanceTask : 0;
            let examGrade = (examScore != 0 && examTotalScore != 0) ? ((examScore / examTotalScore) * 100) * categoryWeights.exam : 0;
            let quizGrade = (quizScore != 0 && quizTotalScore != 0) ? ((quizScore / quizTotalScore) * 100) * categoryWeights.quiz : 0;
            console.log('pt grade:', ptGrade);
            console.log('exam grade:', examGrade);
            console.log('quiz grade:', quizGrade);


            rowData.grade = Math.round(ptGrade + examGrade + quizGrade);
            rowSheet['Student ID'] = row.studentID;
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
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
        console.log('curtab: ', newValue);
        fetchData();

    };
    const handleExport = () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Tinkfast';
        // workbook.lastModifiedBy = 'Tinkfast';
        // workbook.created = new Date();
        // workbook.modified = new Date();
        // workbook.lastPrinted = new Date();
        // workbook.properties.date1904 = true;
        const sheet = workbook.addWorksheet('PerformanceReport');
        sheet.mergeCells('A1', 'B2');
        sheet.addRow(['Student Information', 'Activities', 'Rating'])
        // sheet.spliceRows(1, 0, ['Student Information', 'Activities', 'Rating']);
        const headerColms = [
            {header: 'Student Information', key: 'studentInformation', width: 30},
            {header: 'Activities', key: 'activities', width: 30},
            {header: 'Rating', key: 'rating', width: 30},
        ]
        console.log('xcolumn', xcolumns());
        
        const dataColumn =
            xcolumns().map((xcolumn) => {
                let colm = {
                    header: xcolumn.headerName,
                    key: xcolumn.field,
                    width: 10,
                };
                if (colm.key == 'performance') {
                    colm.header = 'Performance';
                }
                return colm.header;
            });
        
        // sheet.columns = dataColumn;
        sheet.addRow(dataColumn);
        console.log('dataColumn',dataColumn);
        
        
            xgetGridRows().map((rowData) => {
                let row = [];
                xcolumns().map(xcolumn => {
                    console.log('xcolumn', xcolumn.field);
                    console.log(xcolumn.field, rowData[xcolumn.field]);
                    
                    let val = rowData[xcolumn.field];
                    if (xcolumn.field == 'performance') {
                        let perf = '';
                        if ((rowData.grade >= 75 && rowData.grade < 85)) {
                            perf = 'Developing'
                        }
                        else if (rowData.grade >= 85 && rowData.grade <= 89) {
                            perf = 'Great';
                        }
                        else if (rowData.grade >= 90) {
                            perf = 'Excellent';
                        } else {
                            perf = 'Poor';
                        }
                        val = perf;
                    }
                    row.push(val);
                })
                sheet.addRow(row);
            } );
        // console.log('rows are ', datarow);
        // sheet.addRows(datarow);
        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'PerformanceReport.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        // XLSX.utils.sheet_add_aoa(ws, heading);
        // XLSX.utils.sheet_add_aoa(ws, innerHeading);
        // XLSX.utils.sheet_add_json(ws, datarow, { origin: 'A2', skipHeader: true });
        // XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
        // XLSX.writeFile(wb, 'PerformanceReport.xlsx');
    };
    return (
        <>
            <Tabs value={curtab} onChange={handleTabChange} centered>
                <Tab label="Prelim" />
                <Tab label="Midterm" />
                <Tab label="Finals" />
            </Tabs>
            <Box sx={{ width: '100%', alignContent: 'end' }}>
                <Chip
                    sx={{ float: 'right', m: 1 }}
                    size='small'
                    label="Export Excel file"
                    onClick={handleExport}
                    // onDelete={() => { }}
                    icon={<span className="material-symbols-rounded">download</span>}
                    variant="outlined"
                />
            </Box>
            <DataGrid
                rows={xgetGridRows()}
                columns={xcolumns()}
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
