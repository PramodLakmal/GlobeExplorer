import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
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
    useNavigate: () => vi.fn(),
    useParams: () => ({ code: 'FRA' })
  };
});

// Import components after mocking
import axios from 'axios';
import CountryDetailPage from '../pages/CountryDetailPage';
import FavoritesPage from '../pages/FavoritesPage';

// Mock user data
const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
const mockToken = 'test-token-123';

describe('Favorites Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanStorage();
    
    // Set up authenticated state
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('displays an error message when country detail fails to load', async () => {
    // Set up axios mock to return an error
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch country'));
    
    // Render the country detail page
    renderWithProviders(<CountryDetailPage />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch country details')).toBeInTheDocument();
    });
    
    // Verify back button is present
    expect(screen.getByText('Back to Countries')).toBeInTheDocument();
  });

  it('shows empty state message when user has no favorites', async () => {
    // Set up axios to return an empty list of favorites
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/favorites')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/api/auth/user')) {
        return Promise.resolve({ data: { user: mockUser } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    // Render the favorites page
    renderWithProviders(<FavoritesPage />);
    
    // Wait for favorites to load
    await waitFor(() => {
      expect(screen.getByText('Your Favorite Countries')).toBeInTheDocument();
    });
    
    // Check for empty state message
    expect(screen.getByText('No Favorites Yet')).toBeInTheDocument();
    expect(screen.getByText(/Explore countries around the world and save your favorites/i)).toBeInTheDocument();
    expect(screen.getByText('Start Exploring')).toBeInTheDocument();
  });
}); 