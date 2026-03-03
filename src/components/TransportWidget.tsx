import { useState, useEffect, useCallback } from 'react';
import { fetchTfGMDepartures } from '../lib/api';
import type { TfGMDeparture } from '../types';
import WidgetCard from './WidgetCard';

const RAIL_SERVICES = [
  { badge: 'TPE', label: 'TransPennine Express', route: 'Stockport ↔ Manchester Piccadilly', info: '~8 min · every 15 min off-peak', color: 'bg-[#003A70]' },
  { badge: 'AW',  label: 'Avanti West Coast',   route: 'Stockport ↔ London Euston',          info: '~2h journey · frequent departures', color: 'bg-purple-700' },
  { badge: 'NT',  label: 'Northern Trains',      route: 'Stockport ↔ Sheffield via Hazel Grove', info: 'Hourly service', color: 'bg-[#003A70]' },
];

const LINKS = [
  { label: '🚂 Live train departures',     href: 'https://www.nationalrail.co.uk/live-trains/departures/stockport/' },
  { label: '🚌 TfGM journey planner',      href: 'https://tfgm.com/plan-a-journey' },
  { label: '🐝 Bee Network buses & trams', href: 'https://tfgm.com/' },
  { label: '🚲 Cycling routes — Stockport', href: 'https://cycling.tfgm.com/' },
  { label: '🅿️ Stockport car parks',      href: 'https://www.stockport.gov.uk/topic/parking' },
];

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

export default function TransportWidget({ onStatusChange }: Props) {
  const [departures, setDepartures] = useState<TfGMDeparture[]>([]);
  const [tfgmLoading, setTfgmLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const apiKey = import.meta.env.VITE_TFGM_API_KEY as string | undefined;

  const loadDepartures = useCallback(() => {
    if (!apiKey) return;
    setTfgmLoading(true);
    fetchTfGMDepartures(apiKey)
      .then((data) => {
        setDepartures(data.departures ?? []);
        setLastUpdated(new Date());
      })
      .catch(() => {
        // silently degrade — static content still shown
      })
      .finally(() => setTfgmLoading(false));
  }, [apiKey]);

  useEffect(() => {
    onStatusChange?.('ready');
    loadDepartures(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [onStatusChange, loadDepartures]);

  return (
    <WidgetCard
      title="Transport"
      icon="🚆"
      meta="Stockport Station"
      lastUpdated={lastUpdated ?? undefined}
    >
      {/* Live TfGM departures (if API key configured and data arrived) */}
      {tfgmLoading && (
        <p className="text-xs text-gray-400 mb-3 animate-pulse">Loading live departures…</p>
      )}
      {departures.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
            Live Departures
          </p>
          <div className="space-y-1">
            {departures.slice(0, 5).map((dep, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-blue-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${dep.type === 'tram' ? 'bg-yellow-400 text-black' : 'bg-[#003A70] text-white'}`}>
                    {dep.type === 'tram' ? '🚃' : '🚌'}
                  </span>
                  <span className="text-gray-700 truncate max-w-[10rem]">{dep.destination}</span>
                </div>
                <span className="font-semibold text-[#003A70] shrink-0">
                  {dep.wait === 0 ? 'Due' : `${dep.wait} min`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rail services */}
      <div className="space-y-2 mb-5">
        {RAIL_SERVICES.map((s) => (
          <div key={s.badge} className="flex items-center gap-3">
            <span className={`${s.color} text-white text-xs font-bold px-2 py-1 rounded min-w-[2.5rem] text-center`}>
              {s.badge}
            </span>
            <div>
              <div className="text-sm font-medium text-gray-700">{s.route}</div>
              <div className="text-xs text-[#009FE3]">{s.info}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="border-t border-blue-100 pt-2">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#003A70] hover:text-[#009FE3] transition-colors py-2.5 border-b border-blue-50 last:border-0"
          >
            {l.label} →
          </a>
        ))}
      </div>

      {!apiKey && (
        <p className="text-xs text-gray-400 mt-3 border-t border-blue-50 pt-3">
          Add <code className="bg-gray-100 px-1 rounded">VITE_TFGM_API_KEY</code> to show live bus &amp; tram departures.{' '}
          <a href="https://developer.tfgm.com/" target="_blank" rel="noopener noreferrer" className="text-[#009FE3] hover:underline">
            Get a free key →
          </a>
        </p>
      )}
    </WidgetCard>
  );
}
