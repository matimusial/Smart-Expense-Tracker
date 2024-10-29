import React, {useEffect, useState} from 'react';
import {ExtendedSingleEvent, SingleEvent} from './SingleEvent';
import {Box} from '@mui/material';

const colorPalette = [
    '#f7b3b3',
    '#eccb8e',
    '#faf2b1',
    '#c0e6c2',
    '#d2c5ff',
    '#b4f0ec',
    '#c0cffe',
    '#e6bbe8',
];

const HistoryContainer = ({ events }) => {
    const [assignedColors, setAssignedColors] = useState([]);
    const [isExtended, setIsExtended] = useState(false);
    const [eventToExtend, setEventToExtend] = useState(null);
    const [colorToExtend, setColorToExtend] = useState(null);

    useEffect(() => {
        let availableColors = [...colorPalette];
        const reversedEvents = events.slice().reverse();
        const newColors = reversedEvents.map(() => {
            if (availableColors.length === 0) {
                availableColors = [...colorPalette];
            }
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            return availableColors.splice(randomIndex, 1)[0];
        });
        setAssignedColors(newColors);
    }, [events]);

    const handleEventClick = ({ event, color }) => {
        setEventToExtend(event);
        setColorToExtend(color);
        setIsExtended(!isExtended);
    };

    const displayedEvents = isExtended ? events.slice().reverse() : events.slice(-6).reverse();

    return (
        <>
            {!isExtended ? (
                <Box>
                    {displayedEvents.map((event, index) => (
                        <SingleEvent
                            event={event}
                            key={index}
                            color={assignedColors[index]}
                            onEventClick={handleEventClick}
                        />
                    ))}
                </Box>
            ) : (
                <Box>
                    <ExtendedSingleEvent
                        event={eventToExtend}
                        color={colorToExtend}
                        onEventClick={handleEventClick}>
                    </ExtendedSingleEvent>
                </Box>
            )}
        </>
    );

};

export default HistoryContainer;
