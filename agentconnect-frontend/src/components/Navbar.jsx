import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // Don't show navbar on login page
  }

  const getNavLinks = () => {
    const links = [];

    // HR and Agent can see Dashboard
    if (['hr', 'agent'].includes(user.role)) {
      links.push({ path: '/', label: 'Dashboard' });
    }

    // HR and Agent can see Agents
    if (['hr', 'agent'].includes(user.role)) {
      links.push({ path: '/agents', label: 'Agents' });
    }

    // All roles can see Tasks
    links.push({ path: '/tasks', label: 'Tasks' });

    // HR and Agent can see Team
    if (['hr', 'agent'].includes(user.role)) {
      links.push({ path: '/team', label: 'Team' });
    }

    return links;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <NavLink to="/" end className="text-xl font-bold text-blue-600">
                AgentConnect
              </NavLink>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <SearchBar />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 