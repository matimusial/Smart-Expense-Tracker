import React, { useState, useEffect, useRef } from 'react';
import './DropdownMenu.css';
import Avatar from '../../layout/Avatar/Avatar';
import HamburgerMenu from "../HamburgerMenu/HamburgerMenu";
import RegistrationDialog from '../../dialogs/RegistrationDialog/RegistrationDialog';

function DropdownMenu({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const openRegistrationDialog = () => {
        setIsRegistrationOpen(true);
        setIsOpen(false);
    };

    const closeRegistrationDialog = () => {
        setIsRegistrationOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button onClick={toggleMenu} className="dropdown-toggle">
                <HamburgerMenu />
                {user ? (
                    <Avatar name={user} />
                ) : (
                    <img src={require('../../../assets/unauthorizedIcon.png')} alt="Profile" className="unauthorizedIcon" />
                )}
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {user ? (
                        <>
                            <a href="/profile">Profil</a>
                            <a href="/logout">Wyloguj się</a>
                        </>
                    ) : (
                        <>
                            <button onClick={openRegistrationDialog}>Zarejestruj się</button>
                        </>
                    )}
                </div>
            )}

            <RegistrationDialog
                onOpen={isRegistrationOpen}
                onClose={closeRegistrationDialog}
            />
        </div>
    );
}

export default DropdownMenu;
