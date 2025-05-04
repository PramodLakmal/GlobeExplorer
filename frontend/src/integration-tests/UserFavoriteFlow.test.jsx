import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../__tests__/test-utils';
import { cleanStorage } from '../__tests__/setupTests';

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

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(() => {}),
    useParams: () => ({ code: 'FRA' })
  };
});

// Import components after mocking
import axios from 'axios';
import LoginPage from '../pages/LoginPage';
import CountryDetailPage from '../pages/CountryDetailPage';

// Mock user data
const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
const mockToken = 'test-token-123';

const mockCountryDetail = {
  name: { common: 'France', official: 'French Republic' },
  capital: ['Paris'],
  population: 67391582,
  region: 'Europe',
  subregion: 'Western Europe',
  flags: { png: 'france-flag.png', svg: 'france-flag.svg', alt: 'Flag of France' },
  languages: { fra: 'French' },
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  borders: ['DEU', 'ESP', 'ITA'],
  cca3: 'FRA',
  cca2: 'FR'
};

describe('User Authentication and Favorites Flow', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    vi.clearAllMocks();
    cleanStorage();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the login form with expected elements', async () => {
    // Start at login page
    renderWithProviders(<LoginPage />);
    
    // Verify login page elements are shown
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/New to Globe Explorer/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute('href', '/register');
  });

  it('displays an error message when country detail fails to load', async () => {
    // Set up axios mock to return an error
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch country'));
    
    // Mock useAuth to return unauthenticated user
    vi.mock('../contexts/AuthContext', async () => {
      const actual = await vi.importActual('../contexts/AuthContext');
      return {
        ...actual,
        useAuth: () => ({
          user: null,
          token: null,
          isAuthenticated: () => false
        })
      };
    });
    
    // Render country detail page
    renderWithProviders(<CountryDetailPage />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch country details')).toBeInTheDocument();
    });
    
    // Verify back button is present
    expect(screen.getByText('Back to Countries')).toBeInTheDocument();
  });
}); 