-- Add priority column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')); 