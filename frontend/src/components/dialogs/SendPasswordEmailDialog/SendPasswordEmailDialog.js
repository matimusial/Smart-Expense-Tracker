import React, {useState} from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import SubmitButton from "../../ui/SubmitButton/SubmitButton";

import InputLabel from '../../ui/InputLabel/InputLabel';
import {validateEmail} from "../../../utils/Validation";
import {checkEmailAvailability} from "../../../utils/PublicApi";


const SendPasswordEmailDialog = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [sendingLoading, setSendingLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailLoading) {

            try {
                setSendingLoading(true);
                //await SendPasswordEmail(email);
                setEmail('');
                setSendingLoading(false);
                //openEmailSuccessDialog();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        }
    };

    const handleEmailBlur = async () => {
        if (!validateEmail(email)) {
            setEmailError(true);
            return;
        }
        setEmailLoading(true);
        const isAvailable = await checkEmailAvailability(email);
        setEmailError(!isAvailable);
        setEmailLoading(false);
    };


    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px' } }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Przypomnij hasło
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className="welcome-message" style={{fontSize: '15px'}}>
                    Na podany adres email zostanie wysłany link do zmiany hasła
                </div>

                <form onSubmit={handleSubmit}>

                    <InputLabel
                        label="Adres e-mail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        onBlur={handleEmailBlur}
                        error={emailError}
                        helperText={emailError ? 'Adres e-mail jest nieprawidłowy lub już zajęty.' : ''}
                    />


                    <SubmitButton label="Kontynuuj" onClick={handleSubmit} isLoading={sendingLoading}>
                    </SubmitButton>

                </form>
            </DialogContent>
        </Dialog>

    );
};

export default SendPasswordEmailDialog;
