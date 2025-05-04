[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mNaxAqQD)

# Globe Explorer

A modern web application for exploring countries from around the world. Built using React, Tailwind CSS, and the REST Countries API.

## Features

- Browse countries from all around the world
- Search for countries by name
- Filter countries by region or language
- View detailed information about each country
- Save favorite countries to your personal collection
- User authentication system with MongoDB integration

## Technologies Used

- **Frontend:**
  - React (Functional Components)
  - React Router for navigation
  - TanStack Query for data fetching
  - Tailwind CSS for styling
  - Context API for state management

- **Backend:**
  - Node.js with Express
  - MongoDB for user data storage
  - JWT for authentication
  - bcrypt for password hashing

- **APIs:**
  - REST Countries API for country data

## Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (local or Atlas)

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/countries-app
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Project Structure

- `/frontend` - React application
  - `/src/components` - Reusable UI components
  - `/src/pages` - Page components
  - `/src/contexts` - Context providers
  - `/src/api` - API service functions

- `/backend` - Express server
  - `/controllers` - Request handlers
  - `/models` - Database models
  - `/routes` - API routes
  - `/middlewares` - Custom middleware functions

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user's profile

### User Management

- `GET /api/users/favorites` - Get user's favorite countries
- `POST /api/users/favorites` - Add a country to favorites
- `DELETE /api/users/favorites/:countryCode` - Remove a country from favorites

## Deployment

This project can be deployed using platforms like Vercel, Netlify, or Heroku. Follow their respective documentation for deployment instructions.

## License

This project is created for educational purposes as part of SE3040 – Application Frameworks course at SLIIT.

## Created By

IT22588500
BSc (Hons) in Information Technology
Specialized in Software Engineering
3rd Year
Faculty of Computing
SLIIT
2025
