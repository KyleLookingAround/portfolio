import { useState, useEffect, useCallback } from 'react';
import { fetchCrime } from '../lib/api';
import type { CrimeRecord } from '../types';
import WidgetCard from './WidgetCard';

const CRIME_LABELS: Record<string, string> = {
  'violent-crime':           'Violent Crime',
  'anti-social-behaviour':   'Anti-Social Behaviour',
  'vehicle-crime':           'Vehicle Crime',
  'criminal-damage-arson':   'Criminal Damage & Arson',
  'drugs':                   'Drugs',
  'burglary':                'Burglary',
  'theft-from-the-person':   'Theft From Person',
  'shoplifting':             'Shoplifting',
  'public-order':            'Public Order',
  'other-theft':             'Other Theft',
  'bicycle-theft':           'Bicycle Theft',
  'robbery':                 'Robbery',
  'possession-of-weapons':   'Weapons Possession',
  'other-crime':             'Other Crime',
};

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

export default function CrimeWidget({ onStatusChange }: Props) {
  const [crimes, setCrimes] = useState<CrimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    onStatusChange?.('loading');
    fetchCrime()
      .then((data) => {
        setCrimes(data);
        if (data.length > 0) {
          setMonth(data[0].month);
          onStatusChange?.('ready');
        } else {
          onStatusChange?.('error');
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error && err.message === 'TIMEOUT'
          ? 'Crime data request timed out. Please check your connection.'
          : 'Crime data unavailable. The Police API may be temporarily down.';
        setError(msg);
        onStatusChange?.('error');
      })
      .finally(() => setLoading(false));
  }, [onStatusChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Tally by category
  const tally: Record<string, number> = {};
  crimes.forEach((c) => {
    tally[c.category] = (tally[c.category] ?? 0) + 1;
  });
  const sorted = Object.entries(tally).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxCount = sorted[0]?.[1] ?? 1;

  const monthLabel = month
    ? new Date(month + '-01').toLocaleString('en-GB', { month: 'long', year: 'numeric' })
    : '';

  return (
    <WidgetCard
      title="Crime Statistics"
      icon="🚔"
      meta={monthLabel}
      isLoading={loading}
      error={error}
      onRetry={load}
    >
      {crimes.length > 0 && (
        <div>
          {/* Summary pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm">
              Total: <strong className="text-[#003A70]">{crimes.length}</strong>
            </span>
            <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm">
              Categories: <strong className="text-[#003A70]">{Object.keys(tally).length}</strong>
            </span>
          </div>

          {/* Bar chart */}
          <ul className="space-y-2">
            {sorted.map(([cat, count]) => {
              const label = CRIME_LABELS[cat] ?? cat.replace(/-/g, ' ');
              const pct = Math.round((count / maxCount) * 100);
              return (
                <li key={cat} className="flex items-center gap-2 text-sm">
                  <span className="w-36 text-gray-600 truncate shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#009FE3] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-semibold text-[#003A70]">{count}</span>
                </li>
              );
            })}
          </ul>

          <p className="text-xs text-gray-400 mt-3">
            Source: data.police.uk — Greater Manchester Police
          </p>
        </div>
      )}
    </WidgetCard>
  );
}
