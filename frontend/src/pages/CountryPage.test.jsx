import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Set up mock data for consistent testing
const mockCountryData = {
  name: { common: 'France', official: 'French Republic' },
  capital: ['Paris'],
  population: 67391582,
  region: 'Europe',
  subregion: 'Western Europe',
  flags: { 
    png: 'https://example.com/france-flag.png', 
    svg: 'https://example.com/france-flag.svg',
    alt: 'Flag of France' 
  },
  languages: { fra: 'French' },
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  borders: ['AND', 'BEL', 'DEU', 'ITA', 'LUX', 'MCO', 'ESP', 'CHE'],
  cca3: 'FRA',
  cca2: 'FR'
};

// Mock border countries data
const mockBorderCountries = [
  { name: { common: 'Germany' }, cca3: 'DEU' },
  { name: { common: 'Spain' }, cca3: 'ESP' },
  { name: { common: 'Italy' }, cca3: 'ITA' }
];

// Mock axios before importing any modules that use it
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockDelete = vi.fn();
  
  return {
    default: {
      create: vi.fn().mockReturnValue({
        get: mockGet,
        post: mockPost,
        delete: mockDelete,
        defaults: {
          headers: {
            common: {}
          }
        }
      }),
      get: mockGet,
      post: mockPost,
      delete: mockDelete
    },
    __esModule: true
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ code: 'FRA' }),
    useNavigate: () => vi.fn(),
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>{children}</a>
    )
  };
});

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock AuthContext functions
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockCheckFavorite = vi.fn();

// Set default mock implementation
const mockUseAuth = vi.fn();

// Mock AuthContext before importing component
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => mockUseAuth()
  };
});

// Import components after mocking dependencies
import CountryDetailPage from './CountryDetailPage';
import { renderWithProviders } from '../__tests__/test-utils';
import { toast } from 'react-toastify';
import axios from 'axios';

// Get the mock API instance for later use
const mockApiInstance = axios.create();
const mockGet = mockApiInstance.get;
const mockPost = mockApiInstance.post;
const mockDelete = mockApiInstance.delete;

describe('CountryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for API calls
    mockGet.mockImplementation((url) => {
      if (url.includes('/alpha/FRA')) {
        return Promise.resolve({ data: [mockCountryData] });
      } else if (url.includes('/alpha?codes=')) {
        return Promise.resolve({ data: mockBorderCountries });
      } else if (url.includes('/favorites/check/')) {
        return Promise.resolve({ data: { isFavorite: false } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    // Set default authenticated user
    mockUseAuth.mockReturnValue({
      user: { _id: 'user123', name: 'Test User' },
      token: 'test-token',
      addFavorite: mockAddFavorite,
      removeFavorite: mockRemoveFavorite,
      checkFavorite: mockCheckFavorite,
    });
  });

  it('renders loading state initially', async () => {
    // Mock axios to delay response
    mockGet.mockImplementationOnce(() => new Promise(() => {}));
    
    renderWithProviders(<CountryDetailPage />);
    
    // Check for loading skeleton UI elements instead of loading text
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders country details when data is loaded', async () => {
    renderWithProviders(<CountryDetailPage />);
    
    // Wait for country data to load
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    
    // Check that country details are displayed
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('67,391,582')).toBeInTheDocument();
    expect(screen.getAllByText('Europe')[0]).toBeInTheDocument();
    
    // Use getAllByText for text that appears multiple times
    const westernEuropeElements = screen.getAllByText('Western Europe');
    expect(westernEuropeElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Euro (€)')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    
    // Check for the back button
    expect(screen.getByText('Back to Countries')).toBeInTheDocument();
  });

  it('shows Add to Favorites button for authenticated users', async () => {
    renderWithProviders(<CountryDetailPage />);
    
    // Wait for country data to load
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    
    // Check that the add to favorites button is displayed
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    mockGet.mockRejectedValueOnce(new Error('Failed to fetch country data'));

    renderWithProviders(<CountryDetailPage />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/back to countries/i)).toBeInTheDocument();
    });
  });

  it('handles unauthenticated users correctly', async () => {
    // Override the mock for just this test to return unauthenticated user
    mockUseAuth.mockReturnValue({
      user: null,
      token: null
    });
    
    renderWithProviders(<CountryDetailPage />);
    
    // Wait for country data to load
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
    });
    
    // There should be no add to favorites button
    expect(screen.queryByText('Add to Favorites')).not.toBeInTheDocument();
  });
}); 