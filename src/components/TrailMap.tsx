import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import 'leaflet/dist/leaflet.css';

interface TrailMapProps {
  members: Quest[];
  completed: Record<string, string>;
  onSelectQuest: (quest: Quest) => void;
}

interface PinnedMember {
  quest: Quest;
  lat: number;
  lng: number;
  stopNumber: number;
}

function buildStopIcon(color: string, label: string): L.DivIcon {
  const html = `
    <span style="
      display:inline-flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:9999px;
      background:${color};color:white;font-size:12px;font-weight:700;
      border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);
    ">${label}</span>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function BoundsFitter({ pinned }: { pinned: PinnedMember[] }) {
  const map = useMap();
  useEffect(() => {
    if (pinned.length === 0) return;
    if (pinned.length === 1) {
      map.setView([pinned[0].lat, pinned[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(pinned.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [map, pinned]);
  return null;
}

export function TrailMap({ members, completed, onSelectQuest }: TrailMapProps) {
  const pinned = useMemo<PinnedMember[]>(() => {
    return members.reduce<PinnedMember[]>((acc, q) => {
      if (typeof q.lat !== 'number' || typeof q.lng !== 'number') return acc;
      return [...acc, { quest: q, lat: q.lat, lng: q.lng, stopNumber: acc.length + 1 }];
    }, []);
  }, [members]);

  if (pinned.length === 0) return null;

  const center: [number, number] = [pinned[0].lat, pinned[0].lng];

  return (
    <div
      className="h-48 min-h-[192px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      aria-label="Trail stop map"
    >
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsFitter pinned={pinned} />
        {pinned.map(({ quest: q, lat, lng, stopNumber }) => {
          const cat = CATEGORY_MAP[q.category];
          const done = Boolean(completed[q.id]);
          const label = done ? '✓' : String(stopNumber);
          return (
            <Marker
              key={q.id}
              position={[lat, lng]}
              icon={buildStopIcon(done ? '#10B981' : cat.color, label)}
              eventHandlers={{ click: () => onSelectQuest(q) }}
            >
              <Popup>
                <div style={{ minWidth: '130px' }}>
                  <strong style={{ fontSize: '13px' }}>{q.title}</strong>
                  <br />
                  <span style={{ color: cat.color, fontSize: '12px' }}>
                    {cat.emoji} Stop {stopNumber}
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
  );
}
