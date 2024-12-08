import React, { useState, useContext } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Checkbox, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Typography, FormGroup } from '@mui/material';
import { QuizResponseContext } from '../../AppContext';
import { getQuestionScore } from '../../Utils';
const MultiChoice = (props) => {
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [choiceItems, setChoiceItems] = useState([...props.choices]);
    const { quizResponse, dispatchResponse } = useContext(QuizResponseContext);
    const [questionResponse, setQuestionResponse] = useState({
        selectedAnsers: [],
    });
    const selectedItem = (event, item, value) => {
        // console.log('selectedValue', event.target.checked, item);
        let response;

        if (questionResponse.selectedAnsers.indexOf(value) === -1 && event.target.checked) {
            response = [...questionResponse.selectedAnsers, value];
            setQuestionResponse({ ...questionResponse, selectedAnsers: response });
        } else {
            response = [...questionResponse.selectedAnsers];
            const indexToRemove = response.indexOf(value);
            if (indexToRemove !== -1) {
                response.splice(indexToRemove, 1);
            }
            setQuestionResponse({ ...questionResponse, selectedAnsers: response });
        }
        const points = getQuestionScore(questData, response);
        console.log('points', points);
        const answerData = {
            response: response,
            type: questData.type,
            points: points
        }
        dispatchResponse({
            type: 'setMultipleChoiceResponse',
            id: props.questionData,
            data: answerData,
            question: questData
        });

    }
    return (
        <div className="quiz-container">
            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                {questData.question}
            </Typography>
            <Box sx={{ mt: 1, ml: 2 }}>
                <FormControl>
                    <FormLabel>Select answer</FormLabel>
                    <FormGroup>

                        {choiceItems.map((item) => (
                            // <FormControlLabel key={item} value={item} control={<Radio />} label={item} />
                            <FormControlLabel
                                onChange={(e) => selectedItem(e, item, item.value)}
                                checked={questionResponse.selectedAnsers.includes(item.value)}
                                disabled={(questionResponse.selectedAnsers.length >= (choiceItems.filter((choice) => choice.isCorrect)).length) && !questionResponse.selectedAnsers.includes(item.value)}
                                key={item.value} control={<Checkbox />}
                                label={item.value} />
                            // <Checkbox key={item} InputLabel={item} />
                        ))}
                    </FormGroup>
                </FormControl>
            </Box>
        </div >
    )
}
export default MultiChoice;
