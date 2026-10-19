import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

describe('DashboardPage Component', () => {
  it('renders dashboard executive operations heading and main metrics', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/General Reinsurance Executive Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/Gross Written Premium/i)).toBeInTheDocument();
    expect(screen.getByText(/Combined Ratio/i)).toBeInTheDocument();
  });
});
