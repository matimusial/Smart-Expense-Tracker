import React from 'react';
import TextField from '@mui/material/TextField';

const InputLabel = ({
                             label,
                             value,
                             onChange,
                             error,
                             helperText,
                             onBlur=null,
                             endAdornment=null,
                             fullWidth = true,
                             variant = "outlined",
                             margin = "normal",
                             required = true,
                             type = "text",
                             min=null
                         }) => {
    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            onBlur={onBlur}
            InputLabelProps={{
                style: { color: error ? 'red' : '#333' },
            }}
            InputProps={{
                endAdornment: endAdornment,
                sx: {
                    borderRadius: '8px',
                    backgroundColor: error ? '#fff4f4' : '#f5f5f5',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '1px', // Pogrubienie obramowania podczas hovera
                        borderColor: 'inherit', // Dziedziczenie koloru
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px', // Pogrubienie obramowania przy focusie
                        borderColor: 'inherit', // Dziedziczenie koloru przy focusie
                    },
                },
            }}
            fullWidth={fullWidth}
            variant={variant}
            margin={margin}
            required={required}
            type={type}
            min={min}
        />
    );
};

export default InputLabel;
