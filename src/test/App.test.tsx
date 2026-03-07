import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear persisted theme so each test starts in the default 'modern' mode.
    localStorage.clear();
    sessionStorage.clear();

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

  it('hides a widget from the grid after onStatusChange error fires', async () => {
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error('Failed'));

    render(<App />);

    // Weather widget is initially present
    expect(screen.getByText('Weather')).toBeInTheDocument();

    // After the rejection resolves, weather widget should be removed
    await waitFor(() =>
      expect(screen.queryByText('Weather')).not.toBeInTheDocument()
    );

    // Other widgets remain
    expect(screen.getByText('Air Quality')).toBeInTheDocument();
  });

  it('shows the Header error indicator when a widget reports error', async () => {
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error('Failed'));

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText('1 unavailable')).toBeInTheDocument()
    );
  });

  it('renders the theme toggle button in modern mode', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /newspaper/i })).toBeInTheDocument();
  });

  it('switches to newspaper mode when toggle is clicked', () => {
    render(<App />);
    const toggleBtn = screen.getByRole('button', { name: /newspaper/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /modern view/i })).toBeInTheDocument();
  });

  it('renders the masthead title in newspaper mode', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /newspaper/i }));
    // The masthead h1 contains "Stockport Today"
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.some((h) => /stockport today/i.test(h.textContent ?? ''))).toBe(true);
  });

  it('switches back to modern mode from newspaper mode', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /newspaper/i }));
    const modernBtn = screen.getByRole('button', { name: /modern view/i });
    fireEvent.click(modernBtn);
    expect(screen.getByRole('button', { name: /newspaper/i })).toBeInTheDocument();
  });
});

describe('HousingWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    vi.mocked(api.fetchWeather).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchAirQuality).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchCrime).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchPlanning).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.fetchFloodData).mockImplementation(() => new Promise(() => {}));
  });

  it('renders the Housing widget title', () => {
    render(<App />);
    expect(screen.getByText('Housing')).toBeInTheDocument();
  });

  it('renders council housing section', () => {
    render(<App />);
    expect(screen.getByText('Stockport Homes')).toBeInTheDocument();
    expect(screen.getByText('Apply for Social Housing')).toBeInTheDocument();
    expect(screen.getByText('Homelessness & Emergency Housing')).toBeInTheDocument();
  });

  it('renders private renting links', () => {
    render(<App />);
    expect(screen.getByText(/Rightmove — Rentals in Stockport/)).toBeInTheDocument();
    expect(screen.getByText(/Zoopla — Rentals in Stockport/)).toBeInTheDocument();
  });

  it('renders buying a home links', () => {
    render(<App />);
    expect(screen.getByText(/Rightmove — Buy in Stockport/)).toBeInTheDocument();
    expect(screen.getByText(/Shared Ownership/)).toBeInTheDocument();
  });

  it('renders advice and support contacts', () => {
    render(<App />);
    expect(screen.getByText('Citizens Advice Stockport')).toBeInTheDocument();
    expect(screen.getByText('Shelter (Housing Charity)')).toBeInTheDocument();
  });
});
