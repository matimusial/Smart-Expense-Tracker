import React from 'react';
import Ripples from 'react-ripples';
import CircularProgress from '@mui/material/CircularProgress';
import './SubmitButton.css';

const SubmitButton = ({ label, onClick = null, isLoading = false }) => {
    return (
        <Ripples color="rgba(0, 0, 0, 0.3)" className="ripple-wrapper-component">
            <button
                type="button"
                className="submit-button-component"
                onClick={onClick}
                disabled={isLoading}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
