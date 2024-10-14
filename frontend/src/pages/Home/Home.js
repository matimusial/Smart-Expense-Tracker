import React, { useState, useEffect, useContext, useRef } from 'react';
import CurrencyList from '../../components/currency/CurrencyList/CurrencyList';
import Header from '../../components/layout/Header/Header';
import ConverterForm from '../../components/currency/CurrencyConventer/CurrencyConventer';
import './Home.css';
import { authorizeRegistration, fetchCurrencyRates } from "../../utils/PublicApi";
import { DialogContext } from "../../contexts/DialogContext";
import InformationDialog from "../../components/dialogs/InformationDialog/InformationDialog";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [currencyRates, setCurrencyRates] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [authorizationMessage, setAuthorizationMessage] = useState('');
    const [authorizationIcon, setAuthorizationIcon] = useState(null);
    const [authorizationStyle, setAuthorizationStyle] = useState(null);
    const authorizationPerformed = useRef(false);

    const navigate = useNavigate();

    const { isAccountConfirmationDialogOpen, openAccountConfirmationDialog, closeDialogs } = useContext(DialogContext);

    useEffect(() => {
        const performAuthorization = async () => {
            if (authorizationPerformed.current) return;
            if (window.location.pathname.includes('/user/registration/authorize-registration')) {
                authorizationPerformed.current = true;
                const params = new URLSearchParams(window.location.search);
                const pincode = params.get('pincode');
                const [isAuthorized, message] = await authorizeRegistration(pincode);
                setAuthorizationMessage(message);
                setAuthorizationIcon(isAuthorized ? CheckCircleOutlineOutlinedIcon : CancelOutlinedIcon);
                setAuthorizationStyle(isAuthorized ? { color: 'green' } : { color: 'red' });
                openAccountConfirmationDialog();
                window.history.replaceState({}, document.title, '/');
            }
        };

        performAuthorization();

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
    }, [openAccountConfirmationDialog]);

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
                message={authorizationMessage}
                icon={authorizationIcon}
                iconStyle={authorizationStyle}
            />
        </div>
    );
};

export default Home;
