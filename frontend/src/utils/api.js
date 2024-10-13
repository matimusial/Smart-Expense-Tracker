export const checkEmailAvailability = async (email) => {
    const apiUrl = 'http://localhost:8080/spring-api/user/check-email';
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
    const apiUrl = 'http://localhost:8080/spring-api/user/check-username';
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
    const apiUrl = 'http://localhost:8080/spring-api/currency-rates';
    try {
        const response = await fetch(apiUrl);
        return await response.json();
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        throw error;
    }
};

export const registerUser = async (userData) => {
    const apiUrl = 'http://localhost:8080/spring-api/user/registration';
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
    try {
        if (!pincode) {
            return [false, 'Brak kodu PIN w adresie URL.'];
        }

        const response = await fetch(`http://localhost:8080/spring-api/user/authorize-registration/${pincode}`, {
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
