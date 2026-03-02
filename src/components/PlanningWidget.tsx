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

// TODO: Add an onStatusChange prop (matching the widget pattern in CLAUDE.md) so App.tsx
//       can track this widget in the global status map and surface failures in the Header
//       error indicator. Signature: onStatusChange?: (s: 'loading' | 'ready' | 'error') => void
export default function PlanningWidget({ className = '' }: { className?: string }) {
  const [areas, setAreas] = useState<PlanningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Wrap load in useCallback (adding [onStatusChange] as a dep once that prop exists)
  //       to make it stable and avoid potential stale-closure bugs
  // TODO: Add onStatusChange?.('loading') / onStatusChange?.('ready') / onStatusChange?.('error')
  //       calls inside load() once the prop is added
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPlanning()
      .then((data) => setAreas(data.entities ?? []))
      // TODO: Fix silent error suppression — replace setError(null) with a real user-facing
      //       message, e.g. setError('Unable to load planning data.') so the WidgetCard
      //       error state is shown. Also call onStatusChange?.('error') once that prop exists.
      .catch(() => setError(null)) // silently fall back to static data
      .finally(() => setLoading(false));
  }, []);

  // TODO: Remove this duplicate fetchPlanning() call — it replicates load() above.
  //       Replace with: useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetchPlanning()
      .then((data) => setAreas(data.entities ?? []))
      .catch(() => setError(null)) // silently fall back to static data
      .finally(() => setLoading(false));
  }, []);

  // TODO: Add a dedicated test file src/test/PlanningWidget.test.tsx covering:
  //   1. Widget renders a loading skeleton on mount
  //   2. Widget renders conservation areas when API resolves with data
  //   3. Widget shows an error state (with retry button) when the API rejects

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
