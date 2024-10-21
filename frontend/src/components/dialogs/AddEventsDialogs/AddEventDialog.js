import React, {useState, useEffect} from 'react';
import {
    Button, Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import SubmitButton from "../../ui/SubmitButton/SubmitButton";

import InputLabel from '../../ui/InputLabel/InputLabel';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DesktopDatePicker} from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs from "dayjs";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AddEventDialog = ({ open, onClose }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [date, setDate] = useState(dayjs());
    const [insertLoading, setInsertLoading] = useState(false);

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

    useEffect(() => {
        if (!open) {
            setTitle('');
            setCategory('');
            setDescription('');
            setImage(null);
            setDate(dayjs());
            setInsertLoading(false);
        }
    }, [open]);


    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px' } }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Dodaj transakcję
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <form>

                    <InputLabel
                        label="Tytuł"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <InputLabel
                        label="Kategoria"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />

                    <InputLabel
                        label="Opis"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Paragon / faktura
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={(event) => console.log(event.target.files)}
                            multiple
                        />
                    </Button>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DesktopDatePicker
                            label="Data transakcji"
                            value={date}
                            onChange={(newValue) => setDate(newValue)}
                            disableFuture
                            slotProps={{
                                textField: {
                                    sx: {
                                        width: '100%',
                                        borderRadius: '8px',
                                        borderColor: '#333',
                                        '& .MuiInputBase-root': {
                                            borderColor: 'gray',
                                        },
                                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderWidth: '1px',
                                            borderColor: 'inherit',
                                        },
                                        '& .Mui-focused': {
                                            color: '#333',
                                            borderWidth: '1px',
                                            borderColor: 'inherit',
                                        },
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>


                    <SubmitButton label="Dodaj" type="button" onClick={handleSubmit} isLoading={insertLoading}>
                    </SubmitButton>

                </form>
            </DialogContent>
        </Dialog>

    );
};

export default AddEventDialog;
