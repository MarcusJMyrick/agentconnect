import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AgentDetail from './pages/AgentDetail';
import AgentForm from './pages/AgentForm';
import TaskDetail from './pages/TaskDetail';
import TaskForm from './pages/TaskForm';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/agents/new" element={<AgentForm />} />
          <Route path="/agents/:id/edit" element={<AgentForm />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id/edit" element={<TaskForm />} />
          {/* Add more routes as needed */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
