import React from 'react';
import CurrencyTile from '../CurrencyTile/CurrencyTile';
import './CurrencyList.css';

const CurrencyList = ({ currencyRates, onSelectCurrency, selectedCurrency }) => {
    return (
        <div className="currency-list">
            {currencyRates.map((rate) => (
                <div
                    key={rate.currencyCode}
                    onClick={() => onSelectCurrency(rate)}
                    className="currency-item"
                >
                    <CurrencyTile rate={rate} selectedCurrency={selectedCurrency} />
                </div>
            ))}
        </div>
    );
};

export default CurrencyList;
