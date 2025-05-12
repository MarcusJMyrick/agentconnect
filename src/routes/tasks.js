const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get tasks by assigned team member
router.get('/', async (req, res) => {
  try {
    const { assignedTo } = req.query;
    
    if (!assignedTo) {
      return res.status(400).json({ error: 'Team member ID is required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY due_date',
      [assignedTo]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { title, status, assigned_to, due_date } = req.body;
    
    if (!title || !assigned_to || !due_date) {
      return res.status(400).json({ error: 'Title, assigned_to, and due_date are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO tasks (title, status, assigned_to, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, status || 'pending', assigned_to, due_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const result = await pool.query(
      'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 