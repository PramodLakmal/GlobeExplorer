#!/bin/bash

# Complete rebuild with hardcoded values at every step

# Get the public IP of the EC2 instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Stop all containers
echo "Stopping all containers..."
docker-compose down

# Backup original files
echo "Backing up original source files..."
mkdir -p backups
cp -f frontend/src/api/axios.js backups/axios.js.bak
cp -f backend/server.js backups/server.js.bak

# SOLUTION 1: Replace all URLs in the source code
echo "Replacing all API URLs in source files..."
find frontend/src -type f -name "*.js*" -exec sed -i "s/localhost:5000/$PUBLIC_IP:5000/g" {} \;
find frontend/src -type f -name "*.ts*" -exec sed -i "s/localhost:5000/$PUBLIC_IP:5000/g" {} \;

# SOLUTION 2: Create an updated API client with hardcoded IP
echo "Creating hardcoded axios client..."
cat > frontend/src/api/axios.js << EOF
import axios from 'axios';

// Hardcoded API URL
const API_URL = 'http://$PUBLIC_IP:5000';
console.log('API CLIENT USING HARDCODED URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
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

// Export for use in components
export default api;
EOF

# SOLUTION 3: Make CORS wide open on backend
echo "Opening CORS on backend..."
cat > backend/server.js << EOF
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Open CORS - allow from anywhere
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Standard middleware
app.use(express.json());

// CORS set via middleware above - this is a backup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debugging middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  console.log('Origin:', req.headers.origin);
  console.log('Host:', req.headers.host);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Countries API Backend is running! CORS is open.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: \`Route not found: \${req.originalUrl}\`
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT} with CORS open\`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
EOF

# SOLUTION 4: Add a global override script to index.html
echo "Adding global override script to index.html..."
cat > frontend/public/api-override.js << EOF
// Global API URL override script
console.log('🚨 API Override loaded');
window.API_URL = 'http://$PUBLIC_IP:5000';

// Hijack XMLHttpRequest
(function() {
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes('localhost:5000')) {
      url = url.replace('localhost:5000', '$PUBLIC_IP:5000');
      console.log('XHR intercepted:', url);
    }
    return originalOpen.call(this, method, url, ...args);
  };
})();

// Hijack fetch API
(function() {
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('localhost:5000')) {
      url = url.replace('localhost:5000', '$PUBLIC_IP:5000');
      console.log('Fetch intercepted:', url);
    }
    return originalFetch(url, options);
  };
})();
EOF

# Update index.html to include the override script
cat > frontend/index.html << EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Globe Explorer - Discover countries from around the world" />
    <title>Globe Explorer | Countries Information App</title>
    <!-- API URL Override - load before any other scripts -->
    <script src="/api-override.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Rebuild and restart everything
echo "Rebuilding all containers..."
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 20

echo -e "\nComplete rebuild with hardcoded values completed!"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000"
echo -e "\nIMPORTANT: You MUST use a private/incognito browser window or clear your cache" 