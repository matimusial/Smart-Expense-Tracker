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
            if (onUnauthorized) {
                onUnauthorized();
            }
            return null;
        }

        return response;
    } catch (error) {
        console.error('Error in fetchWrapper:', error);
        throw error;
    }
};

