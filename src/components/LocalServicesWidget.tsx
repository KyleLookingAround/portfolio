import { useEffect } from 'react';
import WidgetCard from './WidgetCard';

const EMERGENCY_SERVICES = [
  { icon: '🚨', label: 'Emergency', number: '999', description: 'Police, Fire, Ambulance' },
  { icon: '🏥', label: 'NHS Non-Emergency', number: '111', description: 'Medical advice 24/7' },
];

const LOCAL_SERVICES = [
  {
    icon: '🏛️',
    label: 'Stockport Council',
    phone: '0161 474 4949',
    link: 'https://www.stockport.gov.uk/',
    description: 'Main switchboard',
  },
  {
    icon: '🗑️',
    label: 'Bin Collections',
    phone: '0161 217 6111',
    link: 'https://www.stockport.gov.uk/topic/bins-and-recycling',
    description: 'Report missed collections',
  },
  {
    icon: '💡',
    label: 'Street Lighting',
    phone: '0161 217 6111',
    link: 'https://www.stockport.gov.uk/start/report-a-street-light-fault',
    description: 'Report faults',
  },
  {
    icon: '🚧',
    label: 'Highways & Roads',
    phone: '0161 217 6111',
    link: 'https://www.stockport.gov.uk/topic/roads',
    description: 'Report potholes & problems',
  },
];

const USEFUL_LINKS = [
  { label: '🗓️ Find Your Bin Day',    href: 'https://www.stockport.gov.uk/find-your-collection-day' },
  { label: '📚 Stockport Libraries',  href: 'https://www.stockport.gov.uk/topic/libraries' },
  { label: '🏊 Leisure Centres',      href: 'https://www.stockport.gov.uk/leisure-centres' },
  { label: '♻️ Recycling Centres',   href: 'https://www.stockport.gov.uk/tips-and-recycling-centres' },
  { label: '🎭 Plaza Theatre',        href: 'https://stockportplaza.co.uk/' },
  { label: '🏛️ Hat Works Museum',    href: 'https://www.stockport.gov.uk/topic/hat-works' },
  { label: '🏰 Bramall Hall',         href: 'https://www.stockport.gov.uk/landing/bramall-hall' },
  { label: '🛒 Merseyway Shopping',   href: 'https://merseyway.com/' },
  { label: '🎪 What\'s On Stockport', href: 'https://www.whatsoninstockport.com/' },
];

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
  className?: string;
}

export default function LocalServicesWidget({ onStatusChange, className = '' }: Props) {
  useEffect(() => {
    onStatusChange?.('ready');
  }, [onStatusChange]);

  return (
    <WidgetCard
      title="Local Services"
      icon="📞"
      meta="Useful Contacts"
      className={className}
    >
      <div>
        {/* Emergency services */}
        <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-3 mb-4">
          <p className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2">
            Emergency Services
          </p>
          <div className="space-y-3">
            {EMERGENCY_SERVICES.map((service) => (
              <div key={service.number} className="flex items-center gap-3">
                <span className="text-2xl shrink-0">{service.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-700">{service.label}</div>
                  <div className="text-xs text-gray-500">{service.description}</div>
                </div>
                <a
                  href={`tel:${service.number}`}
                  className="text-xl font-bold text-red-700 hover:text-red-900 transition-colors py-1 px-2 -mr-1"
                >
                  {service.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Council services */}
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
          Council Services
        </p>
        <div className="space-y-1 mb-4">
          {LOCAL_SERVICES.map((service) => (
            <div key={service.label} className="flex items-start gap-3 py-2 border-b border-blue-50 last:border-0">
              <span className="text-xl shrink-0 mt-0.5">{service.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700">{service.label}</div>
                <div className="text-xs text-gray-500 mb-1">{service.description}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a
                    href={`tel:${service.phone.replace(/\s/g, '')}`}
                    className="text-sm font-semibold text-[#003A70] hover:text-[#009FE3] transition-colors"
                  >
                    ☎ {service.phone}
                  </a>
                  <a
                    href={service.link}
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

        {/* Quick links */}
        <div className="border-t border-blue-100 pt-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
            Quick Links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-blue-50 sm:divide-y-0">
            {USEFUL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-2.5 sm:py-2 text-sm text-[#003A70] hover:text-[#009FE3] transition-colors border-b border-blue-50 last:border-0 sm:border-0"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-blue-100 pt-3 mt-1">
          <p className="text-xs text-gray-400">
            For council tax and MyAccount services, visit{' '}
            <a
              href="https://www.stockport.gov.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009FE3] hover:text-[#007AB8]"
            >
              stockport.gov.uk
            </a>
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}
