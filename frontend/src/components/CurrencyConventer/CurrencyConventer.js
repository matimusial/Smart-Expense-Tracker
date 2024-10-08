import React, { useState, useCallback } from "react";
import Ripples from 'react-ripples';
import './CurrencyConventer.css';

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
        <form className="converter-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Wpisz kwotę</label>
                <input
                    type="number"
                    className="form-input"
                    value={amountPLN}
                    onChange={handleAmountChange}
                    required
                    min="0"
                />
            </div>

            <div className="form-currency-group">
                <div className="currency-block">
                    <p className="currency-p">Waluta z</p>
                    <div className="currency-select">
                        <img src={require(`../../assets/flags/PLN.png`)}
                             alt={`PLN flag`}
                             className="flag-icon"/>
                        <p>PLN</p>
                    </div>
                </div>

                <div className="currency-block">
                    <p className="currency-p">Waluta do</p>
                    <div className="currency-select">
                        <img src={require(`../../assets/flags/${selectedCurrency.currencyCode}.png`)}
                             alt={`${selectedCurrency.currencyCode} flag`}
                             className="flag-icon"/>
                        <p>{selectedCurrency.currencyCode}</p>
                    </div>
                </div>
            </div>

            <Ripples color="rgba(0, 0, 0, 0.3)" className="ripple-wrapper">
                <button type="submit" className="submit-button">Oblicz</button>
            </Ripples>
            <p className={`exchange-rate-result ${showResult ? 'show' : ''}`}>
                {result}
            </p>
        </form>

    );
};

export default ConverterForm;
