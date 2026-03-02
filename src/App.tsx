import { useState, useCallback } from 'react';
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

type WidgetStatus = 'loading' | 'ready' | 'error';

// Human-readable names shown in the error indicator tooltip
const WIDGET_NAMES: Record<string, string> = {
  weather:    'Weather',
  airQuality: 'Air Quality',
  crime:      'Crime Statistics',
  flood:      'River Monitoring',
};

export default function App() {
  const [statuses, setStatuses] = useState<Record<string, WidgetStatus>>({
    weather:    'loading',
    airQuality: 'loading',
    crime:      'loading',
    flood:      'loading',
  });

  const setStatus = useCallback((id: string, status: WidgetStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const failingWidgets = Object.entries(statuses)
    .filter(([, s]) => s === 'error')
    .map(([id]) => WIDGET_NAMES[id]);

  const show = (id: string) => statuses[id] !== 'error';

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header failingWidgets={failingWidgets} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {show('weather') && (
          <ErrorBoundary>
            <WeatherWidget onStatusChange={(s) => setStatus('weather', s)} />
          </ErrorBoundary>
        )}
        {show('airQuality') && (
          <ErrorBoundary>
            <AirQualityWidget onStatusChange={(s) => setStatus('airQuality', s)} />
          </ErrorBoundary>
        )}
        {show('crime') && (
          <ErrorBoundary>
            <CrimeWidget onStatusChange={(s) => setStatus('crime', s)} />
          </ErrorBoundary>
        )}
        <ErrorBoundary>
          <PlanningWidget className="md:col-span-2" />
        </ErrorBoundary>
        {show('flood') && (
          <ErrorBoundary>
            <FloodWidget onStatusChange={(s) => setStatus('flood', s)} />
          </ErrorBoundary>
        )}
        <ErrorBoundary>
          <TransportWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <StockportAIWidget className="lg:col-span-3 md:col-span-2" />
        </ErrorBoundary>
        <ErrorBoundary>
          <LocalServicesWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <FactsWidget className="lg:col-span-3" />
        </ErrorBoundary>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-gray-400">
        Data from Open-Meteo · UK Police API · planning.data.gov.uk · Environment Agency · National Rail
        &nbsp;·&nbsp;
        Refreshes on page load
      </footer>
    </div>
  );
}
