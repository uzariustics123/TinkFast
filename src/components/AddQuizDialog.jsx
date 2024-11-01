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
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack } from '@mui/material';
import { green, lightGreen, lime } from '@mui/material/colors';
import Essay from './QuizTypes/Essay';
import { closestCorners, DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function AddQuizDialog() {
    const [quizDraft, setQuizDraft] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDesc, setQuizDesc] = useState('');
    const [selectQuizTypeDialog, setSelectQuizTypeDialog] = useState(false);
    const [currentPostoAdd, setCurrentPostoAdd] = useState(0);
    const customTheme = createTheme({
        palette: {
            primary: green,
            secondary: lime,
        },
    });
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

        try {
            const newQuizDraft = [...quizDraft];
            newQuizDraft.splice(newQuizDraft.indexOf(item), 1);
            setQuizDraft(newQuizDraft);
            console.log('newQ', newQuizDraft);
            console.log('quizd', quizDraft);
        } catch (error) {
            console.log('to remove error', error);
        }

    }
    function addQuiz(type, pos) {
        const quizType = type;
        console.log('new q', type, pos);

        // if (quizType == 'essay') {
        const newQuiz = {
            quizQuestion: 'Edit to add your question',
            quizType: quizType,
            id: (crypto.randomUUID())
        };
        const newQuizList = [...quizDraft];
        newQuizList.splice(pos, 0, newQuiz);
        console.log('newQuizList', newQuizList);
        setQuizDraft(newQuizList);
        // }
    }
    const quizTypeSelectDialog = (pos) => {
        setCurrentPostoAdd(pos);
        setSelectQuizTypeDialog(!selectQuizTypeDialog);
    }
    const DroppableChipArea = (props) => {
        return (
            <div className="quizTypeContainer">
                <Divider sx={{ marginBottom: '1rem' }}>
                    <Chip label="Add Quiz" onClick={() => { quizTypeSelectDialog(0) }} size="small" variant='outlined' />
                </Divider>
                {quizDraft.map((item, index) => (
                    <DraggableQuizTypeContainer key={item.id} item={item} id={item.id} />
                ))}
            </div>
        )
    }
    const QuizTypeDialog = (props) => {
        const pos = props.pos
        const [quizTypes] = useState([
            { type: 'essay', action: () => { }, label: 'Essay' },
            { type: 'multiChoice', action: () => { }, label: 'Multi Choice' },
            { type: 'singleChoice', action: () => { }, label: 'Single Choice' },
            { type: 'mathingType', action: () => { }, label: 'Matching Type' },
        ]);
        const [selectedQuizType, setSelectedQuizType] = useState('');
        const selectAction = (type) => {
            setSelectedQuizType(type);
        }
        return (
            <Dialog open={selectQuizTypeDialog}>
                <DialogTitle>Select a Quiz type</DialogTitle>
                <DialogContent>
                    <Stack direction="column" spacing={1}>
                        {quizTypes.map((item) => (
                            <Chip
                                key={item.type}
                                onClick={() => selectAction(item.type)}
                                label={item.label}
                                variant={selectedQuizType == item.type ? 'filled' : 'outlined'}
                                icon={selectedQuizType == item.type ? <span className='material-symbols-rounded'>check</span> : <></>} >
                            </Chip>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    {/* <md-text-button  >Cancel</md-text-button> */}
                    <Chip size='small' onClick={() => { setSelectQuizTypeDialog(!selectQuizTypeDialog) }} label='Cancel' variant='outlined' />
                    <Chip size='small' onClick={() => { addQuiz(selectedQuizType, pos); setSelectQuizTypeDialog(false); }} disabled={selectedQuizType == ''} label='Save' variant='outlined' />
                    {/* <Button type="submit">Join</Button> */}
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
        return (
            <>
                <div class="quizTypeItem">
                    <div className="quizTypeItemActions">

                        <IconButton aria-label="delete" >
                            <span className="material-symbols-rounded">edit</span>
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => removeQTitem(item)}>
                            <span className="material-symbols-rounded">remove</span>
                        </IconButton>
                    </div>
                    {item.quizType == 'essay' && <>
                        <Essay question={item ? item.quizQuestion : ''} />
                    </>}
                </div>
                <Divider sx={{ marginBottom: '1rem' }}>
                    <Chip label="Add Quiz" onClick={() => { quizTypeSelectDialog(quizDraft.indexOf(item) + 1) }} size="small" variant='outlined' />
                </Divider>
            </>
        )
    }
    return (
        <>
            <QuizTypeDialog pos={currentPostoAdd}></QuizTypeDialog>
            <DraftQuiz.Provider value={{ quizTitle, quizDesc, quizDraft, setQuizTitle, setQuizDesc, setQuizDraft }}>

                <ThemeProvider theme={customTheme}>
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
                                    color="inherit"
                                    onClick={() => { setDialogOpen(!openDialog) }}
                                    aria-label="close">
                                    <CloseIcon />
                                </IconButton>
                                <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="h6" component="div">
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

                                <DroppableChipArea />

                            </Container>
                        </div>
                    </Dialog>
                </ThemeProvider >
            </DraftQuiz.Provider>
        </>
    );
}

export default AddQuizDialog;



