import React, { useState, useEffect } from 'react';
import AgentCard from '../components/AgentCard';
import TaskCard from '../components/TaskCard';
import TeamMemberCard from '../components/TeamMemberCard';
import TaskForm from '../components/TaskForm';
import TaskStatusChart from '../components/TaskStatusChart';

function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleTaskSubmit = async (taskData) => {
    try {
      // Format the date if it exists
      if (taskData.due_date) {
        const date = new Date(taskData.due_date);
        taskData.due_date = date.toISOString().split('T')[0];
      }

      if (editingTask) {
        // Update existing task
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update task');
        }
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create task');
        }
      }
      
      // Refresh tasks
      fetchData();
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.message);
    }
  };

  const handleEditTask = (task) => {
    // Format the task data for editing
    const formattedTask = {
      ...task,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      priority: task.priority || 'Medium',
      status: task.status || 'pending'
    };
    setEditingTask(formattedTask);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
        
        // Refresh tasks
        fetchData();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
      }
    }
  };

  // Calculate summary statistics
  const totalAgents = agents.length;
  const totalTeamMembers = teamMembers.length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // Get recent activity
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  
  const lastAgentAdded = [...agents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">{totalAgents}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Team Members</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">{totalTeamMembers}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">{totalTasks}</dd>
            <div className="mt-2 text-sm text-gray-500">
              <span className="text-yellow-600">{pendingTasks} pending</span>
              {' • '}
              <span className="text-blue-600">{inProgressTasks} in progress</span>
              {' • '}
              <span className="text-green-600">{completedTasks} completed</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">
              {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </dd>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Latest Tasks</h3>
              <div className="space-y-4">
                {recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        Assigned to {task.assigned_to_name || 'Unassigned'} • Due {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status Distribution</h3>
              <TaskStatusChart tasks={tasks} />
            </div>
          </div>
        </div>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          <div className="flex space-x-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Due Date {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {/* New Task Button */}
            <button
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              New Task
            </button>
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <TaskForm
                onSubmit={handleTaskSubmit}
                initialData={editingTask}
                teamMembers={teamMembers}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks
            .filter(task => !statusFilter || task.status === statusFilter)
            .sort((a, b) => {
              const dateA = new Date(a.due_date);
              const dateB = new Date(b.due_date);
              return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            })
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
              />
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