import React, {useEffect, useState} from 'react';
import {Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';

const prepareDataForBarChart = (events, dateFrom, dateTo) => {
    const dataByPeriod = {};
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);


    const timeDiff = toDate - fromDate;
    const dayDiff = timeDiff / (1000 * 3600 * 24);


    const groupByWeek = dayDiff <= 31;

    const isFullMonth = (start, end) => {
        const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        return start.getTime() === startOfMonth.getTime() && end.getTime() === endOfMonth.getTime();
    };


    const generateWeeklyPeriods = (startDate, endDate) => {
        const periods = [];
        let currentStart = new Date(startDate);

        const dayOfWeek = currentStart.getDay();
        const diffToMonday = (dayOfWeek + 6) % 7;
        currentStart.setDate(currentStart.getDate() - diffToMonday);

        while (currentStart <= endDate) {
            let currentEnd = new Date(currentStart);
            currentEnd.setDate(currentEnd.getDate() + 6);

            if (currentEnd > endDate) {
                currentEnd = new Date(endDate);
            }

            periods.push({ start: new Date(currentStart), end: new Date(currentEnd) });

            currentStart.setDate(currentStart.getDate() + 7);
        }

        return periods;
    };

    const generateMonthlyPeriods = (startDate, endDate) => {
        const periods = [];
        let currentStart = new Date(startDate);

        while (currentStart <= endDate) {
            let currentEnd;
            new Date(currentStart.getFullYear(), currentStart.getMonth(), 1);
            const endOfMonth = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 0);

            if (currentStart.getDate() === 1 && endOfMonth <= endDate) {

                currentEnd = new Date(endOfMonth);
            } else {

                currentEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 0);
                if (currentEnd > endDate) {
                    currentEnd = new Date(endDate);
                }
            }

            periods.push({ start: new Date(currentStart), end: new Date(currentEnd) });

            currentStart = new Date(currentEnd);
            currentStart.setDate(currentStart.getDate() + 1);
        }

        return periods;
    };

    const periods = groupByWeek
        ? generateWeeklyPeriods(fromDate, toDate)
        : generateMonthlyPeriods(fromDate, toDate);


    periods.forEach(period => {
        let periodKey;

        if (!groupByWeek && isFullMonth(period.start, period.end)) {

            periodKey = period.start.toLocaleString('pl-PL', { month: 'long', year: 'numeric' });
        } else if (period.start.getTime() === period.end.getTime()) {

            periodKey = `${period.start.getDate()}.${(period.start.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {

            const startDateStr = `${period.start.getDate()}.${(period.start.getMonth() + 1).toString().padStart(2, '0')}`;
            const endDateStr = `${period.end.getDate()}.${(period.end.getMonth() + 1).toString().padStart(2, '0')}`;
            periodKey = `${startDateStr}-${endDateStr}`;
        }

        dataByPeriod[periodKey] = { name: periodKey, Przychód: 0, Wydatek: 0, start: period.start, end: period.end };
    });

    events.forEach(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate >= fromDate && eventDate <= toDate) {
            for (let key in dataByPeriod) {
                const period = dataByPeriod[key];
                if (eventDate >= period.start && eventDate <= period.end) {
                    if (event.type === 'INCOME') {
                        period.Przychód += event.amount;
                    } else if (event.type === 'EXPENSE') {
                        period.Wydatek += event.amount;
                    }
                    break;
                }
            }
        }
    });

    const sortedData = Object.values(dataByPeriod).sort((a, b) => a.start - b.start);

    sortedData.forEach(period => {
        delete period.start;
        delete period.end;
    });

    return sortedData;
};






const ExpenseIncomeBarChart = ({ events, dateFrom, dateTo }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const dataForChart = prepareDataForBarChart(events, dateFrom, dateTo);
        setData(dataForChart);
    }, [events, dateFrom, dateTo]);

    return (
        <ResponsiveContainer width="100%" height={275}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                }}
                barCategoryGap="20%"
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} zł`} />
                <Legend />
                <Bar
                    dataKey="Wydatek"
                    fill="#bd4a4a"
                    activeBar={<Rectangle fill="pink" stroke="blue" />}
                />
                <Bar
                    dataKey="Przychód"
                    fill="#4dd151"
                    activeBar={<Rectangle fill="gold" stroke="purple" />}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ExpenseIncomeBarChart;
