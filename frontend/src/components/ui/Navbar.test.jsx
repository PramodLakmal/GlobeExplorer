import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import { renderWithProviders } from '../../__tests__/test-utils';
import * as AuthContext from '../../contexts/AuthContext';

// Create mockNavigate before the test setup
const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  const mockLogout = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders logo and links correctly when user is not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: null,
      logout: mockLogout,
    }));
    
    renderWithProviders(<Navbar />);
    
    // Check for logo
    expect(screen.getByText('Globe')).toBeInTheDocument();
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    
    // Check for navigation links
    const homeLinks = screen.getAllByText(/home/i);
    expect(homeLinks.length).toBeGreaterThan(0);
    
    const exploreLinks = screen.getAllByText(/explore/i);
    expect(exploreLinks.length).toBeGreaterThan(0);
    
    // Check for login/register links
    const loginLinks = screen.getAllByText(/login/i);
    expect(loginLinks.length).toBeGreaterThan(0);
    
    // Use getAllBy to get all matching elements, then check the first one
    const registerLinks = screen.getAllByText(/get started/i);
    expect(registerLinks[0]).toBeInTheDocument();
    
    // Check that protected routes are not visible
    expect(screen.queryByText(/favorites/i)).not.toBeInTheDocument();
  });
  
  it('renders user menu and favorites link when user is authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: { name: 'Test User', email: 'test@example.com' },
      logout: mockLogout,
    }));
    
    renderWithProviders(<Navbar />);
    
    // Check that user info is displayed - the actual component only shows "Test" in the button
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    // And the email is shown in the dropdown - use getAllByText since there may be multiple matches
    const emailElements = screen.getAllByText('test@example.com');
    expect(emailElements.length).toBeGreaterThan(0);
    expect(emailElements[0]).toBeInTheDocument();
    
    // Check that favorites link is visible
    const favoritesLinks = screen.getAllByText(/favorites/i);
    expect(favoritesLinks.length).toBeGreaterThan(0);
    
    // Check that login link is not visible
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });
  
  it('calls logout function and navigates to login page when clicking logout button', async () => {
    const user = userEvent.setup();
    
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: { name: 'Test User', email: 'test@example.com' },
      logout: mockLogout,
    }));
    
    renderWithProviders(<Navbar />);
    
    // Find and click the sign out button directly (use the first one if there are multiple)
    const signOutButtons = screen.getAllByText(/sign out/i);
    await user.click(signOutButtons[0]);
    
    // Check that logout was called
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
    
    // Check navigation to login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
}); 