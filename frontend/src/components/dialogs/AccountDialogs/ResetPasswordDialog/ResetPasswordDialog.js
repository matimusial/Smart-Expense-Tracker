import React, {useState, useEffect, useContext} from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SubmitButton from "../../../ui/SubmitButton/SubmitButton";

import {
    validatePasswordLength,
    validatePasswordSign,
    validatePasswordMatch,
} from '../../../../utils/Validation';

import { changePassword
} from '../../../../utils/PublicApi';

import InputLabel from '../../../ui/InputLabel/InputLabel';

import {AccountDialogContext} from '../../../../contexts/AccountDialogContext';
import PasswordChecker from "../../../ui/PasswordChecker/PasswordChecker";

const ResetPasswordDialog = ({ open, onClose }) => {
    const { openResetPasswordSuccessDialog } = useContext(AccountDialogContext);
    const [password, setPassword] = useState('');
    const [conPassword, setConPassword] = useState('');
    const [passwordLengthValid, setPasswordLengthValid] = useState(false);
    const [passwordSignValid, setPasswordSignValid] = useState(false);
    const [passwordMatchValid, setPasswordMatchValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorKey, setErrorKey] = useState(0);

    useEffect(() => {
        if (!open) {
            setPassword('');
            setConPassword('');
            setPasswordLengthValid(false);
            setPasswordSignValid(false);
            setPasswordMatchValid(false);
            setShowPassword(false);
            setErrorKey(0);
            setResetPasswordLoading(false);
        }
        setPasswordLengthValid(validatePasswordLength(password));
        setPasswordSignValid(validatePasswordSign(password));
        setPasswordMatchValid(validatePasswordMatch(password, conPassword));
    }, [open, password, conPassword]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        if ( passwordLengthValid &&
            passwordSignValid &&
            passwordMatchValid ) {

            try {
                setErrorKey(prevKey => prevKey + 1);
                setResetPasswordLoading(true);
                const result = await changePassword(password, conPassword);
                if (result[0] === true){
                    setPassword('');
                    setConPassword('');
                    setResetPasswordLoading(false);
                    openResetPasswordSuccessDialog();
                }
                else{
                    setError(result[1]);
                }

            } catch (error) {
                console.error('Change password error:', error);
                throw error;
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px' } }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Utwórz nowe hasło
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <InputLabel
                        label="Hasło"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        endAdornment={
                            <IconButton tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}>

                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        }
                    />

                    <InputLabel
                        label="Potwierdź hasło"
                        type={showPassword ? 'text' : 'password'}
                        value={conPassword}
                        onChange={(e) => setConPassword(e.target.value)}
                    />

                    <PasswordChecker
                        passwordLengthValid={passwordLengthValid}
                        passwordSignValid={passwordSignValid}
                        passwordMatchValid={passwordMatchValid}
                    />

                    <SubmitButton label="Kontynuuj" isLoading={resetPasswordLoading}>
                    </SubmitButton>

                    {error ?
                        <div className="error-message" key={errorKey}>
                            {error}
                        </div> : null}

                </form>
            </DialogContent>
        </Dialog>

    );
};

export default ResetPasswordDialog;
