import React from 'react';
import './Avatar.css';

function Avatar({ userName }) {
    const initial = userName.charAt(0).toUpperCase();

    return (
        <div className="avatar-circle">
            <span className="avatar-initial">{initial}</span>
        </div>
    );
}

export default Avatar;
