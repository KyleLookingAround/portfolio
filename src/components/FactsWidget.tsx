import { useState, useEffect } from 'react';
import WidgetCard from './WidgetCard';
import { useTheme } from '../lib/ThemeContext';

const STATS = [
  { value: '295,000', label: 'Population', note: 'Mid-2022 estimate' },
  { value: '126,000', label: 'Households', note: '2021 Census' },
  { value: '357 km²', label: 'Borough Area', note: 'Metropolitan Borough' },
  { value: '1882',    label: 'County FC Founded', note: 'The Hatters ⚽' },
  { value: '1838',    label: 'Robinsons Brewery', note: 'Est. in Stockport' },
  { value: '1840',    label: 'Viaduct Built',     note: '27 arches, Grade II*' },
  { value: '1894',    label: 'First M&S Bazaar',  note: 'Stockport Market' },
  { value: '14',      label: 'Local Wards',        note: 'Since May 2024' },
  { value: '1939',    label: 'Air Raid Shelters',  note: 'WWII tunnels under the town' },
  { value: '6M+',     label: 'Hats Made Per Year', note: 'Victorian era production peak' },
  { value: '750+',    label: 'Listed Buildings',   note: 'Historic England, Grade I–II' },
  { value: 'Stockport', label: 'River Mersey Source', note: 'Goyt & Tame confluence' },
];

const TRIVIA = [
  'Stockport Viaduct (1840) spans the River Mersey on 27 brick arches — one of the largest brick structures in the UK.',
  'The UK\'s first Marks & Spencer Penny Bazaar opened at Stockport Market in 1894.',
  'Stockport\'s Hat Works Museum on Wellington Road South is the UK\'s only museum dedicated to the hat-making industry.',
  'Robinsons Brewery has been brewing in Stockport since 1838, making it one of the oldest family-owned breweries in England.',
  'Stockport County FC — nicknamed "The Hatters" — was founded in 1882 and plays at Edgeley Park.',
  'The River Mersey flows through Stockport\'s town centre, giving the town its name (from "Stocport" — a market place).',
  'Merseyway Shopping Centre was built over the River Mersey in the 1960s — the river still flows beneath the shopping precinct.',
  'Stockport was a major centre of the cotton hat-making industry during the Victorian era, at its peak producing millions of hats a year.',
  'Stockport\'s sandstone air raid shelters were tunnelled in 1939 and could shelter up to 6,500 people during WWII bombing raids. Today they\'re a preserved heritage attraction — one of the largest surviving civilian shelters in the UK.',
  'At the peak of the Victorian hat boom, Stockport\'s mills churned out over six million hats annually, earning the town its enduring nickname "Hat Capital of the World" and inspiring County FC\'s "Hatters" moniker.',
  'The glass Stockport Pyramid near the A6 — completed in 1992 — is one of Greater Manchester\'s most distinctive landmarks. Despite its futuristic appearance, it houses conventional offices and is Grade II listed for its architectural significance.',
  'The River Mersey is born in Stockport: at the confluence of the rivers Goyt and Tame, just below the viaduct. From here it flows 70 miles westward through Manchester and Merseyside to the Irish Sea at Liverpool Bay.',
];

export default function FactsWidget({ className = '' }: { className?: string }) {
  const [triviaIndex, setTriviaIndex] = useState(() => new Date().getHours() % TRIVIA.length);
  const { theme } = useTheme();
  const newspaper = theme === 'newspaper';

  // TODO: Pause the trivia rotation when the widget is off-screen using the
  //       Intersection Observer API, so the interval does not fire when the user
  //       has scrolled past this widget. Example:
  //         const ref = useRef<HTMLDivElement>(null);
  //         useEffect(() => {
  //           const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
  //           if (ref.current) obs.observe(ref.current);
  //           return () => obs.disconnect();
  //         }, []);
  //       Then only run the setInterval while visible.
  useEffect(() => {
    const timer = setInterval(() => {
      setTriviaIndex((i) => (i + 1) % TRIVIA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // TODO: Add a dedicated test file src/test/FactsWidget.test.tsx covering:
  //   1. Widget renders all STATS cards
  //   2. Widget renders the first trivia fact on mount
  //   3. Clicking a pagination dot updates the displayed trivia fact

  const statCardClass = newspaper
    ? 'bg-[#f5f0e8] border border-gray-300 rounded-lg p-3 text-center'
    : 'bg-blue-50 border border-blue-100 rounded-lg p-3 text-center';

  const statValueClass = newspaper
    ? 'block text-xl font-bold text-black'
    : 'block text-xl font-bold text-[#003A70]';

  const triviaBlockClass = newspaper
    ? 'border-l-4 border-black pl-4 py-1 bg-[#f5f0e8] rounded-r-lg'
    : 'border-l-4 border-[#009FE3] pl-4 py-1 bg-blue-50 rounded-r-lg';

  const triviaHeadingClass = newspaper ? 'text-black' : 'text-[#003A70]';

  const dotActive = newspaper ? 'bg-black' : 'bg-[#009FE3]';
  const dotInactive = newspaper ? 'bg-gray-400' : 'bg-blue-200';

  return (
    <WidgetCard title="Stockport by Numbers" icon="📊" meta="Census & Local Data" className={className}>
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <div key={s.label} className={statCardClass}>
            <span className={statValueClass}>{s.value}</span>
            <span className="block text-sm text-gray-600 mt-0.5">{s.label}</span>
            <span className="block text-xs text-gray-400 mt-0.5">{s.note}</span>
          </div>
        ))}
      </div>

      {/* Rotating trivia */}
      <div className={triviaBlockClass}>
        <p className="text-sm text-gray-700">
          <strong className={triviaHeadingClass}>Did you know? </strong>
          {TRIVIA[triviaIndex]}
        </p>
        <div className="flex gap-1 mt-2">
          {TRIVIA.map((_, i) => (
            <button
              key={i}
              onClick={() => setTriviaIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === triviaIndex ? `w-4 ${dotActive}` : `w-1.5 ${dotInactive}`}`}
              aria-label={`Fact ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">Sources: ONS Census 2021, Stockport Council, Historic England</p>
    </WidgetCard>
  );
}
