FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install express mongoose cors dotenv jsonwebtoken bcryptjs

# If you have a package-lock.json, uncomment this line:
# RUN npm ci

# Otherwise, ensure all dependencies are installed:
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 5000

CMD ["node", "server.js"] 