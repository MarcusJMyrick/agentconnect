const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const agentsRouter = require('../routes/agents');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/agents', agentsRouter);

// Mock the database pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('Agents API', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/agents', () => {
    it('should return an array of agents', async () => {
      const mockAgents = [
        { id: 1, name: 'John Smith', role: 'Senior Agent', office: 'New York', region: 'Northeast' },
        { id: 2, name: 'Sarah Johnson', role: 'Team Lead', office: 'Los Angeles', region: 'West' }
      ];

      pool.query.mockResolvedValue({ rows: mockAgents });

      const response = await request(app).get('/api/agents');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('John Smith');
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/agents');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should return a single agent', async () => {
      const mockAgent = {
        id: 1,
        name: 'John Smith',
        role: 'Senior Agent',
        office: 'New York',
        region: 'Northeast'
      };

      pool.query.mockResolvedValue({ rows: [mockAgent] });

      const response = await request(app).get('/api/agents/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAgent);
    });

    it('should return 404 for non-existent agent', async () => {
      pool.query.mockResolvedValue({ rows: [] });

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
        skills: ['sales'],
        active_status: true
      };

      pool.query.mockResolvedValue({ rows: [{ id: 3, ...newAgent }] });

      const response = await request(app)
        .post('/api/agents')
        .send(newAgent);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newAgent.name);
    });

    it('should validate required fields', async () => {
      const invalidAgent = {
        name: 'New Agent'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/agents')
        .send(invalidAgent);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 