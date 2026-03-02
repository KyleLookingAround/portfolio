import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CrimeWidget from '../components/CrimeWidget';
import * as api from '../lib/api';

vi.mock('../lib/api');

const mockCrimes = [
  { category: 'violent-crime', location: { street: { name: 'High Street' }, latitude: '53.4', longitude: '-2.1' }, month: '2026-01' },
  { category: 'burglary', location: { street: { name: 'Main Street' }, latitude: '53.4', longitude: '-2.1' }, month: '2026-01' },
  { category: 'burglary', location: { street: { name: 'Park Road' }, latitude: '53.4', longitude: '-2.1' }, month: '2026-01' },
];

describe('CrimeWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders a loading skeleton on mount', () => {
    vi.mocked(api.fetchCrime).mockImplementation(() => new Promise(() => {}));
    render(<CrimeWidget />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders bar chart and summary pills with mocked crime data', async () => {
    vi.mocked(api.fetchCrime).mockResolvedValueOnce(mockCrimes);
    render(<CrimeWidget />);
    await waitFor(() => expect(screen.getByText('Violent Crime')).toBeInTheDocument());
    expect(screen.getByText('Burglary')).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('shows error state with retry button when API rejects', async () => {
    vi.mocked(api.fetchCrime).mockRejectedValueOnce(new Error('fail'));
    render(<CrimeWidget />);
    await waitFor(() =>
      expect(screen.getByText(/Crime data unavailable/)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows timeout message when request times out', async () => {
    vi.mocked(api.fetchCrime).mockRejectedValueOnce(new Error('TIMEOUT'));
    render(<CrimeWidget />);
    await waitFor(() => expect(screen.getByText(/timed out/i)).toBeInTheDocument());
  });

  it('calls onStatusChange with error when API returns empty array', async () => {
    vi.mocked(api.fetchCrime).mockResolvedValueOnce([]);
    const onStatusChange = vi.fn();
    render(<CrimeWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('error'));
  });

  it('calls onStatusChange with ready when data loads', async () => {
    vi.mocked(api.fetchCrime).mockResolvedValueOnce(mockCrimes);
    const onStatusChange = vi.fn();
    render(<CrimeWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('ready'));
  });
});
