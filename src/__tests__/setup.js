const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/test');

const pool = new Pool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port
});

async function setupTestDatabase() {
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);

    // Clear existing data
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM team_members');
    await pool.query('DELETE FROM agents');

    // Insert test data
    await pool.query(`
      INSERT INTO agents (name, role, office, region, skills, active_status)
      VALUES 
        ('John Smith', 'Senior Agent', 'New York', 'Northeast', ARRAY['sales', 'negotiation'], true),
        ('Sarah Johnson', 'Team Lead', 'Los Angeles', 'West', ARRAY['management', 'training'], true)
      RETURNING id
    `);

    const agents = await pool.query('SELECT id FROM agents');
    const agentId = agents.rows[0].id;

    await pool.query(`
      INSERT INTO team_members (name, role, agent_id)
      VALUES 
        ('Mike Brown', 'Sales Associate', $1),
        ('Lisa Chen', 'Customer Service', $1)
    `, [agentId]);

    const teamMembers = await pool.query('SELECT id FROM team_members');
    const teamMemberId = teamMembers.rows[0].id;

    await pool.query(`
      INSERT INTO tasks (title, description, status, priority, assigned_to, due_date)
      VALUES 
        ('Test Task 1', 'Description for task 1', 'pending', 'High', $1, '2024-04-15'),
        ('Test Task 2', 'Description for task 2', 'in_progress', 'Medium', $1, '2024-04-20')
    `, [teamMemberId]);

  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

async function teardownTestDatabase() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  }
}

module.exports = {
  pool,
  setupTestDatabase,
  teardownTestDatabase
}; 