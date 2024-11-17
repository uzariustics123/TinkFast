import './styles/addQuizDialog.css';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { MdAssistChip, MdIconButton } from '@material/web/all';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { forwardRef, useContext, useEffect, useReducer, useState } from 'react';
import { AppContext, ClassContext, DraftQuiz, QuizContext, QuizResponseContext } from '../AppContext';
import CloseIcon from '@mui/icons-material/Close';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Input, Select, MenuItem } from '@mui/material';
import { green, grey, lightGreen, lime } from '@mui/material/colors';
import Essay from './QuizTypes/Essay';
import { closestCorners, DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en';
import dayjs from 'dayjs';
import MultiChoice from './QuizTypes/MultiChoice';
import SingleChoice from './QuizTypes/SingleChoice';
import MatchingType from './QuizTypes/MatchingType';
import { addDoc, collection, doc, writeBatch } from 'firebase/firestore';
import { db } from './Firebase';


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function AddQuizDialog() {
    const [quizDraft, setQuizDraft] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDesc, setQuizDesc] = useState('');
    const { currentUserData, backdropOpen, setBackdropOpen, openSnackbar, setSnackbarOpen, setSnackbarMsg } = useContext(AppContext);
    const [quizData, dispatchQuizData] = useReducer((currentData, action) => {
        console.log('data is ', action.data);
        switch (action.type) {
            case 'title': {
                return { ...currentData, title: action.data };
            }
            case 'description': {
                return { ...currentData, description: action.data };
            }
            case 'status': {
                return { ...currentData, status: action.data };
            }
            case 'period': {
                return { ...currentData, period: action.data };
            }
            case 'expectedStartDateTime': {
                return { ...currentData, expectedStartDateTime: action.data };
            }
            case 'expectedEndDateTime': {
                return { ...currentData, expectedEndDateTime: action.data };
            }
            default: {
                return { ...currentData };
            }
        }
    }, {
        title: '',
        description: '',
        status: 'draft',
        period: 'prelim',
        expectedStartDateTime: dayjs().format('MM/DD/YYYY hh:mm A'),
        expectedEndDateTime: '',
    });
    const [toUpdateQuest, setToUpdateQuest] = useState({});
    const [selectQuestionTypeDialog, setSelectQuestionTypeDialog] = useState(false);
    const [editQuestionTypeDialog, setEditQuestionTypeDialog] = useState(false);
    const [setupQuestDialogOpen, openSetupQuestDialog] = useState(false);
    const [currentPostoAdd, setCurrentPostoAdd] = useState(0);
    const [quizResponse, setQuizResponse] = useState([{}]);

    const { openDialog, setDialogOpen } = useContext(QuizContext);
    const { openedClass } = useContext(ClassContext);

    const onQuizTypeDragged = (dragEvent, type) => {
        // dragEvent.dataTransfer.effectAllowed = 'copy';
        dragEvent.dataTransfer.setData("text/plain", type);
        dragEvent.dataTransfer.setData("quizType", type);
        console.log("dragged", dragEvent.dataTransfer);

    }
    const onQuizTypeDragOver = (dragEvent) => {
        dragEvent.preventDefault();
    }
    const removeQTitem = (item) => {
        console.log('removing item ', item);
        if (confirm('Are you sure to remove this question?')) {
            const newQuizDraft = [...quizDraft];
            newQuizDraft.splice(newQuizDraft.indexOf(item), 1);
            setQuizDraft(newQuizDraft);
            console.log('newQ', newQuizDraft);
            console.log('quizd', quizDraft);
        }

    }
    function addQuestion(type, pos) {
        console.log('new q', type, pos);
        let newQuiz = {};
        if (type == 'essay') {
            newQuiz = {
                question: '',
                type: type,
                points: 1,
                id: (crypto.randomUUID())
            };
        } else if (type == 'multiChoice') {
            newQuiz = {
                question: '',
                type: type,
                choices: [
                    // { value: 'Choice 1', isCorrect: false, },
                    // { value: 'Choice 2', isCorrect: false, },
                    // { value: 'Choice 3', isCorrect: false, },
                ],
                id: (crypto.randomUUID())
            };
        } else if (type == 'singleChoice') {
            newQuiz = {
                question: '',
                type: type,
                choices: [
                    // { value: 'Choice 1', isCorrect: false, },
                    // { value: 'Choice 2', isCorrect: false, },
                    // { value: 'Choice 3', isCorrect: false, },
                ],
                points: 1,
                correctChoice: 'Choice 2',
                id: (crypto.randomUUID())
            };
        }
        else if (type == 'matchingType') {
            newQuiz = {
                question: '',
                type: type,
                choices: [
                    // { value: 'Choice 1', desc: 'description', points: 1, isCorrect: false },
                    // { value: 'Choice 2', desc: 'description', points: 1, isCorrect: false },
                    // { value: 'Choice 3', desc: 'description', points: 1, isCorrect: false },
                ],
                id: (crypto.randomUUID())
            };
        }
        newQuiz.status = 'initial';
        newQuiz.points = 1;
        const newQuizList = [...quizDraft];
        newQuizList.splice(pos, 0, newQuiz);
        console.log('newQuizList', newQuizList);
        setQuizDraft(newQuizList);
        setupQuestItem(newQuiz);
    }
    const setupQuestItem = (item) => {
        console.log('setup run');

        setToUpdateQuest(item);
        openSetupQuestDialog(true);
    }
    const SetupQuestItemDialog = (props) => {
        const Qtype = toUpdateQuest.type;
        const [activeStep, setActiveStep] = useState(0);
        const [singleItems, setSingleChoiceItems] = useState([]);
        let steps = [{}];
        let [questionContent, setQuestContent] = useState(toUpdateQuest.question ? toUpdateQuest.question : '');
        const [newQuestData, setNewQuestData] = useState(toUpdateQuest ? { ...toUpdateQuest } : {});
        if (Qtype == 'essay')
            steps = [
                {
                    label: 'Enter Question',
                    description: `Setup question by following these steps`,
                },
                {
                    label: 'Score Points',
                    description:
                        `Allocate score points for this question`,
                },
                {
                    label: 'Considerations',
                    description:
                        `An Essay type of question does not automatically rate your student's answer. You may need to review each of them and rate them manually to justify your student's answer.`,
                },
            ];
        else if (Qtype == 'multiChoice')
            steps = [
                {
                    label: 'Enter Question',
                    description: `Setup question by following these steps`,
                },
                {
                    label: 'Define choices',
                    description:
                        `Add atleast 3 choices to proceed`,
                },
                {
                    label: 'Define correct choices',
                    description:
                        `Select choices not exceeding or equal to the current items count`,
                },
                {
                    label: 'Specify points',
                    description:
                        `Please set score points when a student correctly selected each correct items`,
                },
            ];
        else if (Qtype == 'singleChoice')
            steps = [
                {
                    label: 'Enter Question',
                    description: `Setup question by following these steps`,
                },
                {
                    label: 'Define choices',
                    description:
                        `Add atleast 2 choices to proceed`,
                },
                {
                    label: 'Define the correct choice item',
                    description:
                        `Select 1 correct item for this question`,
                },
                {
                    label: 'Specify points',
                    description:
                        `Please allocate score points when a student succesfully selected the correct item`,
                },
            ];
        else if (Qtype == 'matchingType')
            steps = [
                {
                    label: 'Set Instruction',
                    description: `Setup instruction for your matching type question`,
                },
                {
                    label: 'Items and Values',
                    description:
                        `Define items and their equivalent values`,
                },
                {
                    label: 'Points allocation',
                    description:
                        `Please allocate score points when a student succesfully matched the correct items`,
                },
            ];
        const cancelSetup = () => {
            console.log('new quest data', newQuestData);

            openSetupQuestDialog(false);
            if (newQuestData.status == 'initial') {
                const newQuizDraft = [...quizDraft];
                newQuizDraft.splice(newQuizDraft.indexOf(toUpdateQuest), 1);
                setQuizDraft(newQuizDraft);
            }
        }
        const saveSetup = () => {
            const questToSave = { ...newQuestData };
            if (Qtype == 'essay') {
            }
            questToSave.status = 'draft';
            setToUpdateQuest({ ...questToSave });
            setNewQuestData(questToSave);
            const updatedQuestionList = [...quizDraft];
            updatedQuestionList[quizDraft.indexOf(toUpdateQuest)] = questToSave;
            setQuizDraft(updatedQuestionList);
            openSetupQuestDialog(false);
            // console.log('qdata', questToSave);
            // console.log('newQdata', newQuestData);
        }
        const removeChoiceItem = (item) => {
            const choices = [...newQuestData.choices];
            choices.splice(choices.indexOf(item), 1);
            const toSaveQuestData = { ...newQuestData };
            toSaveQuestData.choices = choices;
            setNewQuestData(toSaveQuestData);
            // console.log('new questdata', newQuestData);
            // console.log('to save questdata', newQuestData);
        }
        const [choiceItemToAdd, setChoiceItemToAdd] = useState('');
        const [choiceItemDescToAdd, setChoiceItemDescToAdd] = useState('');
        const [disableAddItem, setDisableAddItem] = useState(true);
        const choiceItemTxtField = (event) => {
            const textis = event.target.value;
            setChoiceItemToAdd(textis);
            const choices = [...newQuestData.choices];
            const disableChip = choices.find(item => item.value == textis) || (textis.trim() == '');
            setDisableAddItem(disableChip);
        }
        const choiceItemDescField = (event) => {
            const itemDesc = event.target.value;
            setChoiceItemDescToAdd(itemDesc);
            const choices = [...newQuestData.choices];
        }
        const addChoiceItem = () => {
            const choices = [...newQuestData.choices];
            if (choices.find(item => item.value == choiceItemToAdd))
                return;
            console.log('to add item', choiceItemToAdd);
            let newItem = {
                value: choiceItemToAdd,
                isCorrect: false
            };
            if (Qtype == 'matchingType')
                newItem = {
                    ...newItem,
                    desc: choiceItemDescToAdd
                }
            choices.push(newItem);
            const toSaveQuestData = { ...newQuestData };
            toSaveQuestData.choices = choices;
            setNewQuestData(toSaveQuestData);
            console.log('new questdata', newQuestData);
            console.log('to save questdata', newQuestData);
            setDisableAddItem(true);
        }
        const isLimitReached = function () {
            const items = newQuestData.choices;
            const correctItems = items.filter((choice) => choice.isCorrect);
            if (Qtype == 'singleChoice')
                return correctItems.length >= 1;
            else if (Qtype == 'multiChoice')
                return (correctItems.length + 1) >= items.length;
        }
        const [reachedChoiceLimit, setReachedChoiceLimit] = useState(false);
        const setUnsetCorrectChoice = (item) => {
            const items = newQuestData.choices;
            const correctItems = items.filter((choice) => choice.isCorrect);
            const reachedLimit = function () {
                if (Qtype == 'singleChoice')
                    return correctItems.length >= 1;
                else if (Qtype == 'multiChoice')
                    return (correctItems.length + 1) >= items.length;
            }
            setReachedChoiceLimit(reachedLimit());
            // if (!reachedLimit()) {
            const toSaveQuestData = { ...newQuestData };
            item.isCorrect = !item.isCorrect;
            items[items.indexOf(item)] = item;
            toSaveQuestData.choices = items;
            setNewQuestData(toSaveQuestData);
            // } else {

            // }

        }

        return (
            <>
                <Dialog
                    open={setupQuestDialogOpen}>
                    <DialogTitle>Setup Question</DialogTitle>
                    <DialogContent>
                        <Box sx={{ minWidth: '30rem' }}>
                            <Stepper activeStep={activeStep} orientation='vertical'>
                                {steps.map((step, index) => {
                                    const labelProps = {};
                                    const nextBtnProps = {};
                                    labelProps.optional = index === steps.length - 1 ? <Typography variant="caption">Last step</Typography> : null;
                                    const questContentChange = (event) => {
                                        let newQuestion = event.target.value;
                                        // setQuestContent(newQuestion);
                                        setNewQuestData({ ...newQuestData, question: newQuestion });
                                    }
                                    if (index == 0 && newQuestData.question != undefined && newQuestData.question.trim() == '') {
                                        labelProps.optional = <Typography error={true} variant="caption">This is a required field</Typography>;
                                        labelProps.error = true;
                                        nextBtnProps.disabled = true;
                                    }
                                    if (Qtype == 'singleChoice') {
                                        const correctItems = (newQuestData.choices != undefined ? newQuestData.choices : []).filter((choice) => (choice.isCorrect));
                                        if (index == 1 && activeStep == 1 && newQuestData.choices.length < 2) {
                                            labelProps.optional = <Typography error={true} variant="caption">Add atleast 2 choices </Typography>;
                                            labelProps.error = true;
                                            nextBtnProps.disabled = true;
                                        } else if (index == 2 && activeStep == 2 && correctItems.length == 0) {
                                            labelProps.optional = <Typography error={true} variant="caption">Need atleast 1 correct item</Typography>;
                                            // document.getElementById('step-next-btn').disabled = true;
                                            labelProps.error = true;
                                            nextBtnProps.disabled = true;
                                        }
                                    }
                                    if (Qtype == 'multiChoice') {
                                        if (index == 1 && activeStep == 1 && newQuestData.choices.length < 3) {
                                            labelProps.optional = <Typography error={true} variant="caption">Add atleast 3 choices </Typography>;
                                            labelProps.error = true;
                                            nextBtnProps.disabled = true;
                                        }
                                    }
                                    if (Qtype == 'matchingType') {
                                        if (index == 1 && activeStep == 1 && newQuestData.choices.length < 2) {
                                            console.log('step 1 no choices');
                                            labelProps.optional = <Typography error={true} variant="caption">Add atleast 2 choices </Typography>;
                                            labelProps.error = true;
                                            nextBtnProps.disabled = true;
                                        }
                                    }
                                    // }
                                    const handleNext = () => {
                                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                                    };

                                    const handleBack = () => {
                                        setActiveStep((prevActiveStep) => prevActiveStep - 1);
                                    };
                                    const allocPointsEssaySelction = (event) => {
                                        event.preventDefault();
                                        let points = Number(event.target.value);
                                        if (points < 1) {
                                            event.target.value = 1;
                                            points = 1;
                                        }
                                        setNewQuestData({ ...newQuestData, points: points });
                                    }
                                    return (
                                        <Step key={step.label}>
                                            <StepLabel {...labelProps}>
                                                {step.label}
                                            </StepLabel>
                                            <StepContent >
                                                <Typography>{step.description}</Typography>
                                                {(index == 0) && <>
                                                    <TextField label="Enter question" sx={{ minWidth: '30rem' }}
                                                        multiline
                                                        onChange={questContentChange}
                                                        minRows={2}
                                                        maxRows={5}
                                                        defaultValue={newQuestData.question}
                                                        variant="filled" />
                                                </>
                                                }
                                                {/* Choice */}
                                                {((index == 1 && Qtype == 'essay') ||
                                                    ((Qtype == 'singleChoice' || Qtype == 'multiChoice') && index == 3) ||
                                                    (Qtype == 'matchingType' && index == 2)
                                                ) && <>
                                                        <TextField label="Score" sx={{ minWidth: '30rem' }} onChange={allocPointsEssaySelction} defaultValue={newQuestData.points} type='number' variant="filled" />
                                                    </>
                                                }
                                                {(((Qtype == 'singleChoice' || Qtype == 'multiChoice') && index == 1)) && <>
                                                    <Box sx={{ mt: 1, mb: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '.5rem' }} spacing={1}>
                                                        {newQuestData.choices.map((item, index) => (
                                                            <Chip size='medium' key={item.value} label={item.value} variant='outlined' onDelete={() => removeChoiceItem(item)} />
                                                        ))}
                                                    </Box>
                                                    <Stack direction='row' sx={{ minWidth: '30rem', mb: 2, mt: 1 }} spacing={2}>
                                                        <TextField fullWidth id='choice-item-txtfield' label="New item" variant="filled"
                                                            onChange={(e) => choiceItemTxtField(e)} />
                                                        <Chip icon={<span className='material-symbols-outlined'>add</span>} disabled={disableAddItem} sx={{ alignSelf: 'center' }} label='Add' onClick={() => { addChoiceItem(); document.getElementById('choice-item-txtfield').value = ''; }} />
                                                    </Stack>
                                                </>
                                                }


                                                {(((Qtype == 'singleChoice' || Qtype == 'multiChoice') && index == 2)) &&
                                                    <>
                                                        <Box sx={{ mt: 1, mb: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '.5rem' }} spacing={1}>
                                                            {newQuestData.choices.map((item, index) => (
                                                                <Chip
                                                                    icon={item.isCorrect ? <span className='material-icons-outlined'>check</span> : <></>}
                                                                    size='large'
                                                                    key={item.value}
                                                                    label={item.value}
                                                                    disabled={(!(item.isCorrect) && isLimitReached())}
                                                                    onClick={() => setUnsetCorrectChoice(item)}
                                                                    variant='outlined' />
                                                            ))}
                                                        </Box>
                                                    </>
                                                }

                                                {((Qtype == 'matchingType' && index == 1)) && <>
                                                    <Box sx={{ mt: 1, mb: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '.5rem' }} spacing={1}>
                                                        {newQuestData.choices.map((item, index) => (
                                                            <Stack direction='row' sx={{ minWidth: '30rem', mb: 2, mt: 1 }} spacing={2}>
                                                                <Box>
                                                                    <Typography sx={{ ml: 2, width: '100', flex: 1, fontFamily: 'Open Sans' }} variant="caption">
                                                                        {item.value}
                                                                    </Typography>
                                                                    <br />
                                                                    <Typography sx={{ ml: 2, width: '100', flex: 1, fontFamily: 'Open Sans' }} variant="caption">
                                                                        {item.desc}
                                                                    </Typography>
                                                                </Box>
                                                                <IconButton onClick={() => removeChoiceItem(item)} color={'#000'} sx={{ width: '40px', height: '40px', flexFlow: 'right' }} aria-label="close"> <span className="material-symbols-outlined">delete</span></IconButton>
                                                                {/* <Chip size='medium' key={item.value} label={item.value} variant='outlined' onDelete={() => removeChoiceItem(item)} /> */}
                                                            </Stack>
                                                        ))}
                                                    </Box>
                                                    <Stack direction='row' sx={{ minWidth: '30rem', mb: 2, mt: 1 }} spacing={2}>
                                                        <Box>
                                                            <TextField fullWidth id='choice-item-txtfield' label="New item" variant="outlined"
                                                                onChange={(e) => choiceItemTxtField(e)} />
                                                            <TextField sx={{ mt: 1 }} fullWidth id='choice-desc-txtfield' label="Item description" variant="outlined"
                                                                onChange={(e) => choiceItemDescField(e)} />
                                                        </Box>
                                                        <Chip icon={<span className='material-symbols-outlined'>add</span>} disabled={disableAddItem} sx={{ alignSelf: 'center' }} label='Add' onClick={(e) => {
                                                            addChoiceItem();
                                                            document.getElementById('choice-item-txtfield').value = '';
                                                            document.getElementById('choice-desc-txtfield').value = '';
                                                        }} />
                                                    </Stack>
                                                </>
                                                }


                                                <Box sx={{ mb: 2 }}>
                                                    <Button id='step-next-btn' variant="contained" {...nextBtnProps} onClick={handleNext} sx={{ mt: 1, mr: 1 }} >
                                                        {
                                                            (index === 2 && Qtype == 'essay') ?
                                                                'I understand' :
                                                                index === steps.length - 1 ? 'Finish' :
                                                                    'Next'
                                                        }
                                                    </Button>
                                                    <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }} >
                                                        Back
                                                    </Button>
                                                </Box>
                                            </StepContent>
                                        </Step>
                                    )
                                })}
                            </Stepper>
                            {activeStep === steps.length && (
                                <Paper square elevation={0} sx={{ p: 3 }}>
                                    <Typography>All steps completed - you&apos;re finished</Typography>
                                    <Chip sx={{ mt: 1, mr: 1 }} onClick={() => { setActiveStep(0) }} label='Restart' variant='outlined' />
                                </Paper>
                            )}
                            <Stack sx={{ mt: 2 }} direction='row' spacing={3}>

                                <Button size='medium' color='error' variant='outlined' onClick={cancelSetup} sx={{ mt: 1, mr: 1 }} >
                                    Cancel
                                </Button>
                                <Button size='medium' disabled={activeStep !== steps.length} variant='outlined' onClick={() => saveSetup()} sx={{ mt: 1, mr: 1 }} >
                                    Save
                                </Button>
                            </Stack>
                        </Box>
                    </DialogContent>
                </Dialog>
            </>
        )
    }
    const quizTypeSelectDialog = (pos) => {
        setCurrentPostoAdd(pos);
        setSelectQuestionTypeDialog(!selectQuestionTypeDialog);
    }
    const QuestionTypeDialog = (props) => {
        const pos = props.pos
        const [questionTypes] = useState([
            { type: 'singleChoice', action: () => { }, label: 'Single Choice' },
            { type: 'multiChoice', action: () => { }, label: 'Multi Choice' },
            { type: 'essay', action: () => { }, label: 'Essay' },
            { type: 'matchingType', action: () => { }, label: 'Matching Type' },
        ]);
        const [selectedQuestionType, setSelectedQuizType] = useState('');
        const selectAction = (event) => {
            const quizType = event.target.value;
            console.log('value is ', event.target.value);
            setSelectedQuizType(quizType);
        }
        return (
            <Dialog
                sx={{ borderRadius: '30px' }}
                open={selectQuestionTypeDialog}>
                <DialogTitle>Select a type of Question</DialogTitle>
                <DialogContent>
                    <FormControl>
                        <FormLabel id="demo-controlled-radio-buttons-group">Type</FormLabel>
                        <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            onChange={selectAction}
                        >
                            {questionTypes.map((item) => (
                                <FormControlLabel key={item.type} value={item.type} control={<Radio />} label={item.label} />
                            ))}

                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Chip size='small' onClick={() => { setSelectQuestionTypeDialog(!selectQuestionTypeDialog) }} label='Cancel' variant='outlined' />
                    <Chip size='small' onClick={() => { addQuestion(selectedQuestionType, pos); setSelectQuestionTypeDialog(false); }} disabled={selectedQuestionType == ''} label='Add' variant='outlined' />
                </DialogActions>
            </Dialog>
        )
    }
    const DraggableQuizTypeContainer = (props) => {
        const item = props.item;
        // const id = props.id;
        // const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });
        // const style = {
        //     transition,
        //     transform: CSS.Transform.toString(transform)
        // }
        const editQuestion = (item) => {
            console.log('edit launch');

            setToUpdateQuest(item);
            openSetupQuestDialog(true);
        }
        return (
            <>
                <div class="quizTypeItem">
                    <div className="quizTypeItemActions">

                        <IconButton aria-label="edit" onClick={() => editQuestion(item)}>
                            <span className="material-symbols-rounded">edit</span>
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => removeQTitem(item)}>
                            <span className="material-symbols-rounded">remove</span>
                        </IconButton>
                    </div>
                    {item.type == 'essay' && <Essay question={item ? item.question : ''} />}
                    {item.type == 'multiChoice' && <MultiChoice questionData={item} choices={item.choices} />}
                    {item.type == 'singleChoice' && <SingleChoice questionData={item} choices={item.choices} />}
                    {item.type == 'matchingType' && <MatchingType questionData={item} choices={item.choices} />}
                </div>
                <Divider sx={{ marginBottom: '1rem' }}>
                    <Chip label="Add Question" onClick={() => { quizTypeSelectDialog(quizDraft.indexOf(item) + 1) }} size="small" variant='outlined' />
                </Divider>
            </>
        )
    }
    const QuestionEditorDialog = (props) => {
        const Qtype = toUpdateQuest.type;
        const [singleItems, setSingleChoiceItems] = useState([]);
        return (
            <Dialog
                open={editQuestionTypeDialog}>
                <DialogTitle>Question Setup</DialogTitle>
                <DialogContent>
                    {toUpdateQuest.type == 'essay' &&
                        <TextField label="Enter essay question" sx={{ minWidth: '30rem' }}
                            multiline
                            minRows={2}
                            maxRows={5}
                            variant="filled" />}
                    {toUpdateQuest.type == 'singleChoice' &&
                        <TextField label="Enter essay question" sx={{ minWidth: '30rem' }}
                            multiline
                            minRows={2}
                            maxRows={5}
                            variant="filled" />}
                </DialogContent>
                <DialogActions>
                    <Chip size='small' onClick={() => { setEditQuestionTypeDialog(false) }} label='Cancel' variant='outlined' />
                    <Chip size='small' onClick={() => { }} disabled={true} label='Save' variant='outlined' />
                </DialogActions>
            </Dialog>
        );
    }





    // =======================main============================
    const quizTitltFieldChange = (e) => {
        let quitztits = e.target.value;
        dispatchQuizData({ type: 'title', data: quitztits });
    }
    const quizDescFieldChange = (e) => {
        let quitzDesc = e.target.value;
        dispatchQuizData({ type: 'description', data: quitzDesc });
    }
    const quizStatusFieldChange = (e) => {
        let quitzStatus = e.target.value;
        dispatchQuizData({ type: 'status', data: quitzStatus });
    }
    const quizPeriodFieldChange = (e) => {
        let value = e.target.value;
        dispatchQuizData({ type: 'period', data: value });
    }
    const quizStartDateFieldChange = (datetime) => {
        let dateTimeValue = dayjs(datetime).format('MM/DD/YYYY hh:mm A');
        dispatchQuizData({ type: 'expectedStartDateTime', data: dateTimeValue });
        console.log('quiz data is', quizData);
    }
    const quizEndDateFieldChange = (datetime) => {
        if (datetime) {
            let dateTimeValue = dayjs(datetime).format('MM/DD/YYYY hh:mm A');
            dispatchQuizData({ type: 'expectedEndDateTime', data: dateTimeValue });
            console.log('quiz data is', quizData);
        }
    }
    const saveQuizData = async () => {

        if (quizDraft.length < 1) {
            setSnackbarMsg('Add atleast 1 question');
            setSnackbarOpen(true);
            return;
        }
        setBackdropOpen(true);
        console.log('opened class', openedClass);
        const classRef = doc(db, 'classes', openedClass.classId);
        const quizesRef = collection(classRef, 'quizes');
        try {
            const quizSaveResult = await addDoc(quizesRef, quizData);
            try {

                const batch = writeBatch(db);
                const quizRef = doc(collection(quizesRef, quizSaveResult.id, 'questions'));
                quizDraft.map((item, index) => {
                    batch.set(quizRef, item);
                });

                batch.commit().then(function () {
                    // ...
                    setSnackbarMsg('Quiz saved');
                    setSnackbarOpen(true);
                    setDialogOpen(!openDialog);

                });
            } catch (error) {
                setSnackbarMsg(error.message);
                setSnackbarOpen(true);
                console.log(error);

            }

        } catch (error) {
            console.log(error);
        }
        setBackdropOpen(false);

    }

    return (
        <>
            <QuestionEditorDialog />
            <SetupQuestItemDialog />
            <QuestionTypeDialog pos={currentPostoAdd}></QuestionTypeDialog>
            <DraftQuiz.Provider value={{ quizTitle, quizDesc, quizDraft, setQuizTitle, setQuizDesc, setQuizDraft }}>
                <Dialog
                    fullScreen
                    open={openDialog}
                    onClose={() => { }}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{ borderRadius: '25px', marginTop: '.2rem', backgroundColor: 'white', position: 'sticky', boxShadow: '0 0 5px rgba(0,0,0,.3)' }}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color={'#000'}
                                onClick={() => { setDialogOpen(!openDialog) }}
                                aria-label="close">
                                <md-icon>arrow_back</md-icon>
                            </IconButton>
                            <Typography sx={{ color: '#000', ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="h6" component="div">
                                Create Quiz
                            </Typography>
                            <Tooltip title='Save'>
                                <IconButton
                                    disabled={quizData.title.trim() == '' || quizDraft.length <= 0}
                                    edge="end"
                                    color={'#000'}
                                    onClick={saveQuizData}
                                    aria-label="save">
                                    <md-icon>save</md-icon>
                                </IconButton>
                            </Tooltip>
                        </Toolbar>
                    </AppBar>

                    <div className="row">
                        <Container className='quizContainer'>
                            <FormControl sx={{ width: '100%', mt: 1 }}>
                                <TextField fullWidth onChange={quizTitltFieldChange} class='quiz-title' label="Quiz Title" />
                            </FormControl>
                            <FormControl fullWidth sx={{ width: '100%', mt: 1 }}>
                                <TextField fullWidth onChange={quizDescFieldChange} class='quiz-desc' label="Quiz Description" />
                            </FormControl>
                            <Box sx={{ mb: 2 }}>

                            </Box>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en'>
                                <div className="row-center">
                                    {/* <InputLabel>Expected End Date and Time</InputLabel> */}
                                    <FormControl>
                                        <InputLabel id="demo-simple-select-label">Quiz status</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={quizData.status}
                                            label="Quiz status"
                                            onChange={quizStatusFieldChange} >
                                            <MenuItem value={'draft'}>Draft (Visible only to you)</MenuItem>
                                            <MenuItem value={'publish'}>Publish (Visible to everyone on this class)</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel id="demo-simple-select-label">Period</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={quizData.period}
                                            label="Period"
                                            onChange={quizPeriodFieldChange} >
                                            <MenuItem value={'prelim'}>Prelim</MenuItem>
                                            <MenuItem value={'midterm'}>Midterm</MenuItem>
                                            <MenuItem value={'finals'}>Finals</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <MobileDateTimePicker onAccept={quizStartDateFieldChange} defaultValue={dayjs()} label="Expected start date and time" />
                                    {/* <InputLabel>Count</InputLabel> */}
                                    <MobileDateTimePicker onAccept={quizEndDateFieldChange} label="Expected end date and time" />

                                </div>

                            </LocalizationProvider>
                            <div className="quizTypeContainer">
                                <QuizResponseContext.Provider value={{ quizResponse, setQuizResponse }}>

                                    <Divider sx={{ marginBottom: '1rem' }}>
                                        <Chip label="Add Question" onClick={() => { quizTypeSelectDialog(0) }} size="small" variant='outlined' />
                                    </Divider>
                                    {quizDraft.map((item, index) => (
                                        <DraggableQuizTypeContainer key={item.id} item={item} id={item.id} />
                                    ))}
                                </QuizResponseContext.Provider>
                            </div>

                        </Container>

                    </div>
                </Dialog>
            </DraftQuiz.Provider >
        </>
    );
}

export default AddQuizDialog;



