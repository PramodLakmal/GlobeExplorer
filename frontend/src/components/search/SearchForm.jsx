import { useState } from 'react';

const SearchForm = ({ onSearch, onRegionChange, onLanguageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'Africa', label: 'Africa' },
    { value: 'Americas', label: 'Americas' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Europe', label: 'Europe' },
    { value: 'Oceania', label: 'Oceania' },
  ];

  const commonLanguages = [
    { value: '', label: 'All Languages' },
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'russian', label: 'Russian' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'german', label: 'German' },
    { value: 'japanese', label: 'Japanese' },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    onRegionChange(region);
  };

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    setLanguageFilter(language);
    onLanguageChange(language);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
      <form onSubmit={handleSearchSubmit}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a country..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="input pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="md:w-48">
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="input"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:w-48">
            <select
              value={languageFilter}
              onChange={handleLanguageChange}
              className="input"
            >
              {commonLanguages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary md:w-auto">
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm; 