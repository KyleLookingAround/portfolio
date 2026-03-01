import { useState, useEffect } from 'react';

export default function Header() {
  const [now, setNow] = useState(new Date());

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
