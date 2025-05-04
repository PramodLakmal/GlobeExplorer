#!/bin/bash

# Script to check deployment status

echo "=== Container Status ==="
docker ps

echo -e "\n=== Checking Backend Service ==="
curl -s http://localhost:5000 || echo "Backend service is not responding"

echo -e "\n=== Backend Logs ==="
docker logs $(docker ps -qf "name=app_backend") 2>&1 | tail -n 20

echo -e "\n=== Frontend Logs ==="
docker logs $(docker ps -qf "name=app_frontend") 2>&1 | tail -n 20

echo -e "\n=== MongoDB Logs ==="
docker logs $(docker ps -qf "name=app_mongodb") 2>&1 | tail -n 10

echo -e "\n=== Network Information ==="
docker network inspect app_app-network

echo -e "\nDeployment Check Complete" 