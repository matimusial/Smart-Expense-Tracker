import './App.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import { DialogProvider } from './contexts/DialogContext';
import { UserProvider } from "./contexts/UserContext";
import AddEvent from "./pages/AddEvent/AddEvent";

function App() {
    return (
        <DialogProvider>
            <UserProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/user/registration/authorize-registration" element={<Home />} />
                        <Route path="/event/add-event" element={<AddEvent />} />
                    </Routes>
                </Router>
            </UserProvider>
        </DialogProvider>

    );
}

export default App;
