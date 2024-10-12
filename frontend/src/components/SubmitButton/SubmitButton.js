import React from 'react';
import Ripples from 'react-ripples';
import './SubmitButton.css';

const SubmitButton = ({ label , onClick = null }) => {
    return (
        <Ripples color="rgba(0, 0, 0, 0.3)" className="ripple-wrapper-component">
            <button type="button" className="submit-button-component" onClick={onClick}>
                {label}
            </button>
        </Ripples>
    );
};

export default SubmitButton;
