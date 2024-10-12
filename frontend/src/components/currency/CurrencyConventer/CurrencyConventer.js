import React, { useState, useCallback } from "react";
import SubmitButton from "../../ui/SubmitButton/SubmitButton";
import './CurrencyConventer.css';
import InputLabel from '../../ui/InputLabel/InputLabel';

const ConverterForm = ({ selectedCurrency }) => {
    const [amountPLN, setAmountPLN] = useState(100);
    const [fromCurrency] = useState("PLN");
    const [result, setResult] = useState("");
    const [showResult, setShowResult] = useState(false);

    const calculateExchangeRate = useCallback(() => {
        const rate = (selectedCurrency.rate * amountPLN).toFixed(3);
        setResult(`${amountPLN} ${fromCurrency} = ${rate} ${selectedCurrency.currencyCode}`);
        setShowResult(true);
    }, [amountPLN, selectedCurrency, fromCurrency]);

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value >= 0) {
            setAmountPLN(value);
        }
    };

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
                value={amountPLN}
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
                        <img src={require(`../../../assets/flags/PLN.png`)}
                             alt={`PLN flag`}
                             className="flag-icon"/>
                        <p>PLN</p>
                    </div>
                </div>

                <div className="currency-block">
                    <p className="currency-p">Waluta do</p>
                    <div className="currency-select">
                        <img src={require(`../../../assets/flags/${selectedCurrency.currencyCode}.png`)}
                             alt={`${selectedCurrency.currencyCode} flag`}
                             className="flag-icon"/>
                        <p>{selectedCurrency.currencyCode}</p>
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
