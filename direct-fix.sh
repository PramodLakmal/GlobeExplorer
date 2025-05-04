#!/bin/bash

# Script to directly fix the deployed JavaScript files

# Get the public IP of the EC2 instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Stop the containers
echo "Stopping containers..."
docker-compose down

# Create a custom index.html that will override axios URL
cat > frontend/public/index.html << EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Globe Explorer - Discover countries from around the world" />
    <title>Globe Explorer | Countries Information App</title>
    <!-- API URL Override -->
    <script>
      window.API_URL_OVERRIDE = 'http://$PUBLIC_IP:5000';
      console.log('API URL Override:', window.API_URL_OVERRIDE);
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create modified axios.js that checks for override
cat > frontend/src/api/axios.js << EOF
import axios from 'axios';

// First check if we have an override from index.html
const API_URL = window.API_URL_OVERRIDE || 'http://$PUBLIC_IP:5000';
console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Log each request URL for debugging
    console.log('Making request to:', config.url, 'with base URL:', API_URL);
    
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

// Intercept any localhost URLs and replace them
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.includes('localhost:5000')) {
    url = url.replace('localhost:5000', '$PUBLIC_IP:5000');
    console.log('Intercepted and replaced URL:', url);
  }
  return originalFetch(url, options);
};

export default api;
EOF

# Modify the backend server.js to allow all origins
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

// Middleware - Allow ALL origins for CORS
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  console.log('Headers:', req.headers);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Countries API Backend is running!');
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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
EOF

# Create a custom Dockerfile for frontend that includes our overrides
cat > frontend/Dockerfile << EOF
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# For debugging - make sure we have the correct IP
RUN echo "Building with API URL: http://$PUBLIC_IP:5000"

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Patch the main JS bundle to replace all instances of localhost:5000
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \\
    echo 'find ./dist -name "*.js" -exec sed -i "s/localhost:5000/$PUBLIC_IP:5000/g" {} \\;' >> /app/entrypoint.sh && \\
    echo 'echo "Patched all JS files to use $PUBLIC_IP:5000 instead of localhost:5000"' >> /app/entrypoint.sh && \\
    echo 'exec "\$@"' >> /app/entrypoint.sh && \\
    chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF

# Rebuild everything
echo "Rebuilding containers with direct fixes..."
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 15

echo -e "\nAll direct fixes applied! The application should now be accessible at:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000"
echo -e "\nIMPORTANT: Clear your browser cache completely or use an incognito window" 