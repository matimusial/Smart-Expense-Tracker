import React, { useContext } from 'react';
import DropdownMenu from '../../ui/DropdownMenu/DropdownMenu';
import './Header.css';
import { Link } from "react-router-dom";
import InformationDialog from '../../dialogs/InformationDialog/InformationDialog';
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined';
import { DialogContext } from '../../../context/DialogContext';

function Header() {
    const userName = "";

    const {
        handleRegistrationSuccess,
        closeDialogs,
        isRegistrationSuccessDialogOpen,
    } = useContext(DialogContext);

    return (
        <header className="header-container">
            <Link to="/public">
                <img src={require('../../../assets/mainIcon.png')} alt="Profile" className="mainIcon" />
            </Link>
            <h1><span>Smart</span> <span>Expense</span> <span>Tracker</span></h1>
            <DropdownMenu
                user={userName}
                onRegistrationSuccess={handleRegistrationSuccess}
            />

            <InformationDialog
                open={isRegistrationSuccessDialogOpen}
                onClose={closeDialogs}
                title="Rejestracja zakończona"
                message="Twoje konto zostało pomyślnie utworzone! Potwierdź je teraz, klikając w link wysłany na adres email."
                icon={LocalPostOfficeOutlinedIcon}
            />
        </header>
    );
}

export default Header;
