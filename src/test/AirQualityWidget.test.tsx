import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AirQualityWidget from '../components/AirQualityWidget';
import * as api from '../lib/api';

vi.mock('../lib/api');

const mockData = {
  current: { european_aqi: 25, pm10: 15.0, pm2_5: 10.0, nitrogen_dioxide: 20.0 },
};

describe('AirQualityWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders a loading skeleton on mount', () => {
    vi.mocked(api.fetchAirQuality).mockImplementation(() => new Promise(() => {}));
    render(<AirQualityWidget />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders AQI badge and pollutant bars with mocked data', async () => {
    vi.mocked(api.fetchAirQuality).mockResolvedValueOnce(mockData);
    render(<AirQualityWidget />);
    await waitFor(() => expect(screen.getByText('25')).toBeInTheDocument());
    expect(screen.getByText('Fair')).toBeInTheDocument();
    expect(screen.getByText('PM2.5')).toBeInTheDocument();
    expect(screen.getByText('PM10')).toBeInTheDocument();
  });

  it('shows error state with retry button when API rejects', async () => {
    vi.mocked(api.fetchAirQuality).mockRejectedValueOnce(new Error('fail'));
    render(<AirQualityWidget />);
    await waitFor(() =>
      expect(screen.getByText(/Unable to load air quality data/)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows timeout message when request times out', async () => {
    vi.mocked(api.fetchAirQuality).mockRejectedValueOnce(new Error('TIMEOUT'));
    render(<AirQualityWidget />);
    await waitFor(() => expect(screen.getByText(/timed out/i)).toBeInTheDocument());
  });

  it('calls onStatusChange with loading then ready on success', async () => {
    vi.mocked(api.fetchAirQuality).mockResolvedValueOnce(mockData);
    const onStatusChange = vi.fn();
    render(<AirQualityWidget onStatusChange={onStatusChange} />);
    expect(onStatusChange).toHaveBeenCalledWith('loading');
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('ready'));
  });

  it('calls onStatusChange with error when API rejects', async () => {
    vi.mocked(api.fetchAirQuality).mockRejectedValueOnce(new Error('fail'));
    const onStatusChange = vi.fn();
    render(<AirQualityWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('error'));
  });
});
