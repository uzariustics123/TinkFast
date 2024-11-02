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
import { forwardRef, useContext, useEffect, useState } from 'react';
import { DraftQuiz, QuizContext } from '../AppContext';
import CloseIcon from '@mui/icons-material/Close';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper } from '@mui/material';
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


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function AddQuizDialog() {
    const [quizDraft, setQuizDraft] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDesc, setQuizDesc] = useState('');
    const [toUpdateQuest, setToUpdateQuest] = useState({});
    const [selectQuestionTypeDialog, setSelectQuestionTypeDialog] = useState(false);
    const [editQuestionTypeDialog, setEditQuestionTypeDialog] = useState(false);
    const [setupQuestDialogOpen, openSetupQuestDialog] = useState(false);
    const [currentPostoAdd, setCurrentPostoAdd] = useState(0);

    const { openDialog, setDialogOpen } = useContext(QuizContext);

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
                id: (crypto.randomUUID())
            };
        } else if (type == 'multiChoice') {
            newQuiz = {
                question: 'Edit to add your question',
                type: type,
                choices: ['Choice 1', 'Choice 2', 'Choice 3'],
                id: (crypto.randomUUID())
            };
        }
        else if (type == 'matchingType') {
            newQuiz = {
                question: 'Edit to add your question',
                type: type,
                choices: ['Choice 1', 'Choice 2', 'Choice 3'],
                id: (crypto.randomUUID())
            };
        }
        newQuiz.status = 'initial';
        const newQuizList = [...quizDraft];
        newQuizList.splice(pos, 0, newQuiz);
        console.log('newQuizList', newQuizList);
        setQuizDraft(newQuizList);
        setupQuestItem(newQuiz);
    }
    const setupQuestItem = (item) => {
        setToUpdateQuest(item);
        openSetupQuestDialog(true);
    }
    const SetupQuestItemDialog = (props) => {
        console.log('q', quizDraft);

        const Qtype = toUpdateQuest.type;
        const [activeStep, setActiveStep] = useState(0);
        const [singleItems, setSingleChoiceItems] = useState([]);
        let steps = [{}];
        let [questionContent, setQuestContent] = useState(toUpdateQuest.question);
        if (Qtype == 'essay')
            steps = [
                {
                    label: 'Enter Question',
                    description: `Setup question by following these steps`,
                },
                {
                    label: 'Considerations',
                    description:
                        `An Essay type of question does not automatically rate your student's answer. You may need to review each of them and rate them manually to justify your student's answer.`,
                },
            ];
        const cancelSetup = () => {
            openSetupQuestDialog(false);
            if (toUpdateQuest.status == 'initial') {
                const newQuizDraft = [...quizDraft];
                newQuizDraft.splice(newQuizDraft.indexOf(toUpdateQuest), 1);
                setQuizDraft(newQuizDraft);
            }
        }
        const saveSetup = () => {
            const questToSave = { ...toUpdateQuest };
            if (Qtype == 'essay') {
            }
            questToSave.question = questionContent;
            questToSave.status = 'published';
            setToUpdateQuest({ ...questToSave });
            const updatedQuestionList = [...quizDraft];
            updatedQuestionList[quizDraft.indexOf(toUpdateQuest)] = questToSave;
            setQuizDraft(updatedQuestionList);
            openSetupQuestDialog(false);
            console.log('q is ', updatedQuestionList);

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
                                        let essay = event.target.value;
                                        console.log(essay);
                                        setQuestContent(essay);
                                    }
                                    if (index == 0 && Qtype == 'essay') {
                                        if (questionContent.trim() == '') {
                                            labelProps.optional = <Typography error={true} variant="caption">This is a required field</Typography>;
                                            labelProps.error = true;
                                            nextBtnProps.disabled = true;
                                            console.log('wtf');
                                        }
                                    }
                                    const handleNext = () => {
                                        if (activeStep == 0 && Qtype == 'essay') {
                                            // setToUpdateQuest({ ...toUpdateQuest, question: questionContent });
                                        }
                                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                                    };

                                    const handleBack = () => {
                                        setActiveStep((prevActiveStep) => prevActiveStep - 1);
                                    };
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
                                                        defaultValue={questionContent}
                                                        variant="filled" />
                                                </>
                                                }
                                                <Box sx={{ mb: 2 }}>
                                                    <Button variant="contained" {...nextBtnProps} onClick={handleNext} sx={{ mt: 1, mr: 1 }} >
                                                        {(index === 1 && Qtype == 'essay') ? 'I understand'
                                                            : index === steps.length - 1 ? 'Finish' : 'Next'}
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
    const DroppableChipArea = (props) => {
        return (
            <div className="quizTypeContainer">
                <Divider sx={{ marginBottom: '1rem' }}>
                    <Chip label="Add Question" onClick={() => { quizTypeSelectDialog(0) }} size="small" variant='outlined' />
                </Divider>
                {quizDraft.map((item, index) => (
                    <DraggableQuizTypeContainer key={item.id} item={item} id={item.id} />
                ))}
            </div>
        )
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
                                <CloseIcon />
                            </IconButton>
                            <Typography sx={{ color: '#000', ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="h6" component="div">
                                Create Quiz
                            </Typography>
                            <Tooltip title='Save'>
                                <md-outlined-icon-button onClick={() => { setDialogOpen(!openDialog) }}>
                                    <md-icon>save</md-icon>
                                </md-outlined-icon-button>
                            </Tooltip>
                        </Toolbar>
                    </AppBar>
                    <div className="row">
                        <Container className='quizContainer'>
                            <md-outlined-text-field class='quiz-title' label="Quiz Title">
                            </md-outlined-text-field>
                            <md-outlined-text-field class='quiz-desc' label="Quiz Description">
                            </md-outlined-text-field>

                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en'>
                                <div className="row-center">
                                    {/* <InputLabel>Expected End Date and Time</InputLabel> */}
                                    <MobileDateTimePicker defaultValue={dayjs()} label="Expected start date and time" />
                                    {/* <InputLabel>Count</InputLabel> */}
                                    <MobileDateTimePicker label="Expected end date and time" />
                                </div>

                            </LocalizationProvider>
                            <DroppableChipArea />

                        </Container>
                    </div>
                </Dialog>
            </DraftQuiz.Provider >
        </>
    );
}

export default AddQuizDialog;



