import type { ReactNode } from 'react';
import { useTheme } from '../lib/ThemeContext';

interface Props {
  title: string;
  icon: string;
  meta?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
}

function Skeleton({ newspaper }: { newspaper: boolean }) {
  const bar = newspaper ? 'bg-gray-200' : 'bg-blue-100';
  return (
    <div className="space-y-3 animate-pulse">
      <div className={`h-16 rounded ${bar}`} />
      <div className={`h-4 rounded w-3/4 ${bar}`} />
      <div className={`h-4 rounded w-1/2 ${bar}`} />
      <div className={`h-4 rounded w-2/3 ${bar}`} />
    </div>
  );
}

export default function WidgetCard({
  title,
  icon,
  meta,
  isLoading,
  error,
  onRetry,
  children,
  className = '',
}: Props) {
  const { theme } = useTheme();
  const newspaper = theme === 'newspaper';

  const articleClass = newspaper
    ? `bg-white border border-black border-t-4 overflow-hidden flex flex-col ${className}`
    : `bg-white rounded-xl shadow-md overflow-hidden flex flex-col ${className}`;

  const headerClass = newspaper
    ? 'bg-transparent border-b border-black px-5 py-2 flex items-center gap-2'
    : 'bg-[#003A70] text-white px-5 py-3 flex items-center gap-2';

  const titleClass = newspaper
    ? 'text-xs font-bold flex-1 uppercase tracking-[0.15em] font-serif text-black'
    : 'text-base font-semibold flex-1';

  const metaClass = newspaper
    ? 'text-xs text-gray-600 font-serif whitespace-nowrap'
    : 'text-xs text-[#009FE3] whitespace-nowrap';

  return (
    <article className={articleClass}>
      <header className={headerClass}>
        {!newspaper && <span className="text-xl" aria-hidden="true">{icon}</span>}
        <h2 className={titleClass}>{title}</h2>
        {meta && <span className={metaClass}>{meta}</span>}
      </header>
      <div className="p-5 flex-1">
        {isLoading ? (
          <Skeleton newspaper={newspaper} />
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center text-gray-500">
            {newspaper ? (
              <p className="text-sm font-bold font-serif text-black">Error</p>
            ) : (
              <span className="text-3xl">⚠️</span>
            )}
            <p className="text-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className={
                  newspaper
                    ? 'mt-1 px-4 py-1 border border-black text-black text-sm rounded-none font-serif hover:bg-black hover:text-[#f5f0e8] transition-colors'
                    : 'mt-1 px-4 py-1 bg-[#009FE3] text-white text-sm rounded hover:bg-[#007AB8] transition-colors'
                }
              >
                Try again
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </article>
  );
}
