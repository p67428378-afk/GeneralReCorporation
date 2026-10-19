import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TreatiesPage } from './TreatiesPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

describe('TreatiesPage Component', () => {
  it('renders treaties heading and search filter', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TreatiesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Reinsurance Treaties & Facultative Portfolio/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search treaty code, name, cedent/i)).toBeInTheDocument();
  });
});
