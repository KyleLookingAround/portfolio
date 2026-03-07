import { useEffect } from 'react';
import WidgetCard from './WidgetCard';

const COUNCIL_HOUSING = [
  {
    icon: '🏠',
    label: 'Stockport Homes',
    description: 'Council housing landlord for Stockport',
    phone: '0161 217 6016',
    link: 'https://www.stockporthomes.org/',
  },
  {
    icon: '📋',
    label: 'Apply for Social Housing',
    description: 'Join the housing register (HomeChoice)',
    phone: null,
    link: 'https://www.stockporthomes.org/find-a-home/apply-for-housing/',
  },
  {
    icon: '🔑',
    label: 'Mutual Exchange',
    description: 'Swap your council home with another tenant',
    phone: null,
    link: 'https://www.stockporthomes.org/find-a-home/mutual-exchange/',
  },
  {
    icon: '🆘',
    label: 'Homelessness & Emergency Housing',
    description: 'Urgent housing support from the council',
    phone: '0161 474 4237',
    link: 'https://www.stockport.gov.uk/topic/homelessness',
  },
];

const PRIVATE_RENTING = [
  {
    label: '🔍 Rightmove — Rentals in Stockport',
    href: 'https://www.rightmove.co.uk/property-to-rent/Stockport.html',
  },
  {
    label: '🔍 Zoopla — Rentals in Stockport',
    href: 'https://www.zoopla.co.uk/to-rent/property/stockport/',
  },
  {
    label: '📜 Tenant Rights & Advice (Shelter)',
    href: 'https://england.shelter.org.uk/housing_advice/private_renting',
  },
  {
    label: '⚖️ Renters\' Rights (Gov.uk)',
    href: 'https://www.gov.uk/private-renting',
  },
  {
    label: '🛡️ Deposit Protection Schemes',
    href: 'https://www.gov.uk/tenancy-deposit-protection',
  },
];

const BUYING = [
  {
    label: '🏡 Rightmove — Buy in Stockport',
    href: 'https://www.rightmove.co.uk/house-prices/stockport.html',
  },
  {
    label: '🏡 Zoopla — Buy in Stockport',
    href: 'https://www.zoopla.co.uk/for-sale/property/stockport/',
  },
  {
    label: '🤝 Shared Ownership (Own Your Home)',
    href: 'https://www.ownyourhome.gov.uk/scheme/shared-ownership/',
  },
  {
    label: '💰 Help to Buy (Gov.uk)',
    href: 'https://www.gov.uk/help-to-buy-equity-loan',
  },
  {
    label: '📊 First Homes Scheme',
    href: 'https://www.gov.uk/first-homes-scheme',
  },
];

const ADVICE = [
  {
    icon: '🏛️',
    label: 'Stockport Council — Housing',
    phone: '0161 474 4237',
    link: 'https://www.stockport.gov.uk/topic/housing',
  },
  {
    icon: '🤝',
    label: 'Citizens Advice Stockport',
    phone: '0808 278 7807',
    link: 'https://www.stockportcab.org.uk/',
  },
  {
    icon: '🏠',
    label: 'Shelter (Housing Charity)',
    phone: '0808 800 4444',
    link: 'https://england.shelter.org.uk/',
  },
];

interface Props {
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
  className?: string;
}

export default function HousingWidget({ onStatusChange, className = '' }: Props) {
  useEffect(() => {
    onStatusChange?.('ready');
  }, [onStatusChange]);

  return (
    <WidgetCard
      title="Housing"
      icon="🏘️"
      meta="Find a Home in Stockport"
      className={className}
    >
      <div className="space-y-5">

        {/* Council & social housing */}
        <section>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Council &amp; Social Housing
          </p>
          <div className="space-y-1">
            {COUNCIL_HOUSING.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 py-2 border-b border-blue-50 last:border-0"
              >
                <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-500 mb-1">{item.description}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {item.phone && (
                      <a
                        href={`tel:${item.phone.replace(/\s/g, '')}`}
                        className="text-sm font-semibold text-[#003A70] hover:text-[#009FE3] transition-colors"
                      >
                        ☎ {item.phone}
                      </a>
                    )}
                    <a
                      href={item.link}
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
        </section>

        {/* Private renting */}
        <section>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Private Renting
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-blue-50 sm:divide-y-0">
            {PRIVATE_RENTING.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-2 text-sm text-[#003A70] hover:text-[#009FE3] transition-colors border-b border-blue-50 sm:border-0"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {/* Buying */}
        <section>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Buying a Home
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-blue-50 sm:divide-y-0">
            {BUYING.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-2 text-sm text-[#003A70] hover:text-[#009FE3] transition-colors border-b border-blue-50 sm:border-0"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {/* Advice & support */}
        <section className="border-t border-blue-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Advice &amp; Support
          </p>
          <div className="space-y-1">
            {ADVICE.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 py-2 border-b border-blue-50 last:border-0"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                    <a
                      href={`tel:${item.phone.replace(/\s/g, '')}`}
                      className="text-sm font-semibold text-[#003A70] hover:text-[#009FE3] transition-colors"
                    >
                      ☎ {item.phone}
                    </a>
                    <a
                      href={item.link}
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
        </section>
      </div>
    </WidgetCard>
  );
}
