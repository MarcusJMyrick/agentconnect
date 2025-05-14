const request = require('supertest');
const express = require('express');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');
const tasksRouter = require('../routes/tasks');
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRouter);

let testData;
let hrToken;

beforeAll(async () => {
  testData = await setupTestDatabase();
  hrToken = jwt.sign(
    { userId: testData.users.hr.id, role: 'hr' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('Tasks API', () => {
  describe('GET /api/tasks', () => {
    it('should return tasks for a specific team member', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ assignedTo: testData.teamMemberId })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should require assignedTo parameter', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for non-existent team member', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ assignedTo: 99999 })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Task description',
        status: 'pending',
        priority: 'High',
        assignedTo: testData.teamMemberId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.status).toBe(newTask.status);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate priority values', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Invalid Task',
          description: 'Task description',
          status: 'pending',
          priority: 'Invalid',
          assignedTo: testData.teamMemberId,
          dueDate: new Date().toISOString()
        })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const result = await pool.query(`
        INSERT INTO tasks (title, description, status, priority, assigned_to, due_date)
        VALUES ('Test Task', 'Test description', 'pending', 'Medium', $1, CURRENT_DATE + INTERVAL '7 days')
        RETURNING id
      `, [testData.teamMemberId]);
      taskId = result.rows[0].id;
    });

    afterEach(async () => {
      await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    });

    it('should update task status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ status: 'in_progress' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });

    it('should update task priority', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ priority: 'High' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.priority).toBe('High');
    });

    it('should update task description', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ description: 'Updated description' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/99999')
        .send({ status: 'completed' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ status: 'invalid_status' })
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const result = await pool.query(`
        INSERT INTO tasks (title, description, status, priority, assigned_to, due_date)
        VALUES ('Test Task', 'Test description', 'pending', 'Medium', $1, CURRENT_DATE + INTERVAL '7 days')
        RETURNING id
      `, [testData.teamMemberId]);
      taskId = result.rows[0].id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify task is deleted
      const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
      expect(result.rows.length).toBe(0);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 