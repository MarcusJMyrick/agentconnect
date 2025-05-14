import React from 'react';

const AgentCard = ({ agent, teamMembers = [], taskCounts = {} }) => {
  const agentTeamMembers = teamMembers?.filter(member => member.agent_id === agent.id) || [];

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{agent.name}</h2>
        <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Role:</span> {agent.role}
          </div>
          <div>
            <span className="font-medium">Office:</span> {agent.office}
          </div>
          <div>
            <span className="font-medium">Region:</span> {agent.region}
          </div>
        </div>
        {agent.skills && agent.skills.length > 0 && (
          <div className="mt-2">
            <span className="text-sm font-medium text-gray-600">Skills: </span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {agent.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Team Members:</h3>
        <div className="flex flex-wrap gap-2">
          {agentTeamMembers.length > 0 ? (
            agentTeamMembers.map(member => (
              <span
                key={member.id}
                className="text-xs text-gray-600"
              >
                {member.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500 italic">No team members assigned</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentCard; 