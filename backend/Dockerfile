FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install express explicitly just to be safe
RUN npm install express mongoose cors dotenv

# Copy the rest of the files
COPY . .

EXPOSE 5000

CMD ["node", "server.js"] 