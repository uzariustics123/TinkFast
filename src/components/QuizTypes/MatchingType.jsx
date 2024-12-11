import React, { useContext, useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Typography } from '@mui/material';
import { QuizResponseContext } from '../../AppContext';
import { getQuestionScore } from '../../Utils';
const MatchingType = (props) => {
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [choiceItems, setChoiceItems] = useState([...props.choices]);
    const { quizResponse, dispatchResponse } = useContext(QuizResponseContext);
    const [questionResponse, setQuestionResponse] = useState({});


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
                <Box sx={{ mb: 2 }} className="mathingItems">
                    {choiceItems.map((item) => {
                        const [textValue, setTextValue] = useState('--------------------');
                        const onItemDrop = (e) => {
                            const value = e.dataTransfer.getData('value');
                            // console.log(' value', e.dataTransfer.getData('text/plain'));
                            // console.log('test', value);
                            const response = { ...questionResponse };
                            response[item.desc] = value;
                            setTextValue(value);
                            setQuestionResponse(response);
                            const points = getQuestionScore(questData, response);
                            console.log('points mt', points);
                            const answerData = {
                                response: response,
                                type: questData.type,
                                points: points
                            }
                            console.log('data ', answerData);
                            dispatchResponse({
                                type: 'setMatchingTypeResponse',
                                id: props.questionData,
                                data: answerData,
                                question: questData
                            });
                        }

                        const removeSelection = (e) => {
                            console.log('asdf', e);
                            const response = { ...questionResponse };
                            if (Object.values(response).includes(textValue)) {
                                setTextValue('--------------------');
                                delete response[item.desc];
                                setQuestionResponse(response);
                                const points = getQuestionScore(questData, response);
                                console.log('response', response);
                                const answerData = {
                                    response: response,
                                    type: questData.type,
                                    points: points
                                }
                                dispatchResponse({
                                    type: 'setMatchingTypeResponse',
                                    id: props.questionData,
                                    data: answerData,
                                    question: questData
                                });
                            }
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
                        <Chip key={item.value}
                            disabled={Object.values(questionResponse).includes(item.value)}
                            sx={{ cursor: 'pointer' }}
                            draggable
                            onDragStart={(e) => itemDragged(e, item)}
                            label={item.value}
                            size="small"
                            variant='outlined' />
                    ))}
                </Box>
            </Box>
        </div >
    )
}
export default MatchingType;

