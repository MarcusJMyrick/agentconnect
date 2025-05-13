import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentForm from '../components/AgentForm';

function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [filters, setFilters] = useState({
    region: '',
    office: '',
    role: '',
    active_status: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to fetch agents');
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete agent');
        fetchAgents();
      } catch (err) {
        console.error('Error deleting agent:', err);
        setError('Failed to delete agent');
      }
    }
  };

  const handleStatusChange = async (agentId, newStatus) => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active_status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update agent status');
      fetchAgents();
    } catch (err) {
      console.error('Error updating agent status:', err);
      setError('Failed to update agent status');
    }
  };

  const filteredAgents = agents.filter(agent => {
    return (
      (!filters.region || agent.region === filters.region) &&
      (!filters.office || agent.office === filters.office) &&
      (!filters.role || agent.role === filters.role) &&
      (filters.active_status === undefined || agent.active_status === filters.active_status)
    );
  });

  // Get unique values for filters
  const regions = [...new Set(agents.map(agent => agent.region))];
  const offices = [...new Set(agents.map(agent => agent.office))];
  const roles = [...new Set(agents.map(agent => agent.role))];

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
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your agents and their team members
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setEditingAgent(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Agent
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <select
              id="region"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="office" className="block text-sm font-medium text-gray-700">
              Office
            </label>
            <select
              id="office"
              value={filters.office}
              onChange={(e) => setFilters({ ...filters, office: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Offices</option>
              {offices.map(office => (
                <option key={office} value={office}>{office}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="active_status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="active_status"
              value={filters.active_status === undefined ? '' : filters.active_status.toString()}
              onChange={(e) => setFilters({ ...filters, active_status: e.target.value === '' ? undefined : e.target.value === 'true' })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
              <option value="">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    agent.active_status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {agent.active_status ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Region: {agent.region}</p>
                <p className="text-sm text-gray-500">Office: {agent.office}</p>
                <p className="text-sm text-gray-500">Role: {agent.role}</p>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => navigate(`/agents/${agent.id}`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setEditingAgent(agent);
                    setShowForm(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleStatusChange(agent.id, !agent.active_status)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {agent.active_status ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteAgent(agent.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingAgent ? 'Edit Agent' : 'New Agent'}
            </h3>
            <AgentForm
              onSubmit={async (data) => {
                try {
                  const response = await fetch(
                    editingAgent ? `/api/agents/${editingAgent.id}` : '/api/agents',
                    {
                      method: editingAgent ? 'PATCH' : 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(data),
                    }
                  );
                  if (!response.ok) throw new Error('Failed to save agent');
                  fetchAgents();
                  setShowForm(false);
                  setEditingAgent(null);
                } catch (err) {
                  console.error('Error saving agent:', err);
                  setError('Failed to save agent');
                }
              }}
              initialData={editingAgent}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Agents; 