import WidgetCard from './WidgetCard';

const RAIL_SERVICES = [
  { badge: 'TPE', label: 'TransPennine Express', route: 'Stockport ↔ Manchester Piccadilly', info: '~8 min · every 15 min off-peak', color: 'bg-[#003A70]' },
  { badge: 'AW', label: 'Avanti West Coast', route: 'Stockport ↔ London Euston', info: '~2h journey · frequent departures', color: 'bg-purple-700' },
  { badge: 'NT', label: 'Northern Trains', route: 'Stockport ↔ Sheffield via Hazel Grove', info: 'Hourly service', color: 'bg-[#003A70]' },
];

const LINKS = [
  { label: '🚂 Live train departures', href: 'https://www.nationalrail.co.uk/live-trains/departures/stockport/' },
  { label: '🚌 TfGM journey planner', href: 'https://www.tfgm.com/journey-planner' },
  { label: '🚍 Stagecoach bus times', href: 'https://www.stagecoachbus.com/timetables' },
  { label: '🅿️ Stockport car parks', href: 'https://www.stockport.gov.uk/parking' },
];

export default function TransportWidget() {
  return (
    <WidgetCard title="Transport" icon="🚆" meta="Stockport Station">
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
      <div className="border-t border-blue-100 pt-4 space-y-2">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#003A70] hover:text-[#009FE3] transition-colors"
          >
            {l.label} →
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Register free at{' '}
        <a href="https://developer.tfgm.com" target="_blank" rel="noopener noreferrer" className="text-[#009FE3]">
          developer.tfgm.com
        </a>{' '}
        for live car park availability.
      </p>
    </WidgetCard>
  );
}
