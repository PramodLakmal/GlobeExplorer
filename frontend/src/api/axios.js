import axios from 'axios';

// Use environment variables with priority:
// 1. Runtime env from window.ENV_CONFIG (set by Docker entrypoint)
// 2. Build-time env from import.meta.env (set during build)
// 3. Fallback to localhost
const API_URL = 
  (window.ENV_CONFIG?.VITE_API_URL) || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000';

console.log('Using API URL:', API_URL);

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