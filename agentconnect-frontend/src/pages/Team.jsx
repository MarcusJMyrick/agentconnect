import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AgentCard from '../components/AgentCard';

const Team = () => {
  const [agents, setAgents] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region: '',
    role: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [agentsRes, teamMembersRes, tasksRes] = await Promise.all([
          axios.get('/api/agents'),
          axios.get('/api/team-members'),
          axios.get('/api/tasks')
        ]);

        setAgents(agentsRes.data || []);
        setTeamMembers(teamMembersRes.data || []);
        setTasks(tasksRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate task counts for each team member
  const taskCounts = tasks.reduce((acc, task) => {
    if (task.assigned_to) {
      acc[task.assigned_to] = (acc[task.assigned_to] || 0) + 1;
    }
    return acc;
  }, {});

  // Filter agents based on selected filters
  const filteredAgents = agents.filter(agent => {
    if (filters.region && agent.region !== filters.region) return false;
    if (filters.role && agent.role !== filters.role) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!agents.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Team Management</h1>
          <p className="text-gray-600">No agents found. Please add some agents to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Team Management</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
          >
            <option value="">All Regions</option>
            {[...new Set(agents.map(agent => agent.region))].map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <select
            className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">All Roles</option>
            {[...new Set(agents.map(agent => agent.role))].map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-6">
        {filteredAgents.length > 0 ? (
          filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              teamMembers={teamMembers}
              taskCounts={taskCounts}
            />
          ))
        ) : (
          <p className="text-center text-gray-600">No agents found matching the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default Team; 