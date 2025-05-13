const request = require('supertest');
const express = require('express');
const teamMembersRouter = require('../routes/team-members');
const { pool, setupTestDatabase, teardownTestDatabase } = require('./setup');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/team-members', teamMembersRouter);

describe('Team Members API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/team-members', () => {
    it('should return team members for a specific agent', async () => {
      const agents = await pool.query('SELECT id FROM agents LIMIT 1');
      const agentId = agents.rows[0].id;

      const response = await request(app)
        .get('/api/team-members')
        .query({ agentId });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('role');
      expect(response.body[0].agent_id).toBe(agentId);
    });

    it('should require agentId parameter', async () => {
      const response = await request(app).get('/api/team-members');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for non-existent agent', async () => {
      const response = await request(app)
        .get('/api/team-members')
        .query({ agentId: 999 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/team-members', () => {
    it('should create a new team member', async () => {
      const agents = await pool.query('SELECT id FROM agents LIMIT 1');
      const agentId = agents.rows[0].id;

      const newTeamMember = {
        name: 'New Team Member',
        role: 'Sales Associate',
        agent_id: agentId
      };

      const response = await request(app)
        .post('/api/team-members')
        .send(newTeamMember);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newTeamMember.name);
      expect(response.body.role).toBe(newTeamMember.role);
      expect(response.body.agent_id).toBe(agentId);
    });

    it('should validate required fields', async () => {
      const invalidTeamMember = {
        name: 'New Team Member'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/team-members')
        .send(invalidTeamMember);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate agent_id exists', async () => {
      const invalidTeamMember = {
        name: 'New Team Member',
        role: 'Sales Associate',
        agent_id: 999
      };

      const response = await request(app)
        .post('/api/team-members')
        .send(invalidTeamMember);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/team-members/:id', () => {
    it('should update team member role', async () => {
      const teamMembers = await pool.query('SELECT id FROM team_members LIMIT 1');
      const teamMemberId = teamMembers.rows[0].id;

      const updateData = { role: 'Senior Sales Associate' };

      const response = await request(app)
        .patch(`/api/team-members/${teamMemberId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('Senior Sales Associate');
    });

    it('should update team member name', async () => {
      const teamMembers = await pool.query('SELECT id FROM team_members LIMIT 1');
      const teamMemberId = teamMembers.rows[0].id;

      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .patch(`/api/team-members/${teamMemberId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent team member', async () => {
      const response = await request(app)
        .patch('/api/team-members/999')
        .send({ role: 'New Role' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/team-members/:id', () => {
    it('should delete a team member', async () => {
      const teamMembers = await pool.query('SELECT id FROM team_members LIMIT 1');
      const teamMemberId = teamMembers.rows[0].id;

      const response = await request(app)
        .delete(`/api/team-members/${teamMemberId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify team member is deleted
      const deletedMember = await pool.query('SELECT * FROM team_members WHERE id = $1', [teamMemberId]);
      expect(deletedMember.rows).toHaveLength(0);
    });

    it('should return 404 for non-existent team member', async () => {
      const response = await request(app)
        .delete('/api/team-members/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 