import axios from 'axios';

// Use environment variable with fallback, prioritizing runtime config
const getApiUrl = () => {
  // First check if window.ENV_CONFIG exists (set by Docker)
  if (window.ENV_CONFIG && window.ENV_CONFIG.VITE_API_URL) {
    return window.ENV_CONFIG.VITE_API_URL;
  }
  // Then check Vite environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();
console.log('API URL:', API_URL); // Debugging help

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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