import { Typography, TextField, TextareaAutosize, Box, colors, Chip, IconButton, styled, Button } from '@mui/material';
import './styles/fileAttachment.css';
import { useState, useContext } from "react";
import { AppContext, QuizResponseContext } from '../../AppContext';
import { supabase } from '../Supabase';
// import { storage } from '../Firebase';
export const FileAttachment = (props) => {
    const { setSnackbarOpen, setSnackbarMsg, currentUserData } = useContext(AppContext);
    const [questData, setQuestData] = useState({ ...props.questionData });
    const [composeMode, setComposeMode] = useState(props.composeMode);
    const { quizResponse, dispatchResponse } = useContext(QuizResponseContext);
    const [fileUrl, setFileUrl] = useState('');
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });
    const uploadSupabase = async (file) => {
        const filePath = 'uploads/' + questData.id + currentUserData.uid;
        const { data, error } = await supabase
            .storage
            .from('tinkfast-public-bucket')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });
        console.log('error supabase', error);
        const { data: url } = supabase.storage
            .from('tinkfast-public-bucket')
            .getPublicUrl(filePath);
        return url;

    }
    const handleFileUpload = async (event) => {
        try {

            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('uploadedFile', file);
            // uploadFile(file); 
            const fileUrl = await uploadSupabase(file);
            setFileUrl(fileUrl.publicUrl);
            console.log('filepath', fileUrl);
            const answerData = {
                response: fileUrl.publicUrl,
                type: questData.type,
                points: 0,
                status: 'partial'
            }
            dispatchResponse({
                type: 'setFileUpResponse',
                id: props.questionData,
                data: answerData,
                question: questData
            });
        } catch (error) {
            console.log('error', error);

        }
    };
    return (
        <div className="quiz-container">
            <Typography sx={{ ml: 2, flex: 1, fontFamily: 'Open Sans' }} variant="body1">
                {questData.question}
            </Typography>
            <br />
            {/* <md-filled-text-field class='quiz-desc' label="Answer" type='textarea'>
                </md-filled-text-field> */}
            <Box className={'fileUpContainer'} sx={{ p: 1 }}>
                <span className="material-symbols-rounded" style={{ color: colors.grey[500] }}>draft</span>
                <Typography variant="caption" sx={{ ml: 1, color: colors.grey[500] }}>
                    {composeMode ? 'www.yourfile.com/yourfile.pdf' : fileUrl != '' ? fileUrl : 'Attach file'}
                </Typography>
                <span className="file-actions" style={{ float: 'right' }}>
                    {!composeMode && currentUserData.classRole == 'teacher' ?
                        <>
                            {/* <Chip size='small' label='open' variant='outlined' icon={<span className="material-symbols-rounded" style={{ fontSize: '12px', color: colors.grey[500] }}>open_in_new</span>}></Chip> */}
                            < IconButton size='small' sx={{ width: '25px', height: '25px', alignSelf: 'center' }} edge="end" aria-label="save">
                                <span style={{ fontSize: '18px' }} className='material-symbols-rounded'>open_in_new</span>
                            </IconButton>
                            <IconButton size='small' sx={{ width: '25px', height: '25px', alignSelf: 'center' }} edge="end" aria-label="save">
                                <span style={{ fontSize: '18px' }} className='material-symbols-rounded'>download</span>
                            </IconButton>
                        </>
                        :
                        <>
                            {/* <Chip size='small' label='Choose file' variant='outlined' ></Chip>
                             */}
                            <IconButton
                                component="label"
                                role={undefined}
                                variant="outlined"
                                tabIndex={-1}
                                size='small'
                            >
                                <span style={{ fontSize: '18px' }} className='material-symbols-rounded'>attach_file</span>
                                {/* <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleFileUpload}
                                    multiple
                                /> */}
                                <input
                                    style={{ display: 'none' }}
                                    id="upload-photo"
                                    name="upload-photo"
                                    onChange={handleFileUpload}
                                    type="file"
                                />
                            </IconButton>
                        </>
                    }

                </span>
            </Box >

        </div >
    )
}
