import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';

const regions = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

const ExplorePage = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://restcountries.com/v3.1/all');
        // Sort countries by name for better browsing
        const sortedCountries = response.data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (!loadMoreRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredCountries.length > visibleCount) {
          setVisibleCount((prev) => prev + 16);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [filteredCountries, visibleCount, loading]);

  // Filter countries based on search query and region
  useEffect(() => {
    let filtered = countries;
    
    if (selectedRegion !== 'All') {
      filtered = filtered.filter(country => country.region === selectedRegion);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        country => 
          country.name.common.toLowerCase().includes(query) ||
          country.name.official.toLowerCase().includes(query) ||
          (country.capital && country.capital[0] && country.capital[0].toLowerCase().includes(query))
      );
    }
    
    setFilteredCountries(filtered);
    setVisibleCount(20); // Reset visible count when filters change
  }, [countries, searchQuery, selectedRegion]);

  // Debounced search handler
  const debouncedSearchHandler = useCallback(
    debounce((value) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const { value } = e.target;
    e.persist();
    debouncedSearchHandler(value);
  };

  if (loading && countries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-main">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl">
              <div className="animate-pulse space-y-8">
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-full mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-main">
          <div className="flex justify-center">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-6 rounded-xl shadow-lg max-w-md">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold">Error</h2>
              </div>
              <p className="mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-main">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Explore Countries
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for a country..."
                onChange={handleSearchChange}
                className="w-full py-3 pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
              />
            </div>
            
            {/* Region Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region === 'All' ? 'Filter by Region' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              Found {filteredCountries.length} countries
              {selectedRegion !== 'All' && ` in ${selectedRegion}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>

        {filteredCountries.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 p-6 rounded-xl shadow-md max-w-2xl mx-auto text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">No Results Found</h2>
            <p>
              We couldn't find any countries that match your search criteria. Try adjusting your filters or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCountries.slice(0, visibleCount).map((country) => (
              <CountryCard key={country.cca3} country={country} />
            ))}
          </div>
        )}

        {/* Loading indicator at the bottom for infinite scroll */}
        {filteredCountries.length > visibleCount && (
          <div 
            ref={loadMoreRef} 
            className="flex justify-center mt-10"
          >
            <div className="animate-pulse flex space-x-4">
              <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
        )}

        {/* No more countries to load indicator */}
        {filteredCountries.length <= visibleCount && filteredCountries.length > 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            You've reached the end of the list
          </div>
        )}
      </div>
    </div>
  );
};

const CountryCard = ({ country }) => {
  return (
    <Link 
      to={`/country/${country.cca3}`}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={country.flags.svg}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
            {country.name.common}
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
              <span className="font-medium mr-2 text-gray-700 dark:text-gray-200">Region:</span>
              {country.region}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
              <span className="font-medium mr-2 text-gray-700 dark:text-gray-200">Capital:</span>
              {country.capital?.[0] || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
              <span className="font-medium mr-2 text-gray-700 dark:text-gray-200">Population:</span>
              {country.population.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4 text-right">
          <span className="inline-flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform">
              <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ExplorePage; 