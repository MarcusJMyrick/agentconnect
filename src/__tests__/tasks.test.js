const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const tasksRouter = require('../routes/tasks');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRouter);

// Mock the database pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('Tasks API', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for a specific team member', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending', assigned_to: 1, due_date: '2024-04-15' },
        { id: 2, title: 'Task 2', status: 'in_progress', assigned_to: 1, due_date: '2024-04-20' }
      ];

      pool.query.mockResolvedValue({ rows: mockTasks });

      const response = await request(app)
        .get('/api/tasks')
        .query({ assignedTo: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].assigned_to).toBe(1);
    });

    it('should require assignedTo parameter', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        status: 'pending',
        assigned_to: 1,
        due_date: '2024-04-25'
      };

      pool.query.mockResolvedValue({ rows: [{ id: 3, ...newTask }] });

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
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
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task status', async () => {
      const taskId = 1;
      const updateData = { status: 'completed' };
      const updatedTask = {
        id: taskId,
        title: 'Task 1',
        status: 'completed',
        assigned_to: 1,
        due_date: '2024-04-15'
      };

      pool.query.mockResolvedValue({ rows: [updatedTask] });

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should require status field', async () => {
      const response = await request(app)
        .patch('/api/tasks/1')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent task', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .patch('/api/tasks/999')
        .send({ status: 'completed' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 