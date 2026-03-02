import { useState, useEffect } from 'react';
import { fetchAirQuality } from '../lib/api';
import type { AirQualityData } from '../types';
import WidgetCard from './WidgetCard';

interface AqiLabel {
  label: string;
  color: string;
  bg: string;
}

function getAqiLabel(aqi: number): AqiLabel {
  if (aqi <= 20)  return { label: 'Good',        color: 'text-green-700',  bg: 'bg-green-100' };
  if (aqi <= 40)  return { label: 'Fair',         color: 'text-lime-700',   bg: 'bg-lime-100'  };
  if (aqi <= 60)  return { label: 'Moderate',     color: 'text-yellow-700', bg: 'bg-yellow-100' };
  if (aqi <= 80)  return { label: 'Poor',         color: 'text-orange-700', bg: 'bg-orange-100' };
  if (aqi <= 100) return { label: 'Very Poor',    color: 'text-red-700',    bg: 'bg-red-100'   };
  return           { label: 'Extremely Poor', color: 'text-purple-700', bg: 'bg-purple-100' };
}

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

export default function AirQualityWidget({ onStatusChange }: Props) {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Wrap load in useCallback with [onStatusChange] as the dependency array.
  //       This removes the need for the eslint-disable comment below and keeps load
  //       stable so it can be safely included in effect deps or passed as a prop.
  // TODO: Distinguish AbortError (8 s timeout) from other network errors and surface
  //       a more specific message to the user.
  // TODO: Implement exponential backoff on the retry button (2 s → 4 s → 8 s).
  const load = () => {
    setLoading(true);
    setError(null);
    onStatusChange?.('loading');
    fetchAirQuality()
      .then((d) => {
        setData(d);
        onStatusChange?.('ready');
      })
      .catch(() => {
        setError('Unable to load air quality data.');
        onStatusChange?.('error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Add a dedicated test file src/test/AirQualityWidget.test.tsx covering:
  //   1. Widget renders a loading skeleton on mount
  //   2. Widget renders the AQI badge and pollutant bars with mocked API data
  //   3. Widget shows an error state with a retry button when the API rejects

  const current = data?.current;
  const aqiMeta = current ? getAqiLabel(current.european_aqi) : null;

  return (
    <WidgetCard
      title="Air Quality"
      icon="💨"
      meta="European AQI"
      isLoading={loading}
      error={error}
      onRetry={load}
    >
      {current && aqiMeta && (
        <div>
          {/* AQI Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${aqiMeta.bg} mb-4`}>
            <span className={`text-3xl font-bold ${aqiMeta.color}`}>{current.european_aqi}</span>
            <span className={`text-sm font-semibold ${aqiMeta.color}`}>{aqiMeta.label}</span>
          </div>

          {/* Pollutant readings */}
          <div className="space-y-3">
            {[
              { label: 'PM2.5',         value: current.pm2_5,         unit: 'µg/m³', threshold: 25  },
              { label: 'PM10',          value: current.pm10,          unit: 'µg/m³', threshold: 50  },
              { label: 'Nitrogen Dioxide (NO₂)', value: current.nitrogen_dioxide, unit: 'µg/m³', threshold: 40 },
            ].map(({ label, value, unit, threshold }) => {
              const pct = Math.min(100, (value / (threshold * 2)) * 100);
              const barColor = pct < 50 ? 'bg-green-400' : pct < 75 ? 'bg-yellow-400' : 'bg-red-400';
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-[#003A70]">{value.toFixed(1)} {unit}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 mt-3">Source: Open-Meteo Air Quality API</p>
        </div>
      )}
    </WidgetCard>
  );
}
