export const checkEmailAvailability = async (email) => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/check-email`;


    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.status === 200) {
            return true;
        } else if (response.status === 409) {
            return false;
        } else {
            console.error('Unexpected response status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error occurred while checking email availability:', error);
        throw error;
    }
};

export const checkUsernameAvailability = async (username) => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/check-username`;


    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        if (response.status === 200) {
            return true;
        } else if (response.status === 409) {
            return false;
        } else {
            console.error('Unexpected response status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error occurred while checking username availability:', error);
        throw error;
    }
};

export const fetchCurrencyRates = async () => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/currency-rates`;


    try {
        const response = await fetch(apiUrl);
        return await response.json();
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        throw error;
    }
};

export const registerUser = async (userData) => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/registration`;


    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            let errorMessage = 'Registration failed';
            if (response.status === 400) {
                errorMessage = 'Invalid input data.';
            } else if (response.status === 409) {
                errorMessage = 'Username or email already exists.';
            } else if (response.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }
            console.error(errorMessage);
        }
        else {
            console.log("registered User");
        }



    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const authorizeRegistration = async (pincode) => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/authorize-registration/`;


    try {
        if (!pincode) {
            return [false, 'Brak kodu PIN w adresie URL.'];
        }

        const response = await fetch(`${apiUrl}${pincode}`, {
            method: 'GET',
        });
        const data = await response.text();

        if (response.ok) {
            return [true, data];
        } else {
            return [false, data];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return [false, 'Wystąpił błąd podczas autoryzacji rejestracji.'];
    }
};

export const loginUser = async (username, password) => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/login`;


    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({username, password}),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            return data.message;
        }
        else {
            return true;
        }

    } catch (error) {
        console.error(`Error logging user`, error);
        throw error;
    }
}

export const logoutUser = async () => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/logout`;


    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            return true;
        } else {
            console.error('Unexpected logout response status:', response.status);
        }
    } catch (error) {
        console.error(`Logout error`, error);
        throw error;
    }
}

export const SendPasswordEmail = async (email) => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/forgot-password`;


    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email})
        });

        const data = await response.text();

        if (!response.ok){
            return [false, data];
        }
        else {
            return [true, data];
        }
    }
    catch (error) {
        console.error('Error sending password email:', error);
        throw error;
    }
}


export const verifyReset = async (pincode, email) => {
    if (!pincode || !email) {
        return [false, "Błędny adres URL."];
    }
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/verify-reset/${pincode}/${email}`;


    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });

        const data = await response.text();

        if (!response.ok) {

            return [false, data];
        } else {
            return [true, data];
        }
    }
    catch (error) {
        console.error('Error veryfying reset password link:', error);
        throw error;
    }
}


export const changePassword = async (password, conPassword) => {
    const params = new URLSearchParams(window.location.search);
    const pincode = params.get('pincode');
    const email = params.get('email');
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/reset-password/${pincode}/${email}`;


    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                conPassword: conPassword
            })
        });

        const data = await response.text();

        if (!response.ok) {
            return [false, data];
        } else {
            return [true, data];
        }
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

export const getCurrentUser = async () => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/me`;


    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.text();
            if (data !== 'anonymousUser') {
                return data;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const getCategory = async (title, k) => {
    const apiUrl = `${process.env.REACT_APP_FAST_API_BASE_URL}/get-category`;


    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({title, k}),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error('Error getting category:', error);
        throw error;
    }
}

export const uploadAndProcessImage = async (imageFile) => {
    const apiUrl = `${process.env.REACT_APP_FAST_API_BASE_URL}/trim-receipt`;


    const formData = new FormData();
    formData.append('file', imageFile);
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            return null;
        }

        return await response.blob();

    } catch (error) {
        console.error('Error uploading and processing the image:', error);
        throw error;
    }
}
