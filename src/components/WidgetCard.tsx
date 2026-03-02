import type { ReactNode } from 'react';

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

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-16 bg-blue-100 rounded" />
      <div className="h-4 bg-blue-100 rounded w-3/4" />
      <div className="h-4 bg-blue-100 rounded w-1/2" />
      <div className="h-4 bg-blue-100 rounded w-2/3" />
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
  return (
    <article className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col ${className}`}>
      <header className="bg-[#003A70] text-white px-5 py-3 flex items-center gap-2">
        {/* TODO: Provide a more descriptive aria-label for the icon — the current value
                   mirrors the widget title which is already in the adjacent <h2>. Consider
                   using aria-hidden="true" on the span instead, since the title already
                   labels the widget for screen readers. */}
        <span className="text-xl" role="img" aria-label={title}>{icon}</span>
        <h2 className="text-base font-semibold flex-1">{title}</h2>
        {meta && <span className="text-xs text-[#009FE3] whitespace-nowrap">{meta}</span>}
      </header>
      <div className="p-5 flex-1">
        {isLoading ? (
          <Skeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center text-gray-500">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-1 px-4 py-1 bg-[#009FE3] text-white text-sm rounded hover:bg-[#007AB8] transition-colors"
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
