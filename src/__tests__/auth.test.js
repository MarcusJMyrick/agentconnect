const request = require('supertest');
const express = require('express');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');
const authRouter = require('../routes/auth');
const agentsRouter = require('../routes/agents');
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/agents', agentsRouter);

let testData;
let hrToken;
let agentToken;
let memberToken;

beforeAll(async () => {
  testData = await setupTestDatabase();
  hrToken = jwt.sign(
    { id: testData.users.hr.id, role: 'hr' },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
  agentToken = jwt.sign(
    { id: testData.users.agent.id, role: 'agent' },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
  memberToken = jwt.sign(
    { id: testData.users.test.id, role: 'member' },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await teardownTestDatabase();
  await pool.end();
});

describe('Authentication System', () => {
  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.users.hr.email,
          password: 'testpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.users.hr.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('User Info', () => {
    it('should get user info with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testData.users.hr.id);
      expect(res.body).toHaveProperty('email', testData.users.hr.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Role-based Access', () => {
    it('should allow HR to access protected routes', async () => {
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
    });

    it('should prevent member from accessing agent routes', async () => {
      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });
}); 