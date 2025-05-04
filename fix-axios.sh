#!/bin/bash

# Script to fix API URL in axios.js directly in the container

# Get the public IP of the EC2 instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Create a temporary JS file with direct API URL reference
cat > temp_axios.js << EOF
import axios from 'axios';

// Directly use the EC2 public IP
const API_URL = 'http://$PUBLIC_IP:5000';
console.log('Using direct API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
EOF

# Restart containers
echo "Stopping containers..."
docker-compose down

# Update frontend source code and rebuild
echo "Updating axios.js with direct IP reference..."
cp temp_axios.js frontend/src/api/axios.js

# Rebuild and restart
echo "Rebuilding and starting containers..."
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 15

echo "Direct API URL fix applied. The application should now connect properly."
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000" 