const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get all agents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM agents ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new agent
router.post('/', async (req, res) => {
  try {
    const { name, role, office, region, skills, active_status } = req.body;
    
    // Validate required fields
    if (!name || !role || !office || !region) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'role', 'office', 'region']
      });
    }
    
    const result = await pool.query(
      'INSERT INTO agents (name, role, office, region, skills, active_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, role, office, region, skills || [], active_status ?? true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 