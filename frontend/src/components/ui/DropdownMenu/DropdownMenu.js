import React, {useState, useEffect, useRef, useContext} from 'react';
import './DropdownMenu.css';
import Avatar from '../../layout/Avatar/Avatar';
import HamburgerMenu from "../HamburgerMenu/HamburgerMenu";
import RegistrationDialog from '../../dialogs/AccountDialogs/RegistrationDialog/RegistrationDialog';
import {AccountDialogContext} from "../../../contexts/AccountDialogContext";
import InformationDialog from "../../dialogs/InformationDialog/InformationDialog";
import LocalPostOfficeOutlinedIcon from "@mui/icons-material/LocalPostOfficeOutlined";
import LoginDialog from "../../dialogs/AccountDialogs/LoginDialog/LoginDialog";
import SendPasswordEmailDialog from "../../dialogs/AccountDialogs/SendPasswordEmailDialog/SendPasswordEmailDialog";
import { useUser } from '../../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import DeleteAccountDialog from "../../dialogs/AccountDialogs/DeleteAccountDialog/DeleteAccountDialog";

function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { username, logout, downloadRandomImages } = useUser();
    const navigate = useNavigate();

    const {
        closeDialogs,
        openRegistrationDialog,
        isRegistrationDialogOpen,
        isRegistrationSuccessDialogOpen,
        isLoginDialogOpen,
        openLoginDialog,
        isSendPasswordEmailDialogOpen,
        isSendPasswordEmailSuccessDialogOpen,
        openDeleteAccountDialog,
        isDeleteAccountDialogOpen
    } = useContext(AccountDialogContext);


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

    const handleMyExpenseClick = () => {
        navigate('/event/expense-dashboard');
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
                            <button onClick={handleMyExpenseClick}>Moje wydatki</button>
                            <button onClick={downloadRandomImages}>Pobierz paragony</button>
                            <button onClick={logout}>Wyloguj się</button>
                            <button onClick={openDeleteAccountDialog}>Usuń konto</button>
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

            <DeleteAccountDialog
                open={isDeleteAccountDialogOpen}
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

            <InformationDialog
                open={isSendPasswordEmailSuccessDialogOpen}
                onClose={closeDialogs}
                title="Link został wysłany"
                message="Po kliknięciu na link w wiadomości email zostanie otwarty formularz do zmiany hasła."
                icon={LocalPostOfficeOutlinedIcon}
            />
        </div>
    );
}

export default DropdownMenu;
