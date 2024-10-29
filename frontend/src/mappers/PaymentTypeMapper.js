export const paymentTypeMap = new Map([
    ['CARD', 'Karta'],
    ['CASH', 'Gotówka'],
    ['BLIK', 'Blik'],
    ['OTHER', 'Inne'],
]);

export const mapEnglishToPolishPaymentType = (englishName) => {
    return paymentTypeMap.get(englishName) || englishName;
};

export const mapPolishToEnglishPaymentType = (polishName) => {
    for (let [english, polish] of paymentTypeMap.entries()) {
        if (polish.toLowerCase() === polishName.toLowerCase()) {
            return english;
        }
    }
    return polishName;
};
