import { useState, useEffect, useCallback } from 'react';
import { fetchNHSServices } from '../lib/api';
import type { NHSService } from '../types';
import WidgetCard from './WidgetCard';

// Static fallback data — always useful even without an API key.
const STATIC_SERVICES = [
  {
    name: 'Stepping Hill Hospital',
    type: 'NHS Trust',
    address: 'Poplar Grove, Stockport, SK2 7JE',
    phone: '0161 483 1010',
    link: 'https://www.stockport.nhs.uk/',
    icon: '🏥',
  },
  {
    name: 'Stockport Walk-In Centre',
    type: 'Walk-in / Urgent Care',
    address: 'Wellington Road South, Stockport, SK1 3UA',
    phone: '0161 426 9900',
    link: 'https://www.nhs.uk/services/urgent-treatment-centre/stockport-urgent-treatment-centre/N10158755/',
    icon: '🚑',
  },
  {
    name: 'NHS 111 Online',
    type: 'Non-emergency medical advice',
    address: 'Available 24/7',
    phone: '111',
    link: 'https://111.nhs.uk/',
    icon: '💊',
  },
  {
    name: 'Find a GP or Pharmacy',
    type: 'NHS Service Search',
    address: 'Search by postcode',
    phone: '',
    link: 'https://www.nhs.uk/service-search/',
    icon: '🔍',
  },
];

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
  className?: string;
}

export default function NHSServicesWidget({ onStatusChange, className = '' }: Props) {
  const [liveServices, setLiveServices] = useState<NHSService[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const apiKey = import.meta.env.VITE_NHS_API_KEY as string | undefined;

  const loadLive = useCallback(() => {
    if (!apiKey) return;
    setLoading(true);
    onStatusChange?.('loading');
    fetchNHSServices(apiKey)
      .then((data) => {
        setLiveServices(data.value ?? []);
        setLastUpdated(new Date());
        onStatusChange?.('ready');
      })
      .catch(() => {
        // On failure, fall back silently to static data
        onStatusChange?.('ready');
      })
      .finally(() => setLoading(false));
  }, [apiKey, onStatusChange]);

  useEffect(() => {
    if (apiKey) {
      loadLive(); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      onStatusChange?.('ready');
    }
  }, [apiKey, loadLive, onStatusChange]);

  return (
    <WidgetCard
      title="NHS Services"
      icon="🏥"
      meta="Stockport"
      isLoading={loading}
      className={className}
      lastUpdated={lastUpdated ?? undefined}
    >
      <div>
        {/* Live GP results (when API key is configured) */}
        {liveServices.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
              Nearby GP Surgeries
            </p>
            <div className="space-y-2">
              {liveServices.slice(0, 4).map((svc) => (
                <div key={svc.organisationId} className="py-2 border-b border-blue-50 last:border-0">
                  <div className="text-sm font-medium text-gray-700">{svc.organisationName}</div>
                  {svc.address1 && (
                    <div className="text-xs text-gray-500">{svc.address1}, {svc.postcode}</div>
                  )}
                  {svc.phone && (
                    <a
                      href={`tel:${svc.phone}`}
                      className="text-xs text-[#003A70] hover:text-[#009FE3] transition-colors"
                    >
                      ☎ {svc.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Static services — always shown */}
        <div className="space-y-3">
          {STATIC_SERVICES.map((svc) => (
            <div key={svc.name} className="flex items-start gap-3 py-2 border-b border-blue-50 last:border-0">
              <span className="text-xl shrink-0 mt-0.5">{svc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700">{svc.name}</div>
                <div className="text-xs text-gray-500 mb-1">{svc.type} · {svc.address}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {svc.phone && (
                    <a
                      href={`tel:${svc.phone.replace(/\s/g, '')}`}
                      className="text-sm font-semibold text-[#003A70] hover:text-[#009FE3] transition-colors"
                    >
                      ☎ {svc.phone}
                    </a>
                  )}
                  <a
                    href={svc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#009FE3] hover:text-[#007AB8] transition-colors self-center"
                  >
                    Website →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!apiKey && (
          <p className="text-xs text-gray-400 mt-3 border-t border-blue-50 pt-3">
            Add <code className="bg-gray-100 px-1 rounded">VITE_NHS_API_KEY</code> to show nearby GP surgeries.{' '}
            <a href="https://digital.nhs.uk/developer" target="_blank" rel="noopener noreferrer" className="text-[#009FE3] hover:underline">
              Get a free key →
            </a>
          </p>
        )}
      </div>
    </WidgetCard>
  );
}
