import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables with fallback
const API_URL = 
  (window.ENV_CONFIG?.VITE_API_URL) || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000';

console.log('FavoritesPage using API URL:', API_URL);

const FavoritesPage = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching favorites with API URL:', API_URL);
        const response = await axios.get(`${API_URL}/api/users/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Log the actual response to see what the API is returning
        console.log('Favorites API response:', response.data);
        
        // Handle different response structures
        let favoritesArray = [];
        if (response.data.favorites) {
          favoritesArray = response.data.favorites;
        } else if (response.data.favoriteCountries) {
          favoritesArray = response.data.favoriteCountries;
        } else if (Array.isArray(response.data)) {
          favoritesArray = response.data;
        }
        
        // Ensure we're always working with an array of country codes
        favoritesArray = favoritesArray.map(fav => 
          typeof fav === 'string' ? fav : fav.countryCode || fav.code || fav
        );
        
        console.log('Processed favorites array:', favoritesArray);
        setFavorites(favoritesArray);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, token]);

  const handleRemoveFavorite = async (countryId) => {
    try {
      console.log(`Removing favorite ${countryId} with API URL:`, API_URL);
      const response = await axios.delete(`${API_URL}/api/users/favorites/${countryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Remove favorite response:', response.data);
      
      // Handle different response structures
      if (response.data.success) {
        setFavorites(prev => prev.filter(code => code !== countryId));
        toast.success('Removed from favorites');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove favorite');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-pulse space-y-8 w-full max-w-4xl">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
                  <div className="h-40 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container-main">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Your Favorite Countries
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collection of countries you've saved for quick access
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl shadow-sm mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              No Favorites Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Explore countries around the world and save your favorites to build your collection.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Render favorite country cards */}
            {Array.isArray(favorites) && favorites.length > 0 ? (
              favorites.map((countryCode) => (
                <FavoriteCountryCard 
                  key={countryCode} 
                  countryCode={countryCode} 
                  onRemove={handleRemoveFavorite} 
                />
              ))
            ) : (
              <p className="col-span-full text-gray-600 dark:text-gray-400 text-center py-8">
                No favorites found. Try refreshing the page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FavoriteCountryCard = ({ countryCode, onRemove }) => {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        if (response.data && response.data.length > 0) {
          setCountry(response.data[0]);
        } else {
          setError('Country not found');
        }
      } catch (err) {
        console.error(`Error fetching country ${countryCode}:`, err);
        setError('Failed to load country data');
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [countryCode]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md h-64 animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md p-4 text-center">
        <p className="text-red-500 dark:text-red-400">Error loading country</p>
        <button 
          onClick={() => onRemove(countryCode)}
          className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
        <img
          src={country.flags.svg}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <button 
          onClick={() => onRemove(countryCode)}
          className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
          aria-label="Remove from favorites"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            {country.name.common}
          </h2>
          {country.capital && country.capital.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Capital: {country.capital[0]}
            </p>
          )}
        </div>
        <div className="mt-4">
          <Link
            to={`/country/${countryCode}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage; 