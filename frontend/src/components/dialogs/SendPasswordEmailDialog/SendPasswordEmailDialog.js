import React, {useContext, useEffect, useState} from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import SubmitButton from "../../ui/SubmitButton/SubmitButton";

import InputLabel from '../../ui/InputLabel/InputLabel';
import {validateEmail} from "../../../utils/Validation";
import {checkEmailAvailability, SendPasswordEmail} from "../../../utils/PublicApi";
import {LoginDialogContext} from "../../../contexts/LoginDialogContext";


const SendPasswordEmailDialog = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [sendingLoading, setSendingLoading] = useState(false);
    const { openSendPasswordEmailSuccessDialog } = useContext(LoginDialogContext);


    useEffect(() => {
        if (!open) {
            setEmail('');
            setEmailError('');
            setSendingLoading(false);
        }
    }, [open]);




    const handleSubmit = async (e) => {
        setEmailError('');
        e.preventDefault();
        if (!validateEmail(email)) {
            setEmailError('Adres e-mail jest nieprawidłowy.');
            return;
        }
        const isAvailable = await checkEmailAvailability(email);
        if (!isAvailable) {
            try {
                setSendingLoading(true);
                let data = await SendPasswordEmail(email);
                if (data[0] === true) {
                    setEmail('');
                    openSendPasswordEmailSuccessDialog();
                }
                else{
                    setSendingLoading(false);
                    setEmailError(data[1]);
                }
                
                
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        }
        else {
            setEmailError('Adres e-mail jest nieprawidłowy.');
        }
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
                        error={!!emailError}
                        helperText={!!emailError ? 'Adres e-mail jest nieprawidłowy.' : ''}
                    />
                    <SubmitButton label="Kontynuuj" type="submit" isLoading={sendingLoading}>
                    </SubmitButton>
                </form>

            </DialogContent>
        </Dialog>

    );
};

export default SendPasswordEmailDialog;
