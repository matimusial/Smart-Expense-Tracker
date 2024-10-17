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


