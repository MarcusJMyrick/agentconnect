const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const teamMembersRouter = require('../routes/team-members');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/team-members', teamMembersRouter);

// Mock the database pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('Team Members API', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
    jest.clearAllMocks();
  });

  describe('GET /api/team-members', () => {
    it('should return team members for a specific agent', async () => {
      const mockTeamMembers = [
        { id: 1, name: 'Mike Brown', role: 'Sales Associate', agent_id: 1 },
        { id: 2, name: 'Lisa Chen', role: 'Customer Service', agent_id: 1 }
      ];

      pool.query.mockResolvedValue({ rows: mockTeamMembers });

      const response = await request(app)
        .get('/api/team-members')
        .query({ agentId: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].agent_id).toBe(1);
    });

    it('should require agentId parameter', async () => {
      const response = await request(app).get('/api/team-members');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/team-members', () => {
    it('should create a new team member', async () => {
      const newTeamMember = {
        name: 'New Team Member',
        role: 'Sales Associate',
        agent_id: 1
      };

      pool.query.mockResolvedValue({ rows: [{ id: 3, ...newTeamMember }] });

      const response = await request(app)
        .post('/api/team-members')
        .send(newTeamMember);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newTeamMember.name);
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
  });
}); 