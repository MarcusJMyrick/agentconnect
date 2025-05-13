import React, { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, teamRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/team-members')
      ]);

      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      if (!teamRes.ok) throw new Error('Failed to fetch team members');

      const [tasksData, teamData] = await Promise.all([
        tasksRes.json(),
        teamRes.json()
      ]);

      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setTeamMembers(Array.isArray(teamData) ? teamData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      const response = await fetch(
        editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks',
        {
          method: editingTask ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        }
      );
      if (!response.ok) throw new Error('Failed to save task');
      fetchData();
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
        fetchData();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update task status');
      fetchData();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesAssignedTo = !filters.assignedTo || task.assigned_to === parseInt(filters.assignedTo);
    const matchesDueDate = !filters.dueDate || task.due_date === filters.dueDate;
    return matchesStatus && matchesPriority && matchesAssignedTo && matchesDueDate;
  });

  const groupedTasks = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and track your team's tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
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

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
              Assigned To
            </label>
            <select
              id="assignedTo"
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Team Members</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={filters.dueDate}
              onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pending</h2>
          <div className="space-y-4">
            {groupedTasks.pending.map(task => (
              <div
                key={task.id}
                className={`bg-white shadow rounded-lg p-4 ${
                  new Date(task.due_date) < new Date() ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Assigned to: {task.assigned_to_name || 'Unassigned'}</span>
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setShowTaskForm(true);
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">In Progress</h2>
          <div className="space-y-4">
            {groupedTasks.in_progress.map(task => (
              <div
                key={task.id}
                className={`bg-white shadow rounded-lg p-4 ${
                  new Date(task.due_date) < new Date() ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Assigned to: {task.assigned_to_name || 'Unassigned'}</span>
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(task.id, 'completed')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setShowTaskForm(true);
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Completed</h2>
          <div className="space-y-4">
            {groupedTasks.completed.map(task => (
              <div
                key={task.id}
                className="bg-white shadow rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Assigned to: {task.assigned_to_name || 'Unassigned'}</span>
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reopen
                  </button>
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setShowTaskForm(true);
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}

export default Tasks; 