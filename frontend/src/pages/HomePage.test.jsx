import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

// Mock axios before importing any modules that use it
vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn().mockResolvedValue({
      data: [
        { name: { common: 'United States' }, flags: { png: 'us-flag.png' }, cca3: 'USA' },
        { name: { common: 'Canada' }, flags: { png: 'canada-flag.png' }, cca3: 'CAN' },
        { name: { common: 'United Kingdom' }, flags: { png: 'uk-flag.png' }, cca3: 'GBR' }
      ]
    }),
    post: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  };
  
  return {
    default: {
      create: vi.fn().mockReturnValue(mockApi),
      get: mockApi.get,
      post: vi.fn(),
      delete: vi.fn()
    }
  };
});

// Mock AuthContext before importing component
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

// Import components after mocking dependencies
import HomePage from './HomePage';
import { renderWithProviders } from '../__tests__/test-utils';

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the homepage with welcome message and hero section', () => {
    const { container } = renderWithProviders(<HomePage />);

    // Check for the presence of key elements
    expect(screen.getByText(/Incredible Diversity/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore countries, cultures, and data/i)).toBeInTheDocument();
    
    // Check for interactive elements
    expect(screen.getByText(/Start Exploring/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up Free/i)).toBeInTheDocument();
    
    // Verify the component rendered
    expect(container).toBeInTheDocument();
  });

  it('displays the statistics section correctly', () => {
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

  it('displays the features section correctly', () => {
    renderWithProviders(<HomePage />);
    
    // Check for the section title
    expect(screen.getByText('Discover the World Like Never Before')).toBeInTheDocument();
    
    // Check for feature cards - use getAllByText for text that appears multiple times
    const exploreCountriesElements = screen.getAllByText('Explore Countries');
    expect(exploreCountriesElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText(/Browse through detailed information about countries/i)).toBeInTheDocument();
    
    expect(screen.getByText('Advanced Filtering')).toBeInTheDocument();
    expect(screen.getByText(/Filter countries by region, language, or search by name/i)).toBeInTheDocument();
    
    expect(screen.getByText('Favorites Collection')).toBeInTheDocument();
    expect(screen.getByText(/Create an account to save your favorite countries/i)).toBeInTheDocument();
  });

  it('displays the CTA section correctly', () => {
    renderWithProviders(<HomePage />);
    
    // Check for CTA content
    expect(screen.getByText('Ready to Explore the World?')).toBeInTheDocument();
    expect(screen.getByText(/Start your journey today and discover amazing facts/i)).toBeInTheDocument();
    
    // Check for CTA buttons
    const exploreButtons = screen.getAllByText(/Explore Countries/i);
    expect(exploreButtons.length).toBeGreaterThan(0);
    
    const createAccountButton = screen.getByText('Create Account');
    expect(createAccountButton).toBeInTheDocument();
    expect(createAccountButton).toHaveAttribute('href', '/register');
  });
}); 