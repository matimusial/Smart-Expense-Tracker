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
    console.log(url);
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
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/user/delete-account`;
    try {
        const response = await fetchWrapper(apiUrl, {
            method: 'DELETE',
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
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/event/get-events?startDate=${startDate}&endDate=${endDate}`;

    try {
        const response = await fetchWrapper(apiUrl, {
            method: 'GET',
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
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/event/add-event`;
    try {
        const response = await fetchWrapper(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        return response.ok;

    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};


export const addDemoEvents = async () => {
    const apiUrl = `${process.env.REACT_APP_SPRING_BASE_URL}/event/load-demo`;

    try {
        const response = await fetchWrapper(apiUrl, {
            method: 'POST',
        })

        return !response.ok;
    }
    catch (error){
        console.error('Error loading demo data: ', error);
        throw error;
    }
}