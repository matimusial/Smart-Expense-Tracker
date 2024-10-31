import React, { useEffect } from 'react';
import WideExtendedSingleEvent from './WideExtendedSingleEvent';
import { Box } from '@mui/material';

const WideExtendedHistoryContainer = ({ events }) => {

    useEffect(() => {
    }, [events]);

    return (
        <Box
        sx={{
            overflowY:'auto',
            height: '622px',
            paddingRight: '10px',
        }}>
            {events.map((event, index) => (
                <WideExtendedSingleEvent
                    event={event}
                    key={index}
                />
            ))}
        </Box>
    );
};

export default WideExtendedHistoryContainer;
