import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds timeout to handle Render cold starts
});

// Request Interceptor: Attach Auth Token if exists in localStorage or passed via state
// Note: For Clerk, we usually get the token from the hook, so we'll provide a helper to set it.
api.interceptors.request.use(
    (config) => {
        // You can also get token from localStorage if you store it there
        // const token = localStorage.getItem('token');
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.response?.data?.message || 'An unexpected error occurred';

        // Handle specific status codes
        if (error.response?.status === 401) {
            console.warn('Unauthorized! Redirecting to login...');
            // Handle logout or redirect logic here
        } else if (error.response?.status === 403) {
            console.error('Forbidden! You do not have permission.');
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out. The server might be waking up from sleep (Render cold start).');
        }

        return Promise.reject({ ...error, message });
    }
);

/**
 * Helper to set Authorization header dynamically
 * Useful when getting token from useAuth() hook
 */
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

/**
 * Example GET request
 */
export const fetchProfile = () => api.get('/users/profile');

/**
 * Example POST request 
 */
export const postEventRegistration = (eventId, data) => api.post(`/registrations/${eventId}`, data);

export default api;
