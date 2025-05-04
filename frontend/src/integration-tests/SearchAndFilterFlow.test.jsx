import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../__tests__/test-utils';
import { cleanStorage } from '../__tests__/setupTests';

// Mock countries data
const allCountries = [
  { name: { common: 'France' }, flags: { png: 'france-flag.png' }, cca3: 'FRA', capital: ['Paris'], region: 'Europe' },
  { name: { common: 'Germany' }, flags: { png: 'germany-flag.png' }, cca3: 'DEU', capital: ['Berlin'], region: 'Europe' },
  { name: { common: 'Japan' }, flags: { png: 'japan-flag.png' }, cca3: 'JPN', capital: ['Tokyo'], region: 'Asia' },
  { name: { common: 'Brazil' }, flags: { png: 'brazil-flag.png' }, cca3: 'BRA', capital: ['Brasília'], region: 'Americas' },
  { name: { common: 'Australia' }, flags: { png: 'australia-flag.png' }, cca3: 'AUS', capital: ['Canberra'], region: 'Oceania' }
];

// Mock axios before importing components
vi.mock('axios', () => {
  const mockAxios = {
    defaults: {
      headers: {
        common: {}
      }
    },
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    create: vi.fn().mockReturnThis()
  };
  return {
    default: mockAxios
  };
});

// Import components after mocking
import axios from 'axios';
import HomePage from '../pages/HomePage';

describe('Homepage Navigation and Features', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    vi.clearAllMocks();
    cleanStorage();
    
    // Default mock for getting all countries
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/countries')) {
        return Promise.resolve({ data: allCountries });
      }
      return Promise.reject(new Error('Not found'));
    });
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('includes navigation links to explore countries', async () => {
    // Render the HomePage
    renderWithProviders(<HomePage />);
    
    // Find the "Start Exploring" button instead of "Explore Countries"
    const startExploringButton = screen.getByText(/Start Exploring/i);
    expect(startExploringButton).toBeInTheDocument();
    
    // Also verify the "Sign Up Free" button is present
    const signUpButton = screen.getByText(/Sign Up Free/i);
    expect(signUpButton).toBeInTheDocument();
  });

  it('renders the statistics on homepage', async () => {
    renderWithProviders(<HomePage />);
    
    // Check for stat cards
    expect(screen.getByText('195+')).toBeInTheDocument();
    expect(screen.getByText('Countries')).toBeInTheDocument();
    
    expect(screen.getByText('7+')).toBeInTheDocument();
    expect(screen.getByText('Continents')).toBeInTheDocument();
    
    expect(screen.getByText('7,000+')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();
    
    expect(screen.getByText('8B+')).toBeInTheDocument();
    expect(screen.getByText('Population')).toBeInTheDocument();
  });

  it('displays the features section correctly', async () => {
    renderWithProviders(<HomePage />);
    
    // Check for the section title
    expect(screen.getByText('Discover the World Like Never Before')).toBeInTheDocument();
    
    // Check for feature cards
    expect(screen.getByText('Advanced Filtering')).toBeInTheDocument();
    expect(screen.getByText(/Filter countries by region, language, or search by name/i)).toBeInTheDocument();
    
    expect(screen.getByText('Favorites Collection')).toBeInTheDocument();
    expect(screen.getByText(/Create an account to save your favorite countries/i)).toBeInTheDocument();
  });
}); 