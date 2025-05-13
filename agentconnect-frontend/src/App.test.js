import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Add more specific assertions based on your App component's content
    expect(document.body).toBeInTheDocument();
  });
});
