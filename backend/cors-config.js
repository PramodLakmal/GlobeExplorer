import { networkInterfaces } from 'os';

// Get local IP addresses
const getLocalIps = () => {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
};

// Dynamically build allowed origins list
const buildAllowedOrigins = () => {
  // Base allowed origins
  const origins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ];

  // Add EC2 HOST if defined
  if (process.env.EC2_HOST) {
    origins.push(`http://${process.env.EC2_HOST}:3000`);
    origins.push(`http://${process.env.EC2_HOST}:5000`);
  }

  // Add local IPs for development
  const localIps = getLocalIps();
  localIps.forEach(ip => {
    origins.push(`http://${ip}:3000`);
    origins.push(`http://${ip}:5000`);
  });

  // Add wildcard for production as fallback
  if (process.env.NODE_ENV === 'production') {
    origins.push('*');
  }

  return origins;
};

// CORS configuration for development and production
const corsOptions = {
  // In production, allow requests from any origin
  // In development, be more restrictive
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow any origin in production
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  
  // Allow all common HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  
  // Allow common headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Set the Access-Control-Max-Age to 24 hours
  maxAge: 86400
};

export default corsOptions; 