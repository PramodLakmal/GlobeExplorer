#!/bin/bash

# Script to run standalone backend server for testing

# Get public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Stop any running containers
echo "Stopping any running containers..."
docker-compose down

# Install required packages 
echo "Installing required packages..."
cd backend
npm install express

# Run standalone server
echo "Starting standalone backend server on port 5000..."
echo "This server will be accessible at: http://$PUBLIC_IP:5000"
node ../standalone-backend.js

# The server will keep running until you press Ctrl+C 