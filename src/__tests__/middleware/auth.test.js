const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Mock the database pool
jest.mock('../../db/pool', () => ({
  query: jest.fn()
}));

describe('Authentication Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token provided', async () => {
      await authenticateToken(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      
      await authenticateToken(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should set user data and call next() if token is valid', async () => {
      const userData = { id: 1, email: 'test@example.com', role: 'agent' };
      const token = jwt.sign(userData, process.env.JWT_SECRET || 'test-secret-key');
      mockReq.headers.authorization = `Bearer ${token}`;
      
      // Mock the database query to return the user
      const pool = require('../../db/pool');
      pool.query.mockResolvedValueOnce({ rows: [userData] });
      
      await authenticateToken(mockReq, mockRes, nextFunction);
      
      expect(mockReq.user).toEqual(userData);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found in database', async () => {
      const userData = { id: 1, email: 'test@example.com', role: 'agent' };
      const token = jwt.sign(userData, process.env.JWT_SECRET || 'test-secret-key');
      mockReq.headers.authorization = `Bearer ${token}`;
      
      // Mock the database query to return no user
      const pool = require('../../db/pool');
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      await authenticateToken(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRole', () => {
    it('should return 403 if user role is not authorized', () => {
      mockReq.user = { role: 'member' };
      
      authorizeRole(['agent', 'hr'])(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized role' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if user role is authorized', () => {
      mockReq.user = { role: 'agent' };
      
      authorizeRole(['agent', 'hr'])(mockReq, mockRes, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle multiple authorized roles', () => {
      mockReq.user = { role: 'hr' };
      
      authorizeRole(['agent', 'hr'])(mockReq, mockRes, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
}); 