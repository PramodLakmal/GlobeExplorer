import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';

// Mock user data
const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123'
};

let token;
let userId;

// Connect to a test database before all tests
beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/globe_explorer_test';
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clean up database after all tests
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

// Clear existing test user before each test
beforeEach(async () => {
  await User.deleteMany({ email: mockUser.email });
});

describe('User Authentication API', () => {
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(mockUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('name', mockUser.name);
    expect(res.body.user).toHaveProperty('email', mockUser.email);
    expect(res.body.user).not.toHaveProperty('password');

    // Save token and userId for later tests
    token = res.body.token;
    userId = res.body.user._id;
  });

  test('should not register a user with invalid email', async () => {
    const invalidUser = {
      ...mockUser,
      email: 'invalid-email'
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(invalidUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('should not register a user with short password', async () => {
    const invalidUser = {
      ...mockUser,
      password: 'pass'
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(invalidUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('should login an existing user', async () => {
    // First create a user
    await request(app)
      .post('/api/users/register')
      .send(mockUser);

    // Then login
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('name', mockUser.name);
    expect(res.body.user).toHaveProperty('email', mockUser.email);
    expect(res.body.user).not.toHaveProperty('password');

    // Save token for later tests
    token = res.body.token;
  });

  test('should not login with wrong password', async () => {
    // First create a user
    await request(app)
      .post('/api/users/register')
      .send(mockUser);

    // Then try to login with wrong password
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: mockUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('should get user profile with valid token', async () => {
    // First create a user and get token
    const registerRes = await request(app)
      .post('/api/users/register')
      .send(mockUser);

    token = registerRes.body.token;

    // Then get profile with token
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('name', mockUser.name);
    expect(res.body.user).toHaveProperty('email', mockUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('should not get profile without token', async () => {
    const res = await request(app)
      .get('/api/users/me');

    expect(res.statusCode).toBe(401);
  });

  test('should not get profile with invalid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(401);
  });
});

describe('Favorites API', () => {
  beforeEach(async () => {
    // Create a test user and get token
    const res = await request(app)
      .post('/api/users/register')
      .send(mockUser);

    token = res.body.token;
    userId = res.body.user._id;
  });

  test('should add a country to favorites', async () => {
    const res = await request(app)
      .post('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ countryCode: 'USA' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('favoriteCountries');
    expect(res.body.favoriteCountries).toContain('USA');
  });

  test('should not add a duplicate country to favorites', async () => {
    // First add a country
    await request(app)
      .post('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ countryCode: 'USA' });

    // Try to add the same country again
    const res = await request(app)
      .post('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ countryCode: 'USA' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('should remove a country from favorites', async () => {
    // First add a country
    await request(app)
      .post('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ countryCode: 'USA' });

    // Then remove it
    const res = await request(app)
      .delete('/api/users/favorites/USA')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('favoriteCountries');
    expect(res.body.favoriteCountries).not.toContain('USA');
  });

  test('should get user favorites', async () => {
    // First add a couple countries
    await request(app)
      .post('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ countryCode: 'USA' });

    await request(app)
      .post('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ countryCode: 'CAN' });

    // Get favorites
    const res = await request(app)
      .get('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('favoriteCountries');
    expect(res.body.favoriteCountries).toContain('USA');
    expect(res.body.favoriteCountries).toContain('CAN');
  });

  test('should check if a country is a favorite', async () => {
    // First add a country
    await request(app)
      .post('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ countryCode: 'USA' });

    // Check if it's a favorite
    const res = await request(app)
      .get('/api/users/favorites/check/USA')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('isFavorite', true);
  });

  test('should return false when checking non-favorite country', async () => {
    const res = await request(app)
      .get('/api/users/favorites/check/JPN')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('isFavorite', false);
  });
}); 