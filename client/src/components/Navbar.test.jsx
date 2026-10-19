import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Navbar } from './Navbar';
import { AuthProvider } from '../context/AuthContext';

describe('Navbar Component', () => {
  it('renders Gen Re logo and company identity', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText('Gen Re')).toBeInTheDocument();
    expect(screen.getByText(/A Berkshire Hathaway Company/i)).toBeInTheDocument();
  });
});
