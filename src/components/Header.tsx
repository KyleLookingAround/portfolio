import { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext';

interface Props {
  failingWidgets?: string[];
}

export default function Header({ failingWidgets = [] }: Props) {
  const [now, setNow] = useState(new Date());
  const [errorOpen, setErrorOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // TODO: Reduce the clock update interval from 1000 ms to something larger (e.g. 10 000 ms)
  //       or wrap the clock in React.memo, since the 1-second re-render causes the entire
  //       Header to re-render every second even when no data changes.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB');

  if (theme === 'newspaper') {
    return (
      <header className="bg-[#f5f0e8] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-0">
          {/* Top rule */}
          <div className="border-t-4 border-black mb-2" />

          {/* Masthead row: title + toggle */}
          <div className="flex items-center justify-between pb-1">
            <h1 className="font-['Playfair_Display',Georgia,serif] text-5xl sm:text-7xl font-black tracking-tight uppercase text-black leading-none">
              Stockport Today
            </h1>
            <button
              onClick={() => setTheme('modern')}
              className="shrink-0 px-3 py-1.5 border border-black text-xs font-serif hover:bg-black hover:text-[#f5f0e8] transition-colors"
            >
              Modern View
            </button>
          </div>

          {/* Second rule */}
          <div className="border-t-2 border-black mt-1 mb-1" />

          {/* Info bar */}
          <div className="flex flex-wrap items-center gap-x-3 py-1.5 text-xs font-serif text-black">
            <span>{dateStr}</span>
            <span className="hidden sm:inline text-gray-500 select-none">|</span>
            <span>Vol. 1, No. 1</span>
            <span className="hidden sm:inline text-gray-500 select-none">|</span>
            <span>Est. 1894</span>
            <span className="hidden sm:inline text-gray-500 select-none">|</span>
            <span>Price: Free</span>
            <span className="hidden sm:inline text-gray-500 select-none">|</span>
            <time dateTime={now.toISOString()} className="tabular-nums">{timeStr}</time>
            {failingWidgets.length > 0 && (
              <>
                <span className="hidden sm:inline text-gray-500 select-none">|</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setErrorOpen(true)}
                    onMouseLeave={() => setErrorOpen(false)}
                    onFocus={() => setErrorOpen(true)}
                    onBlur={() => setErrorOpen(false)}
                    onClick={() => setErrorOpen((v) => !v)}
                    aria-expanded={errorOpen}
                    aria-label={`${failingWidgets.length} widget${failingWidgets.length > 1 ? 's' : ''} failed to load`}
                    className="text-red-800 hover:underline cursor-pointer"
                  >
                    ⚠ {failingWidgets.length} data source{failingWidgets.length > 1 ? 's' : ''} unavailable
                  </button>
                  {errorOpen && (
                    <div
                      onMouseEnter={() => setErrorOpen(true)}
                      onMouseLeave={() => setErrorOpen(false)}
                      className="absolute top-full left-0 mt-2 w-52 bg-white border border-black shadow-xl p-3 z-50 text-left"
                    >
                      <p className="text-xs font-bold text-black uppercase tracking-wide mb-2">
                        Failed to load:
                      </p>
                      <ul className="space-y-1">
                        {failingWidgets.map((name) => (
                          <li key={name} className="flex items-center gap-2 text-sm text-red-800">
                            <span aria-hidden="true">•</span>
                            {name}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-3 border-t border-gray-300 pt-2">
                        Refresh the page to retry
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom rule */}
          <div className="border-t border-black" />
        </div>
      </header>
    );
  }

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
              onFocus={() => setErrorOpen(true)}
              onBlur={() => setErrorOpen(false)}
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

        {/* Theme toggle */}
        <button
          onClick={() => setTheme('newspaper')}
          className="shrink-0 px-3 py-1.5 border border-white/40 rounded text-white text-xs hover:bg-white/10 transition-colors"
        >
          Newspaper
        </button>

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
