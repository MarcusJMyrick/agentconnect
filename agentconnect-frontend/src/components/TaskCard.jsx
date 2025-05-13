import React, { useState } from 'react';

function TaskCard({ task, onEdit, onDelete }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return '⚠️';
      case 'Medium':
        return '⚡';
      case 'Low':
        return '📌';
      default:
        return '';
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionPreview = task.description
    ? task.description.length > 100 && !showFullDescription
      ? `${task.description.substring(0, 100)}...`
      : task.description
    : 'No description provided';

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-2 flex space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)} {task.priority}
          </span>
        </div>

        {task.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {descriptionPreview}
              {task.description.length > 100 && (
                <button
                  onClick={toggleDescription}
                  className="ml-1 text-indigo-600 hover:text-indigo-900"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            Assigned to: {task.assigned_to_name || 'Unassigned'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TaskCard; 