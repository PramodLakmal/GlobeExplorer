#!/bin/bash

# Script to fix the backend dependencies and restart the containers

# Get public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Stop any running containers
echo "Stopping running containers..."
docker-compose down

# Update backend package.json to ensure dependencies are properly listed
echo "Updating backend/package.json..."
cat > backend/package.json << EOF
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "author": "",
  "license": "ISC"
}
EOF

# Rebuild and restart
echo "Rebuilding and restarting containers..."
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 20

# Check the backend status
echo "Checking backend container status..."
BACKEND_ID=$(docker ps | grep app_backend | awk '{print $1}')
if [ -z "$BACKEND_ID" ]; then
  echo "⚠️ Backend container is not running!"
  BACKEND_ID=$(docker ps -a | grep app_backend | awk '{print $1}')
  if [ ! -z "$BACKEND_ID" ]; then
    echo "Checking logs of crashed container:"
    docker logs $BACKEND_ID
  fi
else
  echo "✅ Backend container is running with ID: $BACKEND_ID"
  echo "Backend logs:"
  docker logs $BACKEND_ID | tail -n 20
fi

# Test if backend is reachable
echo -e "\nTesting backend connectivity..."
curl -v http://$PUBLIC_IP:5000/ || echo "⚠️ Still can't connect to backend"

echo -e "\nFix complete. Try accessing the app at:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000" 