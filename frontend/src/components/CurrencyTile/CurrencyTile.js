import React from 'react';
import './CurrencyTile.css';

const CurrencyTile = ({ rate, selectedCurrency }) => {
    return (
        <div className={`currency-tile ${selectedCurrency?.currencyCode === rate.currencyCode ? 'selected' : ''}`} >
            <img src={require(`../../assets/flags/${rate.currencyCode}.png`)} alt={`${rate.currencyCode} flag`}
                 className="flag-icon" />

            <div className="currency-code">{rate.currencyCode}</div>
            <div className="currency-rate">{rate.rate}</div>
        </div>
    );
};

export default CurrencyTile;
