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
RUN echo '#/bin/sh' > /app/entrypoint.sh && \ 
    echo 'cat > ./dist/env-config.js << EOF' >> /app/entrypoint.sh && \ 
    echo 'window.ENV_CONFIG = {' >> /app/entrypoint.sh && \ 
    echo '  VITE_API_URL: "${VITE_API_URL}"' >> /app/entrypoint.sh && \ 
    echo '};' >> /app/entrypoint.sh && \ 
    echo 'EOF' >> /app/entrypoint.sh && \ 
    echo 'exec "$@"' >> /app/entrypoint.sh && \ 
    chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "3000"]
