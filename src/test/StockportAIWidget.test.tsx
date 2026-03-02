import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StockportAIWidget from '../components/StockportAIWidget';
import * as api from '../lib/api';

vi.mock('../lib/api');

const mockWeather = {
  current: {
    temperature_2m: 15,
    apparent_temperature: 13,
    weathercode: 0,
    windspeed_10m: 20,
    precipitation: 0,
    relative_humidity_2m: 65,
  },
  daily: {
    time: ['2026-03-02'],
    weathercode: [0],
    temperature_2m_max: [17],
    temperature_2m_min: [10],
    precipitation_probability_max: [10],
  },
};

const mockAirQuality = {
  current: { european_aqi: 25, pm10: 15.0, pm2_5: 10.0, nitrogen_dioxide: 20.0 },
};

const mockFlood = {
  items: [
    {
      '@id': 'test-1',
      label: 'Mersey at Stockport',
      parameter: 'level',
      parameterName: 'Water Level',
      station: 'test',
      unit: 'http://qudt.org/1.1/vocab/unit#Metre',
      unitName: 'mASD',
      latestReading: { '@id': 'r-1', dateTime: '2026-03-02T12:00:00Z', value: 1.5 },
    },
  ],
};

describe('StockportAIWidget', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders loading state while data sources are fetching', () => {
    vi.mocked(api.fetchWeather).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchAirQuality).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchFloodData).mockImplementation(() => new Promise(() => {}));
    render(<StockportAIWidget />);
    expect(screen.getByText(/Loading data/)).toBeInTheDocument();
  });

  it('renders copy button enabled once data has loaded', async () => {
    vi.mocked(api.fetchWeather).mockResolvedValueOnce(mockWeather);
    vi.mocked(api.fetchAirQuality).mockResolvedValueOnce(mockAirQuality);
    vi.mocked(api.fetchFloodData).mockResolvedValueOnce(mockFlood);
    render(<StockportAIWidget />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Copy AI Prompt/i })).not.toBeDisabled()
    );
  });

  it('renders the correct source-chip states when sources are ready', async () => {
    vi.mocked(api.fetchWeather).mockResolvedValueOnce(mockWeather);
    vi.mocked(api.fetchAirQuality).mockResolvedValueOnce(mockAirQuality);
    vi.mocked(api.fetchFloodData).mockResolvedValueOnce(mockFlood);
    render(<StockportAIWidget />);
    await waitFor(() => expect(screen.getByText('3/3 sources ready')).toBeInTheDocument());
    expect(screen.getByText(/✓ Weather/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Air Quality/)).toBeInTheDocument();
  });

  it('calls onStatusChange with ready when at least one source loads', async () => {
    vi.mocked(api.fetchWeather).mockResolvedValueOnce(mockWeather);
    vi.mocked(api.fetchAirQuality).mockRejectedValueOnce(new Error('fail'));
    vi.mocked(api.fetchFloodData).mockRejectedValueOnce(new Error('fail'));
    const onStatusChange = vi.fn();
    render(<StockportAIWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('ready'));
  });

  it('calls onStatusChange with error when all sources fail', async () => {
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error('fail'));
    vi.mocked(api.fetchAirQuality).mockRejectedValueOnce(new Error('fail'));
    vi.mocked(api.fetchFloodData).mockRejectedValueOnce(new Error('fail'));
    const onStatusChange = vi.fn();
    render(<StockportAIWidget onStatusChange={onStatusChange} />);
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith('error'));
  });
});
