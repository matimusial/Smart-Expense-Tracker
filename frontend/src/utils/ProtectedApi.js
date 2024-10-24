let onUnauthorizedCallback = null;

export const setOnUnauthorized = (callback) => {
    onUnauthorizedCallback = callback;
};

export const onUnauthorized = () => {
    if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
    }
};

export const fetchWrapper = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
        });

        if (response.status === 401) {
            onUnauthorized();
            return null;
        }

        return response;
    } catch (error) {
        console.error('Error in fetchWrapper:', error);
        throw error;
    }
};



export const deleteAccount = async (password) => {
    const apiUrl = 'http://localhost:8080/spring-api/user/delete-account';
    try {
        const response = await fetchWrapper(apiUrl, {
            method: 'DELETE',
            credentials: 'include',
            body: JSON.stringify({ password }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response && response.ok) {
            return response.status === 204;
        }
        return false;
    } catch (error) {
        console.error('Error in deleteAccount:', error);
        throw error;
    }
};


export const getEvents = async (startDate, endDate) => {
    const apiUrl = `http://localhost:8080/spring-api/event/get-events?startDate=${startDate}&endDate=${endDate}`;

    try {
        const response = await fetchWrapper(apiUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok){
            return null;
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error in getEvents:', error);
        throw error;
    }
};


export const addEventUser = async (userData) => {
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
