import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn(index => Object.keys(store)[index] || null),
    length: Object.keys(store).length
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock fetch API for tests
global.fetch = vi.fn();

// Helper to create mock successful response
export const mockFetchResponse = (data) => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

// Helper to create mock error response
export const mockFetchError = (status = 400, message = 'Bad Request') => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ message }),
    text: async () => JSON.stringify({ message }),
  });
};

// Global function to clean storage between tests
export const cleanStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
}; 