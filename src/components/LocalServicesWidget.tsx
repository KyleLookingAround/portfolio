import WidgetCard from './WidgetCard';

const EMERGENCY_SERVICES = [
  { icon: '🚨', label: 'Emergency', number: '999', description: 'Police, Fire, Ambulance' },
  { icon: '🏥', label: 'NHS Non-Emergency', number: '111', description: 'Medical advice 24/7' },
];

const LOCAL_SERVICES = [
  { 
    icon: '🏛️', 
    label: 'Stockport Council',
    phone: '0161 480 4949',
    link: 'https://www.stockport.gov.uk/',
    description: 'Main switchboard'
  },
  { 
    icon: '🗑️', 
    label: 'Bin Collections',
    phone: '0161 474 4949',
    link: 'https://www.stockport.gov.uk/bin-collections',
    description: 'Report missed collections'
  },
  { 
    icon: '💡', 
    label: 'Street Lighting',
    phone: '0161 474 3814',
    link: 'https://www.stockport.gov.uk/street-lighting',
    description: 'Report faults'
  },
  { 
    icon: '🚧', 
    label: 'Highways & Roads',
    phone: '0161 474 4949',
    link: 'https://www.stockport.gov.uk/highways',
    description: 'Report problems'
  },
];

const USEFUL_LINKS = [
  { label: '📚 Stockport Libraries', href: 'https://www.stockport.gov.uk/libraries' },
  { label: '🏊 Leisure Centres', href: 'https://www.stockport.gov.uk/leisure-centres' },
  { label: '♻️ Recycling Centres', href: 'https://www.stockport.gov.uk/recycling-centres' },
  { label: '🎭 Plaza Theatre', href: 'https://www.stockportplaza.co.uk/' },
  { label: '🏛️ Hat Works Museum', href: 'https://www.hatworks.org.uk/' },
  { label: '🛒 Merseyway Shopping', href: 'https://www.merseyway.com/' },
];

export default function LocalServicesWidget({ className = '' }: { className?: string }) {
  return (
    <WidgetCard
      title="Local Services"
      icon="📞"
      meta="Useful Contacts"
      className={className}
    >
      <div>
        {/* Emergency services - highlighted */}
        <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-3 mb-4">
          <p className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2">
            Emergency Services
          </p>
          <div className="space-y-2">
            {EMERGENCY_SERVICES.map((service) => (
              <div key={service.number} className="flex items-center gap-3">
                <span className="text-2xl">{service.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700">{service.label}</div>
                  <div className="text-xs text-gray-500">{service.description}</div>
                </div>
                <a
                  href={`tel:${service.number}`}
                  className="text-xl font-bold text-red-700 hover:text-red-900 transition-colors"
                >
                  {service.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Local council services */}
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
          Council Services
        </p>
        <div className="space-y-2 mb-4">
          {LOCAL_SERVICES.map((service) => (
            <div key={service.phone} className="flex items-start gap-2 py-2 border-b border-blue-50 last:border-0">
              <span className="text-xl shrink-0">{service.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700">{service.label}</div>
                <div className="text-xs text-gray-500">{service.description}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <a
                    href={`tel:${service.phone}`}
                    className="text-xs text-[#003A70] hover:text-[#009FE3] font-medium transition-colors"
                  >
                    ☎️ {service.phone}
                  </a>
                  <span className="text-gray-300">•</span>
                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#009FE3] hover:text-[#007AB8] transition-colors"
                  >
                    Visit website →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="border-t border-blue-100 pt-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
            Quick Links
          </p>
          <div className="grid grid-cols-2 gap-2">
            {USEFUL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#003A70] hover:text-[#009FE3] transition-colors truncate"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Postcode info */}
        <div className="border-t border-blue-100 pt-3 mt-3">
          <p className="text-xs text-gray-400">
            For bin collection dates and council tax info, visit{' '}
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
