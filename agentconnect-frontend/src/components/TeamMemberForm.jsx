import React, { useState } from 'react';

const TeamMemberForm = ({ onSubmit, initialData, agents }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    agent_id: '',
    active_status: true,
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.role) newErrors.role = 'Role is required';
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          } focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <input
          type="text"
          name="role"
          id="role"
          value={formData.role}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.role ? 'border-red-300' : 'border-gray-300'
          } focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role}</p>
        )}
      </div>

      <div>
        <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700">
          Assigned Agent
        </label>
        <select
          name="agent_id"
          id="agent_id"
          value={formData.agent_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select an agent</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="active_status"
            name="active_status"
            type="checkbox"
            checked={formData.active_status}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="active_status" className="font-medium text-gray-700">
            Active Status
          </label>
          <p className="text-gray-500">Is this team member currently active?</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onSubmit(null)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default TeamMemberForm; 