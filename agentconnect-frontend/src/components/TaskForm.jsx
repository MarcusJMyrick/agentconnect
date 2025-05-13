import React, { useState, useEffect } from 'react';

function TaskForm({ onSubmit, initialData = null, teamMembers = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'Medium',
    assigned_to: '',
    due_date: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Format the date for the input field
      const formattedData = {
        ...initialData,
        due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : ''
      };
      setFormData(formattedData);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Assignee is required';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.title ? 'border-red-500' : ''
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter task description..."
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          name="priority"
          id="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
          Assign To
        </label>
        <select
          name="assigned_to"
          id="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.assigned_to ? 'border-red-500' : ''
          }`}
        >
          <option value="">Select a team member</option>
          {teamMembers.map(member => (
            <option key={member.id} value={member.id}>
              {member.name} - {member.role}
            </option>
          ))}
        </select>
        {errors.assigned_to && (
          <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>
        )}
      </div>

      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          name="due_date"
          id="due_date"
          value={formData.due_date}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.due_date ? 'border-red-500' : ''
          }`}
        />
        {errors.due_date && (
          <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onSubmit(null)}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm; 