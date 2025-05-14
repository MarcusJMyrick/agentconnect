require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Import routes
const agentsRouter = require('./routes/agents');
const teamMembersRouter = require('./routes/team-members');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Make pool available globally
global.pool = pool;

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/team-members', teamMembersRouter);
app.use('/api/tasks', tasksRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Export app for testing
module.exports = app; 