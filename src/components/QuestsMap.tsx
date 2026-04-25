import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CategoryId, Quest } from '../types';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { getQuestOfTheDay } from '../lib/progress';
import { useQuestContext } from '../lib/QuestContext';
import { MapControls } from './MapControls';
import 'leaflet/dist/leaflet.css';

interface TrailOverlay {
  title: string;
  coords: Array<{ lat: number; lng: number }>;
}

interface QuestsMapProps {
  quests: Quest[];
  completed: Record<string, string>;
  onSelectQuest: (quest: Quest) => void;
  trailOverlay?: TrailOverlay;
}

const STOCKPORT_CENTER: [number, number] = [53.4083, -2.1494];
const DEFAULT_ZOOM = 13;

interface IconSpec {
  color: string;
  emoji: string;
  done: boolean;
  highlight: boolean;
}

function buildIcon({ color, emoji, done, highlight }: IconSpec): L.DivIcon {
  const size = highlight ? 36 : 28;
  const ring = highlight
    ? `box-shadow:0 0 0 4px rgba(245,158,11,0.55),0 2px 6px rgba(0,0,0,0.3);`
    : `box-shadow:0 2px 4px rgba(0,0,0,0.25);`;
  const inner = done ? '✓' : emoji;
  const html = `
    <span style="position:relative;display:inline-block;">
      <span style="
        display:inline-flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:9999px;
        background:${color};color:white;font-size:${highlight ? 16 : 14}px;font-weight:700;
        border:2px solid white;${ring}
      ">${inner}</span>
    </span>`;
  return L.divIcon({
    html,
    className: highlight ? 'sq-pin-pulse' : '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

interface FlyToOnSelectProps {
  target: { position: [number, number]; tick: number } | null;
}

function FlyToOnSelect({ target }: FlyToOnSelectProps) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target.position, Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [map, target]);
  return null;
}

export function QuestsMap({ quests, completed, onSelectQuest, trailOverlay }: QuestsMapProps) {
  const { quests: allQuests } = useQuestContext();
  const [hiddenCategories, setHiddenCategories] = useState<Set<CategoryId>>(new Set());
  const [flyTarget, setFlyTarget] = useState<{ position: [number, number]; tick: number } | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [lastTappedPinId, setLastTappedPinId] = useState<string | null>(null);

  const withCoords = useMemo(
    () => quests.filter((q): q is Quest & { lat: number; lng: number } =>
      typeof q.lat === 'number' && typeof q.lng === 'number'
    ),
    [quests]
  );

  const visiblePins = useMemo(
    () => withCoords.filter(q => !hiddenCategories.has(q.category)),
    [withCoords, hiddenCategories]
  );

  const doneCount = useMemo(
    () => visiblePins.reduce((n, q) => (completed[q.id] ? n + 1 : n), 0),
    [visiblePins, completed]
  );

  const countsByCategory = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const q of withCoords) {
      map.set(q.category, (map.get(q.category) ?? 0) + 1);
    }
    return map;
  }, [withCoords]);

  const questOfTheDay = useMemo(
    () => getQuestOfTheDay(allQuests, completed),
    [allQuests, completed]
  );

  const lastTappedPin = useMemo(() => {
    if (!lastTappedPinId) return null;
    return withCoords.find(q => q.id === lastTappedPinId) ?? null;
  }, [withCoords, lastTappedPinId]);

  function toggleCategory(id: CategoryId) {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="relative">
      <div className="px-4 pt-2 pb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {visiblePins.length} pins · {doneCount} done · {visiblePins.length - doneCount} to go
        </span>
        <span aria-hidden="true">Tap a pin for details</span>
      </div>

      <div
        className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none"
        role="group"
        aria-label="Toggle category visibility"
      >
        {CATEGORIES.map(cat => {
          const count = countsByCategory.get(cat.id) ?? 0;
          if (count === 0) return null;
          const hidden = hiddenCategories.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              aria-pressed={!hidden}
              className={[
                'shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-opacity whitespace-nowrap border',
                hidden ? 'opacity-40' : 'opacity-100',
              ].join(' ')}
              style={{
                backgroundColor: `${cat.color}18`,
                color: cat.color,
                borderColor: `${cat.color}40`,
              }}
            >
              <span aria-hidden="true">{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="relative h-[calc(100vh-22rem)] min-h-[320px] mx-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={STOCKPORT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToOnSelect target={flyTarget} />
          <MapControls
            defaultCenter={STOCKPORT_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            onUserPosChange={setUserPos}
          />
          {trailOverlay && trailOverlay.coords.length >= 2 && (
            <Polyline
              positions={trailOverlay.coords.map(c => [c.lat, c.lng] as [number, number])}
              pathOptions={{
                color: '#4F46E5',
                weight: 3,
                opacity: 0.6,
                dashArray: '6 8',
              }}
            />
          )}
          {!trailOverlay && userPos && lastTappedPin && (
            <Polyline
              positions={[userPos, [lastTappedPin.lat, lastTappedPin.lng]]}
              pathOptions={{
                color: '#3B82F6',
                weight: 3,
                opacity: 0.55,
                dashArray: '4 6',
              }}
            />
          )}
          {visiblePins.map(q => {
            const cat = CATEGORY_MAP[q.category];
            const done = Boolean(completed[q.id]);
            const highlight = questOfTheDay?.id === q.id;
            return (
              <Marker
                key={q.id}
                position={[q.lat, q.lng]}
                icon={buildIcon({
                  color: cat.color,
                  emoji: q.emoji ?? cat.emoji,
                  done,
                  highlight,
                })}
                eventHandlers={{
                  click: () => {
                    setFlyTarget({ position: [q.lat, q.lng], tick: Date.now() });
                    setLastTappedPinId(q.id);
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <strong style={{ fontSize: '13px' }}>{q.title}</strong>
                    <br />
                    <span style={{ color: cat.color, fontSize: '12px' }}>
                      {cat.emoji} {cat.label}
                    </span>
                    {highlight && (
                      <>
                        <br />
                        <span style={{ color: '#B45309', fontSize: '11px', fontWeight: 600 }}>
                          ⭐ Quest of the Day
                        </span>
                      </>
                    )}
                    <br />
                    <button
                      type="button"
                      onClick={() => onSelectQuest(q)}
                      style={{
                        color: cat.color,
                        fontWeight: 600,
                        fontSize: '12px',
                        marginTop: '5px',
                        display: 'inline-block',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    >
                      View quest →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {trailOverlay && (
          <div
            role="status"
            aria-label={`Tracked trail overlay: ${trailOverlay.title}`}
            className="absolute bottom-3 left-3 z-[400] max-w-[240px] bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <span aria-hidden="true">🥾</span>
            <span className="truncate">{trailOverlay.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}
