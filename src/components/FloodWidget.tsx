import { useState, useEffect, useCallback } from 'react';
import { fetchFloodData } from '../lib/api';
import type { FloodMeasure } from '../types';
import WidgetCard from './WidgetCard';

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

export default function FloodWidget({ onStatusChange }: Props) {
  const [measures, setMeasures] = useState<FloodMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    onStatusChange?.('loading');
    fetchFloodData()
      .then((data) => {
        const merseyMeasures = data.items.filter((m) => {
          if (!m.latestReading) return false;
          const label = m.label.toLowerCase();
          return label.includes('mersey') && !label.includes('mersea');
        });
        const top3 = merseyMeasures.slice(0, 3);
        setMeasures(top3);
        if (top3.length > 0) {
          onStatusChange?.('ready');
        } else {
          onStatusChange?.('error');
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error && err.message === 'TIMEOUT'
          ? 'Flood data request timed out. Please check your connection.'
          : 'Unable to load flood monitoring data.';
        setError(msg);
        onStatusChange?.('error');
      })
      .finally(() => setLoading(false));
  }, [onStatusChange]);

  useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect

  function getStatusColor(measure: FloodMeasure): string {
    if (!measure.latestReading || !measure.stageScale?.highestRecent) return 'bg-gray-100';

    const current = measure.latestReading.value;
    const highest = measure.stageScale.highestRecent.value;
    const percentage = (current / highest) * 100;

    if (percentage > 80) return 'bg-red-100 border-red-300';
    if (percentage > 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  }

  function getStatusLabel(measure: FloodMeasure): string {
    if (!measure.latestReading || !measure.stageScale?.highestRecent) return 'Normal';

    const current = measure.latestReading.value;
    const highest = measure.stageScale.highestRecent.value;
    const percentage = (current / highest) * 100;

    if (percentage > 80) return 'High';
    if (percentage > 60) return 'Elevated';
    return 'Normal';
  }

  function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <WidgetCard
      title="River Monitoring"
      icon="🌊"
      meta="Environment Agency"
      isLoading={loading}
      error={error}
      onRetry={load}
    >
      {measures.length > 0 && (
        <div className="space-y-3">
          {measures.map((measure) => {
            const reading = measure.latestReading;
            if (!reading) return null;

            const stationName = measure.label.split('-')[0].trim();
            const statusColor = getStatusColor(measure);
            const statusLabel = getStatusLabel(measure);

            return (
              <div
                key={measure['@id']}
                className={`border rounded-lg p-3 ${statusColor}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{stationName}</div>
                    <div className="text-xs text-gray-500">{measure.parameterName}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/70 font-medium">
                    {statusLabel}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#003A70]">
                    {reading.value.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600">{measure.unitName}</span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Updated: {formatDateTime(reading.dateTime)}
                </div>

                {measure.stageScale?.highestRecent && (
                  <div className="mt-2 text-xs text-gray-500">
                    Recent high: {measure.stageScale.highestRecent.value.toFixed(2)} {measure.unitName}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-blue-100 pt-3 mt-3">
            <a
              href="https://check-for-flooding.service.gov.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#003A70] hover:text-[#009FE3] transition-colors"
            >
              Check flood warnings →
            </a>
          </div>

          <p className="text-xs text-gray-400">
            River Mersey flows through Stockport town centre under the historic viaduct.
          </p>
        </div>
      )}
    </WidgetCard>
  );
}
