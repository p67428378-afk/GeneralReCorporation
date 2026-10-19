import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard Component', () => {
  it('renders metric title and value accurately', () => {
    render(
      <MetricCard
        title="Gross Written Premium"
        value="$14.2B"
        subtitle="Net Earned: $12.8B"
        trend={{ value: '+8.4%', isPositive: true }}
      />
    );

    expect(screen.getByText('Gross Written Premium')).toBeInTheDocument();
    expect(screen.getByText('$14.2B')).toBeInTheDocument();
    expect(screen.getByText('Net Earned: $12.8B')).toBeInTheDocument();
    expect(screen.getByText('+8.4%')).toBeInTheDocument();
  });
});
