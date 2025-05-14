import React from 'react';
import { Link } from 'react-router-dom';

const TeamMemberCard = ({ member, taskCount }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.role}</p>
          <p className="text-sm text-gray-500 mt-1">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'} assigned
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/tasks?assignedTo=${member.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            View Tasks
          </Link>
          <Link
            to={`/team/edit/${member.id}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard; 