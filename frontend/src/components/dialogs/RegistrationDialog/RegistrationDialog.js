import React, {useState, useEffect, useContext} from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SubmitButton from "../../ui/SubmitButton/SubmitButton";
import './RegistrationDialog.css';

import {
    validateFirstName,
    validateUsername,
    validatePasswordLength,
    validatePasswordSign,
    validatePasswordMatch,
    validateEmail
} from '../../../utils/Validation';

import {
    checkEmailAvailability,
    checkUsernameAvailability, registerUser
} from '../../../utils/PublicApi';

import InputLabel from '../../ui/InputLabel/InputLabel';

import {LoginDialogContext} from '../../../contexts/LoginDialogContext';
import PasswordChecker from "../../ui/PasswordChecker/PasswordChecker";

const RegistrationDialog = ({ open, onClose }) => {
    const { openRegistrationSuccessDialog } = useContext(LoginDialogContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [conPassword, setConPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [passwordLengthValid, setPasswordLengthValid] = useState(false);
    const [passwordSignValid, setPasswordSignValid] = useState(false);
    const [passwordMatchValid, setPasswordMatchValid] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [registrationLoading, setRegistrationLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setEmail('');
            setPassword('');
            setConPassword('');
            setFirstName('');
            setUsername('');
            setPasswordLengthValid(false);
            setPasswordSignValid(false);
            setPasswordMatchValid(false);
            setFirstNameError(false);
            setEmailError(false);
            setUsernameError(false);
            setUsernameLoading(false);
            setEmailLoading(false);
            setShowPassword(false);
            setRegistrationLoading(false);
        }
        setFirstNameError(!validateFirstName(firstName));
        setPasswordLengthValid(validatePasswordLength(password));
        setPasswordSignValid(validatePasswordSign(password));
        setPasswordMatchValid(validatePasswordMatch(password, conPassword));
    }, [open, firstName, password, conPassword]);


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

    const handleUsernameBlur = async () => {
        if (!validateUsername(username)) {
            setUsernameError(true);
            return;
        }
        setUsernameLoading(true);
        const isAvailable = await checkUsernameAvailability(username);
        setUsernameError(!isAvailable);
        setUsernameLoading(false);
    };


    const isFormValid = () => {
        return (
            !firstNameError &&
            !emailError &&
            !usernameError &&
            passwordLengthValid &&
            passwordSignValid &&
            passwordMatchValid &&
            !emailLoading && !usernameLoading
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormValid()) {
            const userData = {
                firstName,
                email,
                username,
                password,
                conPassword
            };

            try {
                setRegistrationLoading(true);
                await registerUser(userData);
                setFirstName('');
                setEmail('');
                setUsername('');
                setPassword('');
                setConPassword('');
                setRegistrationLoading(false);
                openRegistrationSuccessDialog();
            } catch (error) {
                console.error('Registration error:', error);
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
                Zarejestruj
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className="welcome-message">Witaj w Smart Expense Tracker</div>
                <form>

                    <InputLabel
                        label="Imię"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={firstNameError}
                        helperText={firstNameError ? 'Imię jest wymagane i musi zawierać tylko litery.' : ''}
                    />

                    <InputLabel
                        label="Adres e-mail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        onBlur={handleEmailBlur}
                        error={emailError}
                        helperText={emailError ? 'Adres e-mail jest nieprawidłowy lub już zajęty.' : ''}
                    />

                    <InputLabel
                        label="Login"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        onBlur={handleUsernameBlur}
                        error={usernameError}
                        helperText={usernameError ? 'Login jest nieprawidłowy lub już zajęty.' : ''}
                    />

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

                    <SubmitButton label="Kontynuuj" type="button" onClick={handleSubmit} isLoading={registrationLoading}>
                    </SubmitButton>

                </form>
            </DialogContent>
        </Dialog>

    );
};

export default RegistrationDialog;
