import { useState, useEffect, useCallback } from 'react';
import { fetchPlanning } from '../lib/api';
import type { PlanningRecord } from '../types';
import WidgetCard from './WidgetCard';

const STATUS_CLASSES: Record<string, string> = {
  approved:  'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  refused:   'bg-red-100 text-red-700',
  designated: 'bg-blue-100 text-blue-700',
};

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
  className?: string;
}

export default function PlanningWidget({ onStatusChange, className = '' }: Props) {
  const [areas, setAreas] = useState<PlanningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    onStatusChange?.('loading');
    fetchPlanning()
      .then((data) => {
        setAreas(data.entities ?? []);
        onStatusChange?.('ready');
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error && err.message === 'TIMEOUT'
          ? 'Planning data request timed out. Please check your connection.'
          : 'Unable to load planning data.';
        setError(msg);
        onStatusChange?.('error');
      })
      .finally(() => setLoading(false));
  }, [onStatusChange]);

  useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect

  return (
    <WidgetCard
      title="Planning & Development"
      icon="🏗️"
      meta="Stockport MBC"
      isLoading={loading}
      error={error}
      onRetry={load}
      className={className}
    >
      <div>
        {/* Conservation areas from live API */}
        {areas.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
              Conservation Areas ({areas.length} shown)
            </p>
            <div className="space-y-2">
              {areas.map((a) => (
                <div key={a.entity} className="flex items-start justify-between gap-2 py-2 border-b border-blue-50 last:border-0">
                  <div>
                    <div className="text-xs font-mono text-[#009FE3]">{a.reference}</div>
                    <div className="text-sm text-gray-700">{a.name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_CLASSES.designated}`}>
                      Designated
                    </span>
                    {a['start-date'] && (
                      <span className="text-xs text-gray-400">Since {a['start-date'].slice(0, 4)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href="https://www.stockport.gov.uk/find-planning-applications"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-sm text-[#009FE3] hover:text-[#007AB8] transition-colors"
        >
          Search all planning applications on Stockport Council website →
        </a>
      </div>
    </WidgetCard>
  );
}
