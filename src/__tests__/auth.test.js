const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const authRouter = require('../routes/auth');
const agentsRouter = require('../routes/agents');
const { pool, setupTestDatabase, teardownTestDatabase } = require('./setup');

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/agents', agentsRouter);

describe('Authentication System', () => {
  let testUser;
  let testToken;
  let hrUser;
  let memberUser;
  const testEmails = ['test@agentconnect.com', 'hr@test.com', 'member@test.com'];

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test users
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const hrPassword = await bcrypt.hash('hrpassword123', 10);
    const memberPassword = await bcrypt.hash('memberpass123', 10);

    // Create main test user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      ['Test User', 'test@agentconnect.com', hashedPassword, 'agent']
    );
    testUser = result.rows[0];

    // Create HR user
    const hrResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      ['HR User', 'hr@test.com', hrPassword, 'hr']
    );
    hrUser = hrResult.rows[0];

    // Create member user
    const memberResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      ['Member User', 'member@test.com', memberPassword, 'member']
    );
    memberUser = memberResult.rows[0];

    // Generate tokens
    testToken = jwt.sign({ id: testUser.id, role: testUser.role }, process.env.JWT_SECRET);
    const hrToken = jwt.sign({ id: hrUser.id, role: hrUser.role }, process.env.JWT_SECRET);
    const memberToken = jwt.sign({ id: memberUser.id, role: memberUser.role }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@agentconnect.com',
          password: 'testpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@agentconnect.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('User Info', () => {
    it('should get user info with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testUser.id);
      expect(res.body).toHaveProperty('email', testUser.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('Role-based Access', () => {
    it('should allow HR to access protected routes', async () => {
      const hrToken = jwt.sign({ id: hrUser.id, role: hrUser.role }, process.env.JWT_SECRET);
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
    });

    it('should prevent member from accessing agent routes', async () => {
      const memberToken = jwt.sign({ id: memberUser.id, role: memberUser.role }, process.env.JWT_SECRET);
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });
}); 