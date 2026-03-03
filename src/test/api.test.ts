import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeather, fetchAirQuality, fetchCrime, fetchPlanning, clearApiCache } from '../lib/api';

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as typeof fetch;

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    clearApiCache(); // ensure no cached responses bleed between tests
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('fetchWeather', () => {
    it('fetches weather data successfully', async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchWeather();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('throws error on HTTP error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchWeather()).rejects.toThrow('HTTP 500');
    });
  });

  describe('fetchAirQuality', () => {
    it('fetches air quality data successfully', async () => {
      const mockData = {
        current: {
          european_aqi: 25,
          pm10: 15,
          pm2_5: 10,
          nitrogen_dioxide: 20,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchAirQuality();
      expect(result).toEqual(mockData);
    });

    it('throws error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchAirQuality()).rejects.toThrow('Network error');
    });
  });

  describe('fetchCrime', () => {
    it('fetches crime data successfully', async () => {
      const mockData = [
        {
          category: 'anti-social-behaviour',
          location: {
            street: { name: 'On or near Test Street' },
            latitude: '53.4083',
            longitude: '-2.1494',
          },
          month: '2024-01',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchCrime();
      expect(result).toEqual(mockData);
    });

    it('tries multiple months if first returns empty', async () => {
      // First call returns empty array
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Second call returns data
      const mockData = [{ category: 'burglary', location: { street: { name: 'Test' }, latitude: '0', longitude: '0' }, month: '2024-01' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchCrime();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('returns empty array if all attempts fail', async () => {
      // All three attempts return empty
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const result = await fetchCrime();
      expect(result).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('fetchPlanning', () => {
    it('fetches planning data successfully', async () => {
      const mockData = {
        count: 2,
        entities: [
          {
            entity: 1,
            name: 'Test Conservation Area',
            reference: 'CA001',
            'entry-date': '2020-01-01',
            'start-date': '2020-01-01',
            dataset: 'conservation-area',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchPlanning();
      expect(result).toEqual(mockData);
    });

    it('handles errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchPlanning()).rejects.toThrow('HTTP 404');
    });
  });
});
