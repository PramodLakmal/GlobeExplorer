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

# Create a script to inject environment variables at runtime
RUN echo '#!/bin/sh \n\
cat > ./dist/env-config.js << EOF \n\
window.ENV_CONFIG = { \n\
  VITE_API_URL: "${VITE_API_URL}" \n\
}; \n\
EOF \n\
\n\
exec "$@" \n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "3000"] 