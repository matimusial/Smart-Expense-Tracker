import React, { useState, useEffect, useRef } from 'react';
import './DropdownMenu.css';
import Avatar from '../../layout/Avatar/Avatar';
import HamburgerMenu from "../HamburgerMenu/HamburgerMenu";
import RegistrationDialog from '../../dialogs/RegistrationDialog/RegistrationDialog';
import SuccessDialog from '../../dialogs/RegistrationDialog/SuccessDialog';

function DropdownMenu({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
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

    const openSuccessDialog = () => {
        setIsSuccessOpen(true);
    };

    const closeSuccessDialog = () => {
        setIsSuccessOpen(false);
    };

    const handleRegistrationSuccess = () => {
        setIsRegistrationOpen(false);
        openSuccessDialog();
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
                open={isRegistrationOpen}
                onClose={closeRegistrationDialog}
                onSuccess={handleRegistrationSuccess}
            />

            <SuccessDialog
                open={isSuccessOpen}
                onClose={closeSuccessDialog}
            />
        </div>
    );
}

export default DropdownMenu;
