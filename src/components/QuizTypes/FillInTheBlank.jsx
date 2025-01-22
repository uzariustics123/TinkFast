import { Typography, TextField, TextareaAutosize } from '@mui/material';
import './styles/fillIn.css';
import { useState, useContext } from "react";
import { AppContext, QuizResponseContext } from '../../AppContext';
import { getQuestionScore } from '../../Utils';
export const FillInTheBlank = (props) => {
    const { setSnackbarOpen, setSnackbarMsg } = useContext(AppContext);
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [composeMode, setComposeMode] = useState(false);
    const { quizResponse, dispatchResponse } = useContext(QuizResponseContext);
    const onpasteHandler = (e) => {
        e.preventDefault();
    }
    const onTextChangeHandler = (e) => {
        console.log('onTextChangeHandler', e.target.value);
        const points = getQuestionScore(questData, e.target.value);
        const answerData = {
            response: e.target.value,
            type: questData.type,
            points: points,
            status: 'partial'
        }
        dispatchResponse({
            type: 'setFillInResponse',
            id: props.questionData,
            data: answerData,
            question: questData
        });
    }
    return (
        <>
            <div className='fill-in-container' style={{}}>
                <TextField
                    className='fill-in-tf'
                    onPaste={onpasteHandler}
                    onChange={onTextChangeHandler}
                    sx={{ minWidth: '300px' }}
                    id="fill-the-blank"
                    label="Answer here"
                    variant="outlined"
                />
                <span>
                    <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans', mr: 8 }} variant="body1">
                        {questData.question}
                    </Typography>
                </span>
            </div>

        </>
    );
}
