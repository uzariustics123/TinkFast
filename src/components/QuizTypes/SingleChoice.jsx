import React, { useState, useContext } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Typography } from '@mui/material';
import { QuizResponseContext } from '../../AppContext';
const SingleChoice = (props) => {
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [choiceItems, setChoiceItems] = useState([...props.choices]);
    const { quizResponse, setQuizResponse } = useContext(QuizResponseContext);
    return (
        <div className="quiz-container">
            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                {questData.question}
            </Typography>
            <Box sx={{ mt: 1, ml: 2 }}>
                <FormControl>
                    <FormLabel>Select answer</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        onChange={() => { }}>
                        {choiceItems.map((item) => (
                            <FormControlLabel key={item.value} value={item.value} control={<Radio />} label={item.value} />
                        ))}

                    </RadioGroup>
                </FormControl>
            </Box>
        </div >
    )
}
export default SingleChoice;
