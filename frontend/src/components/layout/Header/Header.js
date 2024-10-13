import React from 'react';
import DropdownMenu from '../../ui/DropdownMenu/DropdownMenu';
import './Header.css';
import { Link } from "react-router-dom";
import { useUser } from '../../../context/UserContext';

function Header() {
    const { user } = useUser();
    let userName = '';
    if (user) {
        userName = user.username;
    }



    return (
        <header className="header-container">
            <Link to="/">
                <img src={require('../../../assets/mainIcon.png')} alt="Profile" className="mainIcon" />
            </Link>
            <h1><span>Smart</span> <span>Expense</span> <span>Tracker</span></h1>
            <DropdownMenu
                userName={userName}
            />
        </header>
    );
}

export default Header;
