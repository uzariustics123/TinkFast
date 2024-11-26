import React, { useContext, useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Typography } from '@mui/material';
import { QuizResponseContext } from '../../AppContext';
const MatchingType = (props) => {
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [choiceItems, setChoiceItems] = useState([...props.choices]);
    const { quizResponse, dispatchResponse } = useContext(QuizResponseContext);
    const [questionResponse, setQuestionResponse] = useState(new Map());

    const onItemDragOver = (e) => {
        e.preventDefault();
    }
    const itemDragged = (e, item) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
        e.dataTransfer.setData("value", item.value);
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
                    {choiceItems.map((item) => {
                        const [textValue, setTextValue] = useState('--------------------');
                        const onItemDrop = (e) => {
                            const value = e.dataTransfer.getData('value');
                            console.log(' value', e.dataTransfer.getData('text/plain'));
                            console.log('test', value);
                            const response = new Map(questionResponse);
                            response.set(item.desc, value);
                            setTextValue(value);
                            setQuestionResponse(response);
                        }
                        const removeSelection = (e) => {
                            console.log('asdf', e);
                            const response = new Map(questionResponse);
                            if (Array.from(response.values()).includes(textValue)) {
                                // const indexToRemove = response.indexOf(textValue);
                                setTextValue('--------------------');
                                response.set(item.desc, null);
                                setQuestionResponse(response);
                            }
                            // e.target.innerText = '--------------------';
                        }
                        return (
                            // <FormControlLabel  value={item} control={<Radio />} label={item} />
                            <Box className='' sx={{ p: 1 }} key={item.description}>
                                <span style={{ minWidth: '200px' }}
                                >
                                    {textValue !== '--------------------' ?
                                        <Chip sx={{ p: 1 }}
                                            onDrop={(e) => { onItemDrop(e, item) }}
                                            onDelete={removeSelection}
                                            onDragOver={onItemDragOver} label={textValue} />
                                        : <Chip sx={{ p: 1 }}
                                            onDrop={(e) => { onItemDrop(e, item) }}
                                            onDragOver={onItemDragOver} label={textValue} />}
                                </span>
                                <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="caption">
                                    {item.desc}
                                </Typography>
                            </Box>
                        )
                    })}
                </Box>
                <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '.5rem' }} className="choicesContainer">
                    {choiceItems.map((item) => (
                        // <FormControlLabel  value={item} control={<Radio />} label={item} />
                        <Chip disabled={Array.from(questionResponse.values()).includes(item.value)} sx={{ cursor: 'pointer' }} key={item.value} draggable onDragStart={(e) => itemDragged(e, item)} label={item.value} size="small" variant='outlined' />
                    ))}
                </Box>
            </Box>
        </div >
    )
}
export default MatchingType;
