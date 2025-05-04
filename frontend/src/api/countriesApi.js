import axios from 'axios';

const BASE_URL = 'https://restcountries.com/v3.1';

// Get all countries
export const getAllCountries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all countries:', error);
    throw error;
  }
};

// Search countries by name
export const searchCountriesByName = async (name) => {
  try {
    const response = await axios.get(`${BASE_URL}/name/${name}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return [];
    }
    console.error('Error searching countries by name:', error);
    throw error;
  }
};

// Get countries by region
export const getCountriesByRegion = async (region) => {
  try {
    const response = await axios.get(`${BASE_URL}/region/${region}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching countries by region:', error);
    throw error;
  }
};

// Get country details by code
export const getCountryByCode = async (code) => {
  try {
    const response = await axios.get(`${BASE_URL}/alpha/${code}`);
    return response.data[0];
  } catch (error) {
    console.error('Error fetching country details:', error);
    throw error;
  }
};

// Filter countries by language
export const filterCountriesByLanguage = async (language) => {
  try {
    // First get all countries
    const allCountries = await getAllCountries();
    
    // Then filter by language
    return allCountries.filter((country) => {
      if (!country.languages) return false;
      return Object.values(country.languages).some(
        (lang) => lang.toLowerCase().includes(language.toLowerCase())
      );
    });
  } catch (error) {
    console.error('Error filtering countries by language:', error);
    throw error;
  }
}; 