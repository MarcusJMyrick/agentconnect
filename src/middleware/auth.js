const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  let decoded;
  try {
    const secret = process.env.JWT_SECRET || 'test-secret-key';
    decoded = jwt.verify(token, secret);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const result = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
  
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = result.rows[0];
  return next();
};

// For role-based authorization
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No user data' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    return next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
}; 