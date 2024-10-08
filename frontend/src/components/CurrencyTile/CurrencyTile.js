import React from 'react';
import './CurrencyTile.css';

const CurrencyTile = ({ rate, selectedCurrency }) => {
    const change = ((rate.rate - rate.prevRate) / rate.prevRate) * 100;
    const hasIncreased = change > 0;

    return (
        <div className={`currency-tile ${selectedCurrency?.currencyCode === rate.currencyCode ? 'selected' : ''}`}>
            <img
                src={require(`../../assets/flags/${rate.currencyCode}.png`)}
                alt={`${rate.currencyCode} flag`}
                className="flag-icon"
            />
            <div className="currency-code">{rate.currencyCode}</div>
            <div className="currency-rate">
                {rate.rate}
                {change !== 0 ?
                <span className={`rate-change ${hasIncreased ? 'up' : 'down'}`}>
                    {hasIncreased ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </span>
                    : null}
            </div>
        </div>
    );
};

export default CurrencyTile;
