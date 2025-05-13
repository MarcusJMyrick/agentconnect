const request = require('supertest');
const express = require('express');
const agentsRouter = require('../routes/agents');
const teamMembersRouter = require('../routes/team-members');
const tasksRouter = require('../routes/tasks');
const { pool, setupTestDatabase, teardownTestDatabase } = require('./setup');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/agents', agentsRouter);
app.use('/api/team-members', teamMembersRouter);
app.use('/api/tasks', tasksRouter);

describe('Agents API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/agents', () => {
    it('should return an array of agents', async () => {
      const response = await request(app).get('/api/agents');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('role');
      expect(response.body[0]).toHaveProperty('office');
      expect(response.body[0]).toHaveProperty('region');
      expect(response.body[0]).toHaveProperty('skills');
      expect(response.body[0]).toHaveProperty('active_status');
    });

    it('should filter agents by region', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ region: 'Northeast' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(agent => agent.region === 'Northeast')).toBe(true);
    });

    it('should filter agents by office', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ office: 'New York' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(agent => agent.office === 'New York')).toBe(true);
    });

    it('should filter agents by active status', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ active: true });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(agent => agent.active_status === true)).toBe(true);
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should return a single agent', async () => {
      const agents = await pool.query('SELECT id FROM agents LIMIT 1');
      const agentId = agents.rows[0].id;

      const response = await request(app).get(`/api/agents/${agentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', agentId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('role');
      expect(response.body).toHaveProperty('office');
      expect(response.body).toHaveProperty('region');
      expect(response.body).toHaveProperty('skills');
      expect(response.body).toHaveProperty('active_status');
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app).get('/api/agents/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const newAgent = {
        name: 'New Agent',
        role: 'Junior Agent',
        office: 'Chicago',
        region: 'Midwest',
        skills: ['sales', 'communication'],
        active_status: true
      };

      const response = await request(app)
        .post('/api/agents')
        .send(newAgent);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newAgent.name);
      expect(response.body.role).toBe(newAgent.role);
      expect(response.body.office).toBe(newAgent.office);
      expect(response.body.region).toBe(newAgent.region);
      expect(response.body.skills).toEqual(newAgent.skills);
      expect(response.body.active_status).toBe(newAgent.active_status);
    });

    it('should validate required fields', async () => {
      const invalidAgent = {
        name: 'New Agent'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/agents')
        .send(invalidAgent);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('required');
    });

    it('should validate skills array', async () => {
      const invalidAgent = {
        name: 'New Agent',
        role: 'Junior Agent',
        office: 'Chicago',
        region: 'Midwest',
        skills: 'not-an-array',
        active_status: true
      };

      const response = await request(app)
        .post('/api/agents')
        .send(invalidAgent);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/agents/:id', () => {
    it('should update agent role', async () => {
      const agents = await pool.query('SELECT id FROM agents LIMIT 1');
      const agentId = agents.rows[0].id;

      const updateData = { role: 'Senior Agent' };

      const response = await request(app)
        .patch(`/api/agents/${agentId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe('Senior Agent');
    });

    it('should update agent skills', async () => {
      const agents = await pool.query('SELECT id FROM agents LIMIT 1');
      const agentId = agents.rows[0].id;

      const updateData = { skills: ['sales', 'management', 'training'] };

      const response = await request(app)
        .patch(`/api/agents/${agentId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.skills).toEqual(['sales', 'management', 'training']);
    });

    it('should update agent active status', async () => {
      const agents = await pool.query('SELECT id FROM agents LIMIT 1');
      const agentId = agents.rows[0].id;

      const updateData = { active_status: false };

      const response = await request(app)
        .patch(`/api/agents/${agentId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.active_status).toBe(false);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .patch('/api/agents/999')
        .send({ role: 'New Role' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should delete an agent after removing their tasks', async () => {
      // 1. Create an agent
      const agentRes = await request(app)
        .post('/api/agents')
        .send({
          name: 'Test Agent',
          role: 'Tester',
          office: 'Chicago',
          region: 'Midwest',
          skills: ['testing']
        });
      const agentId = agentRes.body.id;

      // 2. Create a team member
      const memberRes = await request(app)
        .post('/api/team-members')
        .send({
          name: 'Team Member',
          role: 'Support',
          agent_id: agentId
        });
      const memberId = memberRes.body.id;

      // 3. Assign a task
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          status: 'pending',
          assigned_to: memberId,
          due_date: '2025-12-01'
        });
      const taskId = taskRes.body.id;

      // 4. Delete the task
      await request(app).delete(`/api/tasks/${taskId}`);

      // 5. Delete the agent
      const res = await request(app).delete(`/api/agents/${agentId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);

      // Verify agent is deleted
      const deletedAgent = await pool.query('SELECT * FROM agents WHERE id = $1', [agentId]);
      expect(deletedAgent.rows).toHaveLength(0);
    });

    it('should return 400 if agent has tasks', async () => {
      // 1. Create an agent
      const agentRes = await request(app)
        .post('/api/agents')
        .send({
          name: 'Test Agent 2',
          role: 'Tester',
          office: 'Chicago',
          region: 'Midwest',
          skills: ['testing']
        });
      const agentId = agentRes.body.id;

      // 2. Create a team member
      const memberRes = await request(app)
        .post('/api/team-members')
        .send({
          name: 'Team Member 2',
          role: 'Support',
          agent_id: agentId
        });
      const memberId = memberRes.body.id;

      // 3. Assign a task
      await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task 2',
          status: 'pending',
          assigned_to: memberId,
          due_date: '2025-12-01'
        });

      // 4. Try to delete the agent (should fail)
      const res = await request(app).delete(`/api/agents/${agentId}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot delete agent/i);
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .delete('/api/agents/999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 