import React, {useContext, useEffect, useState} from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SubmitButton from "../../ui/SubmitButton/SubmitButton";

import InputLabel from '../../ui/InputLabel/InputLabel';
import './LoginDialog.css';

import { useUser } from '../../../contexts/UserContext';
import {useNavigate} from "react-router-dom";
import {DialogContext} from '../../../contexts/DialogContext';


const LoginDialog = ({ open, onClose }) => {
    const { openSendPasswordEmailDialog } = useContext(DialogContext);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [errorKey, setErrorKey] = useState(0);
    const { login, error, clearError} = useUser();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setErrorKey(prevKey => prevKey + 1);
        await login(username, password);
        setPassword(``);
        setUsername(``);
        setLoginLoading(false);
        navigate('/event/add-event');
        onClose();
    };

    useEffect(() => {
        if (!open) {
            setUsername('');
            setPassword('');
            setErrorKey(0);
            clearError();
        }
    }, [clearError, open]);


    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px' } }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Zaloguj
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className="welcome-message">Witaj ponownie!</div>
                <form onSubmit={handleSubmit}>

                    <InputLabel
                        label="Login"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        error={!!error}
                    />

                    <InputLabel
                        label="Hasło"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error}
                        endAdornment={
                            <IconButton tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}>

                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                        }
                    />

                    {error ?
                        <div className="error-message" key={errorKey}>
                            {error}
                        </div> : null}


                    <SubmitButton label="Zaloguj" type="submit" isLoading={loginLoading}>
                    </SubmitButton>
                    <SubmitButton label="Zapomniales hasla?" type="button" onClick={openSendPasswordEmailDialog}></SubmitButton>

                </form>
            </DialogContent>
        </Dialog>

    );
};

export default LoginDialog;
