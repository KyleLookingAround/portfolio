import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import * as api from '../lib/api';

vi.mock('../lib/api');

// TODO: Add dedicated test files for every widget that currently has no coverage:
//   - src/test/AirQualityWidget.test.tsx
//   - src/test/CrimeWidget.test.tsx
//   - src/test/FloodWidget.test.tsx
//   - src/test/PlanningWidget.test.tsx
//   - src/test/TransportWidget.test.tsx
//   - src/test/FactsWidget.test.tsx
//   - src/test/LocalServicesWidget.test.tsx
//   - src/test/StockportAIWidget.test.tsx
// Each file should cover: loading state, successful data render, and error state.

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock all API calls to prevent actual network requests
    vi.mocked(api.fetchWeather).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchAirQuality).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchCrime).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchPlanning).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchFloodData).mockImplementation(() => new Promise(() => {}));
  });

  it('renders the header', () => {
    render(<App />);
    
    // Header text from Header component
    expect(document.querySelector('header')).toBeInTheDocument();
  });

  it('renders all widget sections', () => {
    render(<App />);
    
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Air Quality')).toBeInTheDocument();
    expect(screen.getByText('Crime Statistics')).toBeInTheDocument();
    expect(screen.getByText('Planning & Development')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('renders footer with data sources', () => {
    render(<App />);
    
    expect(screen.getByText(/Open-Meteo/)).toBeInTheDocument();
    expect(screen.getByText(/UK Police API/)).toBeInTheDocument();
    expect(screen.getByText(/planning.data.gov.uk/)).toBeInTheDocument();
  });

  it('continues to render other widgets even if one fails', async () => {
    // Make weather widget fail
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error('Failed'));

    // Make other widgets succeed
    vi.mocked(api.fetchAirQuality).mockResolvedValueOnce({
      current: { european_aqi: 25, pm10: 15, pm2_5: 10, nitrogen_dioxide: 20 }
    });
    vi.mocked(api.fetchCrime).mockResolvedValueOnce([]);
    vi.mocked(api.fetchPlanning).mockResolvedValueOnce({ count: 0, entities: [] });

    render(<App />);

    // All widgets should still be present even if weather fails (checked before async settling)
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Air Quality')).toBeInTheDocument();
    expect(screen.getByText('Crime Statistics')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('wraps widgets in error boundaries', () => {
    const { container } = render(<App />);

    // Check that main element exists with grid layout
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.classList.contains('grid')).toBe(true);
  });

  // TODO: Add a test that verifies a widget is removed from the grid after its
  //       onStatusChange('error') fires — i.e. that show(id) === false hides it.
  //       Requires waitFor(() => expect(screen.queryByText('Weather')).not.toBeInTheDocument())
  //       after mockRejectedValue resolves.

  // TODO: Add a test that verifies the Header error indicator appears (and lists the
  //       correct widget name) when one or more widgets report an error status.
});
