const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Validation middleware for task creation/updates
function validateTask(req, res, next) {
  const { title, assignedTo, status, priority } = req.body;

  // Required fields check
  if (!title || !assignedTo) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['title', 'assignedTo']
    });
  }

  // Status values
  if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  // Priority values
  if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority value' });
  }

  next();
}

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { assignedTo } = req.query;
    
    if (!assignedTo) {
      return res.status(400).json({ error: 'assignedTo parameter is required' });
    }

    const result = await pool.query(
      `SELECT tasks.*, team_members.name AS assigned_to_name
       FROM tasks
       LEFT JOIN team_members ON tasks.assigned_to = team_members.id
       WHERE assigned_to = $1
       ORDER BY due_date`,
      [assignedTo]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('🔥 Error fetching tasks:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get tasks by assigned team member
router.get('/assigned', async (req, res) => {
  try {
    const { assignedTo } = req.query;
    
    if (!assignedTo) {
      return res.status(400).json({ error: 'Team member ID is required' });
    }
    
    const result = await pool.query(
      `SELECT tasks.*, team_members.name AS assigned_to_name
       FROM tasks
       LEFT JOIN team_members ON tasks.assigned_to = team_members.id
       WHERE assigned_to = $1
       ORDER BY due_date`,
      [assignedTo]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new task
router.post(
  '/',
  validateTask,              // Run validation first
  authenticateToken,
  authorizeRole(['hr']),
  async (req, res) => {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO tasks
           (title, description, status, priority, assigned_to, due_date)
         VALUES 
           ($1, $2, $3, $4, $5, $6)
         RETURNING
           id,
           title,
           description,
           status,
           priority,
           assigned_to   AS "assignedTo",
           due_date      AS "dueDate"`,
        [
          title,
          description || '',
          status || 'pending',
          priority || 'Medium',
          assignedTo,
          dueDate || null
        ]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

// Update task
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, description, title, due_date, assigned_to } = req.body;
    
    if (!status && !priority && !description && !title && !due_date && !assigned_to) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }

    // Validate status if provided
    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Validate priority if provided
    if (priority) {
      const normalizedPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
      if (!['High', 'Medium', 'Low'].includes(normalizedPriority)) {
        return res.status(400).json({ error: 'Priority must be High, Medium, or Low' });
      }
    }

    // Format date if provided
    let formattedDueDate = due_date;
    if (due_date) {
      try {
        const date = new Date(due_date);
        formattedDueDate = date.toISOString().split('T')[0];
      } catch (err) {
        console.error('Invalid date format:', due_date);
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }
    
    const result = await pool.query(
      `UPDATE tasks 
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           description = COALESCE($3, description),
           title = COALESCE($4, title),
           due_date = COALESCE($5, due_date),
           assigned_to = COALESCE($6, assigned_to),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *,
         (SELECT name FROM team_members WHERE id = COALESCE($6, tasks.assigned_to)) AS assigned_to_name`,
      [
        status,
        priority ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : null,
        description,
        title,
        formattedDueDate,
        assigned_to,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Format the response date
    const task = result.rows[0];
    if (task.due_date) {
      task.due_date = new Date(task.due_date).toISOString().split('T')[0];
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 