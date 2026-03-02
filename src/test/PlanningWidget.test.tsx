import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PlanningWidget from '../components/PlanningWidget';
import * as api from '../lib/api';

vi.mock('../lib/api');

const mockPlanningData = {
  count: 1,
  entities: [
    {
      entity: 1,
      name: 'Town Centre Conservation Area',
      reference: 'CA-001',
      'entry-date': '2020-01-01',
      'start-date': '2000-01-01',
      dataset: 'conservation-area',
    },
  ],
};

describe('PlanningWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders a loading skeleton on mount', () => {
    vi.mocked(api.fetchPlanning).mockImplementation(() => new Promise(() => {}));
    render(<PlanningWidget />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders conservation areas when API resolves with data', async () => {
    vi.mocked(api.fetchPlanning).mockResolvedValueOnce(mockPlanningData);
    render(<PlanningWidget />);
    await waitFor(() =>
      expect(screen.getByText('Town Centre Conservation Area')).toBeInTheDocument()
    );
    expect(screen.getByText('CA-001')).toBeInTheDocument();
    expect(screen.getByText('Designated')).toBeInTheDocument();
  });

  it('shows error state with retry button when API rejects', async () => {
    vi.mocked(api.fetchPlanning).mockRejectedValueOnce(new Error('fail'));
    render(<PlanningWidget />);
    await waitFor(() =>
      expect(screen.getByText(/Unable to load planning data/)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows timeout message when request times out', async () => {
    vi.mocked(api.fetchPlanning).mockRejectedValueOnce(new Error('TIMEOUT'));
    render(<PlanningWidget />);
    await waitFor(() => expect(screen.getByText(/timed out/i)).toBeInTheDocument());
  });

  it('calls onStatusChange with ready when data loads', async () => {
    vi.mocked(api.fetchPlanning).mockResolvedValueOnce(mockPlanningData);
    const onStatusChange = vi.fn();
    render(<PlanningWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('ready'));
  });

  it('calls onStatusChange with error when API rejects', async () => {
    vi.mocked(api.fetchPlanning).mockRejectedValueOnce(new Error('fail'));
    const onStatusChange = vi.fn();
    render(<PlanningWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('error'));
  });
});
