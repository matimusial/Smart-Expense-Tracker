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

export const calculateExpensesByCategory = (events) => {
    const expensesByCategory = {};

    events.forEach(event => {
        if (event.type === "EXPENSE") {
            const category = event.category;
            const amount = event.amount;

            if (expensesByCategory[category]) {
                expensesByCategory[category] += amount;
            } else {
                expensesByCategory[category] = amount;
            }
        }
    });

    return expensesByCategory;
};


export const groupEventsByPeriod = (events, dateFrom, dateTo) => {
    dateFrom = dayjs(dateFrom);
    dateTo = dayjs(dateTo);
    const periodType = determinePeriodType(dateFrom, dateTo);
    const groupedData = {};

    events.forEach(event => {
        if (!event.date || !event.amount || !event.eventType) {
            return;
        }

        const eventDate = dayjs(event.date);

        if (!eventDate.isBetween(dateFrom, dateTo, null, '[]')) {
            return; // Pomijamy wydarzenia poza zakresem
        }

        let periodKey;
        if (periodType === 'month') {
            periodKey = eventDate.format('YYYY-MM'); // '2021-01'
        } else if (periodType === 'week') {
            periodKey = eventDate.isoWeekYear() + '-W' + String(eventDate.isoWeek()).padStart(2, '0'); // '2021-W01'
        } else if (periodType === 'day') {
            periodKey = eventDate.format('YYYY-MM-DD'); // '2021-01-01'
        }

        if (!groupedData[periodKey]) {
            groupedData[periodKey] = { income: 0, expense: 0 };
        }

        if (event.eventType.toUpperCase() === 'INCOME') {
            groupedData[periodKey].income += event.amount;
        } else if (event.eventType.toUpperCase() === 'EXPENSE') {
            groupedData[periodKey].expense += event.amount;
        }
    });

    return Object.keys(groupedData)
        .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
        .map(periodKey => {
            const data = groupedData[periodKey];
            let periodLabel;
            if (periodType === 'month') {
                periodLabel = dayjs(periodKey, 'YYYY-MM').format('MMM YYYY'); // 'Jan 2021'
            } else if (periodType === 'week') {
                const [year, week] = periodKey.split('-W');
                periodLabel = `Tydzień ${parseInt(week)} ${year}`; // 'Tydzień 1 2021'
            } else if (periodType === 'day') {
                periodLabel = dayjs(periodKey, 'YYYY-MM-DD').format('DD.MM.YYYY'); // '01.01.2021'
            }

            return {
                period: periodLabel,
                income: data.income,
                expense: data.expense
            };
        });
};

const determinePeriodType = (dateFrom, dateTo) => {
    const diffInDays = dateTo.diff(dateFrom, 'day') + 1;
    if (diffInDays <= 7) {
        return 'day';
    } else if (diffInDays <= 31) {
        return 'week';
    } else {
        return 'month';
    }
};


// <BarChart data={groupedData}>
//     <XAxis dataKey="period" />
//     <YAxis />
//     <Tooltip />
//     <Legend />
//     <Bar dataKey="income" fill="#82ca9d" />
//     <Bar dataKey="expense" fill="#8884d8" />
// </BarChart>