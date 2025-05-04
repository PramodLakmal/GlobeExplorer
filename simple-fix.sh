#!/bin/bash

# A simpler fix script that avoids compatibility issues

# Get public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Stop any running containers
echo "Stopping running containers..."
docker-compose down

# Update backend Dockerfile (without npm update)
echo "Creating a fixed backend Dockerfile..."
cat > backend/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies without updating npm
RUN npm install
RUN npm install express mongoose cors dotenv jsonwebtoken bcryptjs

# Copy the rest of the files
COPY . .

EXPOSE 5000

# Use the test server for now
CMD ["node", "test-server.js"]
EOF

# Create a simple test endpoint file to verify server can start
echo "Creating a test-server.js file..."
cat > backend/test-server.js << EOF
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add body parser to handle JSON
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, data: 'API is working' });
});

// Simulate auth routes
app.post('/api/auth/register', (req, res) => {
  console.log('Register endpoint hit with data:', req.body);
  res.json({
    success: true,
    message: 'User registered successfully',
    user: { _id: '123', name: req.body.name || 'Test User', email: req.body.email || 'test@example.com' },
    token: 'test-token-123'
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login endpoint hit with data:', req.body);
  res.json({
    success: true,
    message: 'Login successful',
    user: { _id: '123', name: 'Test User', email: req.body.email || 'test@example.com' },
    token: 'test-token-123'
  });
});

// Favorites endpoints
app.get('/api/favorites', (req, res) => {
  res.json({
    success: true,
    favorites: []
  });
});

app.post('/api/favorites', (req, res) => {
  console.log('Adding favorite:', req.body);
  res.json({
    success: true,
    message: 'Country added to favorites'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Test server running on port \${PORT}\`);
  console.log(\`Server should be accessible at http://$PUBLIC_IP:5000\`);
});
EOF

# Also make a package.json with required dependencies
echo "Creating a minimal package.json..."
cat > backend/package.json << EOF
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "test-server.js",
  "type": "module",
  "scripts": {
    "start": "node test-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "author": "",
  "license": "ISC"
}
EOF

# Rebuild and restart
echo "Rebuilding and restarting containers..."
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 20

# Check if the backend is running
echo "Checking backend container status..."
BACKEND_ID=$(docker ps | grep app_backend | awk '{print $1}')
if [ -z "$BACKEND_ID" ]; then
  echo "⚠️ Backend container is not running!"
  # Show the logs of the crashed container
  CRASHED_ID=$(docker ps -a | grep app_backend | awk '{print $1}')
  if [ ! -z "$CRASHED_ID" ]; then
    echo "Logs from crashed backend container:"
    docker logs $CRASHED_ID
  fi
else
  echo "✅ Backend container is running with ID: $BACKEND_ID"
  echo "Backend logs:"
  docker logs $BACKEND_ID
fi

# Test if the backend is accessible
echo -e "\nTesting backend connectivity..."
curl -s http://$PUBLIC_IP:5000/ || echo "⚠️ Cannot connect to backend"

echo -e "\nFix complete! If the backend is running, you can access:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000"
echo -e "\nMake sure to use a private/incognito browser window to avoid cache issues" 