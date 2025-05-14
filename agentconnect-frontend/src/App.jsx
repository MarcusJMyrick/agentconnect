import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="py-10">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute roles={['hr', 'agent']}>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/agents"
                  element={
                    <PrivateRoute roles={['hr', 'agent']}>
                      <Agents />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <PrivateRoute roles={['hr', 'agent', 'member']}>
                      <Tasks />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <PrivateRoute roles={['hr', 'agent']}>
                      <Team />
                    </PrivateRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 