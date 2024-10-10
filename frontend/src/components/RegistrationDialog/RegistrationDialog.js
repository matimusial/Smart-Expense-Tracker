import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Ripples from "react-ripples";

const RegistrationDialog = ({ open, onClose }) => {
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [conPassword, setConPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [passwordLengthFlag, setPasswordLengthFlag] = useState(false);
    const [passwordSignFlag, setPasswordSignFlag] = useState(false);
    const [passwordMatchFlag, setPasswordMatchFlag] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);

    const validateFirstName = (name) => {
        const regex = /^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]+$/;
        return regex.test(name) && name.trim().length > 0;
    };

    const validatePasswordLength = (password) => {
        return password.length >= 8;
    };

    const validatePasswordSign = (password) => {
        const regex = /[0-9!@#$%^&*]/;
        return regex.test(password);
    };

    const validatePasswordMatch = (password, conPassword) => {
        return password === conPassword;
    };

    useEffect(() => {
        setFirstNameError(!validateFirstName(firstName));
        setPasswordLengthFlag(validatePasswordLength(password));
        setPasswordSignFlag(validatePasswordSign(password));
        setPasswordMatchFlag(validatePasswordMatch(password, conPassword));
    }, [firstName, password, conPassword]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Zarejestruj
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                Witaj w Smart Expense Tracker
                <TextField
                    label="Imię"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    error={firstNameError}
                    InputLabelProps={{
                        style: { color: firstNameError ? 'red' : undefined }
                    }}
                    InputProps={{
                        style: { backgroundColor: firstNameError ? '#fff4f4' : undefined }
                    }}
                />
                <TextField
                    label="Adres e-mail"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                />
                <TextField
                    label="Login"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                />
                <TextField
                    label="Hasło"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                />
                <TextField
                    label="Potwierdź hasło"
                    type="password"
                    value={conPassword}
                    onChange={(e) => setConPassword(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                />
                <div className={"password-checker"}>
                    {passwordSignFlag ? (
                        <CheckCircleIcon style={{ color: 'green', fontSize: "small" }} />
                    ) : (
                        <CancelIcon style={{ color: 'red', fontSize: 'small' }} />
                    )}
                    <span className={`password-check ${passwordSignFlag ? 'ok' : 'error'}`}>
                        Zawiera liczbę lub znak specjalny<br />
                    </span>
                    {passwordLengthFlag ? (
                        <CheckCircleIcon style={{ color: 'green', fontSize: 'small' }} />
                    ) : (
                        <CancelIcon style={{ color: 'red', fontSize: 'small' }} />
                    )}
                    <span className={`password-check ${passwordLengthFlag ? 'ok' : 'error'}`}>
                        Minimalna wymagana liczba znaków: 8
                    </span>
                    <br />
                    {passwordMatchFlag ? (
                        <CheckCircleIcon style={{ color: 'green', fontSize: 'small' }} />
                    ) : (
                        <CancelIcon style={{ color: 'red', fontSize: 'small' }} />
                    )}
                    <span className={`password-check ${passwordMatchFlag ? 'ok' : 'error'}`}>
                        Hasła są zgodne
                    </span>
                </div>
                <Ripples>
                    <Button
                        disabled={firstNameError || !passwordLengthFlag || !passwordSignFlag || !passwordMatchFlag} // Walidacja wszystkich pól
                    >
                        Kontynuuj
                    </Button>
                </Ripples>
            </DialogContent>
        </Dialog>
    );
};

export default RegistrationDialog;
