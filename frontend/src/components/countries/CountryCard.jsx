import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CountryCard = ({ country }) => {
  const { user, addFavorite, removeFavorite } = useAuth();
  
  const isFavorite = user?.favoriteCountries?.includes(country.cca3);
  
  const handleFavoriteToggle = async () => {
    if (!user) return;
    
    if (isFavorite) {
      await removeFavorite(country.cca3);
    } else {
      await addFavorite(country.cca3);
    }
  };
  
  const formatPopulation = (population) => {
    return new Intl.NumberFormat().format(population);
  };
  
  const getLanguages = (languages) => {
    if (!languages) return 'N/A';
    return Object.values(languages).join(', ');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="h-40 overflow-hidden">
        <img
          src={country.flags.svg}
          alt={`Flag of ${country.name.common}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">
            {country.name.common}
          </h2>
          {user && (
            <button
              onClick={handleFavoriteToggle}
              className="text-2xl focus:outline-none"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <span className="text-red-500">★</span>
              ) : (
                <span className="text-gray-400 hover:text-red-500">☆</span>
              )}
            </button>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Capital:</span>{' '}
            {country.capital ? country.capital[0] : 'N/A'}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Region:</span> {country.region}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Population:</span>{' '}
            {formatPopulation(country.population)}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Languages:</span>{' '}
            {getLanguages(country.languages)}
          </p>
        </div>
        
        <Link
          to={`/country/${country.cca3}`}
          className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CountryCard; 