import React, {useState, useEffect, useRef, useContext} from 'react';
import './DropdownMenu.css';
import Avatar from '../../layout/Avatar/Avatar';
import HamburgerMenu from "../HamburgerMenu/HamburgerMenu";
import RegistrationDialog from '../../dialogs/RegistrationDialog/RegistrationDialog';
import {DialogContext} from "../../../contexts/DialogContext";
import InformationDialog from "../../dialogs/InformationDialog/InformationDialog";
import LocalPostOfficeOutlinedIcon from "@mui/icons-material/LocalPostOfficeOutlined";
import LoginDialog from "../../dialogs/LoginDialog/LoginDialog";
import SendPasswordEmailDialog from "../../dialogs/SendPasswordEmailDialog/SendPasswordEmailDialog";
import { useUser } from '../../../contexts/UserContext';

function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { username, logout } = useUser();

    const {
        closeDialogs,
        openRegistrationDialog,
        isRegistrationDialogOpen,
        isRegistrationSuccessDialogOpen,
        isLoginDialogOpen,
        openLoginDialog,
        isSendPasswordEmailDialogOpen,
    } = useContext(DialogContext);


    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const openRegistrationDialogComponent = () => {
        setIsOpen(false);
        openRegistrationDialog();
    };

    const openLoginDialogComponent = () => {
        setIsOpen(false);
        openLoginDialog();
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
                {username ? (
                    <Avatar userName={username} />
                ) : (
                    <img src={require('../../../assets/unauthorizedIcon.png')} alt="Profile" className="unauthorizedIcon" />
                )}
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {username ? (
                        <>
                            <button onClick={logout}>Profil</button>
                            <button onClick={logout}>Wyloguj się</button>
                        </>
                    ) : (
                        <>
                            <button onClick={openLoginDialogComponent}>Zaloguj się</button>
                            <button onClick={openRegistrationDialogComponent}>Zarejestruj się</button>
                        </>
                    )}
                </div>
            )}

            <RegistrationDialog
                open={isRegistrationDialogOpen}
                onClose={closeDialogs}
            />

            <InformationDialog
                open={isRegistrationSuccessDialogOpen}
                onClose={closeDialogs}
                title="Rejestracja zakończona"
                message="Twoje konto zostało pomyślnie utworzone! Potwierdź je teraz, klikając w link wysłany na adres email."
                icon={LocalPostOfficeOutlinedIcon}
            />

            <LoginDialog open={isLoginDialogOpen}
                         onClose={closeDialogs}
            />

            <SendPasswordEmailDialog
                open={isSendPasswordEmailDialogOpen}
                onClose={closeDialogs}
            />
        </div>
    );
}

export default DropdownMenu;
