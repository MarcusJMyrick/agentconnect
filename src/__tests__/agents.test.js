const request = require('supertest');
const express = require('express');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');
const agentsRouter = require('../routes/agents');
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/agents', agentsRouter);

let testData;
let hrToken;

beforeAll(async () => {
  testData = await setupTestDatabase();
  hrToken = jwt.sign(
    { userId: testData.users.hr.id, role: testData.users.hr.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('Agents API', () => {
  describe('GET /api/agents', () => {
    it('should return an array of agents', async () => {
      const response = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('role');
    });

    it('should filter agents by region', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ region: 'Northeast' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(agent => agent.region === 'Northeast')).toBe(true);
    });

    it('should filter agents by office', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ office: 'New York' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(agent => agent.office === 'New York')).toBe(true);
    });

    it('should filter agents by active status', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ active: true })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(agent => agent.active_status === true)).toBe(true);
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should return a single agent', async () => {
      const response = await request(app)
        .get(`/api/agents/${testData.agentId}`)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testData.agentId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('role');
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .get('/api/agents/99999')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const newAgent = {
        name: 'New Agent',
        role: 'Junior Agent',
        region: 'West',
        office: 'Los Angeles',
        skills: ['sales', 'communication'],
        active_status: true
      };

      const response = await request(app)
        .post('/api/agents')
        .send(newAgent)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newAgent.name);
      expect(response.body.role).toBe(newAgent.role);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/agents')
        .send({})
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('required');
    });

    it('should validate skills array', async () => {
      const response = await request(app)
        .post('/api/agents')
        .send({
          name: 'Invalid Agent',
          role: 'Junior Agent',
          region: 'West',
          office: 'Los Angeles',
          skills: 'not-an-array',
          active_status: true
        })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/agents/:id', () => {
    it('should update agent role', async () => {
      const response = await request(app)
        .patch(`/api/agents/${testData.agentId}`)
        .send({ role: 'Senior Agent' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('Senior Agent');
    });

    it('should update agent skills', async () => {
      const response = await request(app)
        .patch(`/api/agents/${testData.agentId}`)
        .send({ skills: ['sales', 'management', 'training'] })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.skills).toEqual(['sales', 'management', 'training']);
    });

    it('should update agent active status', async () => {
      const response = await request(app)
        .patch(`/api/agents/${testData.agentId}`)
        .send({ active_status: false })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.active_status).toBe(false);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .patch('/api/agents/99999')
        .send({ role: 'New Role' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should delete an agent after removing their tasks', async () => {
      // First delete any tasks associated with the agent
      await pool.query('DELETE FROM tasks WHERE assigned_to IN (SELECT id FROM team_members WHERE agent_id = $1)', [testData.agentId]);
      // Then delete any team members associated with the agent
      await pool.query('DELETE FROM team_members WHERE agent_id = $1', [testData.agentId]);

      const response = await request(app)
        .delete(`/api/agents/${testData.agentId}`)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      // Verify agent is deleted
      const result = await pool.query('SELECT * FROM agents WHERE id = $1', [testData.agentId]);
      expect(result.rows.length).toBe(0);
    });

    it('should return 400 if agent has tasks', async () => {
      // Create a team member and task for the agent
      const teamMemberResult = await pool.query(`
        INSERT INTO team_members (name, role, agent_id)
        VALUES ('Test Member', 'Junior Agent', $1)
        RETURNING id
      `, [testData.agentId]);

      await pool.query(`
        INSERT INTO tasks (title, description, status, priority, assigned_to, due_date)
        VALUES ('Test Task', 'Test description', 'pending', 'Medium', $1, CURRENT_DATE + INTERVAL '7 days')
      `, [teamMemberResult.rows[0].id]);

      const response = await request(app)
        .delete(`/api/agents/${testData.agentId}`)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');

      // Clean up
      await pool.query('DELETE FROM tasks WHERE assigned_to = $1', [teamMemberResult.rows[0].id]);
      await pool.query('DELETE FROM team_members WHERE id = $1', [teamMemberResult.rows[0].id]);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .delete('/api/agents/99999')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 