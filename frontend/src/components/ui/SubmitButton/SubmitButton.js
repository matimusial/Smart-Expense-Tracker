import React from 'react';
import Ripples from 'react-ripples';
import CircularProgress from '@mui/material/CircularProgress';
import './SubmitButton.css';

const SubmitButton = ({ label, type = "submit", onClick = null, isLoading = false, sx = {} }) => {
    return (
        <Ripples color="rgba(0, 0, 0, 0.3)" className="ripple-wrapper-component">
            <button
                type={type}
                className="submit-button-component"
                onClick={onClick}
                disabled={isLoading}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...sx
                }}
            >
                {isLoading ? (
                    <CircularProgress
                        size={24}
                        style={{ color: 'white', position: 'absolute' }}
                    />
                ) : (
                    label
                )}
            </button>
        </Ripples>
    );
};

export default SubmitButton;
