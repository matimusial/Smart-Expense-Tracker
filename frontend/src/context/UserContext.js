import React, { createContext, useContext, useState } from 'react';
import { loginUser, logoutUser } from '../utils/api';


const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        try {
            const result = await loginUser(username, password);
            if (result === true) {
                setUser({ username });
                setError(null);
            } else {
                setError(result);
            }
        } catch (error) {
            setError('Error logging in');
        }
    };

    const logout = async () => {
        try {
            const result = await logoutUser();
            if (result === true) {
                setUser(null);
                setError(null);
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            setError('Error logging out');
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, error, setError }}>
            {children}
        </UserContext.Provider>
    );
};
