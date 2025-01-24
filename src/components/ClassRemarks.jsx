import React, { forwardRef, useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { collection, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from './Firebase';
import { DataGrid, GRID_STRING_COL_DEF, GridToolbar, GridToolbarExport } from '@mui/x-data-grid';
import { AppContext, ClassContext } from '../AppContext';
import { renderEditProgress, renderProgress } from './progress';
import { cheerfulFiestaPalette, LineChart, PieChart, SparkLineChart } from '@mui/x-charts';
import { AppBar, Box, Chip, colors, Dialog, Divider, IconButton, Slide, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { renderStatus } from './status';
const ExcelJS = require('exceljs');
import './styles/classRemarks.css';
// import XLSX from 'xlsx';
// import * as XLSX from "xlsx";

const xTransition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const ClassRemarks = (props) => {
    const { openedClass } = useContext(ClassContext);
    const { currentUserData, gridxcolumn, setgridxcolumn, gridxrow, setgridxrow, gridxgrouping, setgridxgrouping } = useContext(AppContext);
    const [curtab, setTab] = useState(0);
    let periods = ['prelim', 'midterm', 'finals'];
    const navigate = useNavigate();
    const [performanceReportToggle, setPerformanceReportToggle] = useState(false);
    const [currReportViewData, setCurrReportViewData] = useState({});
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
                // where('period', '==', periods[curtab])
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
                        if (openedClass.classRole == 'student' && foundMembershipData.uid == currentUserData.uid) {

                            participants.push({ userDoc: doc.id, ...doc.data(), ...foundMembershipData });
                        } else if (openedClass.classRole == 'teacher') {
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
    const detailedGraphChip = (params => {
        const value = params?.value;
        const chipStyle = {
            border: `1px solid ${colors.green[900]}`,
            color: colors.green[900],
        }
        const chipProp = {
            icon: < span style={{ color: colors.green[800] }} className="material-symbols-rounded" > arrow_drop_down</span >
        }
        return (
            <>
                <Chip sx={{ ...chipStyle }} size='small' onClick={() => { togglePerfDialog(value) }} variant='outlined' {...chipProp} label='View Report'></Chip>
            </>
        )
    })
    const togglePerfDialog = (value) => {
        let data = {
            ...value,
            xcol: [
                // { field: 'id', headerName: '', width: 100 },
                { field: 'title', headerName: 'Activity Name', width: 150 },
                { field: 'category', headerName: 'Category', width: 100 },
                { field: 'answered', headerName: 'Responded', width: 100 },
                { field: 'score', headerName: 'Score', type: 'Number', width: 100 },
                { field: 'totalScore', headerName: 'Total Score', type: 'Number', width: 120 },
                { field: 'percentage', headerName: 'Score Percentage', type: 'Number', width: 200 },
                // { field: 'avg', headerName: '', width: 100 },
            ],
            xrow: [
                ...value['quiz'].map(item => ({
                    category: 'quiz',
                    id: item.id,
                    title: item.title,
                    answered: item.answered ? 'Yes' : 'No',
                    score: item.answered ? item.score : '--',
                    totalScore: item.answered ? item.totalScore : '--',
                    percentage: item.answered ? item.percentage : '--',
                })),
                ...value['exam'].map(item => ({
                    category: 'exam',
                    id: item.id,
                    title: item.title,
                    answered: item.answered ? 'Yes' : 'No',
                    score: item.answered ? item.score : '--',
                    totalScore: item.answered ? item.totalScore : '--',
                    percentage: item.answered ? item.percentage.toPrecision(2) : '--',
                })),
                ...value['performance task'].map(item => ({
                    category: 'performance task',
                    id: item.id,
                    title: item.title,
                    answered: item.answered ? 'Yes' : 'No',
                    score: item.answered ? item.score : '--',
                    totalScore: item.answered ? item.totalScore : '--',
                    percentage: item.answered ? item.percentage.toPrecision(2) : '--',
                })),
            ],
            linechartx:
                [
                    ...value['quiz']?.map(item => (item.title)),
                    ...value['exam']?.map(item => (item.title)),
                    ...value['performance task']?.map(item => (item.title))
                ],
            linecharty: [
                {
                    data: [
                        ...value['quiz']?.map(item => (item.percentage)),
                        ...value['exam']?.map(item => (item.percentage)),
                        ...value['performance task']?.map(item => (item.percentage))
                    ], label: 'Scoring Percentage', color: colors.blue[500], area: false,
                },
            ],
            actsTaken: [
                ...value['quiz'],
                ...value['exam'],
                ...value['performance task']
            ].filter(item => item.answered).length
        }
        setCurrReportViewData(data);
        console.log('vals:', data);

        setPerformanceReportToggle(true);
        console.log('toggled');

    }
    const xcolumns = () => {
        let ctgs = {
            'prelim': {
                'quiz': 1,
                'performance task': 1,
                'exam': 1
            },
            'midterm': {
                'quiz': 1,
                'performance task': 1,
                'exam': 1
            },
            'finals': {
                'quiz': 1,
                'performance task': 1,
                'exam': 1
            }
        }
        const xgridColumn = [
            { field: 'studentID', headerName: 'ID number', width: 100 },
            { field: 'name', headerName: 'Name', width: 200 },
            ...[...acts.quizes, ...acts.pt, ...acts.exams].filter(item => item.period == 'prelim').map((quiz, index) => ({
                field: quiz.id.toString(),
                headerName: (quiz.category == 'quiz' ? 'Quiz ' : quiz.category == 'performance task' ? 'PT ' : quiz.category == 'exam' ? 'Exam ' : '') + ctgs[quiz.period][quiz.category]++,
                width: quiz.category == 'performance task' ? 200 : 70,
                editable: false,
                description: quiz.title + ' - ' + quiz.description,
            })),
            ...[...acts.quizes, ...acts.pt, ...acts.exams].filter(item => item.period == 'midterm').map((quiz, index) => ({
                field: quiz.id.toString(),
                headerName: (quiz.category == 'quiz' ? 'Quiz ' : quiz.category == 'performance task' ? 'PT ' : quiz.category == 'exam' ? 'Exam ' : '') + ctgs[quiz.period][quiz.category]++,
                width: quiz.category == 'performance task' ? 200 : 70,
                editable: false,
                description: quiz.title + ' - ' + quiz.description,
            })),
            ...[...acts.quizes, ...acts.pt, ...acts.exams].filter(item => item.period == 'finals').map((quiz, index) => ({
                field: quiz.id.toString(),
                headerName: (quiz.category == 'quiz' ? 'Quiz ' : quiz.category == 'performance task' ? 'PT ' : quiz.category == 'exam' ? 'Exam ' : '') + ctgs[quiz.period][quiz.category]++,
                width: quiz.category == 'performance task' ? 200 : 70,
                editable: false,
                description: quiz.title + ' - ' + quiz.description,
            })),
        ];
        if (openedClass.classRole == 'teacher')
            xgridColumn.push(
                {
                    field: 'perfdetails',
                    headerName: 'Detailed Report',
                    renderCell: detailedGraphChip,
                    width: 150,
                    editable: false,
                }
            )
        xgridColumn.push(
            {
                field: 'performance',
                headerName: 'Indicator',
                description: '',
                ...sparklineColumnType,
                width: 150,
                editable: false,
            }
        )
        if (openedClass.classRole == 'teacher') {
            xgridColumn.push(
                {
                    field: 'gradePrelim',
                    headerName: 'Prelim',
                    renderCell: renderProgress,
                    renderEditCell: renderEditProgress,
                    width: 100,
                    editable: false,
                },
            );
            xgridColumn.push(
                {
                    field: 'gradeMidterm',
                    headerName: 'Midterm',
                    renderCell: renderProgress,
                    renderEditCell: renderEditProgress,
                    width: 100,
                    editable: false,
                },
            );
            xgridColumn.push(
                {
                    field: 'gradeFinals',
                    headerName: 'Finals',
                    renderCell: renderProgress,
                    renderEditCell: renderEditProgress,
                    width: 100,
                    editable: false,
                },
            );
            xgridColumn.push(
                {
                    field: 'grade',
                    headerName: 'Final Grade',
                    renderCell: renderProgress,
                    renderEditCell: renderEditProgress,
                    width: 100,
                    editable: false,
                },
            );
        }
        xgridColumn.push(
            {
                field: 'gradeIndicator',
                headerName: 'Remarks',
                renderCell: statusChip,
                width: 200,
                editable: false,
            }
        )

        return xgridColumn;
    };
    const xgetGridRows = () => {
        console.log('examrate', openedClass.examRate);
        console.log('ptRate', openedClass.ptRate);
        console.log('quizrate', openedClass.quizRate);

        const categoryWeights = {
            performanceTask: openedClass.ptRate ?? 0.40,
            exam: openedClass.examRate ?? 0.30,
            quiz: openedClass.quizRate ?? 0.30,
        };
        let griddata = rows.map((row) => {
            let rowSheet = {};
            let gainedScore = 0;
            let totalScore = 0;
            let ptScorePercentage = {
                'prelim': 0,
                'midterm': 0,
                'finals': 0,
            };
            let ptTotalItems = {
                'prelim': 0,
                'midterm': 0,
                'finals': 0,
            };
            let examScorePercentage = {
                'prelim': 0,
                'midterm': 0,
                'finals': 0,
            };
            let examTotalItems = {
                'prelim': 0,
                'midterm': 0,
                'finals': 0,
            };
            let quizScorePercentage = {
                'prelim': 0,
                'midterm': 0,
                'finals': 0,
            };
            let quizTotalItems = {
                'prelim': 0,
                'midterm': 0,
                'finals': 0,
            };
            let gradeData = {
                'prelim': [],
                'midterm': [],
                'finals': [],
            };
            let actsPerPeriod = {
                'prelim': [],
                'midterm': [],
                'finals': [],
            };
            const rowData = {
                id: row.uid,
                studentID: row.studentID,
                name: `${row.firstname} ${row.lastname}`,
                performance: [],
                grade: 0,
            };

            rowData.perfdetails = {
                personData: row,
                categoryWeights: categoryWeights,
                'quiz': [],
                'performance task': [],
                'exam': [],

            };

            [...acts.quizes, ...acts.pt, ...acts.exams].forEach((quiz) => {
                const response = responses.find(item => item.uid === row.uid && item.quizId === quiz.id);
                rowData[quiz.id] = response ? response.score + ' / ' + response.totalScore : '- -';
                let initialPersonResponse = {
                    id: quiz.id,
                    title: quiz.title,
                    score: 0,
                    totalScore: 0,
                    answered: false,
                    percentage: 0
                }
                if (response) {
                    switch (quiz.category) {
                        case 'performance task':
                            ptScorePercentage[quiz.period] += (response.score / response.totalScore) * 100;
                            ptTotalItems[quiz.period] += 1;
                            initialPersonResponse = {
                                id: quiz.id,
                                title: quiz.title,
                                score: response.score,
                                totalScore: response.totalScore,
                                answered: true,
                                percentage: (response.score / response.totalScore) * 100
                            }
                            break;
                        case 'exam':
                            examScorePercentage[quiz.period] += (response.score / response.totalScore) * 100;
                            examTotalItems[quiz.period] += 1;
                            initialPersonResponse = {
                                id: quiz.id,
                                title: quiz.title,
                                score: response.score,
                                totalScore: response.totalScore,
                                answered: true,
                                percentage: (response.score / response.totalScore) * 100
                            }
                            break;
                        case 'quiz':
                            quizScorePercentage[quiz.period] += (response.score / response.totalScore) * 100;
                            quizTotalItems[quiz.period] += 1;
                            initialPersonResponse = {
                                id: quiz.id,
                                title: quiz.title,
                                score: response.score,
                                totalScore: response.totalScore,
                                answered: true,
                                percentage: (response.score / response.totalScore) * 100
                            }
                            break;
                        default:
                            break;
                    }
                    gainedScore += response ? response.score : 0;

                    totalScore += response ? response.totalScore : 0;
                    rowData.performance.push(response.score != 0 ? Math.round((response.score / response.totalScore) * 100) : 0);
                }
                rowData.perfdetails[quiz.category].push(initialPersonResponse);
            });
            // console.log('pt: ', ptScorePercentage, '/', ptTotalItems, '=', ptScorePercentage / ptTotalItems);
            // console.log('exam: ', examScorePercentage, '/', examTotalItems);
            // console.log('quiz:', quizScorePercentage, '/', quizTotalItems);
            let ptGradePrelim = ptTotalItems['prelim'] > 0 ? (ptScorePercentage['prelim'] / ptTotalItems['prelim']) * categoryWeights.performanceTask : 0;
            let ptGradeMidterm = ptTotalItems['midterm'] > 0 ? (ptScorePercentage['midterm'] / ptTotalItems['midterm']) * categoryWeights.performanceTask : 0;
            let ptGradeFinal = ptTotalItems['finals'] > 0 ? (ptScorePercentage['finals'] / ptTotalItems['finals']) * categoryWeights.performanceTask : 0;
            let examGradePrelim = examTotalItems['prelim'] > 0 ? (examScorePercentage['prelim'] / examTotalItems['prelim']) * categoryWeights.exam : 0;
            let examGradeMidterm = examTotalItems['midterm'] > 0 ? (examScorePercentage['midterm'] / examTotalItems['midterm']) * categoryWeights.exam : 0;
            let examGradeFinal = examTotalItems['finals'] > 0 ? (examScorePercentage['finals'] / examTotalItems['finals']) * categoryWeights.exam : 0;
            let quizGradePrelim = quizTotalItems['prelim'] > 0 ? (quizScorePercentage['prelim'] / quizTotalItems['prelim']) * categoryWeights.quiz : 0;
            let quizGradeMidterm = quizTotalItems['midterm'] > 0 ? (quizScorePercentage['midterm'] / quizTotalItems['midterm']) * categoryWeights.quiz : 0;
            let quizGradeFinal = quizTotalItems['finals'] > 0 ? (quizScorePercentage['finals'] / quizTotalItems['finals']) * categoryWeights.quiz : 0;

            let gradePrelim = Math.round(ptGradePrelim + examGradePrelim + quizGradePrelim);
            let gradeMidterm = Math.round(ptGradeMidterm + examGradeMidterm + quizGradeMidterm);
            let gradeFinal = Math.round(ptGradeFinal + examGradeFinal + quizGradeFinal);

            let finalGrade = ((gradeMidterm * .5) + (gradeFinal * .5));
            rowData.grade = finalGrade;
            rowData.perfdetails.gradePrelim = gradePrelim;
            rowData.perfdetails.gradeMidterm = gradeMidterm;
            rowData.perfdetails.gradeFinal = gradeFinal;
            rowData.gradePrelim = gradePrelim;
            rowData.gradeMidterm = gradeMidterm;
            rowData.gradeFinals = gradeFinal;
            rowData.perfdetails.grade = finalGrade;
            if (finalGrade >= 90) {
                rowData.gradeIndicator = 'Outstanding';
            }
            else if (finalGrade >= 85) {
                rowData.gradeIndicator = 'Very Satisfactory';
            }
            else if (finalGrade >= 80) {
                rowData.gradeIndicator = 'Satisfactory';
            }
            else if (finalGrade >= 75) {
                rowData.gradeIndicator = 'Fairly Satisfactory';
            }
            else {
                rowData.gradeIndicator = 'Did Not Met Expectation';
            }
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
                    groupId: 'Prelim',
                    children: [
                        {
                            groupId: 'Quizzes',
                            children: [
                                ...acts.quizes.filter(item => item.period == 'prelim').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                        {
                            groupId: 'Performance Tasks',
                            children: [
                                ...acts.pt.filter(item => item.period == 'prelim').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                        {
                            groupId: 'Exams',
                            children: [
                                ...acts.exams.filter(item => item.period == 'prelim').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                    ]
                },
                {
                    groupId: 'Midterm',
                    children: [
                        {
                            groupId: 'Quizzes',
                            children: [
                                ...acts.quizes.filter(item => item.period == 'midterm').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                        {
                            groupId: 'Performance Tasks',
                            children: [
                                ...acts.pt.filter(item => item.period == 'midterm').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                        {
                            groupId: 'Exams',
                            children: [
                                ...acts.exams.filter(item => item.period == 'midterm').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                    ]
                },
                {
                    groupId: 'Finals',
                    children: [
                        {
                            groupId: 'Quizzes',
                            children: [
                                ...acts.quizes.filter(item => item.period == 'finals').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                        {
                            groupId: 'Performance Tasks',
                            children: [
                                ...acts.pt.filter(item => item.period == 'finals').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                        {
                            groupId: 'Exams',
                            children: [
                                ...acts.exams.filter(item => item.period == 'finals').map((quiz) => ({
                                    field: quiz.id.toString()
                                })),
                            ]
                        },
                    ]
                },
            ],
        },
        {
            groupId: 'Performance',
            children: [
                { field: 'performance' },
                { field: 'perfdetails' },
            ]
        },
        {
            groupId: 'Grading',
            children: [
                { field: 'gradeIndicator' },
                { field: 'gradePrelim' },
                { field: 'gradeMidterm' },
                { field: 'gradeFinals' },
                { field: 'grade' },
            ]
        },
    ];

    // const PerformanceReportDialog = () => {
    //     return (
    //         <>

    //         </>
    //     )
    // }
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
    const handlePdfExport = () => {
        setgridxcolumn(xcolumns());
        setgridxrow(xgetGridRows());
        setgridxgrouping(xcolumnGroupingModel);
        navigate('/export-pdf');
        // window.open('/export-pdf', "_blank");
    }
    const handleExport = () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Tinkfast';
        // workbook.lastModifiedBy = 'Tinkfast';
        // workbook.created = new Date();
        // workbook.modified = new Date();
        // workbook.lastPrinted = new Date();
        // workbook.properties.date1904 = true;
        const sheet = workbook.addWorksheet('PerformanceReport');
        sheet.mergeCells('A1', 'B1');
        // sheet.mergeCells('C1', 'J2');
        // sheet.getCell('A1').value = 'Client List'
        // sheet.spliceRows(1, 0, ['Student Information', 'Activities', 'Rating']);
        const header1 = [];
        header1[1] = 'Student Information';
        header1[3] = 'Activities';
        header1[[...acts.quizes, ...acts.pt, ...acts.exams].length + 3] = 'Rating';
        sheet.getRow(1).values = header1;
        const header2 = [];
        header2[3] = 'Quizzes';
        header2[[...acts.quizes].length + 3] = 'Performance Tasks';
        sheet.getRow(2).values = header2;
        const header3 = [];
        console.log('xcolumn', xcolumns());

        const dataColumn = [
            ...xcolumns().map((xcolumn) => {
                let header = xcolumn.headerName;
                let colm = {
                    // header: xcolumn.headerName,
                    key: xcolumn.field,
                    // width: 10,
                };
                if (colm.key == 'performance') {
                    header = 'Performance';
                }
                else if (colm.key == 'name') {
                    colm.width = 20;
                }
                header3.push(header);
                return colm;
            })
        ]
        sheet.addRow(header3);
        sheet.columns = dataColumn;
        console.log('dataColumn', dataColumn);

        const datarow = [
            ...xgetGridRows().map((rowData) => {
                const performance = () => {
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
                    return perf;
                }
                const row = { ...rowData, test: 'test' };
                row['performance'] = performance();
                return row;
            })
        ];
        // console.log('rows are ', datarow);
        const foundColm = sheet.getColumn(acts.exams[acts.exams.length - 1].id);
        console.log('found col', foundColm);
        foundColm.eachCell((cell, rowNumber) => {
            console.log(`Row ${rowNumber}, Value: ${cell.value}`);
        });

        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'b9f6ca' },
        };

        sheet.addRows(datarow);
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
            {/* <Tabs value={curtab} onChange={handleTabChange} centered>
                <Tab label="Prelim" />
                <Tab label="Midterm" />
                <Tab label="Finals" />
            </Tabs> */}
            {/* <Box sx={{ width: '100%', alignContent: 'end' }}>
                <Chip
                    sx={{ float: 'right', m: 1 }}
                    size='small'
                    label="PDF printable version"
                    onClick={handlePdfExport}
                    // onDelete={() => { }}
                    icon={<span className="material-symbols-rounded">download</span>}
                    variant="outlined"
                />
                <Chip
                    sx={{ float: 'right', m: 1 }}
                    size='small'
                    label="Export Excel file"
                    onClick={handleExport}
                    // onDelete={() => { }}
                    icon={<span className="material-symbols-rounded">download</span>}
                    variant="outlined"
                />
            </Box> */}
            <DataGrid
                rows={xgetGridRows()}
                columns={xcolumns()}
                pageSize={5}
                rowsPerPageOptions={[5]}
                // checkboxSelection
                disableSelectionOnClick
                disableColumnSelector
                initialState={{
                    density: 'compact', // Set density to compact by default
                }}
                // rowHeight={25}
                columnGroupingModel={xcolumnGroupingModel}
                slots={{
                    toolbar: GridToolbar,
                }}
            />
            <Dialog
                fullScreen
                open={performanceReportToggle}
                onClose={() => { }}
                TransitionComponent={xTransition}>
                <AppBar className='exclude-print' sx={{ borderRadius: '25px', marginTop: '.2rem', backgroundColor: 'white', position: 'sticky', boxShadow: 'none' }}>

                    <Toolbar className='exclude-print'>
                        <IconButton
                            className='exclude-print'
                            edge="start"
                            color={'#000'}
                            onClick={() => { setPerformanceReportToggle(false) }}
                            aria-label="close">
                            <md-icon>arrow_back</md-icon>
                        </IconButton>
                        <Typography sx={{ color: '#000', ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="h6" component="div">
                            Performance Report
                        </Typography>
                    </Toolbar>
                    {/* {showLoading && <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>} */}
                </AppBar>
                <Box sx={{ m: 2, mt: 0 }}>
                    <div className='person-con'>
                        <div className="img-person">
                            <img src={currReportViewData?.personData?.imgUrl} style={{ borderRadius: '50%', border: `4px solid ${colors.blue[600]}`, width: '150px', height: '150px', justifySelf: 'center' }} />
                        </div>
                        <h3>{currReportViewData?.personData?.firstname} {currReportViewData?.personData?.lastname}</h3>
                        <p style={{ color: colors.blue[500], textTransform: 'capitalize' }}>{currReportViewData?.personData?.role}</p>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: colors.blue[500] }}>{currReportViewData?.personData?.email}</p>
                    </div>
                    <Divider><span style={{ color: colors.grey[500], fontSize: '12px' }}>Grades & Standards</span></Divider>
                    <div className='piecont' style={{ width: '100%', height: '200px', display: 'flex', flexDirection: 'row' }}>
                        <PieChart
                            colors={cheerfulFiestaPalette}
                            // slotProps={{ legend: { hidden: true } }}
                            series={[
                                {
                                    data: [
                                        { id: 0, value: (currReportViewData?.categoryWeights?.performanceTask ?? 0) * 100, label: `Performance task = ${(currReportViewData?.categoryWeights?.performanceTask * 100)}%` },
                                        { id: 1, value: (currReportViewData?.categoryWeights?.exam ?? 0) * 100, label: `Exam = ${(currReportViewData?.categoryWeights?.exam * 100)}%` },
                                        { id: 2, value: (currReportViewData?.categoryWeights?.quiz ?? 0) * 100, label: `Quiz = ${(currReportViewData?.categoryWeights?.performanceTask * 100)}%` },
                                    ],
                                    cornerRadius: 5,
                                    innerRadius: 20,
                                    paddingAngle: 6
                                },
                            ]}
                            height={140}
                            width={500} />
                        <div style={{ width: '400px', padding: '1rem' }}>

                            <Typography component="span"
                                variant="display"
                                sx={{ color: 'text.seconday' }} >
                                <strong>Grades:</strong><br />
                                Prelim:&nbsp;<span><strong>{currReportViewData.gradePrelim?.toPrecision(2)}</strong> </span>
                                <br />
                                Midterm:&nbsp;<span><strong>{currReportViewData.gradeMidterm?.toPrecision(2)}</strong> </span>
                                <br />
                                Finals:&nbsp;<span><strong>{currReportViewData.gradeFinal?.toPrecision(2)} </strong> </span>
                                <br />
                                Final Grade:&nbsp;<span><strong style={{ fontSize: '18px' }}>{currReportViewData.grade}</strong></span>
                            </Typography>
                        </div>
                    </div>
                    <Divider><span style={{ color: colors.grey[500], fontSize: '12px' }}>Performance Per Activities</span></Divider>
                    <div className="linecharcont" style={{ width: '100%', height: '500px' }}>
                        <LineChart
                            series={currReportViewData.linecharty}
                            xAxis={[
                                {
                                    scaleType: 'point', data: currReportViewData.linechartx
                                },
                            ]}
                        />
                    </div>
                    <br />
                    <Divider><span style={{ color: colors.grey[500], fontSize: '12px' }}>Tabular Representation</span></Divider>
                    <br />
                    <div>
                        <DataGrid
                            rows={currReportViewData.xrow}
                            columns={currReportViewData.xcol}
                            // checkboxSelection
                            disableSelectionOnClick
                            // disableColumnSelector
                            // rowHeight={25}
                            slots={{
                                toolbar: GridToolbar,
                            }}
                            slotProps={{
                                aggregation: {
                                    model: {
                                        totalScore: 'sum',
                                    },
                                },
                            }}
                        />
                    </div>
                </Box >
            </Dialog >
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

const statusChip = (props) => {
    const label = props?.value;
    let chipStyle = null;
    let chipProp = {}
    if (label === 'Outstanding') {
        chipStyle = {
            color: colors.green[800],
            border: `1px solid ${colors.green[800]}`,
        }
        chipProp.icon = < span style={{ color: colors.green[800] }} className="material-symbols-rounded" > sentiment_excited</span >
    }
    else if (label === 'Very Satisfactory') {
        chipStyle = {
            color: colors.blue[800],
            border: `1px solid ${colors.blue[800]}`,
        }
        chipProp.icon = < span style={{ color: colors.blue[800] }} className="material-symbols-rounded" > sentiment_very_satisfied</span >
    }
    else if (label === 'Fairly Satisfactory') {
        chipStyle = {
            color: colors.yellow[800],
            border: `1px solid ${colors.yellow[800]}`,
        }
        chipProp.icon = < span style={{ color: colors.yellow[800] }} className="material-symbols-rounded" > sentiment_satisfied</span >
    }
    else if (label === 'Satisfactory') {
        chipStyle = {
            color: colors.orange[800],
            border: `1px solid ${colors.orange[800]}`,
        }
        chipProp.icon = < span style={{ color: colors.orange[800] }} className="material-symbols-rounded" > sentiment_neutral</span >
    }
    else if (label === 'Did Not Met Expectation' || label === 'DNME') {
        chipStyle = {
            color: colors.red[800],
            border: `1px solid ${colors.red[800]}`,
        }
        chipProp.icon = < span style={{ color: colors.red[800] }} className="material-symbols-rounded" > sentiment_very_dissatisfied</span >
    }
    return <Chip variant='outlined' size='small' style={{ ...chipStyle }} label={label} {...chipProp}></Chip >
}

