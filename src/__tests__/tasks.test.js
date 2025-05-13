const request = require('supertest');
const express = require('express');
const tasksRouter = require('../routes/tasks');
const { pool, setupTestDatabase, teardownTestDatabase } = require('./setup');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRouter);

describe('Tasks API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for a specific team member', async () => {
      const teamMembers = await pool.query('SELECT id FROM team_members LIMIT 1');
      const teamMemberId = teamMembers.rows[0].id;

      const response = await request(app)
        .get('/api/tasks')
        .query({ assignedTo: teamMemberId });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('status');
      expect(response.body[0]).toHaveProperty('priority');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0].assigned_to).toBe(teamMemberId);
    });

    it('should require assignedTo parameter', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for non-existent team member', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ assignedTo: 999 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const teamMembers = await pool.query('SELECT id FROM team_members LIMIT 1');
      const teamMemberId = teamMembers.rows[0].id;

      const newTask = {
        title: 'New Test Task',
        description: 'Description for new test task',
        status: 'pending',
        priority: 'High',
        assigned_to: teamMemberId,
        due_date: '2024-04-25'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.description).toBe(newTask.description);
      expect(response.body.status).toBe(newTask.status);
      expect(response.body.priority).toBe(newTask.priority);
      expect(response.body.assigned_to).toBe(teamMemberId);
    });

    it('should validate required fields', async () => {
      const invalidTask = {
        title: 'New Task'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate priority values', async () => {
      const teamMembers = await pool.query('SELECT id FROM team_members LIMIT 1');
      const teamMemberId = teamMembers.rows[0].id;

      const invalidTask = {
        title: 'New Task',
        description: 'Description',
        status: 'pending',
        priority: 'Invalid',
        assigned_to: teamMemberId,
        due_date: '2024-04-25'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task status', async () => {
      const tasks = await pool.query('SELECT id FROM tasks LIMIT 1');
      const taskId = tasks.rows[0].id;

      const updateData = { status: 'completed' };

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should update task priority', async () => {
      const tasks = await pool.query('SELECT id FROM tasks LIMIT 1');
      const taskId = tasks.rows[0].id;

      const updateData = { priority: 'Low' };

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.priority).toBe('Low');
    });

    it('should update task description', async () => {
      const tasks = await pool.query('SELECT id FROM tasks LIMIT 1');
      const taskId = tasks.rows[0].id;

      const updateData = { description: 'Updated description' };

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/999')
        .send({ status: 'completed' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate status values', async () => {
      const tasks = await pool.query('SELECT id FROM tasks LIMIT 1');
      const taskId = tasks.rows[0].id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ status: 'invalid_status' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const tasks = await pool.query('SELECT id FROM tasks LIMIT 1');
      const taskId = tasks.rows[0].id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify task is deleted
      const deletedTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
      expect(deletedTask.rows).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 