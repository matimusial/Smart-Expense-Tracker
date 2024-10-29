export const eventTypeMap = new Map([
    ['INCOME', 'Wpływ'],
    ['EXPENSE', 'Wydatek'],
]);

export const mapEnglishToPolishEventType = (englishName) => {
    return eventTypeMap.get(englishName) || englishName;
};
