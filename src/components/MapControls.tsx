import { useEffect, useState } from 'react';
import { CircleMarker, useMap } from 'react-leaflet';

interface MapControlsProps {
  defaultCenter: [number, number];
  defaultZoom: number;
  onUserPosChange?: (pos: [number, number] | null) => void;
}

export function MapControls({ defaultCenter, defaultZoom, onUserPosChange }: MapControlsProps) {
  const map = useMap();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    if (!locateError) return;
    const t = setTimeout(() => setLocateError(null), 3500);
    return () => clearTimeout(t);
  }, [locateError]);

  const supportsGeolocation =
    typeof navigator !== 'undefined' && 'geolocation' in navigator;

  function handleLocate() {
    if (!supportsGeolocation || locating) return;
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const next: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(next);
        onUserPosChange?.(next);
        map.flyTo(next, 15, { duration: 0.8 });
        setLocating(false);
      },
      err => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied'
            : 'Could not find your location',
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }

  function handleReset() {
    map.flyTo(defaultCenter, defaultZoom, { duration: 0.8 });
  }

  return (
    <>
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-2 pointer-events-auto">
        {supportsGeolocation && (
          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            className="w-10 h-10 rounded-full bg-white dark:bg-surface-dark text-brand dark:text-brand-dark shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Find my location"
          >
            {locating ? (
              <span aria-hidden="true" className="animate-pulse">📡</span>
            ) : (
              <span aria-hidden="true">📍</span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="w-10 h-10 rounded-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Reset map view"
        >
          <span aria-hidden="true">🎯</span>
        </button>
      </div>

      {locateError && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
          role="status"
        >
          {locateError}
        </div>
      )}

      {userPos && (
        <CircleMarker
          center={userPos}
          radius={8}
          pathOptions={{
            color: '#2563EB',
            fillColor: '#3B82F6',
            fillOpacity: 0.7,
            weight: 2,
          }}
        />
      )}
    </>
  );
}
