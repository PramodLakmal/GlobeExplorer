FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create a .env file during build if needed for Vite to access env vars
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Create a script that will replace the API URL at runtime
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)' >> /app/entrypoint.sh && \
    echo 'echo "window.ENV_CONFIG = { VITE_API_URL: \"http://$PUBLIC_IP:5000\" };" > ./dist/env-config.js' >> /app/entrypoint.sh && \
    echo 'echo "API URL set to: http://$PUBLIC_IP:5000"' >> /app/entrypoint.sh && \
    echo 'exec "$@"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "3000"] 