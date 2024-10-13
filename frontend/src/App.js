import './App.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import { DialogProvider } from './context/DialogContext';


function App() {

    return (
        <DialogProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/user/registration/authorize-registration" element={<Home />} />
                </Routes>
            </Router>
        </DialogProvider>
    );
}

export default App;

