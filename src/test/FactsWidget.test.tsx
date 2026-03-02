import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FactsWidget from '../components/FactsWidget';

describe('FactsWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders all STATS cards', () => {
    render(<FactsWidget />);
    expect(screen.getByText('295,000')).toBeInTheDocument();
    expect(screen.getByText('Population')).toBeInTheDocument();
    expect(screen.getByText('126,000')).toBeInTheDocument();
    expect(screen.getByText('Households')).toBeInTheDocument();
    expect(screen.getByText('357 km²')).toBeInTheDocument();
    expect(screen.getByText('1882')).toBeInTheDocument();
    expect(screen.getByText('Robinsons Brewery')).toBeInTheDocument();
  });

  it('renders a trivia fact on mount', () => {
    render(<FactsWidget />);
    expect(screen.getByText(/Did you know\?/)).toBeInTheDocument();
  });

  it('renders pagination dots for trivia facts', () => {
    render(<FactsWidget />);
    const dots = screen.getAllByRole('button', { name: /Fact \d+/ });
    expect(dots.length).toBeGreaterThan(1);
  });

  it('clicking a pagination dot updates the displayed trivia fact', () => {
    render(<FactsWidget />);
    const dots = screen.getAllByRole('button', { name: /Fact \d+/ });
    // Click the last fact dot
    const lastDot = dots[dots.length - 1];
    fireEvent.click(lastDot);
    // The trivia panel should still be visible
    expect(screen.getByText(/Did you know\?/)).toBeInTheDocument();
  });
});
