import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TransportWidget from '../components/TransportWidget';

describe('TransportWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders all three rail service rows', () => {
    render(<TransportWidget />);
    expect(screen.getByText('TPE')).toBeInTheDocument();
    expect(screen.getByText('AW')).toBeInTheDocument();
    expect(screen.getByText('NT')).toBeInTheDocument();
    expect(screen.getByText(/Stockport ↔ Manchester Piccadilly/)).toBeInTheDocument();
    expect(screen.getByText(/Stockport ↔ London Euston/)).toBeInTheDocument();
    expect(screen.getByText(/Stockport ↔ Sheffield via Hazel Grove/)).toBeInTheDocument();
  });

  it('renders all quick-link anchors with correct hrefs', () => {
    render(<TransportWidget />);
    const trainLink = screen.getByText(/Live train departures/).closest('a');
    expect(trainLink).toHaveAttribute('href', 'https://www.nationalrail.co.uk/live-trains/departures/stockport/');
    const journeyLink = screen.getByText(/TfGM journey planner/).closest('a');
    expect(journeyLink).toHaveAttribute('href', 'https://tfgm.com/plan-a-journey');
  });

  it('calls onStatusChange with ready on mount', async () => {
    const onStatusChange = vi.fn();
    render(<TransportWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('ready'));
  });
});
