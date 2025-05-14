const request = require('supertest');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const authRouter = require('../../routes/auth');
const pool = require('../../db/pool');

app.use(express.json());
app.use('/api/auth', authRouter);

describe('Authentication Routes', () => {
  const testEmails = ['test1@example.com', 'test2@example.com', 'test3@example.com', 'test4@example.com'];
  let testUser3;
  let testUser4;
  let authToken;

  beforeAll(async () => {
    // Clean up any existing test users
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [testEmails]);
  });

  beforeEach(async () => {
    // Clean up any existing test users
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [testEmails]);
  });

  afterAll(async () => {
    // Clean up all test users
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [testEmails]);
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'TestUser1',
        email: 'test1@example.com',
        password: 'password123',
        role: 'agent'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).toHaveProperty('role', userData.role);
      expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('should not register a user with existing email', async () => {
      // First registration
      const userData = {
        username: 'TestUser2',
        email: 'test2@example.com',
        password: 'password123',
        role: 'agent'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Attempt to register same email again
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
        ['Test User 3', 'test3@example.com', hashedPassword, 'agent']
      );
      testUser3 = result.rows[0];
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test3@example.com',
          password: 'testpass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'test3@example.com');
      expect(res.body.user).toHaveProperty('role', 'agent');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test3@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpass123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Create a test user and get their token
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
        ['Test User 4', 'test4@example.com', hashedPassword, 'agent']
      );
      testUser4 = result.rows[0];

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test4@example.com',
          password: 'testpass123'
        });

      authToken = loginRes.body.token;
    });

    it('should get user info with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', 'test4@example.com');
      expect(res.body).toHaveProperty('role', 'agent');
    });

    it('should not get user info without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it('should not get user info with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid token');
    });
  });
}); 