import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import 'leaflet/dist/leaflet.css';

interface QuestsMapProps {
  quests: Quest[];
  completed: Record<string, string>;
  onSelectQuest: (quest: Quest) => void;
}

const STOCKPORT_CENTER: [number, number] = [53.4083, -2.1494];
const DEFAULT_ZOOM = 13;

function buildIcon(color: string, done: boolean): L.DivIcon {
  const html = `
    <span style="
      display:inline-flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:9999px;
      background:${color};color:white;font-size:14px;font-weight:700;
      border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.25);
    ">${done ? '✓' : ''}</span>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export function QuestsMap({ quests, completed, onSelectQuest }: QuestsMapProps) {
  const withCoords = useMemo(
    () => quests.filter((q): q is Quest & { lat: number; lng: number } =>
      typeof q.lat === 'number' && typeof q.lng === 'number'
    ),
    [quests]
  );

  return (
    <div className="relative">
      <div className="px-4 pt-2 pb-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{withCoords.length} of {quests.length} pinned</span>
        <span aria-hidden="true">Tap a pin for details</span>
      </div>
      <div className="h-[calc(100vh-18rem)] min-h-[320px] mx-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={STOCKPORT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {withCoords.map(q => {
            const cat = CATEGORY_MAP[q.category];
            const done = Boolean(completed[q.id]);
            return (
              <Marker
                key={q.id}
                position={[q.lat, q.lng]}
                icon={buildIcon(cat.color, done)}
                eventHandlers={{
                  click: () => onSelectQuest(q),
                }}
              >
                <Popup>
                  <div style={{ minWidth: '140px' }}>
                    <strong style={{ fontSize: '13px' }}>{q.title}</strong>
                    <br />
                    <span style={{ color: cat.color, fontSize: '12px' }}>
                      {cat.emoji} {cat.label}
                    </span>
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
      </div>
    </div>
  );
}
