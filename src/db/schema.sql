-- Drop tables if they exist
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS agents;
DROP TABLE IF EXISTS users;

-- Create agents table
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  office VARCHAR(50) NOT NULL,
  region VARCHAR(50) NOT NULL,
  skills TEXT[],
  active_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  assigned_to INTEGER REFERENCES team_members(id),
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('hr', 'agent', 'member')),
  profile_id INTEGER,
  profile_type VARCHAR(20) CHECK (profile_type IN ('agent', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create seed data for users
INSERT INTO users (username, email, password_hash, role) VALUES
  ('HR Admin', 'hr@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'hr'),
  ('John Smith', 'john.smith@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'agent'),
  ('Sarah Johnson', 'sarah.johnson@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'agent'),
  ('Michael Chen', 'michael.chen@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'agent'),
  ('Emily Rodriguez', 'emily.rodriguez@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'agent'),
  ('David Kim', 'david.kim@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'agent'),
  ('Jennifer Park', 'jennifer.park@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'member'),
  ('Kevin Wong', 'kevin.wong@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'member'),
  ('Rachel Kim', 'rachel.kim@agentconnect.com', '$2b$10$jZkxnqeV.E/rMDdeHqZwoeSWWhF5HVRS.O7UEuw26U9DEOj9ivjVW', 'member');

-- Update profile_id and profile_type for agents
UPDATE users SET profile_id = 1, profile_type = 'agent' WHERE email = 'john.smith@agentconnect.com';
UPDATE users SET profile_id = 2, profile_type = 'agent' WHERE email = 'sarah.johnson@agentconnect.com';
UPDATE users SET profile_id = 3, profile_type = 'agent' WHERE email = 'michael.chen@agentconnect.com';
UPDATE users SET profile_id = 4, profile_type = 'agent' WHERE email = 'emily.rodriguez@agentconnect.com';
UPDATE users SET profile_id = 5, profile_type = 'agent' WHERE email = 'david.kim@agentconnect.com';

-- Update profile_id and profile_type for team members
UPDATE users SET profile_id = 1, profile_type = 'member' WHERE email = 'jennifer.park@agentconnect.com';
UPDATE users SET profile_id = 2, profile_type = 'member' WHERE email = 'kevin.wong@agentconnect.com';
UPDATE users SET profile_id = 3, profile_type = 'member' WHERE email = 'rachel.kim@agentconnect.com';

-- Create indexes for better query performance
CREATE INDEX idx_agents_region ON agents(region);
CREATE INDEX idx_agents_office ON agents(office);
CREATE INDEX idx_team_members_agent_id ON team_members(agent_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status); 