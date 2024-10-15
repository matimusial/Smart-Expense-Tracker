import React, { createContext, useState, useCallback } from 'react';

export const LoginDialogContext = createContext();

export const LoginDialogProvider = ({ children }) => {
    const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
    const [isRegistrationSuccessDialogOpen, setIsRegistrationSuccessDialogOpen] = useState(false);

    const [isAccountConfirmationDialogOpen, setIsAccountConfirmationDialogOpen] = useState(false);

    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

    const [isSendPasswordEmailDialogOpen, setIsSendPasswordEmailDialogOpen ] = useState(false);
    const [isSendPasswordEmailSuccessDialogOpen, setIsSendPasswordEmailSuccessDialogOpen ] = useState(false);

    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
    const [isResetPasswordSuccessDialogOpen, setIsResetPasswordSuccessDialogOpen] = useState(false);
    const [isResetPasswordErrorDialogOpen, setIsResetPasswordErrorDialogOpen] = useState(false);

    const closeDialogs = useCallback(() => {
        setIsRegistrationDialogOpen(false);
        setIsRegistrationSuccessDialogOpen(false);
        setIsAccountConfirmationDialogOpen(false);
        setIsLoginDialogOpen(false);
        setIsSendPasswordEmailDialogOpen(false);
        setIsSendPasswordEmailSuccessDialogOpen(false);
        setIsResetPasswordDialogOpen(false);
        setIsResetPasswordSuccessDialogOpen(false);
        setIsResetPasswordErrorDialogOpen(false);
    }, []);

    const openResetPasswordErrorDialog = useCallback(() => {
        closeDialogs();
        setIsResetPasswordErrorDialogOpen(true);
    }, [closeDialogs]);
    
    const openResetPasswordSuccessDialog = useCallback(() => {
        closeDialogs();
        setIsResetPasswordSuccessDialogOpen(true);
    }, [closeDialogs])

    const openResetPasswordDialog = useCallback(() => {
        closeDialogs();
        setIsResetPasswordDialogOpen(true);
    }, [closeDialogs]);

    const openRegistrationDialog = useCallback(() => {
        closeDialogs();
        setIsRegistrationDialogOpen(true);
    }, [closeDialogs]);

    const openSendPasswordEmailSuccessDialog = useCallback(() => {
        closeDialogs();
        setIsSendPasswordEmailSuccessDialogOpen(true);
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
        <LoginDialogContext.Provider
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
                isSendPasswordEmailDialogOpen,
                isSendPasswordEmailSuccessDialogOpen,
                openSendPasswordEmailSuccessDialog,
                openResetPasswordDialog,
                isResetPasswordDialogOpen,
                openResetPasswordSuccessDialog,
                isResetPasswordSuccessDialogOpen,
                openResetPasswordErrorDialog,
                isResetPasswordErrorDialogOpen
            }}
        >
            {children}
        </LoginDialogContext.Provider>
    );
};
