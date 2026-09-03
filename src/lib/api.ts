import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        let url = import.meta.env.VITE_API_URL;
        if (!url.endsWith('/api') && !url.includes('/api/')) {
            url = url.endsWith('/') ? `${url}api` : `${url}/api`;
        }
        return url;
    }
    
    // In browser production environment (not localhost), default to relative '/api'
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api';
    }

    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
