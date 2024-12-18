import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {getCurrentUser, loginUser, logoutUser} from '../utils/PublicApi';
import {deleteAccount, setOnUnauthorized} from '../utils/ProtectedApi';
import { AccountDialogContext } from './AccountDialogContext';
import { motion } from 'framer-motion';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const { openLoginDialog } = useContext(AccountDialogContext);
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


    const downloadRandomImages = useCallback(async () => {
        try {
            const response = await fetch("/receipts.json");
            const fileNames = await response.json();

            if (!Array.isArray(fileNames) || fileNames.length === 0) {
                console.error("Lista nazw plików jest pusta lub niepoprawna.");
                return;
            }

            const shuffled = fileNames.sort(() => 0.5 - Math.random());
            const selectedFiles = shuffled.slice(0, 4);

            let counter = 1;

            for (const fileName of selectedFiles) {
                try {
                    const url = `/exampleReceipts/${fileName}`;
                    const imageResponse = await fetch(url);

                    if (!imageResponse.ok) {
                        throw new Error(`Nie udało się pobrać obrazu: ${url}`);
                    }

                    const blob = await imageResponse.blob();
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);

                    link.download = `paragon_demonstracyjny_${counter}.jpg`;
                    counter++;

                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (imageError) {
                    console.error("Błąd podczas pobierania obrazu:", fileName, imageError);
                }
            }
        } catch (error) {
            console.error("Błąd podczas pobierania zdjęć:", error);
        }
    }, []);


    useEffect(() => {
        checkUser();
        setOnUnauthorized(() => {
            setUsername('');
            window.location.href = '/';
            openLoginDialog();
        });
    }, [checkUser, openLoginDialog]);


    return (
        <UserContext.Provider value={{ username, login, logout, deleteAccountHandler, error, clearError, downloadRandomImages }}>
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
