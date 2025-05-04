FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create a .env file during build if needed for Vite to access env vars
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Hardcode the API URL to ensure it's set
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Create a proper entrypoint script file with hardcoded URL
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'echo "window.ENV_CONFIG = { VITE_API_URL: \"$VITE_API_URL\" };" > ./dist/env-config.js' >> /app/entrypoint.sh && \
    echo 'echo "Using API URL: $VITE_API_URL"' >> /app/entrypoint.sh && \
    echo 'exec "$@"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

EXPOSE 3000

# Pass environment variable to the runtime container
ENV VITE_API_URL=${VITE_API_URL}

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "3000"] 