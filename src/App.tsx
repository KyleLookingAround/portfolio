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

export default function App() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ErrorBoundary>
          <WeatherWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <AirQualityWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <CrimeWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <PlanningWidget className="md:col-span-2" />
        </ErrorBoundary>
        <ErrorBoundary>
          <TransportWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <FactsWidget className="lg:col-span-3" />
        </ErrorBoundary>
        <WeatherWidget />
        <AirQualityWidget />
        <CrimeWidget />
        <FloodWidget />
        <LocalServicesWidget />
        <PlanningWidget className="md:col-span-2" />
        <TransportWidget />
        <FactsWidget className="lg:col-span-3" />
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-gray-400">
        Data from Open-Meteo · UK Police API · planning.data.gov.uk · Environment Agency · National Rail
        &nbsp;·&nbsp;
        Refreshes on page load
      </footer>
    </div>
  );
}
