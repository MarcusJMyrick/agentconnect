import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamMemberForm from '../components/TeamMemberForm';

function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    agent: '',
    active_status: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamRes, agentsRes, tasksRes] = await Promise.all([
        fetch('/api/team-members'),
        fetch('/api/agents'),
        fetch('/api/tasks')
      ]);

      if (!teamRes.ok) throw new Error('Failed to fetch team members');
      if (!agentsRes.ok) throw new Error('Failed to fetch agents');
      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');

      const [teamData, agentsData, tasksData] = await Promise.all([
        teamRes.json(),
        agentsRes.json(),
        tasksRes.json()
      ]);

      setTeamMembers(Array.isArray(teamData) ? teamData : []);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/team-members/${memberId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete team member');
        fetchData();
      } catch (err) {
        console.error('Error deleting team member:', err);
        setError('Failed to delete team member');
      }
    }
  };

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active_status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update team member status');
      fetchData();
    } catch (err) {
      console.error('Error updating team member status:', err);
      setError('Failed to update team member status');
    }
  };

  const handleReassignAgent = async (memberId, newAgentId) => {
    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_id: newAgentId }),
      });
      if (!response.ok) throw new Error('Failed to reassign team member');
      fetchData();
    } catch (err) {
      console.error('Error reassigning team member:', err);
      setError('Failed to reassign team member');
    }
  };

  const getTaskCount = (memberId) => {
    return tasks.filter(task => task.assigned_to === memberId).length;
  };

  const filteredMembers = teamMembers.filter(member => {
    return (
      (!filters.role || member.role === filters.role) &&
      (!filters.agent || member.agent_id === parseInt(filters.agent)) &&
      (filters.active_status === undefined || member.active_status === filters.active_status)
    );
  });

  // Get unique values for filters
  const roles = [...new Set(teamMembers.map(member => member.role))];

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
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your team members and their assignments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setEditingMember(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Team Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <label htmlFor="agent" className="block text-sm font-medium text-gray-700">
              Assigned Agent
            </label>
            <select
              id="agent"
              value={filters.agent}
              onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
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

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.active_status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.active_status ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Role: {member.role}</p>
                <p className="text-sm text-gray-500">
                  Assigned to: {agents.find(a => a.id === member.agent_id)?.name || 'Unassigned'}
                </p>
                <p className="text-sm text-gray-500">
                  Tasks: {getTaskCount(member.id)}
                </p>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => navigate(`/team/${member.id}`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setEditingMember(member);
                    setShowForm(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleStatusChange(member.id, !member.active_status)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {member.active_status ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
              {/* Reassign Agent Dropdown */}
              <div className="mt-4">
                <label htmlFor={`reassign-${member.id}`} className="block text-sm font-medium text-gray-700">
                  Reassign Agent
                </label>
                <select
                  id={`reassign-${member.id}`}
                  value={member.agent_id || ''}
                  onChange={(e) => handleReassignAgent(member.id, parseInt(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Member Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingMember ? 'Edit Team Member' : 'New Team Member'}
            </h3>
            <TeamMemberForm
              onSubmit={async (data) => {
                try {
                  const response = await fetch(
                    editingMember ? `/api/team-members/${editingMember.id}` : '/api/team-members',
                    {
                      method: editingMember ? 'PATCH' : 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(data),
                    }
                  );
                  if (!response.ok) throw new Error('Failed to save team member');
                  fetchData();
                  setShowForm(false);
                  setEditingMember(null);
                } catch (err) {
                  console.error('Error saving team member:', err);
                  setError('Failed to save team member');
                }
              }}
              initialData={editingMember}
              agents={agents}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Team; 