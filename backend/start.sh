#!/bin/sh

# Print environment variables (excluding secrets)
echo "Starting backend server..."
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "MONGO_URI: ${MONGO_URI}"
echo "JWT_EXPIRE: ${JWT_EXPIRE}"

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
RETRIES=30
until nc -z mongodb 27017 || [ $RETRIES -eq 0 ]; do
  echo "MongoDB not ready, waiting... ($RETRIES retries left)"
  RETRIES=$((RETRIES-1))
  sleep 1
done

if [ $RETRIES -eq 0 ]; then
  echo "Error: MongoDB connection failed"
  exit 1
fi

echo "MongoDB is available, starting server..."

# Start the server
node server.js 