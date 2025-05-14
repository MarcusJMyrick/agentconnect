const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const teamMembersRouter = require('../routes/team-members');
const { pool, setupTestDatabase, teardownTestDatabase } = require('./setup');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/team-members', teamMembersRouter);

describe('Team Members API', () => {
  let testData;
  let hrToken;

  beforeAll(async () => {
    testData = await setupTestDatabase();
    // Create HR token
    hrToken = jwt.sign(
      { userId: testData.users.hr.id, role: testData.users.hr.role },
      process.env.JWT_SECRET || 'test-secret-key'
    );
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/team-members', () => {
    it('should return team members for a specific agent', async () => {
      // Create a test team member first
      await pool.query(`
        INSERT INTO team_members (name, role, agent_id)
        VALUES ('Test Member', 'Junior Agent', $1)
      `, [testData.agentId]);

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
      expect(response.body[0].agent_id).toBe(testData.agentId);
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
        .query({ agentId: 999 })
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
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
        .set('Authorization', `Bearer ${hrToken}`)
        .send(newMember);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newMember.name);
      expect(response.body.role).toBe(newMember.role);
      expect(response.body.agent_id).toBe(testData.agentId);
    });

    it('should validate required fields', async () => {
      const invalidMember = {
        name: 'New Member'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/team-members')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(invalidMember);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate agent_id exists', async () => {
      const invalidMember = {
        name: 'New Member',
        role: 'Junior Agent',
        agent_id: 999
      };

      const response = await request(app)
        .post('/api/team-members')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(invalidMember);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/team-members/:id', () => {
    let teamMemberId;

    beforeEach(async () => {
      // Create a new team member for each test
      const result = await pool.query(`
        INSERT INTO team_members (name, role, agent_id)
        VALUES ('Test Member', 'Junior Agent', $1)
        RETURNING id
      `, [testData.agentId]);
      teamMemberId = result.rows[0].id;
    });

    afterEach(async () => {
      // Clean up the test team member
      await pool.query('DELETE FROM team_members WHERE id = $1', [teamMemberId]);
    });

    it('should update team member role', async () => {
      const updateData = { role: 'Senior Agent' };
      const response = await request(app)
        .patch(`/api/team-members/${teamMemberId}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('Senior Agent');
    });

    it('should update team member name', async () => {
      const updateData = { name: 'Updated Name' };
      const response = await request(app)
        .patch(`/api/team-members/${teamMemberId}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent team member', async () => {
      const response = await request(app)
        .patch('/api/team-members/999')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ role: 'New Role' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/team-members/:id', () => {
    let teamMemberId;

    beforeEach(async () => {
      // Create a new team member for each test
      const result = await pool.query(`
        INSERT INTO team_members (name, role, agent_id)
        VALUES ('Test Member', 'Junior Agent', $1)
        RETURNING id
      `, [testData.agentId]);
      teamMemberId = result.rows[0].id;
    });

    afterEach(async () => {
      // Clean up the test team member if it still exists
      await pool.query('DELETE FROM team_members WHERE id = $1', [teamMemberId]);
    });

    it('should delete a team member', async () => {
      const response = await request(app)
        .delete(`/api/team-members/${teamMemberId}`)
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify team member is deleted
      const deletedMember = await pool.query('SELECT * FROM team_members WHERE id = $1', [teamMemberId]);
      expect(deletedMember.rows).toHaveLength(0);
    });

    it('should return 404 for non-existent team member', async () => {
      const response = await request(app)
        .delete('/api/team-members/999')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 