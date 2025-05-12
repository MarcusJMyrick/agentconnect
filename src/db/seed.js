require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const seedData = async () => {
  try {
    // Insert agents
    const agent1 = await pool.query(
      'INSERT INTO agents (name, role, office, region, skills) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['John Smith', 'Senior Agent', 'New York', 'Northeast', ['sales', 'management', 'training']]
    );
    
    const agent2 = await pool.query(
      'INSERT INTO agents (name, role, office, region, skills) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Sarah Johnson', 'Team Lead', 'Los Angeles', 'West', ['coaching', 'recruitment', 'sales']]
    );

    // Insert team members
    const teamMembers = [
      ['Mike Brown', 'Sales Associate', agent1.rows[0].id],
      ['Lisa Chen', 'Customer Service', agent1.rows[0].id],
      ['David Wilson', 'Sales Associate', agent2.rows[0].id],
      ['Emma Davis', 'Customer Service', agent2.rows[0].id],
      ['James Miller', 'Sales Associate', agent2.rows[0].id]
    ];

    const teamMemberIds = [];
    for (const [name, role, agentId] of teamMembers) {
      const result = await pool.query(
        'INSERT INTO team_members (name, role, agent_id) VALUES ($1, $2, $3) RETURNING id',
        [name, role, agentId]
      );
      teamMemberIds.push(result.rows[0].id);
    }

    // Insert tasks
    const tasks = [
      ['Complete sales training', 'pending', teamMemberIds[0], '2024-04-15'],
      ['Review customer feedback', 'in_progress', teamMemberIds[1], '2024-04-10'],
      ['Prepare quarterly report', 'pending', teamMemberIds[2], '2024-04-20'],
      ['Update client database', 'completed', teamMemberIds[3], '2024-04-05'],
      ['Schedule team meeting', 'pending', teamMemberIds[4], '2024-04-12']
    ];

    for (const [title, status, assignedTo, dueDate] of tasks) {
      await pool.query(
        'INSERT INTO tasks (title, status, assigned_to, due_date) VALUES ($1, $2, $3, $4)',
        [title, status, assignedTo, dueDate]
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 