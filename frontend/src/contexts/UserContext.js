import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser } from '../utils/PublicApi';
import {deleteAccount, setOnUnauthorized} from '../utils/ProtectedApi';
import { LoginDialogContext } from './LoginDialogContext';
import { motion } from 'framer-motion';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const { openLoginDialog } = useContext(LoginDialogContext);
    const [username, setUsername] = useState(null);
    const [error, setError] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const clearError = () => {
        setError(null);
    };
    

    const login = useCallback(async (inputUsername, password) => {
        setError(null);
        try {
            const result = await loginUser(inputUsername, password);

            if (result === true) {
                setUsername(inputUsername);
                setError(null);
                return true;
            } else {
                setError(result);
            }
        } catch (error) {
            setError('Błąd podczas logowania');
            console.error('Error login:', error);
        }
    }, []);



    const logout = useCallback(async () => {
        setError(null);
        setIsLoggingOut(true);
        try {
            const result = await logoutUser();
            if (result === true) {
                window.location.href = '/';
                setTimeout(() => {
                    setUsername("");
                    setIsLoggingOut(false);
                }, 250);
            }
        } catch (error) {
            console.error(`Logout error`, error);
            setIsLoggingOut(false);
            throw error;
        }
    }, []);


    const deleteAccountHandler = useCallback(async (password) => {
        setError(null);
        try {
            let result = await deleteAccount(password);
            if (result) {
                setIsLoggingOut(true);
                result = await logoutUser();
                if (result === true) {
                    window.location.href = '/';
                    setTimeout(() => {
                        setUsername("");
                        setIsLoggingOut(false);
                    }, 100);
                }
                return false;
            }
        }
        catch
            (error)
            {
                console.error("Error deleting account:", error);
                throw error;
            }
    }, []);


    useEffect(() => {
        setOnUnauthorized(() => {
            setUsername('');
            window.location.href = '/';
            openLoginDialog();
        });
    }, [openLoginDialog]);


    return (
        <UserContext.Provider value={{ username, login, logout, deleteAccountHandler, error, clearError }}>
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: isLoggingOut ? 0 : 1 }}
                transition={{ duration: 0.25 }}
            >
                {children}
            </motion.div>
        </UserContext.Provider>
    );
};
