import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchData = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        // Search across all endpoints
        const [agentsRes, tasksRes, teamRes] = await Promise.all([
          fetch('/api/agents'),
          fetch('/api/tasks'),
          fetch('/api/team-members')
        ]);

        const [agents, tasks, teamMembers] = await Promise.all([
          agentsRes.json(),
          tasksRes.json(),
          teamRes.json()
        ]);

        // Filter and format results
        const searchResults = [
          ...agents
            .filter(agent => 
              agent.name.toLowerCase().includes(query.toLowerCase()) ||
              agent.region.toLowerCase().includes(query.toLowerCase())
            )
            .map(agent => ({
              type: 'agent',
              id: agent.id,
              title: agent.name,
              subtitle: `Agent • ${agent.region}`,
              url: `/agents/${agent.id}`
            })),
          ...tasks
            .filter(task =>
              task.title.toLowerCase().includes(query.toLowerCase()) ||
              task.description?.toLowerCase().includes(query.toLowerCase())
            )
            .map(task => ({
              type: 'task',
              id: task.id,
              title: task.title,
              subtitle: `Task • ${task.status.replace('_', ' ')}`,
              url: `/tasks/${task.id}`
            })),
          ...teamMembers
            .filter(member =>
              member.name.toLowerCase().includes(query.toLowerCase()) ||
              member.role.toLowerCase().includes(query.toLowerCase())
            )
            .map(member => ({
              type: 'team',
              id: member.id,
              title: member.name,
              subtitle: `Team Member • ${member.role}`,
              url: `/team/${member.id}`
            }))
        ];

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (result) => {
    navigate(result.url);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search agents, tasks, team..."
          className="w-full px-4 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {results.map((result) => (
              <li
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
              >
                <div className="flex items-center">
                  <span className="ml-3 block truncate">
                    <span className="font-medium">{result.title}</span>
                    <span className="ml-2 text-sm text-gray-500">{result.subtitle}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 