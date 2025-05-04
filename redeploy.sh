#!/bin/bash

# Redeploy script for EC2

# Make scripts executable
chmod +x check-status.sh fix-cors.sh

# Stop and remove all containers
echo "Stopping and removing all containers..."
docker-compose down

# Pull the latest changes
echo "Pulling latest changes from git..."
git pull

# Rebuild and start containers
echo "Rebuilding and starting containers..."
docker-compose up -d --build

# Clean up
echo "Cleaning up unused images..."
docker image prune -f

# Check status
echo "Checking deployment status..."
./check-status.sh

echo "Deployment complete!"
echo "Frontend: http://$(curl -s http://checkip.amazonaws.com):3000"
echo "Backend API: http://$(curl -s http://checkip.amazonaws.com):5000"
echo ""
echo "If you encounter CORS issues, run: ./fix-cors.sh" 