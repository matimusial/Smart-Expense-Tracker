import React from 'react';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

const DatePicker = ({
                              label,
                              value,
                              onChange,
                              disableFuture = false,
                              minDate,
                              maxDate,
                              disabled = false,
                              fullWidth = true,
                              width = '100%',
                          }) => {
    return (
        <DesktopDatePicker
            label={label}
            value={value}
            onChange={onChange}
            disableFuture={disableFuture}
            minDate={minDate}
            maxDate={maxDate}
            fullWidth={fullWidth}
            disabled={disabled}
            slotProps={{
                textField: {
                    sx: {
                        width: width,
                        borderRadius: '8px',
                        backgroundColor: "#f5f5f5",
                        borderColor: '#333',
                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                            borderColor: '#333',
                        },
                        '& .Mui-focused': {
                            color: '#333',
                        },
                    },
                },
            }}
        />
    );
};

export default DatePicker;
