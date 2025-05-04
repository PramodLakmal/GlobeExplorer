FROM node:18-alpine

WORKDIR /app

# Install wget for healthcheck and netcat for connection check
RUN apk --no-cache add wget netcat-openbsd

# Copy package files first
COPY package*.json ./

# Install all dependencies explicitly
RUN npm install && \
    npm install express mongoose cors dotenv jsonwebtoken bcryptjs

# Copy the rest of the app
COPY . .

# Make the startup script executable
RUN chmod +x start.sh

# Set environment variable
ENV NODE_ENV=production

# Configure the healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000 || exit 1

EXPOSE 5000

# Start the application using the startup script
CMD ["./start.sh"] 