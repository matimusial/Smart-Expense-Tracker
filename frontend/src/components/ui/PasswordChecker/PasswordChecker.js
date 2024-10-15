import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const PasswordChecker = ({ passwordLengthValid, passwordSignValid, passwordMatchValid }) => {
    return (
        <div className="password-checker">
            <div className="password-check-item">
                {passwordSignValid ? (
                    <CheckCircleIcon style={{ color: 'green', fontSize: 'small' }} />
                ) : (
                    <CancelIcon style={{ color: 'red', fontSize: 'small' }} />
                )}
                <span className={`password-check ${passwordSignValid ? 'ok' : 'error'}`}>
                    Zawiera liczbę lub znak specjalny
                </span>
            </div>
            <div className="password-check-item">
                {passwordLengthValid ? (
                    <CheckCircleIcon style={{ color: 'green', fontSize: 'small' }} />
                ) : (
                    <CancelIcon style={{ color: 'red', fontSize: 'small' }} />
                )}
                <span className={`password-check ${passwordLengthValid ? 'ok' : 'error'}`}>
                    Minimalna wymagana liczba znaków: 8
                </span>
            </div>
            <div className="password-check-item">
                {passwordMatchValid ? (
                    <CheckCircleIcon style={{ color: 'green', fontSize: 'small' }} />
                ) : (
                    <CancelIcon style={{ color: 'red', fontSize: 'small' }} />
                )}
                <span className={`password-check ${passwordMatchValid ? 'ok' : 'error'}`}>
                    Hasła są zgodne
                </span>
            </div>
        </div>
    );
};

export default PasswordChecker;
