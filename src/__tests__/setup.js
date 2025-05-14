const pool = require('../db/pool');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

// Generate a unique test run ID
const TEST_RUN_ID = Date.now().toString(36) + Math.random().toString(36).substr(2);

async function setupTestDatabase() {
  // Wipe everything and restart all IDs
  await pool.query(`
    TRUNCATE tasks, team_members, agents, users
    RESTART IDENTITY CASCADE;
  `);

  // Create test users with unique emails using TEST_RUN_ID
  const password_hash = await bcrypt.hash('testpassword', 10);
  const usersResult = await pool.query(`
    INSERT INTO users (username, email, password_hash, role)
    VALUES 
      ('Test User',       'test.${TEST_RUN_ID}@example.com', $1, 'member'),
      ('Test Agent',      'agent.${TEST_RUN_ID}@example.com',$1, 'agent'),
      ('Test HR',         'hr.${TEST_RUN_ID}@example.com',   $1, 'hr')
    RETURNING id, username, email, role
  `, [password_hash]);

  const users = {
    test: usersResult.rows[0],
    agent: usersResult.rows[1],
    hr: usersResult.rows[2]
  };

  // Insert agents
  const agentsRes = await pool.query(`
    INSERT INTO agents (name, role, office, region, skills, active_status)
    VALUES 
      ('John Smith', 'Senior Agent', 'New York',    'Northeast', ARRAY['sales','negotiation'], true),
      ('Sarah Johnson','Team Lead', 'Los Angeles', 'West',      ARRAY['management','training'], true)
    RETURNING id, name, role, office, region, skills, active_status
  `);
  const agents = agentsRes.rows;

  // Insert team members using the real agent ID
  const teamRes = await pool.query(`
    INSERT INTO team_members (name, role, agent_id)
    VALUES 
      ('Mike Brown', 'Sales Associate', $1),
      ('Lisa Chen',  'Customer Service',$1)
    RETURNING id, name, role, agent_id
  `, [agents[0].id]);
  const teamMembers = teamRes.rows;

  // Insert tasks using the real team member ID
  const tasksRes = await pool.query(`
    INSERT INTO tasks (title, description, status, priority, assigned_to, due_date)
    VALUES 
      ('Test Task 1','...', 'pending',     'High',   $1, CURRENT_DATE + INTERVAL '3 days'),
      ('Test Task 2','...', 'in_progress','Medium', $1, CURRENT_DATE + INTERVAL '7 days')
    RETURNING id, title, description, status, priority, assigned_to, due_date
  `, [teamMembers[0].id]);
  const tasks = tasksRes.rows;

  // Return all test data for use in tests
  return {
    users,
    agents,
    teamMembers,
    tasks,
    agentId: agents[0].id,
    teamMemberId: teamMembers[0].id,
    taskId: tasks[0].id
  };
}

async function teardownTestDatabase() {
  await pool.query('TRUNCATE tasks, team_members, agents, users RESTART IDENTITY CASCADE;');
}

module.exports = {
  pool,
  setupTestDatabase,
  teardownTestDatabase,
  TEST_RUN_ID
};