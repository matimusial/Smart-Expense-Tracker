import React from 'react';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import './Header.css';

function Header() {
    const userName = "";

    return (
        <header className="header-container">
            <img src={require('../../assets/mainIcon.png')} alt="Profile" className="mainIcon"/>
            <h1><span>Smart</span> <span>Expense</span> <span>Tracker</span></h1>
            <DropdownMenu user={userName}/>
        </header>
    );
}

export default Header;
