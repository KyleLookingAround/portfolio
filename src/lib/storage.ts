import type { UserProgress } from '../types';

const STORAGE_KEY = 'stockport-quest-progress-v1';

function defaultProgress(): UserProgress {
  return {
    version: 2,
    displayName: 'Explorer',
    completed: {},
    favourites: [],
    streak: { lastActiveDate: '', current: 0, longest: 0 },
    trackedMetaQuestId: null,
    notes: {},
    seenAchievementIds: [],
  };
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Omit<UserProgress, 'version'>> & { version?: number };
      if (parsed.version === 1 || parsed.version === 2) {
        // Merge with defaults so older saves without newer fields still load.
        return { ...defaultProgress(), ...parsed, version: 2 } as UserProgress;
      }
    }
  } catch {
    // corrupt or unavailable storage
  }
  return defaultProgress();
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage quota exceeded or unavailable
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // unavailable
  }
}
