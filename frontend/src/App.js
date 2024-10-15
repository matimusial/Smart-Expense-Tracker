import './App.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import { LoginDialogProvider } from './contexts/LoginDialogContext';
import { UserProvider } from "./contexts/UserContext";
import ExpenseDashboard from "./pages/ExpenseDashboard/ExpenseDashboard";

function App() {
    return (
        <LoginDialogProvider>
            <UserProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/user/registration/authorize-registration" element={<Home />} />
                        <Route path="/user/login/reset-password" element={<Home />} />
                        <Route path="/event/expense-dashboard" element={<ExpenseDashboard />} />
                    </Routes>
                </Router>
            </UserProvider>
        </LoginDialogProvider>

    );
}

export default App;
