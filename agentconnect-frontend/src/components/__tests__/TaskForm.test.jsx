import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../TaskForm';

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn();
  const mockTeamMembers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with all fields', () => {
    render(<TaskForm onSubmit={mockOnSubmit} teamMembers={mockTeamMembers} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assign to/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} teamMembers={mockTeamMembers} />);

    fireEvent.click(screen.getByText(/create task/i));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/assignee is required/i)).toBeInTheDocument();
      expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} teamMembers={mockTeamMembers} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Task' }
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' }
    });

    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: 'High' }
    });

    fireEvent.change(screen.getByLabelText(/assign to/i), {
      target: { value: '1' }
    });

    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2024-12-31' }
    });

    fireEvent.click(screen.getByText(/create task/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'High',
        status: 'pending',
        assigned_to: '1',
        due_date: '2024-12-31'
      });
    });
  });

  it('populates form with initial data', () => {
    const initialData = {
      title: 'Existing Task',
      description: 'Existing Description',
      priority: 'Medium',
      status: 'in_progress',
      assigned_to: '2',
      due_date: '2024-12-31'
    };

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        initialData={initialData}
        teamMembers={mockTeamMembers}
      />
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Task');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing Description');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('Medium');
    expect(screen.getByLabelText(/status/i)).toHaveValue('in_progress');
    expect(screen.getByLabelText(/assign to/i)).toHaveValue('2');
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2024-12-31');
  });

  it('calls onSubmit with null when cancel is clicked', () => {
    render(<TaskForm onSubmit={mockOnSubmit} teamMembers={mockTeamMembers} />);

    fireEvent.click(screen.getByText(/cancel/i));

    expect(mockOnSubmit).toHaveBeenCalledWith(null);
  });
}); 