#!/bin/bash

# Script to fix CORS issues by restarting containers

# Get the public IP of the EC2 instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Update the .env file with the EC2_HOST value
echo "Updating EC2_HOST in .env..."
if grep -q "EC2_HOST" .env; then
  # Update existing EC2_HOST
  sed -i "s/EC2_HOST=.*/EC2_HOST=$PUBLIC_IP/" .env
else
  # Add EC2_HOST if it doesn't exist
  echo "EC2_HOST=$PUBLIC_IP" >> .env
fi

# Restart containers
echo "Restarting containers..."
docker-compose down
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 15

# Check if backend has CORS configured correctly
echo "Checking backend CORS configuration..."
curl -s -I -X OPTIONS -H "Origin: http://$PUBLIC_IP:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://$PUBLIC_IP:5000/api/auth/register | grep -i access-control

echo "CORS fix attempted. Check browser console for any remaining CORS errors."
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000" 