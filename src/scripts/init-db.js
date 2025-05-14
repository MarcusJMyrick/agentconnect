const pool = require('../db/pool');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Insert sample agents
    const agents = [
      {
        name: 'John Smith',
        role: 'Senior Agent',
        office: 'New York',
        region: 'Northeast',
        skills: ['Negotiation', 'Client Relations'],
        active_status: true
      },
      {
        name: 'Sarah Johnson',
        role: 'Junior Agent',
        office: 'Los Angeles',
        region: 'West',
        skills: ['Marketing', 'Social Media'],
        active_status: true
      }
    ];

    for (const agent of agents) {
      await pool.query(
        'INSERT INTO agents (name, role, office, region, skills, active_status) VALUES ($1, $2, $3, $4, $5, $6)',
        [agent.name, agent.role, agent.office, agent.region, agent.skills, agent.active_status]
      );
    }
    console.log('✅ Sample agents added successfully');

    // Get agent IDs for team members
    const agentResult = await pool.query('SELECT id FROM agents');
    const agentIds = agentResult.rows.map(row => row.id);

    // Insert sample team members
    const teamMembers = [
      {
        name: 'Mike Wilson',
        role: 'Assistant',
        agent_id: agentIds[0]
      },
      {
        name: 'Emily Brown',
        role: 'Coordinator',
        agent_id: agentIds[0]
      },
      {
        name: 'David Lee',
        role: 'Assistant',
        agent_id: agentIds[1]
      }
    ];

    for (const member of teamMembers) {
      await pool.query(
        'INSERT INTO team_members (name, role, agent_id) VALUES ($1, $2, $3)',
        [member.name, member.role, member.agent_id]
      );
    }
    console.log('✅ Sample team members added successfully');

    // Get team member IDs for tasks
    const teamMemberResult = await pool.query('SELECT id FROM team_members');
    const teamMemberIds = teamMemberResult.rows.map(row => row.id);

    // Insert sample tasks
    const tasks = [
      {
        title: 'Client Meeting Preparation',
        description: 'Prepare documents for upcoming client meeting',
        status: 'pending',
        priority: 'High',
        assigned_to: teamMemberIds[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Follow-up Calls',
        description: 'Make follow-up calls to recent leads',
        status: 'in_progress',
        priority: 'Medium',
        assigned_to: teamMemberIds[1],
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ];

    for (const task of tasks) {
      await pool.query(
        'INSERT INTO tasks (title, description, status, priority, assigned_to, due_date) VALUES ($1, $2, $3, $4, $5, $6)',
        [task.title, task.description, task.status, task.priority, task.assigned_to, task.due_date]
      );
    }
    console.log('✅ Sample tasks added successfully');

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase(); 