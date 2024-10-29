import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export const calculateBalance = (events) => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    events.forEach(event => {
        if (event.type === "INCOME") {
            incomeTotal += event.amount;
        } else if (event.type === "EXPENSE") {
            expenseTotal += event.amount;
        }
    });
    return [incomeTotal, expenseTotal, incomeTotal - expenseTotal];
};