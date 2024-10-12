import React from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SuccessDialog = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px' } }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Rejestracja Udana
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent style={{ textAlign: 'center' }}>
                <CheckCircleIcon style={{ color: 'green', fontSize: '4rem' }} />
                <p>
                    Twoje konto zostało pomyślnie utworzone! Potwierdź je teraz, klikając w link wysłany na adres email.
                </p>
                <p>
                    Bez tej akcji nie będzie można korzystać z serwisu.
                </p>
            </DialogContent>
        </Dialog>
    );
};

export default SuccessDialog;
