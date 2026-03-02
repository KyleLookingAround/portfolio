import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FloodWidget from '../components/FloodWidget';
import * as api from '../lib/api';

vi.mock('../lib/api');

const mockFloodData = {
  items: [
    {
      '@id': 'test-1',
      label: 'Mersey at Stockport',
      parameter: 'level',
      parameterName: 'Water Level',
      station: 'test-station',
      unit: 'http://qudt.org/1.1/vocab/unit#Metre',
      unitName: 'mASD',
      latestReading: {
        '@id': 'reading-1',
        dateTime: '2026-03-02T12:00:00Z',
        value: 1.5,
      },
      stageScale: {
        '@id': 'scale-1',
        highestRecent: { '@id': 'h-1', dateTime: '2026-01-01T00:00:00Z', value: 3.0 },
      },
    },
  ],
};

const noMerseyFloodData = {
  items: [
    {
      '@id': 'test-2',
      label: 'Thames at London',
      parameter: 'level',
      parameterName: 'Water Level',
      station: 'test-station-2',
      unit: 'http://qudt.org/1.1/vocab/unit#Metre',
      unitName: 'mASD',
      latestReading: { '@id': 'reading-2', dateTime: '2026-03-02T12:00:00Z', value: 2.0 },
    },
  ],
};

describe('FloodWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders a loading skeleton on mount', () => {
    vi.mocked(api.fetchFloodData).mockImplementation(() => new Promise(() => {}));
    render(<FloodWidget />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders Mersey river readings with mocked data', async () => {
    vi.mocked(api.fetchFloodData).mockResolvedValueOnce(mockFloodData);
    render(<FloodWidget />);
    await waitFor(() => expect(screen.getByText('Mersey at Stockport')).toBeInTheDocument());
    expect(screen.getByText('1.50')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('shows error state with retry button when API rejects', async () => {
    vi.mocked(api.fetchFloodData).mockRejectedValueOnce(new Error('fail'));
    render(<FloodWidget />);
    await waitFor(() =>
      expect(screen.getByText(/Unable to load flood monitoring data/)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows timeout message when request times out', async () => {
    vi.mocked(api.fetchFloodData).mockRejectedValueOnce(new Error('TIMEOUT'));
    render(<FloodWidget />);
    await waitFor(() => expect(screen.getByText(/timed out/i)).toBeInTheDocument());
  });

  it('calls onStatusChange with error when no Mersey readings are found', async () => {
    vi.mocked(api.fetchFloodData).mockResolvedValueOnce(noMerseyFloodData);
    const onStatusChange = vi.fn();
    render(<FloodWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('error'));
  });

  it('calls onStatusChange with ready when Mersey data loads', async () => {
    vi.mocked(api.fetchFloodData).mockResolvedValueOnce(mockFloodData);
    const onStatusChange = vi.fn();
    render(<FloodWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('ready'));
  });
});
