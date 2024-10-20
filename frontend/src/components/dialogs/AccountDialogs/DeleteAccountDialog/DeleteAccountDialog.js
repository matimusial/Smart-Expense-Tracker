import React, {useState, useEffect} from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SubmitButton from "../../../ui/SubmitButton/SubmitButton";

import InputLabel from '../../../ui/InputLabel/InputLabel';

import { useUser } from '../../../../contexts/UserContext';

const DeleteAccountDialog = ({ open, onClose }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorKey, setErrorKey] = useState(0);
    const { deleteAccountHandler} = useUser();

    useEffect(() => {
        if (!open) {
            setPassword('');
            setShowPassword(false);
            setErrorKey(0);
            setDeleteAccountLoading(false);
        }
    }, [open]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setErrorKey(prevKey => prevKey + 1);
        setDeleteAccountLoading(true);
        try {
            const result = await deleteAccountHandler(password);

            if (result){
                onClose();
            }
            else{
                setError("Nieprawidłowe hasło");
                setDeleteAccountLoading(false);
            }

        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px' } }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Usuń konto
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

                    {error ?
                        <div className="error-message" key={errorKey}>
                            {error}
                        </div> : null}

                    <SubmitButton label="Usuń konto" isLoading={deleteAccountLoading}>
                    </SubmitButton>

                </form>
            </DialogContent>
        </Dialog>

    );
};

export default DeleteAccountDialog;
