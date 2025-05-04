// Standalone Express server for testing connectivity
// Save as standalone-backend.js and run with: node standalone-backend.js

import express from 'express';

const app = express();
const PORT = 5000;

// Allow CORS from anywhere
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request from:', req.headers.origin);
    return res.status(204).end();
  }
  next();
});

// Simple logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Test backend is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test endpoint working' });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register endpoint hit');
  res.json({ 
    success: true, 
    message: 'Registration successful (test mode)',
    user: { id: 123, email: 'test@example.com' },
    token: 'test-token-123'
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login endpoint hit');
  res.json({ 
    success: true, 
    message: 'Login successful (test mode)',
    user: { id: 123, email: 'test@example.com' },
    token: 'test-token-123'
  });
});

// Start server listening on ALL interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Test server should be accessible from any IP on port ${PORT}`);
  console.log('Try accessing:');
  console.log(`- http://YOUR_EC2_IP:${PORT}/`);
  console.log(`- http://YOUR_EC2_IP:${PORT}/api/test`);
}); 