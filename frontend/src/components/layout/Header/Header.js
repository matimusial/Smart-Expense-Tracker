import React from 'react';
import DropdownMenu from '../../ui/DropdownMenu/DropdownMenu';
import './Header.css';
import {Link} from "react-router-dom";

function Header() {
    const userName = "";

    return (
        <header className="header-container">
            <Link to="/public">
                <img src={require('../../../assets/mainIcon.png')} alt="Profile" className="mainIcon" />
            </Link>
            <h1><span>Smart</span> <span>Expense</span> <span>Tracker</span></h1>
            <DropdownMenu user={userName}/>
        </header>
    );
}

export default Header;
