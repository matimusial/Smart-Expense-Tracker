import React, {useEffect, useState} from 'react';
import {Legend, Pie, PieChart, ResponsiveContainer, Sector} from 'recharts';

const colorPalette = [
    "#bd4a4a", "#c59347", "#ddc72e", "#4dd151", "#9966FF",
    "#29dcd0", "#dc4646", "#2e54c6", "#9328c5", "#0088FE"
];

const prepareDataForPieChart = (events) => {
    const expensesByCategory = {};

    events.forEach(event => {
        if (event.type === "Wydatek") {
            const category = event.category;
            const amount = event.amount;

            if (expensesByCategory[category]) {
                expensesByCategory[category] += amount;
            } else {
                expensesByCategory[category] = amount;
            }
        }
    });

    return Object.keys(expensesByCategory).map((category, index) => ({
        name: category,
        value: expensesByCategory[category],
        fill: colorPalette[index % colorPalette.length]
    }));
};



const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={15}>
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} fontSize={13} textAnchor={textAnchor} fill="#333">{`${value.toFixed(2)} zł`}</text>
        </g>
    );
};

const ExpensePieChart = ({ events }) => {
    const [data, setData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const dataForChart = prepareDataForPieChart(events);
        setData(dataForChart);
    }, [events]);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <ResponsiveContainer width="100%" height={335}>
            <PieChart>
                <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={110}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                />
                <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{
                        paddingLeft: 20,
                        lineHeight: '125%'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpensePieChart;
