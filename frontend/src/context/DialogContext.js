import React, { createContext, useState } from 'react';

export const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
    const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
    const [isRegistrationSuccessDialogOpen, setIsRegistrationSuccessDialogOpen] = useState(false);
    const [isAccountConfirmationDialogOpen, setIsAccountConfirmationDialogOpen] = useState(false);

    const openRegistrationDialog = () => {
        setIsRegistrationDialogOpen(true);
    };

    const openAuthorizationDialog = () => {
        setIsAccountConfirmationDialogOpen(true);
    };

    const closeDialogs = () => {
        setIsRegistrationDialogOpen(false);
        setIsRegistrationSuccessDialogOpen(false);
        setIsAccountConfirmationDialogOpen(false);
    };

    const handleRegistrationSuccess = () => {
        setIsRegistrationDialogOpen(false);
        setIsRegistrationSuccessDialogOpen(true);
    };

    return (
        <DialogContext.Provider
            value={{
                openRegistrationDialog,
                openAuthorizationDialog,
                closeDialogs,
                handleRegistrationSuccess,
                isRegistrationDialogOpen,
                isRegistrationSuccessDialogOpen,
                isAccountConfirmationDialogOpen,
            }}
        >
            {children}
        </DialogContext.Provider>
    );
};
