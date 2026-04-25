import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';
import { nearestQuestsByCoord } from '../lib/progress';
import 'leaflet/dist/leaflet.css';

const STOCKPORT_CENTER: [number, number] = [53.4083, -2.1494];
const DEFAULT_ZOOM = 13;
const PIN_LIMIT = 5;

function buildSmallIcon(color: string, emoji: string): L.DivIcon {
  const size = 22;
  const html = `
    <span style="
      display:inline-flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};color:white;font-size:12px;font-weight:700;
      border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.25);
    ">${emoji}</span>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

function BoundsFitter({ pins, fallback }: { pins: Quest[]; fallback: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = pins.filter(
      (q): q is Quest & { lat: number; lng: number } =>
        typeof q.lat === 'number' && typeof q.lng === 'number'
    );
    if (withCoords.length === 0) {
      map.setView(fallback, DEFAULT_ZOOM);
      return;
    }
    if (withCoords.length === 1) {
      map.setView([withCoords[0].lat, withCoords[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(withCoords.map(q => [q.lat, q.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, pins, fallback]);
  return null;
}

export function DiscoverMiniMap() {
  const { quests, progress } = useQuestContext();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const uncompletedWithCoords = useMemo(
    () =>
      quests.filter(
        q =>
          !progress.completed[q.id] &&
          typeof q.lat === 'number' &&
          typeof q.lng === 'number'
      ),
    [quests, progress.completed]
  );

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      pos => {
        if (cancelled) return;
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // ignore — fallback already in place
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 60_000 }
    );
    return () => { cancelled = true; };
  }, []);

  const pins = useMemo<Quest[]>(() => {
    if (userPos) {
      return nearestQuestsByCoord(
        { lat: userPos[0], lng: userPos[1] },
        uncompletedWithCoords,
        PIN_LIMIT
      );
    }
    return uncompletedWithCoords.slice(0, PIN_LIMIT);
  }, [userPos, uncompletedWithCoords]);

  function handleOpenFullMap() {
    sessionStorage.setItem('sq-quests-view', 'map');
  }

  return (
    <section aria-labelledby="discover-mini-map-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="discover-mini-map-heading"
          className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
        >
          <span aria-hidden="true">📍</span> Near you
        </h2>
        <a
          href="#/quests"
          onClick={handleOpenFullMap}
          className="text-xs font-semibold text-brand dark:text-brand-dark no-underline hover:underline"
        >
          Open full map →
        </a>
      </div>
      <div className="relative h-40 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={STOCKPORT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <BoundsFitter pins={pins} fallback={STOCKPORT_CENTER} />
          {pins.map(q => {
            if (typeof q.lat !== 'number' || typeof q.lng !== 'number') return null;
            const cat = CATEGORY_MAP[q.category];
            return (
              <Marker
                key={q.id}
                position={[q.lat, q.lng]}
                icon={buildSmallIcon(cat.color, q.emoji ?? cat.emoji)}
                interactive={false}
              />
            );
          })}
        </MapContainer>
        <a
          href="#/quests"
          onClick={handleOpenFullMap}
          aria-label="Open full map"
          className="absolute inset-0 z-[500]"
        />
      </div>
    </section>
  );
}
