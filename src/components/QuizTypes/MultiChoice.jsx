import React, { useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Checkbox, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Typography } from '@mui/material';
const MultiChoice = (props) => {
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [choiceItems, setChoiceItems] = useState([...props.choices]);
    return (
        <div className="quiz-container">
            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                {questData.question}
            </Typography>
            <Box sx={{ mt: 1, ml: 2 }}>
                <FormControl>
                    <FormLabel>Select answer</FormLabel>

                    {choiceItems.map((item) => (
                        // <FormControlLabel key={item} value={item} control={<Radio />} label={item} />
                        <FormControlLabel control={<Checkbox />} label={item} />
                        // <Checkbox key={item} InputLabel={item} />
                    ))}

                </FormControl>
            </Box>
        </div >
    )
}
export default MultiChoice;
