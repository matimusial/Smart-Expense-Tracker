import React, { createContext, useState, useCallback } from 'react';

export const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
    const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
    const [isRegistrationSuccessDialogOpen, setIsRegistrationSuccessDialogOpen] = useState(false);
    const [isAccountConfirmationDialogOpen, setIsAccountConfirmationDialogOpen] = useState(false);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isSendPasswordEmailDialogOpen, setIsSendPasswordEmailDialogOpen ] = useState(false);

    const closeDialogs = useCallback(() => {
        setIsRegistrationDialogOpen(false);
        setIsRegistrationSuccessDialogOpen(false);
        setIsAccountConfirmationDialogOpen(false);
        setIsLoginDialogOpen(false);
        setIsSendPasswordEmailDialogOpen(false);
    }, []);

    const openRegistrationDialog = useCallback(() => {
        closeDialogs();
        setIsRegistrationDialogOpen(true);
    }, [closeDialogs]);

    const openRegistrationSuccessDialog = useCallback(() => {
        closeDialogs();
        setIsRegistrationSuccessDialogOpen(true);
    }, [closeDialogs]);

    const openSendPasswordEmailDialog = useCallback(()=> {
        closeDialogs();
        setIsSendPasswordEmailDialogOpen(true);
    }, [closeDialogs]);

    const openAccountConfirmationDialog = useCallback(() => {
        closeDialogs();
        setIsAccountConfirmationDialogOpen(true);
    }, [closeDialogs]);

    const openLoginDialog = useCallback(() => {
        closeDialogs();
        setIsLoginDialogOpen(true);
    }, [closeDialogs]);

    return (
        <DialogContext.Provider
            value={{
                openRegistrationDialog,
                openRegistrationSuccessDialog,
                openAccountConfirmationDialog,
                openSendPasswordEmailDialog,
                closeDialogs,
                openLoginDialog,
                isRegistrationDialogOpen,
                isRegistrationSuccessDialogOpen,
                isAccountConfirmationDialogOpen,
                isLoginDialogOpen,
                isSendPasswordEmailDialogOpen
            }}
        >
            {children}
        </DialogContext.Provider>
    );
};
