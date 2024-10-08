import React, { useState, useEffect } from 'react';
import CurrencyList from '../../components/CurrencyList/CurrencyList';
import Header from '../../components/Header/Header';
import ConverterForm from '../../components/CurrencyConventer/CurrencyConventer';
import './Home.css';

const Home = () => {
    const [currencyRates, setCurrencyRates] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = 'http://localhost:8080/springapi/currency-rates';

    useEffect(() => {

        fetch(apiUrl)
            .then(response => {
                return response.json();
            })
            .then(data => {
                const processedRates = processRates(data);
                setCurrencyRates(processedRates);

                const eurCurrency = processedRates.find(rate =>
                    rate.currencyCode === 'EUR');

                if (eurCurrency) {
                    setSelectedCurrency(eurCurrency);
                }

                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }, []);


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

    if (isLoading) {
        return;
    }

    return (
        <div>
            <Header/>
            <div className="container">
                <div className="currency-list-container">
                    <CurrencyList
                        currencyRates={currencyRates}
                        onSelectCurrency={setSelectedCurrency}
                        selectedCurrency={selectedCurrency}
                    />
                </div>
                <div className="currency-calculator-container">
                    <ConverterForm selectedCurrency={selectedCurrency}/>
                </div>
            </div>
        </div>
    );
}

export default Home;
