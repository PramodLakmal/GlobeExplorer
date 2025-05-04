import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { vi } from 'vitest';

// Mock toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

// Custom renderer that includes providers
export function renderWithProviders(ui, options = {}) {
  const { route = '/', initialEntries = [route], ...rest } = options;
  
  // If initialEntries is provided, use MemoryRouter for controlled routing
  if (initialEntries) {
    return render(ui, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={initialEntries}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MemoryRouter>
      ),
      ...rest
    });
  }
  
  // Otherwise use BrowserRouter (original implementation)
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    ),
    ...rest
  });
}

// Render component with full routing setup
export function renderWithRouting(ui, { routes, initialEntry = '/' }) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          {routes.map((route) => (
            <Route 
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
}

// Helper to mock axios response
export function mockAxiosResponse(data, status = 200) {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'ERROR',
    headers: {},
    config: {}
  };
}

// Helper to mock failed axios response
export function mockAxiosError(message = 'Request failed', status = 400) {
  const error = new Error(message);
  error.response = {
    data: { message },
    status,
    statusText: 'ERROR',
    headers: {},
    config: {}
  };
  return error;
} 