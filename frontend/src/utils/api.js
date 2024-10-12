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
        return false;
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
        return false;
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
