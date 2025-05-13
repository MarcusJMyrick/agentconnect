const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Get all agents with optional filtering
router.get('/', async (req, res) => {
  try {
    const { region, office, skills, active_status } = req.query;
    let query = 'SELECT * FROM agents';
    const params = [];
    const conditions = [];
    
    if (region) {
      conditions.push(`region = $${params.length + 1}`);
      params.push(region);
    }
    
    if (office) {
      conditions.push(`office = $${params.length + 1}`);
      params.push(office);
    }
    
    if (skills) {
      const skillsArray = skills.split(',');
      const placeholders = skillsArray.map((_, i) => `$${params.length + i + 1}`).join(',');
      conditions.push(`skills && ARRAY[${placeholders}]`);
      params.push(...skillsArray);
    }
    
    if (active_status !== undefined) {
      conditions.push(`active_status = $${params.length + 1}`);
      params.push(active_status === 'true');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// Create new agent
router.post('/', async (req, res) => {
  try {
    const { name, region, office, skills, role, active_status } = req.body;
    
    if (!name || !region || !office || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'region', 'office', 'role']
      });
    }
    
    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array' });
    }
    
    const result = await pool.query(
      'INSERT INTO agents (name, region, office, skills, role, active_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, region, office, skills || [], role, active_status ?? true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update agent
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, region, office, skills, role, active_status } = req.body;
    
    if (!name && !region && !office && !skills && !role && active_status === undefined) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }
    
    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array' });
    }
    
    const result = await pool.query(
      `UPDATE agents 
       SET name = COALESCE($1, name),
           region = COALESCE($2, region),
           office = COALESCE($3, office),
           skills = COALESCE($4, skills),
           role = COALESCE($5, role),
           active_status = COALESCE($6, active_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, region, office, skills, role, active_status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete agent
router.delete('/:id', async (req, res) => {
  const agentId = req.params.id;

  try {
    // 1. Get all team member IDs for the agent
    const teamRes = await pool.query(
      'SELECT id FROM team_members WHERE agent_id = $1',
      [agentId]
    );

    const teamMemberIds = teamRes.rows.map(member => parseInt(member.id, 10));
    console.log('👥 teamMemberIds:', teamMemberIds);

    if (teamMemberIds.length > 0) {
      // 2. Check if any tasks exist for those team members
      const taskRes = await pool.query(
        `SELECT 1 FROM tasks 
         WHERE assigned_to IN (
           SELECT unnest($1::int[])
         )
         LIMIT 1`,
        [teamMemberIds]
      );

      console.log('📋 Task check result:', taskRes.rowCount > 0 ? 'Tasks found' : 'No tasks');

      if (taskRes.rowCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete agent: associated team members have tasks.'
        });
      }
    }

    // 3. Delete team members first (if any)
    await pool.query(
      'DELETE FROM team_members WHERE agent_id = $1',
      [agentId]
    );

    // 4. Delete the agent
    const result = await pool.query(
      'DELETE FROM agents WHERE id = $1 RETURNING *',
      [agentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.status(200).json({ message: 'Agent deleted successfully.' });

  } catch (err) {
    console.error('🔥 Error deleting agent:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router; 