import React, { createContext, useState } from 'react';

export const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
    const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
    const [isRegistrationSuccessDialogOpen, setIsRegistrationSuccessDialogOpen] = useState(false);
    const [isAccountConfirmationDialogOpen, setIsAccountConfirmationDialogOpen] = useState(false);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

    const openRegistrationDialog = () => {
        closeDialogs();
        setIsRegistrationDialogOpen(true);
    };

    const openRegistrationSuccessDialog = () => {
        closeDialogs();
        setIsRegistrationSuccessDialogOpen(true);
    }

    const openAccountConfirmationDialog = () => {
        closeDialogs();
        setIsAccountConfirmationDialogOpen(true);
    };

    const openLoginDialog = () => {
        closeDialogs();
        setIsLoginDialogOpen(true);
    }

    const closeDialogs = () => {
        setIsRegistrationDialogOpen(false);
        setIsRegistrationSuccessDialogOpen(false);
        setIsAccountConfirmationDialogOpen(false);
        setIsLoginDialogOpen(false);
    };

    return (
        <DialogContext.Provider
            value={{
                openRegistrationDialog,
                openRegistrationSuccessDialog,
                openAccountConfirmationDialog,
                closeDialogs,
                openLoginDialog,
                isRegistrationDialogOpen,
                isRegistrationSuccessDialogOpen,
                isAccountConfirmationDialogOpen,
                isLoginDialogOpen
            }}
        >
            {children}
        </DialogContext.Provider>
    );
};
