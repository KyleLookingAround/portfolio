import { useState, useEffect } from 'react';

interface Props {
  failingWidgets?: string[];
}

export default function Header({ failingWidgets = [] }: Props) {
  const [now, setNow] = useState(new Date());
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB');

  return (
    <header className="bg-gradient-to-r from-[#003A70] to-[#005A9E] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#009FE3] rounded-full flex items-center justify-center text-xl font-bold shrink-0" aria-hidden="true">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight">Stockport Today</h1>
            <p className="text-[#009FE3] text-xs uppercase tracking-widest mt-0.5">
              Your live local dashboard
            </p>
          </div>
        </div>

        {/* API error indicator */}
        {failingWidgets.length > 0 && (
          <div className="relative">
            <button
              onMouseEnter={() => setErrorOpen(true)}
              onMouseLeave={() => setErrorOpen(false)}
              onClick={() => setErrorOpen((v) => !v)}
              aria-expanded={errorOpen}
              aria-label={`${failingWidgets.length} widget${failingWidgets.length > 1 ? 's' : ''} failed to load`}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/20 border border-amber-400/50 rounded-lg text-amber-300 text-sm hover:bg-amber-400/30 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{failingWidgets.length} unavailable</span>
            </button>

            {errorOpen && (
              <div
                onMouseEnter={() => setErrorOpen(true)}
                onMouseLeave={() => setErrorOpen(false)}
                className="absolute top-full right-0 mt-2 w-52 bg-[#002850] border border-[#004080] rounded-lg shadow-xl p-3 z-50 text-left"
              >
                <p className="text-xs font-semibold text-[#009FE3] uppercase tracking-wide mb-2">
                  Failed to load:
                </p>
                <ul className="space-y-1">
                  {failingWidgets.map((name) => (
                    <li key={name} className="flex items-center gap-2 text-sm text-amber-300">
                      <span aria-hidden="true">•</span>
                      {name}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-3 border-t border-[#003A70] pt-2">
                  Refresh the page to retry
                </p>
              </div>
            )}
          </div>
        )}

        {/* Clock */}
        <div className="text-right">
          <div className="text-[#009FE3] text-xs uppercase tracking-wide">{dateStr}</div>
          <time className="text-2xl font-bold tabular-nums tracking-widest" dateTime={now.toISOString()}>
            {timeStr}
          </time>
        </div>
      </div>
    </header>
  );
}
