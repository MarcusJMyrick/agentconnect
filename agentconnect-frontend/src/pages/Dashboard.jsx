import React, { useState, useEffect } from 'react';
import AgentCard from '../components/AgentCard';
import TaskCard from '../components/TaskCard';
import TeamMemberCard from '../components/TeamMemberCard';

function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch agents
        const agentsResponse = await fetch('/api/agents');
        if (!agentsResponse.ok) throw new Error('Failed to fetch agents');
        const agentsData = await agentsResponse.json();
        console.log('Agents data:', agentsData);
        setAgents(Array.isArray(agentsData) ? agentsData : []);

        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks');
        if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
        const tasksData = await tasksResponse.json();
        console.log('Tasks data:', tasksData);
        setTasks(Array.isArray(tasksData) ? tasksData : []);

        // Fetch team members
        const teamResponse = await fetch('/api/team-members');
        if (!teamResponse.ok) throw new Error('Failed to fetch team members');
        const teamData = await teamResponse.json();
        console.log('Team data:', teamData);
        setTeamMembers(Array.isArray(teamData) ? teamData : []);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to your AgentConnect dashboard. Here's an overview of your team and tasks.
        </p>
      </div>

      {/* Agents Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Agents</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tasks</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 