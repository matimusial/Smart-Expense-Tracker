import React, {useState, useCallback, useEffect} from "react";
import SubmitButton from "../../ui/SubmitButton/SubmitButton";
import './CurrencyConventer.css';
import InputLabel from '../../ui/InputLabel/InputLabel';
import {IconButton} from "@mui/material";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
const ConverterForm = ({ selectedCurrency }) => {
    const [amount, setAmount] = useState(100);
    const [fromCurrencyCode, setFromCurrencyCode] = useState("PLN");
    const [toCurrencyCode, setToCurrencyCode] = useState(selectedCurrency.currencyCode);
    const [result, setResult] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false);

    const calculateExchangeRate = useCallback(() => {
        const rate = (isSwapped ? amount * selectedCurrency.rate : amount / selectedCurrency.rate).toFixed(2);
        setResult(`${amount} ${fromCurrencyCode} = ${rate} ${toCurrencyCode}`);
        setShowResult(true);
    }, [isSwapped, amount, selectedCurrency, fromCurrencyCode, toCurrencyCode]);

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value >= 0) {
            setAmount(value);
        }
    };
    
    const swapCurrencies = () => {
        setIsSwapped(!isSwapped);
        setFromCurrencyCode((prevFromCurrencyCode) => {
            setToCurrencyCode(prevFromCurrencyCode);
            return toCurrencyCode;
        });
    }
    
    useEffect(() => {
        setShowResult(false);
        setToCurrencyCode(selectedCurrency.currencyCode);
        setFromCurrencyCode("PLN");
        setResult("");
        setAmount(100);
    }, [selectedCurrency])

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowResult(false);
        setTimeout(() => {
            calculateExchangeRate();
        }, 250);
    };

    return (
        <form className="converter-form">
            <div className="form-group">

                <InputLabel
                label="Wpisz kwotę"
                value={amount}
                onChange={handleAmountChange}
                type="number"
                min="0"
                required={false}
                >
                </InputLabel>

            </div>

            <div className="form-currency-group">
                <div className="currency-block">
                    <p className="currency-p">Waluta z</p>
                    <div className="currency-select">
                        <img src={require(`../../../assets/flags/${fromCurrencyCode}.png`)}
                             alt={`${fromCurrencyCode} flag`}
                             className="flag-icon"/>
                        <p>{fromCurrencyCode}</p>
                    </div>
                </div>

                <IconButton
                    size="small"
                    onClick={swapCurrencies}
                    disableRipple
                    sx={{
                        alignItems: 'flex-end',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: 'transparent',
                        },
                        '&:focus': {
                            backgroundColor: 'transparent',
                        },
                        '&:active': {
                            transform: 'scale(1.5)',
                        },
                    }}
                >
                    <SwapHorizIcon fontSize="large"/>
                </IconButton>

                <div className="currency-block">
                    <p className="currency-p">Waluta do</p>
                    <div className="currency-select">
                        <img src={require(`../../../assets/flags/${toCurrencyCode}.png`)}
                             alt={`${toCurrencyCode} flag`}
                             className="flag-icon"/>
                        <p>{toCurrencyCode}</p>
                    </div>
                </div>
            </div>
            <SubmitButton label="Oblicz" onClick={handleSubmit}></SubmitButton>

            <p className={`exchange-rate-result ${showResult ? 'show' : ''}`}>
                {result}
            </p>
        </form>
    );
};

export default ConverterForm;
