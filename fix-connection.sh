#!/bin/bash

# Connection fix script - diagnoses and repairs backend connectivity issues

# Get the public IP of the EC2 instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Check if backend container is running
echo "Checking backend container status..."
BACKEND_ID=$(docker ps | grep app_backend | awk '{print $1}')
if [ -z "$BACKEND_ID" ]; then
  echo "⚠️ Backend container is not running! Checking why..."
  docker ps -a | grep app_backend
  
  # Check logs for crashed container
  CRASHED_ID=$(docker ps -a | grep app_backend | awk '{print $1}')
  if [ ! -z "$CRASHED_ID" ]; then
    echo "Crashed backend container logs:"
    docker logs $CRASHED_ID
  fi
else
  echo "✅ Backend container is running with ID: $BACKEND_ID"
  echo "Backend logs:"
  docker logs $BACKEND_ID | tail -n 20
fi

# Check if the port is accessible
echo -e "\nChecking if port 5000 is listening on all interfaces..."
LISTENING=$(docker exec $BACKEND_ID netstat -tulnp 2>/dev/null | grep 5000 || echo "Not found")
echo "Port status: $LISTENING"

# Check the EC2 security group
echo -e "\nChecking if port 5000 is open in EC2 security group..."
echo "⚠️ Ensure your EC2 security group allows inbound traffic on port 5000"
echo "You can check this in the AWS Console under EC2 > Security Groups"

# Fix the backend server to listen on all interfaces
echo -e "\nFixing backend server to listen on all interfaces..."
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

// CORS with verbose debugging
app.use((req, res, next) => {
  console.log('CORS middleware - Origin:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(204).end();
  }
  next();
});

// Standard middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.method !== 'GET') {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check route
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

// Connect to MongoDB and start server - EXPLICITLY LISTENING ON ALL INTERFACES
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Listen on all interfaces (0.0.0.0)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`Server running on port \${PORT} listening on all interfaces\`);
      console.log(\`API should be accessible at http://$PUBLIC_IP:5000\`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.error('MongoDB URI:', process.env.MONGO_URI); // Log the MongoDB URI to help diagnose
  });
EOF

# Fix MongoDB connection
echo -e "\nFixing MongoDB connection..."
echo "Checking .env file for MongoDB URI..."
grep MONGO_URI .env || echo "MONGO_URI not found in .env file"

# Update .env file with correct MongoDB URI if needed
if ! grep -q "MONGO_URI=" .env; then
  echo "Adding MongoDB URI to .env file..."
  echo "MONGO_URI=mongodb://mongodb:27017/countries-app" >> .env
fi

# Restart containers
echo -e "\nRestarting containers..."
docker-compose down
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 20

# Check if backend is now responding
echo -e "\nTesting backend connectivity..."
curl -v http://$PUBLIC_IP:5000/ || echo "⚠️ Still not connecting to backend"

echo -e "\nChecking Docker container status..."
docker ps

echo -e "\nChecking backend logs..."
NEW_BACKEND_ID=$(docker ps | grep app_backend | awk '{print $1}')
if [ ! -z "$NEW_BACKEND_ID" ]; then
  docker logs $NEW_BACKEND_ID | tail -n 30
else
  echo "⚠️ Backend container is not running!"
fi

echo -e "\nFix attempts complete. You can now try accessing the application at:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000"
echo -e "\nIf still not working, check:"
echo "1. EC2 security group allows traffic on port 5000"
echo "2. Check Docker networking with: docker network inspect app_app-network"
echo "3. MongoDB connection issues in backend logs"
echo -e "\nYou can manually test API access with: curl -v http://$PUBLIC_IP:5000/" 