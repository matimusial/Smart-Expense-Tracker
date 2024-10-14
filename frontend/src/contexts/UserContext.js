import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser, getCurrentUser } from '../utils/PublicApi';
import { setOnUnauthorized } from '../utils/ProtectedApi';
import { DialogContext } from './DialogContext';
import { motion } from 'framer-motion';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const { openLoginDialog } = useContext(DialogContext);
    const [username, setUsername] = useState(null);
    const [error, setError] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const checkUser = useCallback(async () => {
        try {
            const result = await getCurrentUser();
            if (result) {
                setUsername(result);
            } else {
                setUsername("");
            }
        } catch (error) {
            console.error('Error checking user:', error);
            setUsername("");
        }
    }, []);

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const login = useCallback(async (inputUsername, password) => {
        setError(null);
        try {
            const result = await loginUser(inputUsername, password);
            if (result === true) {
                setUsername(inputUsername);
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
                setTimeout(() => {
                    setUsername("");
                    setIsLoggingOut(false);
                }, 100);
            }
        } catch (error) {
            console.error(`Logout error`, error);
            setIsLoggingOut(false);
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
        <UserContext.Provider value={{ username, login, logout, error, checkUser, clearError }}>
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: isLoggingOut ? 0 : 1 }}
                transition={{ duration: 0.1 }}
            >
                {children}
            </motion.div>
        </UserContext.Provider>
    );
};
