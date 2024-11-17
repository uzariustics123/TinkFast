import React, { useContext, useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Typography } from '@mui/material';
import { QuizResponseContext } from '../../AppContext';
const MatchingType = (props) => {
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [choiceItems, setChoiceItems] = useState([...props.choices]);
    const [questionResponse, setQuestionResponse] = useState({});
    const { quizResponse, setQuizResponse } = useContext(QuizResponseContext);
    const onItemDragOver = (e) => {
        e.preventDefault();
    }
    return (
        <div className="quiz-container">
            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                {questData.question}
            </Typography>
            <Box sx={{ mt: 1, ml: 2 }}>
                {/* <FormControl>
                    <FormLabel>Select answer</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        onChange={() => { }}>
                        {choiceItems.map((item) => (
                            <FormControlLabel key={item} value={item} control={<Radio />} label={item} />
                        ))}

                    </RadioGroup>
                </FormControl> */}
                <Box sx={{ mb: 2 }} className="mathingItems">
                    {choiceItems.map((item) => (
                        // <FormControlLabel  value={item} control={<Radio />} label={item} />
                        <Box className='' sx={{ p: 1 }}>
                            <span style={{ minWidth: '200px' }} key={item.description} onDrop={() => { }} onDragOver={onItemDragOver} >
                                <Chip label='drop here' />
                            </span>
                            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="caption">
                                {item.desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '.5rem' }} className="choicesContainer">
                    {choiceItems.map((item) => (
                        // <FormControlLabel  value={item} control={<Radio />} label={item} />
                        <Chip sx={{ cursor: 'pointer' }} key={item.value} draggable label={item.value} size="small" variant='outlined' />
                    ))}
                </Box>
            </Box>
        </div >
    )
}
export default MatchingType;
