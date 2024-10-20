import React, { useState, useEffect, useContext, useRef } from 'react';
import CurrencyList from '../../components/currency/CurrencyList/CurrencyList';
import Header from '../../components/layout/Header/Header';
import ConverterForm from '../../components/currency/CurrencyConventer/CurrencyConventer';
import './Home.css';
import {authorizeRegistration, fetchCurrencyRates, verifyReset} from "../../utils/PublicApi";
import { AccountDialogContext } from "../../contexts/AccountDialogContext";
import InformationDialog from "../../components/dialogs/InformationDialog/InformationDialog";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useNavigate } from 'react-router-dom';
import ResetPasswordDialog from "../../components/dialogs/AccountDialogs/ResetPasswordDialog/ResetPasswordDialog";

const Home = () => {
    const [currencyRates, setCurrencyRates] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);

    const [popupMessage, setPopupMessage] = useState('');
    const [popupIcon, setPopupIcon] = useState(null);
    const [popupStyle, setPopupStyle] = useState(null);
    const authorizationPerformed = useRef(false);
    const handledResetCredentials = useRef(false);
    const [isLoading, setIsLoading] = useState(true);


    const navigate = useNavigate();

    const { isAccountConfirmationDialogOpen, openAccountConfirmationDialog, closeDialogs, openResetPasswordDialog,
    isResetPasswordDialogOpen, isResetPasswordSuccessDialogOpen, isResetPasswordErrorDialogOpen} = useContext(AccountDialogContext);

    const clearStyles = () => {
        setPopupMessage("");
        setPopupStyle(null);
        setPopupIcon(null);
    }


    useEffect(() => {
        const performAuthorization = async () => {
            if (authorizationPerformed.current) return;
            clearStyles();
            if (window.location.pathname.includes('/user/registration/authorize-registration')) {
                authorizationPerformed.current = true;
                const params = new URLSearchParams(window.location.search);
                const pincode = params.get('pincode');
                const [isAuthorized, message] = await authorizeRegistration(pincode);
                setPopupMessage(message);
                setPopupIcon(isAuthorized ? CheckCircleOutlineOutlinedIcon : CancelOutlinedIcon);
                setPopupStyle(isAuthorized ? { color: 'green' } : { color: 'red' });
                openAccountConfirmationDialog();
                window.history.replaceState({}, document.title, '/');
            }
        };

        performAuthorization();

        const handleResetCredentials = async () => {
            if (handledResetCredentials.current) return;
            clearStyles();
            if (window.location.pathname.includes('/user/login/reset-password')) {
                authorizationPerformed.current = true;
                const params = new URLSearchParams(window.location.search);
                const pincode = params.get('pincode');
                const email = params.get('email');
                const [isAuthorized, message] = await verifyReset(pincode, email);
                if (isAuthorized) {
                    openResetPasswordDialog();
                }
                else{
                    setPopupMessage(message);
                    setPopupIcon(CancelOutlinedIcon);
                    setPopupStyle({ color: 'red' });
                    openAccountConfirmationDialog();
                }
            }
        };

        handleResetCredentials();

        const getCurrencyRates = async () => {
            try {
                const data = await fetchCurrencyRates();
                const processedRates = processRates(data);
                setCurrencyRates(processedRates);

                const eurCurrency = processedRates.find(rate =>
                    rate.currencyCode === 'EUR');

                if (eurCurrency) {
                    setSelectedCurrency(eurCurrency);
                }
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch currency rates:', err);
                setIsLoading(false);
            }
        };

        getCurrencyRates();
    }, [openAccountConfirmationDialog, openResetPasswordDialog]);

    const processRates = (data) => {
        const rateList = data.currentRateList;
        const prevRateList = data.prevRateList;

        return Object.entries(rateList)
            .filter(([key]) => key !== 'id' && key !== 'insertDate')
            .map(([currencyCode, rate]) => {
                const prevRate = prevRateList[currencyCode];

                return {
                    currencyCode: currencyCode.toUpperCase(),
                    rate: parseFloat(rate).toFixed(3),
                    prevRate: parseFloat(prevRate).toFixed(3)
                };
            });
    };

    const closeAuthorizationDialog = () => {
        closeDialogs();
        navigate('/');
    };

    if (isLoading) {
        return null;
    }

    return (
        <div>
            <Header />
            <div className="container">
                <div className="currency-list-container">
                    <CurrencyList
                        currencyRates={currencyRates}
                        onSelectCurrency={setSelectedCurrency}
                        selectedCurrency={selectedCurrency}
                    />
                </div>
                <div className="currency-calculator-container">
                    <ConverterForm selectedCurrency={selectedCurrency} />
                </div>
            </div>

            <InformationDialog
                open={isAccountConfirmationDialogOpen}
                onClose={closeAuthorizationDialog}
                title=""
                message={popupMessage}
                icon={popupIcon}
                iconStyle={popupStyle}
            />

            <ResetPasswordDialog
                open={isResetPasswordDialogOpen}
                onClose={closeDialogs}
            />


            <InformationDialog
                open={isResetPasswordErrorDialogOpen}
                onClose={closeDialogs}
                title=""
                message={popupMessage}
                icon={popupIcon}
                iconStyle={popupStyle}
            />

            <InformationDialog
                open={isResetPasswordSuccessDialogOpen}
                onClose={closeDialogs}
                title="Hasło zostało pomyślnie zmienione!"
                message="Możesz teraz się zalogować do serwisu."
                icon={CheckCircleOutlineOutlinedIcon}
                iconStyle={{color: 'green'}}
            />
        </div>
    );
};

export default Home;
