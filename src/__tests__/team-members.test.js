const request = require('supertest');
const express = require('express');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');
const teamMembersRouter = require('../routes/team-members');
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/team-members', teamMembersRouter);

let testData;
let hrToken;
let agentToken;
let memberToken;

beforeEach(async () => {
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

afterEach(async () => {
  await teardownTestDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe('Team Members API', () => {
  describe('GET /api/team-members', () => {
    it('should return team members for a specific agent', async () => {
      const response = await request(app)
        .get('/api/team-members')
        .query({ agentId: testData.agentId })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('role');
    });

    it('should require agentId parameter', async () => {
      const response = await request(app)
        .get('/api/team-members')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for non-existent agent', async () => {
      const response = await request(app)
        .get('/api/team-members')
        .query({ agentId: 99999 })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/team-members', () => {
    it('should create a new team member', async () => {
      const newMember = {
        name: 'New Team Member',
        role: 'Junior Agent',
        agent_id: testData.agentId
      };

      const response = await request(app)
        .post('/api/team-members')
        .send(newMember)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newMember.name);
      expect(response.body.role).toBe(newMember.role);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/team-members')
        .send({})
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate agent_id exists', async () => {
      const response = await request(app)
        .post('/api/team-members')
        .send({
          name: 'Invalid Member',
          role: 'Junior Agent',
          agent_id: 99999
        })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/team-members/:id', () => {
    it('should update team member role', async () => {
      const response = await request(app)
        .patch(`/api/team-members/${testData.teamMemberId}`)
        .send({ role: 'Senior Agent' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('Senior Agent');
    });

    it('should update team member name', async () => {
      const response = await request(app)
        .patch(`/api/team-members/${testData.teamMemberId}`)
        .send({ name: 'Updated Name' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent team member', async () => {
      const response = await request(app)
        .patch('/api/team-members/99999')
        .send({ role: 'New Role' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/team-members/:id', () => {
    it('should delete a team member', async () => {
      const response = await request(app)
        .delete(`/api/team-members/${testData.teamMemberId}`)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Team member deleted successfully');
    });

    it('should return 404 for non-existent team member', async () => {
      const response = await request(app)
        .delete('/api/team-members/99999')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 