import React from 'react';
import DropdownMenu from '../../ui/DropdownMenu/DropdownMenu';
import './Header.css';
import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="header-container">
            <Link to="/">
                <img src={require('../../../assets/mainIcon.png')} alt="Profile" className="mainIcon" />
            </Link>
            <h1><span>Smart</span> <span>Expense</span> <span>Tracker</span></h1>
            <DropdownMenu/>
        </header>
    );
}

export default Header;
