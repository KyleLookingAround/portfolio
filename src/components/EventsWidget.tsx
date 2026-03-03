import { useState, useEffect, useCallback } from 'react';
import { fetchEventbriteEvents } from '../lib/api';
import type { EventbriteEvent } from '../types';
import WidgetCard from './WidgetCard';

// Curated recurring / annual events in Stockport — always shown as a base layer.
const RECURRING_EVENTS = [
  {
    name: 'Stockport Market',
    detail: 'Tue, Fri & Sat · Stockport Market Place',
    link: 'https://www.stockportmarket.com/',
    icon: '🛒',
  },
  {
    name: 'Stockport Food & Drink Festival',
    detail: 'Annual · Merseyway & Market',
    link: 'https://www.visitstockport.co.uk/',
    icon: '🍕',
  },
  {
    name: 'Stockport Jazz Festival',
    detail: 'Annual · Various venues',
    link: 'https://stockportjazz.co.uk/',
    icon: '🎷',
  },
  {
    name: 'Stockport Plaza Cinema',
    detail: 'Reg. screenings + special events · Mersey Square',
    link: 'https://stockportplaza.co.uk/',
    icon: '🎬',
  },
  {
    name: 'Hat Works Museum',
    detail: 'Open Tue–Sun · Wellington Road South',
    link: 'https://www.stockport.gov.uk/topic/hat-works',
    icon: '🎩',
  },
  {
    name: 'Bramall Hall',
    detail: 'Open daily · Bramhall Park',
    link: 'https://www.stockport.gov.uk/landing/bramall-hall',
    icon: '🏰',
  },
  {
    name: "What's On Stockport",
    detail: 'Full local events listing',
    link: 'https://www.whatsoninstockport.com/',
    icon: '📅',
  },
];

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
  className?: string;
}

export default function EventsWidget({ onStatusChange, className = '' }: Props) {
  const [liveEvents, setLiveEvents] = useState<EventbriteEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const token = import.meta.env.VITE_EVENTBRITE_TOKEN as string | undefined;

  const loadLive = useCallback(() => {
    if (!token) return;
    setLoading(true);
    onStatusChange?.('loading');
    fetchEventbriteEvents(token)
      .then((data) => {
        setLiveEvents(data.events ?? []);
        setLastUpdated(new Date());
        onStatusChange?.('ready');
      })
      .catch(() => {
        onStatusChange?.('ready');
      })
      .finally(() => setLoading(false));
  }, [token, onStatusChange]);

  useEffect(() => {
    if (token) {
      loadLive(); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      onStatusChange?.('ready');
    }
  }, [token, loadLive, onStatusChange]);

  return (
    <WidgetCard
      title="Local Events"
      icon="📅"
      meta="Stockport"
      isLoading={loading}
      className={className}
      lastUpdated={lastUpdated ?? undefined}
    >
      <div>
        {/* Live Eventbrite results */}
        {liveEvents.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
              Upcoming Events
            </p>
            <div className="space-y-2">
              {liveEvents.slice(0, 5).map((evt) => (
                <a
                  key={evt.id}
                  href={evt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 border-b border-blue-50 last:border-0 hover:text-[#009FE3] transition-colors"
                >
                  <div className="text-sm font-medium text-gray-700 hover:text-[#009FE3]">
                    {evt.name.text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatEventDate(evt.start.local)}
                    {evt.venue?.name ? ` · ${evt.venue.name}` : ''}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Recurring events — always visible */}
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
          Regular &amp; Annual Events
        </p>
        <div className="space-y-1">
          {RECURRING_EVENTS.map((evt) => (
            <a
              key={evt.link}
              href={evt.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 py-2 border-b border-blue-50 last:border-0 group"
            >
              <span className="text-lg shrink-0 mt-0.5">{evt.icon}</span>
              <div>
                <div className="text-sm font-medium text-[#003A70] group-hover:text-[#009FE3] transition-colors">
                  {evt.name}
                </div>
                <div className="text-xs text-gray-500">{evt.detail}</div>
              </div>
            </a>
          ))}
        </div>

        {!token && (
          <p className="text-xs text-gray-400 mt-3 border-t border-blue-50 pt-3">
            Add <code className="bg-gray-100 px-1 rounded">VITE_EVENTBRITE_TOKEN</code> to show live events.{' '}
            <a href="https://www.eventbrite.com/platform/api" target="_blank" rel="noopener noreferrer" className="text-[#009FE3] hover:underline">
              Get a free token →
            </a>
          </p>
        )}
      </div>
    </WidgetCard>
  );
}
