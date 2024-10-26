import React from 'react';
import TextField from '@mui/material/TextField';

const InputLabel = ({
                        label,
                        value,
                        onChange,
                        error,
                        helperText,
                        onBlur = null,
                        endAdornment = null,
                        fullWidth = true,
                        variant = "outlined",
                        margin = "normal",
                        required = true,
                        type = "text",
                        inputProps = {},
                    }) => {
    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            onBlur={onBlur}
            tabIndex={0}
            InputLabelProps={{
                style: { color: error ? 'red' : '#333' },
            }}
            InputProps={{
                endAdornment: endAdornment,
                sx: {
                    borderRadius: '8px',
                    backgroundColor: error ? '#fff4f4' : '#f5f5f5',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '1px',
                        borderColor: 'inherit',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                        borderColor: 'inherit',
                    },
                },
            }}
            inputProps={inputProps}
            fullWidth={fullWidth}
            variant={variant}
            margin={margin}
            required={required}
            type={type}
        />
    );
};

export default InputLabel;
