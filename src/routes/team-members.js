const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Get all team members
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query;
    let result;

    if (agentId) {
      result = await pool.query(
        'SELECT * FROM team_members WHERE agent_id = $1 ORDER BY name',
        [agentId]
      );
    } else {
      result = await pool.query('SELECT * FROM team_members ORDER BY name');
    }

    return res.json(result.rows);
  } catch (err) {
    console.error('🔥 Error fetching team members:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create new team member
router.post('/', async (req, res) => {
  try {
    const { name, role, agent_id } = req.body;
    
    if (!name || !role || !agent_id) {
      return res.status(400).json({ error: 'Name, role, and agent_id are required' });
    }

    // Check if agent exists
    const agentResult = await pool.query('SELECT id FROM agents WHERE id = $1', [agent_id]);
    if (agentResult.rows.length === 0) {
      return res.status(400).json({ error: 'Agent does not exist' });
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

// Update team member
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    
    if (!name && !role) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }
    
    const result = await pool.query(
      'UPDATE team_members SET name = COALESCE($1, name), role = COALESCE($2, role), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM team_members WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 