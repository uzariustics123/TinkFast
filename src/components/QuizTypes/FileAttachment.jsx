import React from 'react'
import React, { useContext, useState } from 'react'
import { Container, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Tooltip, Chip, Stack, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, InputLabel, TextField, Stepper, Step, StepLabel, StepContent, Box, Paper, Typography } from '@mui/material';
import { QuizResponseContext } from '../../AppContext';
export const FileAttachment = () => {
    return (
        <div className="quiz-container">
            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                {questData.question}
            </Typography>
            <br />
            {/* <md-filled-text-field class='quiz-desc' label="Answer" type='textarea'>
                </md-filled-text-field> */}
            <Box>

            </Box>

        </div>
    )
}
