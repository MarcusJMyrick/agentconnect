const pool = require('../db/pool');
const fs = require('fs');
const path = require('path');

async function seedExpandedData() {
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Insert expanded agents
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
      },
      {
        name: 'Michael Chen',
        role: 'Senior Agent',
        office: 'Chicago',
        region: 'Midwest',
        skills: ['Property Management', 'Investment'],
        active_status: true
      },
      {
        name: 'Emily Rodriguez',
        role: 'Junior Agent',
        office: 'Miami',
        region: 'Southeast',
        skills: ['Luxury Properties', 'International Clients'],
        active_status: true
      },
      {
        name: 'David Kim',
        role: 'Senior Agent',
        office: 'Seattle',
        region: 'Northwest',
        skills: ['Commercial Real Estate', 'Development'],
        active_status: true
      }
    ];

    for (const agent of agents) {
      await pool.query(
        'INSERT INTO agents (name, role, office, region, skills, active_status) VALUES ($1, $2, $3, $4, $5, $6)',
        [agent.name, agent.role, agent.office, agent.region, agent.skills, agent.active_status]
      );
    }
    console.log('✅ Expanded agents added successfully');

    // Get agent IDs for team members
    const agentResult = await pool.query('SELECT id FROM agents');
    const agentIds = agentResult.rows.map(row => row.id);

    // Insert expanded team members
    const teamMembers = [
      // John Smith's team
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
        name: 'Alex Thompson',
        role: 'Marketing Specialist',
        agent_id: agentIds[0]
      },
      // Sarah Johnson's team
      {
        name: 'David Lee',
        role: 'Assistant',
        agent_id: agentIds[1]
      },
      {
        name: 'Sophie Martinez',
        role: 'Client Relations',
        agent_id: agentIds[1]
      },
      // Michael Chen's team
      {
        name: 'James Wilson',
        role: 'Property Manager',
        agent_id: agentIds[2]
      },
      {
        name: 'Lisa Chen',
        role: 'Investment Analyst',
        agent_id: agentIds[2]
      },
      {
        name: 'Robert Taylor',
        role: 'Assistant',
        agent_id: agentIds[2]
      },
      // Emily Rodriguez's team
      {
        name: 'Maria Garcia',
        role: 'Luxury Property Specialist',
        agent_id: agentIds[3]
      },
      {
        name: 'Carlos Mendez',
        role: 'International Relations',
        agent_id: agentIds[3]
      },
      // David Kim's team
      {
        name: 'Jennifer Park',
        role: 'Commercial Specialist',
        agent_id: agentIds[4]
      },
      {
        name: 'Kevin Wong',
        role: 'Development Analyst',
        agent_id: agentIds[4]
      },
      {
        name: 'Rachel Kim',
        role: 'Assistant',
        agent_id: agentIds[4]
      }
    ];

    for (const member of teamMembers) {
      await pool.query(
        'INSERT INTO team_members (name, role, agent_id) VALUES ($1, $2, $3)',
        [member.name, member.role, member.agent_id]
      );
    }
    console.log('✅ Expanded team members added successfully');

    // Get team member IDs for tasks
    const teamMemberResult = await pool.query('SELECT id FROM team_members');
    const teamMemberIds = teamMemberResult.rows.map(row => row.id);

    // Insert expanded tasks
    const tasks = [
      // Tasks for John Smith's team
      {
        title: 'Client Meeting Preparation',
        description: 'Prepare documents for upcoming client meeting',
        status: 'pending',
        priority: 'High',
        assigned_to: teamMemberIds[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Follow-up Calls',
        description: 'Make follow-up calls to recent leads',
        status: 'in_progress',
        priority: 'Medium',
        assigned_to: teamMemberIds[1],
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      // Tasks for Sarah Johnson's team
      {
        title: 'Social Media Campaign',
        description: 'Create and schedule social media posts',
        status: 'pending',
        priority: 'High',
        assigned_to: teamMemberIds[4],
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      // Tasks for Michael Chen's team
      {
        title: 'Property Analysis',
        description: 'Analyze potential investment properties',
        status: 'in_progress',
        priority: 'High',
        assigned_to: teamMemberIds[6],
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      // Tasks for Emily Rodriguez's team
      {
        title: 'Luxury Property Tour',
        description: 'Schedule and prepare for luxury property viewing',
        status: 'pending',
        priority: 'High',
        assigned_to: teamMemberIds[9],
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      // Tasks for David Kim's team
      {
        title: 'Commercial Property Evaluation',
        description: 'Evaluate potential commercial property investments',
        status: 'in_progress',
        priority: 'High',
        assigned_to: teamMemberIds[11],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const task of tasks) {
      await pool.query(
        'INSERT INTO tasks (title, description, status, priority, assigned_to, due_date) VALUES ($1, $2, $3, $4, $5, $6)',
        [task.title, task.description, task.status, task.priority, task.assigned_to, task.due_date]
      );
    }
    console.log('✅ Expanded tasks added successfully');

    console.log('🎉 Expanded database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding expanded data:', error);
  } finally {
    await pool.end();
  }
}

seedExpandedData(); 