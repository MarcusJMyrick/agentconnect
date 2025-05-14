const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all agents with optional filtering
router.get('/', authenticateToken, authorizeRole(['hr', 'agent']), async (req, res) => {
  try {
    const { region, office, skills, active_status } = req.query;
    let query = 'SELECT * FROM agents';
    const params = [];
    const conditions = [];

    if (region) {
      params.push(region);
      conditions.push(`region = $${params.length}`);
    }

    if (office) {
      params.push(office);
      conditions.push(`office = $${params.length}`);
    }

    if (skills) {
      const skillsArray = skills.split(',');
      params.push(skillsArray);
      conditions.push(`skills && $${params.length}`);
    }

    if (active_status !== undefined) {
      params.push(active_status === 'true');
      conditions.push(`active_status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single agent by ID
router.get('/:id', authenticateToken, authorizeRole(['hr', 'agent']), async (req, res) => {
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

// Create a new agent
router.post('/', authenticateToken, authorizeRole(['hr']), async (req, res) => {
  try {
    const { name, role, region, office, skills, active_status } = req.body;

    // Validate required fields
    if (!name || !role || !region || !office) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'role', 'region', 'office']
      });
    }

    // Validate skills array
    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array' });
    }

    const result = await pool.query(
      `INSERT INTO agents (name, role, region, office, skills, active_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, role, region, office, skills || [], active_status ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an agent
router.patch('/:id', authenticateToken, authorizeRole(['hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, region, office, skills, active_status } = req.body;

    // Check if at least one field is provided
    if (!name && !role && !region && !office && !skills && active_status === undefined) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Validate skills array if provided
    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (role) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (region) {
      updates.push(`region = $${paramCount}`);
      values.push(region);
      paramCount++;
    }

    if (office) {
      updates.push(`office = $${paramCount}`);
      values.push(office);
      paramCount++;
    }

    if (skills) {
      updates.push(`skills = $${paramCount}`);
      values.push(skills);
      paramCount++;
    }

    if (active_status !== undefined) {
      updates.push(`active_status = $${paramCount}`);
      values.push(active_status);
      paramCount++;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE agents 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an agent
router.delete('/:id', authenticateToken, authorizeRole(['hr']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if agent has any associated team members
    const teamMembersResult = await pool.query(
      'SELECT COUNT(*) FROM team_members WHERE agent_id = $1',
      [id]
    );

    if (parseInt(teamMembersResult.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete agent with associated team members'
      });
    }

    // Check if agent has any associated tasks
    const tasksResult = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to IN (SELECT id FROM team_members WHERE agent_id = $1)',
      [id]
    );

    if (parseInt(tasksResult.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete agent with associated tasks'
      });
    }

    const result = await pool.query('DELETE FROM agents WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 