#!/bin/bash

# Comprehensive fix script that applies all fixes at once

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

# Fix 1: Update axios.js with hardcoded IP reference
echo "Fixing axios.js with direct IP reference..."
cat > frontend/src/api/axios.js << EOF
import axios from 'axios';

// Directly use the EC2 public IP
const API_URL = 'http://$PUBLIC_IP:5000';
console.log('Using direct API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
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

export default api;
EOF

# Fix 2: Update entrypoint script in Dockerfile
echo "Updating entrypoint script in frontend Dockerfile..."
cat > frontend/Dockerfile << EOF
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create a .env file during build if needed for Vite to access env vars
ARG VITE_API_URL
ENV VITE_API_URL=http://$PUBLIC_IP:5000

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Create a script that will directly set the API URL
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \\
    echo 'echo "window.ENV_CONFIG = { VITE_API_URL: \\"http://$PUBLIC_IP:5000\\" };" > ./dist/env-config.js' >> /app/entrypoint.sh && \\
    echo 'echo "Using hardcoded API URL: http://$PUBLIC_IP:5000"' >> /app/entrypoint.sh && \\
    echo 'exec "\$@"' >> /app/entrypoint.sh && \\
    chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF

# Fix 3: Ensure backend CORS includes this IP
echo "Updating backend CORS configuration..."
sed -i "s/const EC2_HOST.*/const EC2_HOST = '$PUBLIC_IP';  \/\/ Hardcoded from fix-all.sh/" backend/server.js

# Stop and rebuild containers
echo "Rebuilding containers with fixes..."
docker-compose down
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 20

# Verify the backend is running and has correct CORS
echo "Verifying backend CORS..."
curl -s -I -X OPTIONS -H "Origin: http://$PUBLIC_IP:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://$PUBLIC_IP:5000/api/auth/register

echo -e "\nAll fixes applied! The application should now be accessible at:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000"
echo -e "\nIf you still encounter issues, try accessing the frontend in a private/incognito browser window" 