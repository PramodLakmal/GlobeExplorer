import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

// Get API URL from environment variables with fallback
const API_URL = 
  (window.ENV_CONFIG?.VITE_API_URL) || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000';

console.log('CountryDetailPage using API URL:', API_URL);

const CountryDetailPage = () => {
  const { code } = useParams();
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, token, addFavorite, removeFavorite } = useAuth();

  useEffect(() => {
    const fetchCountry = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`);
        if (response.data && response.data.length > 0) {
          setCountry(response.data[0]);
          // Check if the country is in user's favorites
          if (user && token) {
            console.log(`Checking favorite status for ${code} with API URL: ${API_URL}`);
            const favResponse = await axios.get(
              `${API_URL}/api/users/favorites/check/${code}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFavorite(favResponse.data.isFavorite);
          }
        } else {
          setError('Country not found');
        }
      } catch (err) {
        console.error('Error fetching country:', err);
        setError('Failed to fetch country details');
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [code, user, token]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info('Please log in to save favorites');
      return;
    }

    console.log('🔍 Toggle favorite for country:', code);
    console.log('🔍 Current favorite status:', isFavorite);
    console.log('🔍 User:', user);
    console.log('🔍 Token available:', !!token);
    console.log('🔍 Using API URL:', API_URL);

    try {
      if (isFavorite) {
        console.log('🔍 Removing from favorites');
        // Use AuthContext method if available, otherwise direct axios call
        if (typeof removeFavorite === 'function') {
          const result = await removeFavorite(code);
          if (result.success) {
            setIsFavorite(false);
            toast.success('Removed from favorites');
          } else {
            toast.error(result.message || 'Failed to remove from favorites');
          }
        } else {
          const result = await axios.delete(`${API_URL}/api/users/favorites/${code}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('✅ Remove favorite response:', result.data);
          
          if (result.data.success) {
            setIsFavorite(false);
            toast.success('Removed from favorites');
          } else {
            toast.error(result.data.message || 'Failed to remove from favorites');
          }
        }
      } else {
        console.log('🔍 Adding to favorites');
        // Use AuthContext method if available, otherwise direct axios call
        if (typeof addFavorite === 'function') {
          const result = await addFavorite(code);
          if (result.success) {
            setIsFavorite(true);
            toast.success('Added to favorites');
          } else {
            toast.error(result.message || 'Failed to add to favorites');
          }
        } else {
          // Use direct axios call with very explicit params
          const result = await axios({
            method: 'post',
            url: `${API_URL}/api/users/favorites`,
            data: { countryCode: code },
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Add favorite response:', result.data);
          
          if (result.data.success) {
            setIsFavorite(true);
            toast.success('Added to favorites');
          } else {
            toast.error(result.data.message || 'Failed to add to favorites');
          }
        }
      }
    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
      console.error('❌ Error details:', err.response?.data || 'No response data');
      toast.error(`Failed to update favorites: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-56 bg-gray-300 dark:bg-gray-700 rounded-xl w-full"></div>
          <div className="space-y-6">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-5/6"></div>
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-2/3"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 p-6 rounded-xl shadow-lg max-w-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Link to="/explore" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Countries
          </Link>
        </div>
      </div>
    );
  }

  if (!country) {
    return null;
  }

  // Format data for display
  const languages = country.languages ? Object.values(country.languages).join(', ') : 'None';
  const currencies = country.currencies
    ? Object.entries(country.currencies)
        .map(([code, currency]) => `${currency.name} (${currency.symbol || code})`)
        .join(', ')
    : 'None';
  const capital = country.capital ? country.capital.join(', ') : 'None';
  const borderCountries = country.borders || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container-main animation-fade-in">
        <Link 
          to="/explore" 
          className="inline-flex items-center mb-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-lg">Back to Countries</span>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="aspect-video w-full overflow-hidden relative bg-gray-200 dark:bg-gray-700">
            <img
              src={country.flags.svg}
              alt={country.flags.alt || `Flag of ${country.name.common}`}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 md:p-8 lg:p-10 w-full">
                <div className="flex flex-wrap justify-between items-end gap-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    {country.name.common}
                    <span className="text-lg md:text-xl align-top ml-2 opacity-70">{country.cca2}</span>
                  </h1>
                  
                  {user && (
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex items-center px-5 py-2 rounded-full transition-all duration-300 ${
                        isFavorite 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {isFavorite ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                          </svg>
                          <span>Favorited</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          <span>Add to Favorites</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-block px-3 py-1 bg-blue-600/80 text-white text-sm rounded-full backdrop-blur-sm">
                    {country.region}
                  </span>
                  {country.subregion && (
                    <span className="inline-block px-3 py-1 bg-blue-500/70 text-white text-sm rounded-full backdrop-blur-sm">
                      {country.subregion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Country Information</h2>
                <div className="space-y-4">
                  <InfoItem label="Official Name" value={country.name.official} />
                  <InfoItem label="Population" value={country.population.toLocaleString()} />
                  <InfoItem label="Region" value={country.region} />
                  <InfoItem label="Subregion" value={country.subregion || 'N/A'} />
                  <InfoItem label="Capital" value={capital} />
                  <InfoItem 
                    label="Languages" 
                    value={languages} 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    } 
                  />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Additional Details</h2>
                <div className="space-y-4">
                  <InfoItem 
                    label="Currencies" 
                    value={currencies}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                  <InfoItem 
                    label="TLD" 
                    value={country.tld?.join(', ') || 'None'}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                  <InfoItem 
                    label="Area" 
                    value={country.area ? `${country.area.toLocaleString()} km²` : 'N/A'}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                  <InfoItem 
                    label="Driving Side" 
                    value={country.car?.side === 'right' ? 'Right' : 'Left'} 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h2a1 1 0 001-1v-6a1 1 0 00-.293-.707l-2-2A1 1 0 0012 4H3zm11 3.586V7H8.414l2-2H12l2 2z" />
                      </svg>
                    }
                  />
                  {country.timezones && (
                    <InfoItem 
                      label="Time Zones" 
                      value={country.timezones.join(', ')}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {borderCountries.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Border Countries</h3>
                <div className="flex flex-wrap gap-3">
                  {borderCountries.map((border) => (
                    <Link
                      key={border}
                      to={`/country/${border}`}
                      className="px-4 py-2 bg-white dark:bg-gray-700 shadow-md hover:shadow-lg dark:shadow-gray-900/20 rounded-lg text-gray-800 dark:text-gray-200 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                    >
                      {border}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {country.maps?.googleMaps && (
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Maps</h3>
                <div className="flex space-x-4">
                  <a
                    href={country.maps.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                    </svg>
                    Google Maps
                  </a>
                  {country.maps.openStreetMaps && (
                    <a
                      href={country.maps.openStreetMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      OpenStreetMap
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying information items
const InfoItem = ({ label, value, icon }) => {
  return (
    <div className="flex items-start">
      {icon && <div className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5">{icon}</div>}
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</h4>
        <p className="text-gray-900 dark:text-gray-100 font-medium">{value}</p>
      </div>
    </div>
  );
};

export default CountryDetailPage; 