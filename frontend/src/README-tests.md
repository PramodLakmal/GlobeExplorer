# Testing Documentation for Globe Explorer

This document provides an overview of the testing implementation for the Globe Explorer application.

## Test Setup

The project uses the following testing tools:

- **Vitest**: A fast test runner for Vite applications
- **React Testing Library**: For testing React components
- **Jest DOM**: For additional DOM testing matchers
- **User Event**: For simulating user interactions

## Test Files Structure

The test files are located alongside the components and pages they test:

- `src/components/ui/Navbar.test.jsx`: Tests for the Navbar component
- `src/contexts/AuthContext.test.jsx`: Tests for the AuthContext provider
- `src/pages/HomePage.test.jsx`: Tests for the HomePage component
- `src/pages/LoginPage.test.jsx`: Tests for the LoginPage component
- `src/pages/CountryPage.test.jsx`: Tests for the CountryPage component

## Backend Tests

The backend API is tested using Jest and Supertest:

- `backend/tests/user.test.js`: Tests for the user authentication and favorites API endpoints

## Current Test Coverage

The tests cover the following functionalities:

### Frontend Tests

1. **AuthContext Tests**:
   - Initial authentication state
   - Loading user data from token
   - Login functionality
   - Logout functionality
   - Handling authentication errors

2. **Navbar Tests**:
   - Rendering for authenticated and unauthenticated users
   - Logout functionality

3. **HomePage Tests**:
   - Rendering the main components
   - Search functionality
   - Region filtering
   - Error handling

4. **LoginPage Tests**:
   - Form rendering
   - Form validation
   - Submission with valid data
   - Error display

5. **CountryPage Tests**:
   - Loading and displaying country details
   - Adding and removing favorites
   - Error handling
   - Displays for authenticated vs unauthenticated users

### Backend Tests

1. **User Authentication Tests**:
   - User registration
   - Input validation
   - User login
   - Profile retrieval
   - Token validation

2. **Favorites API Tests**:
   - Adding countries to favorites
   - Preventing duplicate favorites
   - Removing countries from favorites
   - Retrieving favorite countries
   - Checking if a country is a favorite

## Running Tests

To run the frontend tests:
```
cd frontend
npm run test
```

To run with coverage:
```
cd frontend
npm run test:coverage
```

To run the backend tests:
```
cd backend
npm run test
```

## Known Issues and Future Improvements

Some tests are currently failing due to:

1. Mock implementation issues in react-router-dom hooks
2. Axios mock configuration needs to be improved
3. Some component imports might be incorrect

Future improvements:
- Add more integration tests between components
- Increase test coverage for edge cases
- Add end-to-end tests with Cypress 