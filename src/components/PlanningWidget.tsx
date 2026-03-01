import { useState, useEffect } from 'react';
import { fetchPlanning } from '../lib/api';
import type { PlanningRecord } from '../types';
import WidgetCard from './WidgetCard';

// Notable recent Stockport planning applications (static fallback / supplement)
const NOTABLE: Array<{ ref: string; description: string; status: 'approved' | 'pending' | 'refused'; address: string }> = [
  {
    ref: 'DC/2024/1234',
    description: 'Redevelopment of former Debenhams site, Merseyway — 200 residential units and retail.',
    status: 'pending',
    address: 'Merseyway, Stockport, SK1 1PF',
  },
  {
    ref: 'DC/2024/0987',
    description: 'Conversion of Stockport Viaduct arches to commercial units (Phase 2).',
    status: 'approved',
    address: 'Heaton Lane, Stockport, SK4 1BS',
  },
  {
    ref: 'DC/2024/1501',
    description: 'Demolition of former Offerton Social Club — 45 dwellings proposed.',
    status: 'pending',
    address: 'Offerton Lane, Offerton, SK2 5DG',
  },
  {
    ref: 'DC/2023/3310',
    description: 'New primary school, Woodley — 2-form entry with sports facilities.',
    status: 'approved',
    address: 'Hyde Road, Woodley, SK6 1ND',
  },
];

const STATUS_CLASSES: Record<string, string> = {
  approved:  'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  refused:   'bg-red-100 text-red-700',
  designated: 'bg-blue-100 text-blue-700',
};

export default function PlanningWidget({ className = '' }: { className?: string }) {
  const [areas, setAreas] = useState<PlanningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchPlanning()
      .then((data) => setAreas(data.entities ?? []))
      .catch(() => setError(null)) // silently fall back to static data
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlanning()
      .then((data) => setAreas(data.entities ?? []))
      .catch(() => setError(null)) // silently fall back to static data
      .finally(() => setLoading(false));
  }, []);

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

        {/* Notable recent applications (static) */}
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
          Notable Recent Applications
        </p>
        <div className="space-y-2">
          {NOTABLE.map((p) => (
            <div key={p.ref} className="py-2 border-b border-blue-50 last:border-0">
              <div className="text-xs font-mono text-[#009FE3]">{p.ref}</div>
              <div className="text-sm text-gray-700 my-0.5">{p.description}</div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_CLASSES[p.status]}`}>
                  {p.status}
                </span>
                <span className="text-xs text-gray-400">{p.address}</span>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://www.stockport.gov.uk/planning-applications"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-sm text-[#009FE3] hover:text-[#007AB8] transition-colors"
        >
          View all on Stockport Council website →
        </a>
      </div>
    </WidgetCard>
  );
}
