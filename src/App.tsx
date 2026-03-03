import { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import WeatherWidget from './components/WeatherWidget';
import AirQualityWidget from './components/AirQualityWidget';
import CrimeWidget from './components/CrimeWidget';
import PlanningWidget from './components/PlanningWidget';
import TransportWidget from './components/TransportWidget';
import FactsWidget from './components/FactsWidget';
import ErrorBoundary from './components/ErrorBoundary';
import FloodWidget from './components/FloodWidget';
import LocalServicesWidget from './components/LocalServicesWidget';
import StockportAIWidget from './components/StockportAIWidget';
import { ThemeContext } from './lib/ThemeContext';
import type { Theme } from './lib/ThemeContext';

type WidgetStatus = 'loading' | 'ready' | 'error';

// Human-readable names shown in the error indicator tooltip
const WIDGET_NAMES: Record<string, string> = {
  weather:       'Weather',
  airQuality:    'Air Quality',
  crime:         'Crime Statistics',
  flood:         'River Monitoring',
  planning:      'Planning & Development',
  transport:     'Transport',
  facts:         'Stockport by Numbers',
  localServices: 'Local Services',
  stockportAI:   'Plan Your Day Out',
};

export default function App() {
  const [theme, setTheme] = useState<Theme>('modern');

  const [statuses, setStatuses] = useState<Record<string, WidgetStatus>>({
    weather:       'loading',
    airQuality:    'loading',
    crime:         'loading',
    flood:         'loading',
    planning:      'loading',
    transport:     'loading',
    facts:         'ready',
    localServices: 'loading',
    stockportAI:   'loading',
  });

  const setStatus = useCallback((id: string, status: WidgetStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  // Stable per-widget handlers — memoised so widgets with useCallback([onStatusChange])
  // deps don't re-fetch every time App re-renders (e.g. when another widget updates).
  const onStatus = useMemo(() => ({
    weather:       (s: WidgetStatus) => setStatus('weather', s),
    airQuality:    (s: WidgetStatus) => setStatus('airQuality', s),
    crime:         (s: WidgetStatus) => setStatus('crime', s),
    flood:         (s: WidgetStatus) => setStatus('flood', s),
    planning:      (s: WidgetStatus) => setStatus('planning', s),
    transport:     (s: WidgetStatus) => setStatus('transport', s),
    localServices: (s: WidgetStatus) => setStatus('localServices', s),
    stockportAI:   (s: WidgetStatus) => setStatus('stockportAI', s),
  }), [setStatus]);

  const failingWidgets = Object.entries(statuses)
    .filter(([, s]) => s === 'error')
    .map(([id]) => WIDGET_NAMES[id]);

  const show = (id: string) => statuses[id] !== 'error';

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
    <div
      data-theme={theme}
      className={`min-h-screen transition-colors duration-300 ${theme === 'newspaper' ? 'bg-[#f5f0e8]' : 'bg-[#f0f4f8]'}`}
    >
      <Header failingWidgets={failingWidgets} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {show('weather') && (
          <ErrorBoundary>
            <WeatherWidget onStatusChange={onStatus.weather} />
          </ErrorBoundary>
        )}
        {show('airQuality') && (
          <ErrorBoundary>
            <AirQualityWidget onStatusChange={onStatus.airQuality} />
          </ErrorBoundary>
        )}
        {show('crime') && (
          <ErrorBoundary>
            <CrimeWidget onStatusChange={onStatus.crime} />
          </ErrorBoundary>
        )}
        {show('planning') && (
          <ErrorBoundary>
            <PlanningWidget
              className="md:col-span-2"
              onStatusChange={onStatus.planning}
            />
          </ErrorBoundary>
        )}
        {show('flood') && (
          <ErrorBoundary>
            <FloodWidget onStatusChange={onStatus.flood} />
          </ErrorBoundary>
        )}
        {show('transport') && (
          <ErrorBoundary>
            <TransportWidget onStatusChange={onStatus.transport} />
          </ErrorBoundary>
        )}
        {show('stockportAI') && (
          <ErrorBoundary>
            <StockportAIWidget
              className="lg:col-span-3 md:col-span-2"
              onStatusChange={onStatus.stockportAI}
            />
          </ErrorBoundary>
        )}
        {show('localServices') && (
          <ErrorBoundary>
            <LocalServicesWidget onStatusChange={onStatus.localServices} />
          </ErrorBoundary>
        )}
        {show('facts') && (
          <ErrorBoundary>
            <FactsWidget className="lg:col-span-3" />
          </ErrorBoundary>
        )}
      </main>

      <footer className={`max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs ${
        theme === 'newspaper'
          ? 'border-t-2 border-black text-gray-600 font-serif mt-2'
          : 'text-gray-400'
      }`}>
        Data from Open-Meteo · UK Police API · planning.data.gov.uk · Environment Agency · National Rail
        &nbsp;·&nbsp;
        Refreshes on page load
      </footer>
    </div>
    </ThemeContext.Provider>
  );
}
