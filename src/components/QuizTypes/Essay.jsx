import { Typography, TextField, TextareaAutosize } from '@mui/material';
import './styles/essay.css';
import { useState, useContext } from "react";
import { AppContext, QuizResponseContext } from '../../AppContext';

const Essay = (props) => {
    const { setSnackbarOpen, setSnackbarMsg } = useContext(AppContext);
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [composeMode, setComposeMode] = useState(false);
    const { quizResponse, dispatchResponse } = useContext(QuizResponseContext);
    const onpasteHandler = (e) => {
        e.preventDefault();
    }
    const onTextChangeHandler = (e) => {
        console.log('onTextChangeHandler', e.target.value);
        const answerData = {
            response: e.target.value,
            type: questData.type,
            points: 0,
            status: 'partial'
        }
        dispatchResponse({
            type: 'setEssayResponse',
            id: props.questionData,
            data: answerData,
            question: questData
        });
    }
    return (
        <>
            <div className="quiz-container">
                <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                    {questData.question}
                </Typography>
                <br />
                {/* <md-filled-text-field class='quiz-desc' label="Answer" type='textarea'>
                </md-filled-text-field> */}
                <TextField
                    onPaste={onpasteHandler}
                    onChange={onTextChangeHandler}
                    sx={{ width: '100%' }}
                    id="filled-multiline-static"
                    label="Answer here"
                    multiline
                    minRows={2}
                    maxRows={5}
                    variant="filled"
                />
            </div>

        </>
    );
}

export default Essay;