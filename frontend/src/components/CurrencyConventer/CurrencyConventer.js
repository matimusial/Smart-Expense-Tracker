import React, { useEffect, useState, useCallback } from "react";
import './CurrencyConventer.css';

const ConverterForm = ({ selectedCurrency }) => {
    const [amountPLN, setAmountPLN] = useState(100);
    const [fromCurrency] = useState("PLN");
    const [result, setResult] = useState("");

    const calculateExchangeRate = useCallback(() => {
        const rate = (selectedCurrency.rate * amountPLN).toFixed(3);
        setResult(`${amountPLN} ${fromCurrency} = ${rate} ${selectedCurrency.currencyCode}`);
    }, [amountPLN, selectedCurrency, fromCurrency]);

    useEffect(() => {
        calculateExchangeRate();
    }, [calculateExchangeRate]);

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value >= 0) {
            setAmountPLN(value);
        }
    };

    return (
        <form className="converter-form">
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

            <div className="form-group form-currency-group">
                <div className="form-section">
                    <label className="form-label">Waluta z</label>
                    <div className="currency-select">
                        <img src={require(`../../assets/flags/PLN.png`)}
                             alt={`PLN flag`}
                             className="flag-icon"/>
                        <p>PLN</p>
                    </div>
                </div>

                <div className="form-section">
                    <label className="form-label">Waluta do</label>
                    <div className="currency-select">
                        <img src={require(`../../assets/flags/${selectedCurrency.currencyCode}.png`)}
                             alt={`${selectedCurrency.currencyCode} flag`}
                             className="flag-icon"/>
                        <p>{selectedCurrency.currencyCode}</p>
                    </div>
                </div>
            </div>
            <p className="exchange-rate-result">
                {result}
            </p>
        </form>
    );
};

export default ConverterForm;
