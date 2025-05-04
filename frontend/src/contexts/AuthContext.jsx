import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Use environment variables with priority:
// 1. Runtime env from window.ENV_CONFIG (set by Docker entrypoint)
// 2. Build-time env from import.meta.env (set during build)
// 3. Fallback to localhost
const API_URL = 
  (window.ENV_CONFIG?.VITE_API_URL) || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000';

// Log the API URL for debugging
console.log('AuthContext using API URL:', API_URL);

// Create a singleton axios instance to be used throughout the app
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set the authorization header for all requests when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data from the server with the stored token
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting to load user with token, API URL:', API_URL);
        const { data } = await api.get('/auth/me');
        console.log('User data loaded:', data);
        setUser(data.user);
      } catch (err) {
        console.error('Error loading user data:', err);
        // Clear token if it's invalid or expired
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError('Authentication expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (name, email, password) => {
    try {
      console.log('Attempting to register user to API:', API_URL);
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      // Store token and user data immediately
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting to login to API:', API_URL);
      const { data } = await api.post('/auth/login', {
        email,
        password,
      });

      console.log('Login response:', data);
      
      // Store token and user data immediately
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const addFavorite = async (countryCode) => {
    try {
      console.log(`Attempting to add favorite ${countryCode} to API:`, API_URL);
      const { data } = await api.post('/users/favorites', { countryCode });

      setUser({
        ...user,
        favoriteCountries: data.favoriteCountries,
      });

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Add favorite error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to add to favorites',
      };
    }
  };

  const removeFavorite = async (countryCode) => {
    try {
      console.log(`Attempting to remove favorite ${countryCode} from API:`, API_URL);
      const { data } = await api.delete(`/users/favorites/${countryCode}`);

      setUser({
        ...user,
        favoriteCountries: data.favoriteCountries,
      });

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Remove favorite error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to remove from favorites',
      };
    }
  };

  // Add a method to check if user is logged in
  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    addFavorite,
    removeFavorite,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}