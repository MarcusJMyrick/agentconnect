const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Get all team members
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members');
    return res.json(result.rows);
  } catch (err) {
    console.error('🔥 Error fetching team members:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get team members by agent ID
router.get('/by-agent', async (req, res) => {
  try {
    const { agentId } = req.query;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM team_members WHERE agent_id = $1 ORDER BY name',
      [agentId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new team member
router.post('/', async (req, res) => {
  try {
    const { name, role, agent_id } = req.body;
    
    if (!name || !role || !agent_id) {
      return res.status(400).json({ error: 'Name, role, and agent_id are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO team_members (name, role, agent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, role, agent_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 