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
// TODO: Add missing widgets to WIDGET_NAMES so the Header error indicator tracks all 9 widgets:
//       planning, transport, facts, localServices, stockportAI
const WIDGET_NAMES: Record<string, string> = {
  weather:    'Weather',
  airQuality: 'Air Quality',
  crime:      'Crime Statistics',
  flood:      'River Monitoring',
};

export default function App() {
  // TODO: Add the 5 missing widgets to the initial statuses map to match WIDGET_NAMES above:
  //       planning, transport, facts, localServices, stockportAI
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
      {/* TODO: Add a global "Refresh all" button to the Header so users can re-fetch
               all widgets without a full page reload */}
      {/* TODO: Consider showing a brief full-dashboard loading skeleton on first mount
               while all widgets initialise, rather than each one independently */}
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
        {/* TODO: Add onStatusChange to PlanningWidget and wrap with show('planning') once
                 PlanningWidget implements the onStatusChange prop pattern */}
        <ErrorBoundary>
          <PlanningWidget className="md:col-span-2" />
        </ErrorBoundary>
        {show('flood') && (
          <ErrorBoundary>
            <FloodWidget onStatusChange={(s) => setStatus('flood', s)} />
          </ErrorBoundary>
        )}
        {/* TODO: Add onStatusChange to TransportWidget and wrap with show('transport')
                 once TransportWidget implements the onStatusChange prop pattern */}
        <ErrorBoundary>
          <TransportWidget />
        </ErrorBoundary>
        {/* TODO: Add onStatusChange to StockportAIWidget and wrap with show('stockportAI')
                 once StockportAIWidget implements the onStatusChange prop pattern */}
        <ErrorBoundary>
          <StockportAIWidget className="lg:col-span-3 md:col-span-2" />
        </ErrorBoundary>
        {/* TODO: Add onStatusChange to LocalServicesWidget and wrap with show('localServices')
                 once LocalServicesWidget implements the onStatusChange prop pattern */}
        <ErrorBoundary>
          <LocalServicesWidget />
        </ErrorBoundary>
        {/* TODO: Add onStatusChange to FactsWidget and wrap with show('facts')
                 once FactsWidget implements the onStatusChange prop pattern */}
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
