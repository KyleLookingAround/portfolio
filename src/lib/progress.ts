import type { Difficulty, Quest, UserProgress } from '../types';

export const XP_BY_DIFFICULTY = { easy: 10, medium: 25, hard: 50 } as const;

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const LEVEL_NAMES = [
  'Stockport Newcomer',
  'Underbanks Explorer',
  'Viaduct Wanderer',
  'Hat Works Historian',
  'Bramall Baron',
  'Reddish Vale Ranger',
  'Stockport Legend',
] as const;

export function xpForLevel(level: number): number {
  return 20 * (level - 1) * (level - 1);
}

export function computeLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 20)) + 1;
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}

export function computeTotalXP(
  completed: Record<string, string>,
  quests: Quest[]
): number {
  const xpMap = Object.fromEntries(quests.map(q => [q.id, q.xp]));
  return Object.keys(completed).reduce((sum, id) => sum + (xpMap[id] ?? 0), 0);
}

export function getLocalDateStr(): string {
  return new Date().toLocaleDateString('en-CA');
}

function dateStrOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-CA');
}

export function updateStreak(progress: UserProgress, today: string): UserProgress {
  const { streak } = progress;
  const yesterday = dateStrOffset(-1);

  if (!streak.lastActiveDate || streak.lastActiveDate < yesterday) {
    const updated = { ...streak, current: 1, lastActiveDate: today };
    return { ...progress, streak: { ...updated, longest: Math.max(updated.longest, 1) } };
  }
  if (streak.lastActiveDate === today) {
    return progress;
  }
  // lastActiveDate === yesterday
  const current = streak.current + 1;
  return {
    ...progress,
    streak: { lastActiveDate: today, current, longest: Math.max(streak.longest, current) },
  };
}

export function checkStreakReset(progress: UserProgress): UserProgress {
  const { streak } = progress;
  if (!streak.lastActiveDate) return progress;
  const yesterday = dateStrOffset(-1);
  if (streak.lastActiveDate < yesterday && streak.current > 0) {
    return { ...progress, streak: { ...streak, current: 0 } };
  }
  return progress;
}

export function isMetaQuest(quest: Quest): boolean {
  return !!quest.memberQuestIds && quest.memberQuestIds.length > 0;
}

export function getMetaQuestProgress(
  quest: Quest,
  completed: Record<string, string>
): { done: number; total: number } {
  const members = quest.memberQuestIds ?? [];
  let done = 0;
  for (const id of members) {
    if (completed[id]) done++;
  }
  return { done, total: members.length };
}

export function isMetaQuestFullyComplete(
  quest: Quest,
  completed: Record<string, string>
): boolean {
  const members = quest.memberQuestIds ?? [];
  return members.length > 0 && members.every(id => !!completed[id]);
}

export function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash * 31) + dateStr.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

export function getQuestOfTheDay(
  quests: Quest[],
  completed: Record<string, string>
): Quest | null {
  const available = quests.filter(q => !completed[q.id]);
  if (available.length === 0) return null;
  const today = getLocalDateStr();
  const hash = hashDateString(today);
  return available[hash % available.length];
}

// Great-circle distance in kilometres between two lat/lng points.
export function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function tripDistanceKm(coords: Array<{ lat: number; lng: number }>): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1], coords[i]);
  }
  return total;
}

export function walkingTimeMinutes(km: number, kmh: number = 5): number {
  if (kmh <= 0) return 0;
  return (km / kmh) * 60;
}

export function nearestQuestsByCoord<T extends { lat?: number; lng?: number }>(
  from: { lat: number; lng: number },
  list: T[],
  n: number
): T[] {
  const withCoords = list.filter(
    (item): item is T & { lat: number; lng: number } =>
      typeof item.lat === 'number' && typeof item.lng === 'number'
  );
  return withCoords
    .map(item => ({ item, d: haversineDistance(from, { lat: item.lat, lng: item.lng }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map(x => x.item);
}
