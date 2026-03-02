import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeatherWidget from '../components/WeatherWidget';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('WeatherWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.fetchWeather).mockImplementation(() => new Promise(() => {}));
    
    render(<WeatherWidget />);
    
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders weather data when loaded successfully', async () => {
    const mockData = {
      current: {
        temperature_2m: 15.5,
        apparent_temperature: 13.2,
        weathercode: 1,
        windspeed_10m: 10.2,
        precipitation: 0,
        relative_humidity_2m: 70,
      },
      daily: {
        time: ['2024-01-01', '2024-01-02', '2024-01-03'],
        weathercode: [1, 2, 3],
        temperature_2m_max: [16, 17, 15],
        temperature_2m_min: [10, 11, 9],
        precipitation_probability_max: [20, 30, 40],
      },
    };

    vi.mocked(api.fetchWeather).mockResolvedValueOnce(mockData);
    
    render(<WeatherWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument();
    });

    expect(screen.getByText(/10.*km\/h/)).toBeInTheDocument();
    expect(screen.getByText(/70/)).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error('Network error'));

    render(<WeatherWidget />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load weather data.')).toBeInTheDocument();
    });
  });

  it('shows timeout message when request times out', async () => {
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error('TIMEOUT'));
    render(<WeatherWidget />);
    await waitFor(() =>
      expect(screen.getByText(/timed out/i)).toBeInTheDocument()
    );
  });

  it('retry button works after error', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error('Network error'));
    
    render(<WeatherWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load weather data.')).toBeInTheDocument();
    });

    const mockData = {
      current: {
        temperature_2m: 15,
        apparent_temperature: 13,
        weathercode: 1,
        windspeed_10m: 10,
        precipitation: 0,
        relative_humidity_2m: 70,
      },
      daily: {
        time: ['2024-01-01'],
        weathercode: [1],
        temperature_2m_max: [16],
        temperature_2m_min: [10],
        precipitation_probability_max: [20],
      },
    };
    vi.mocked(api.fetchWeather).mockResolvedValueOnce(mockData);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it('renders forecast for multiple days', async () => {
    const mockData = {
      current: {
        temperature_2m: 15,
        apparent_temperature: 13,
        weathercode: 1,
        windspeed_10m: 10,
        precipitation: 0,
        relative_humidity_2m: 70,
      },
      daily: {
        time: ['2024-01-01', '2024-01-02', '2024-01-03'],
        weathercode: [1, 2, 3],
        temperature_2m_max: [16, 17, 15],
        temperature_2m_min: [10, 11, 9],
        precipitation_probability_max: [20, 30, 40],
      },
    };

    vi.mocked(api.fetchWeather).mockResolvedValueOnce(mockData);
    
    render(<WeatherWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    // Check that forecast days are rendered - looking for the text in the elements
    const percentages = screen.getAllByText(/%/);
    expect(percentages.length).toBeGreaterThan(0);
  });
});
