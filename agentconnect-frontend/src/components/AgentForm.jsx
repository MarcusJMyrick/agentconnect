import React, { useState, useEffect } from 'react';

const AgentForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    office: '',
    role: '',
    status: 'active',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.office) newErrors.office = 'Office is required';
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
          Region
        </label>
        <input
          type="text"
          name="region"
          id="region"
          value={formData.region}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.region ? 'border-red-300' : 'border-gray-300'
          } focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.region && (
          <p className="mt-1 text-sm text-red-600">{errors.region}</p>
        )}
      </div>

      <div>
        <label htmlFor="office" className="block text-sm font-medium text-gray-700">
          Office
        </label>
        <input
          type="text"
          name="office"
          id="office"
          value={formData.office}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.office ? 'border-red-300' : 'border-gray-300'
          } focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.office && (
          <p className="mt-1 text-sm text-red-600">{errors.office}</p>
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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

export default AgentForm; 