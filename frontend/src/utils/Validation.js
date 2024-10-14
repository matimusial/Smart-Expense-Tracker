export const validateFirstName = (name) => {
    if (name.trim() === '') {
        return true;
    }
    const regex = /^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]+$/;
    return regex.test(name);
};

export const validateUsername = (username) => {
    if (username.trim() === '') {
        return true;
    }
    if (username.trim().toLowerCase() === 'anonymoususer') {
        return false;
    }
    const usernameRegex = /^(?=[a-zA-Z0-9])(?!.*[_.-]{2})(?!.*[_.-]{2})(?!.*[_.-]$)[a-zA-Z0-9._-]{3,20}$/;
    return usernameRegex.test(username);
};

export const validatePasswordLength = (password) => {
    return password.length >= 8;
};

export const validatePasswordSign = (password) => {
    const regex = /[0-9!@#$%^&*]/;
    return regex.test(password);
};

export const validatePasswordMatch = (password, confirmPassword) => {
    if (password === '' && confirmPassword === '') {
        return false;
    }
    return password === confirmPassword;
};

export const validateEmail = (email) => {
    if (email.trim() === '') {
        return true;
    }
    const emailRegex = /^[^\s@,]+(?:\.[^\s@.,]+)*@[^\s@,]+(?:\.[^\s@,]+)+$/;
    return emailRegex.test(email) && (email.endsWith('.com') || email.endsWith('.pl'));
};
