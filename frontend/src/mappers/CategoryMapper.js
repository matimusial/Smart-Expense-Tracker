const categoryMap = new Map([
    ['elektronika', 'ELECTRONICS'],
    ['finanse i płatności', 'FINANCE_AND_PAYMENTS'],
    ['inwestycje i lokaty', 'INVESTMENTS_AND_SAVINGS'],
    ['kultura i edukacja', 'CULTURE_AND_EDUCATION'],
    ['moda i dodatki', 'FASHION_AND_ACCESSORIES'],
    ['nieruchomości', 'REAL_ESTATE'],
    ['opłaty domowe', 'HOME_BILLS'],
    ['pożyczki i kredyty', 'LOANS_AND_CREDITS'],
    ['prezenty i rodzina', 'GIFTS_AND_FAMILY'],
    ['przelewy i transakcje', 'TRANSFERS_AND_TRANSACTIONS'],
    ['rozrywka i wypoczynek', 'ENTERTAINMENT_AND_LEISURE'],
    ['transport', 'TRANSPORT'],
    ['usługi i serwis', 'SERVICES_AND_REPAIRS'],
    ['wynagrodzenia i przychody', 'SALARIES_AND_INCOME'],
    ['wyposażenie', 'EQUIPMENT'],
    ['zakupy codzienne', 'DAILY_SHOPPING'],
    ['zdrowie i uroda', 'HEALTH_AND_BEAUTY'],
    ['zwierzęta domowe', 'PETS'],
    ['inne', 'OTHERS']
]);


export const mapPolishToEnglish = (polskaNazwa) => {
    return categoryMap.get(polskaNazwa);
};

export const mapEnglishToPolish = (englishName) => {
    for (let [pol, eng] of categoryMap.entries()) {
        if (eng.toLowerCase() === englishName.toLowerCase()) {
            return pol;
        }
    }
};
