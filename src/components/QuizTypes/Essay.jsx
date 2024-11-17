import { Typography, TextField, TextareaAutosize } from '@mui/material';
import './styles/essay.css';
import { useState, useContext } from "react";
import { QuizResponseContext } from '../../AppContext';

const Essay = (props) => {
    const [composeMode, setComposeMode] = useState(false);
    const { quizResponse, setQuizResponse } = useContext(QuizResponseContext);
    return (
        <>
            <div className="quiz-container">
                <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                    {props.question}
                </Typography>
                <br />
                {/* <md-filled-text-field class='quiz-desc' label="Answer" type='textarea'>
                </md-filled-text-field> */}
                <TextField
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