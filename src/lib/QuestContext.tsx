/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import type { Quest, UserProgress } from '../types';
import { QUESTS as RAW_QUESTS } from '../data/quests';
import { QUEST_COORDS } from '../data/quest-coords';
import { loadProgress, saveProgress, clearProgress } from './storage';

// Merge optional coordinates from the sidecar map.
const QUESTS: Quest[] = RAW_QUESTS.map(q => {
  const c = QUEST_COORDS[q.id];
  return c ? { ...q, ...c } : q;
});
import {
  computeLevel,
  computeTotalXP,
  getLevelName,
  getLocalDateStr,
  updateStreak,
  checkStreakReset,
  isMetaQuest,
  isMetaQuestFullyComplete,
} from './progress';
import { getNewlyUnlocked, type Achievement } from './achievements';

interface ToggleCompleteResult {
  levelDelta: number;
  newLevel: number;
  levelName: string;
  unlockedAchievements: Achievement[];
}

interface QuestContextValue {
  quests: Quest[];
  progress: UserProgress;
  totalXP: number;
  level: number;
  levelName: string;
  trackedMetaQuest: Quest | null;
  tripQuests: Quest[];
  toggleComplete: (id: string) => ToggleCompleteResult;
  toggleFavourite: (id: string) => void;
  updateDisplayName: (name: string) => void;
  setTrackedMetaQuest: (id: string | null) => void;
  setNote: (id: string, value: string) => void;
  markAchievementsSeen: (ids: string[]) => void;
  resetProgress: () => void;
  addToTrip: (id: string) => void;
  removeFromTrip: (id: string) => void;
  clearTrip: () => void;
  reorderTrip: (fromIndex: number, toIndex: number) => void;
}

const QuestContext = createContext<QuestContextValue | null>(null);

export const MAX_TRIP_STOPS = 10;

export function useQuestContext(): QuestContextValue {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error('useQuestContext must be used inside QuestContextProvider');
  return ctx;
}

export function QuestContextProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const p = loadProgress();
    return checkStreakReset(p);
  });

  const totalXP = useMemo(() => computeTotalXP(progress.completed, QUESTS), [progress.completed]);
  const level = useMemo(() => computeLevel(totalXP), [totalXP]);
  const levelName = useMemo(() => getLevelName(level), [level]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const toggleComplete = useCallback((id: string): ToggleCompleteResult => {
    let levelDelta = 0;
    let newLevel = 0;
    let newLevelName = '';
    let unlockedAchievements: Achievement[] = [];

    setProgress(prev => {
      // Meta-quests cannot be toggled directly — their state is derived.
      const target = QUESTS.find(q => q.id === id);
      if (target && isMetaQuest(target)) {
        newLevel = computeLevel(computeTotalXP(prev.completed, QUESTS));
        newLevelName = getLevelName(newLevel);
        return prev;
      }

      const xpBefore = computeTotalXP(prev.completed, QUESTS);
      const levelBefore = computeLevel(xpBefore);

      const isCompleted = Boolean(prev.completed[id]);
      const updatedCompleted: Record<string, string> = { ...prev.completed };
      const nowIso = new Date().toISOString();

      if (isCompleted) {
        delete updatedCompleted[id];
      } else {
        updatedCompleted[id] = nowIso;
      }

      // Sync every meta-quest whose derived state may have changed.
      for (const meta of QUESTS) {
        if (!isMetaQuest(meta)) continue;
        const fullyDone = isMetaQuestFullyComplete(meta, updatedCompleted);
        const wasMarked = Boolean(updatedCompleted[meta.id]);
        if (fullyDone && !wasMarked) {
          updatedCompleted[meta.id] = nowIso;
        } else if (!fullyDone && wasMarked) {
          delete updatedCompleted[meta.id];
        }
      }

      const today = getLocalDateStr();
      let updated = { ...prev, completed: updatedCompleted };

      // Auto-clear the tracked trail once it's fully complete.
      if (prev.trackedMetaQuestId && updatedCompleted[prev.trackedMetaQuestId]) {
        updated = { ...updated, trackedMetaQuestId: null };
      }

      if (!isCompleted) {
        updated = updateStreak(updated, today);
      }

      const xpAfter = computeTotalXP(updatedCompleted, QUESTS);
      const levelAfter = computeLevel(xpAfter);
      levelDelta = levelAfter - levelBefore;
      newLevel = levelAfter;
      newLevelName = getLevelName(levelAfter);

      unlockedAchievements = getNewlyUnlocked(prev, updated, QUESTS);

      return updated;
    });

    return { levelDelta, newLevel, levelName: newLevelName, unlockedAchievements };
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    setProgress(prev => {
      const isFav = prev.favourites.includes(id);
      return {
        ...prev,
        favourites: isFav
          ? prev.favourites.filter(f => f !== id)
          : [...prev.favourites, id],
      };
    });
  }, []);

  const updateDisplayName = useCallback((name: string) => {
    setProgress(prev => ({ ...prev, displayName: name.trim() || 'Explorer' }));
  }, []);

  const setTrackedMetaQuest = useCallback((id: string | null) => {
    setProgress(prev => {
      if (id === null) return { ...prev, trackedMetaQuestId: null };
      const target = QUESTS.find(q => q.id === id);
      if (!target || !isMetaQuest(target)) return prev;
      return { ...prev, trackedMetaQuestId: id };
    });
  }, []);

  const setNote = useCallback((id: string, value: string) => {
    setProgress(prev => {
      const trimmed = value.trim();
      const nextNotes = { ...prev.notes };
      if (trimmed) {
        nextNotes[id] = trimmed;
      } else {
        delete nextNotes[id];
      }
      return { ...prev, notes: nextNotes };
    });
  }, []);

  const markAchievementsSeen = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setProgress(prev => {
      const next = new Set(prev.seenAchievementIds);
      let changed = false;
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (!changed) return prev;
      return { ...prev, seenAchievementIds: [...next] };
    });
  }, []);

  const resetProgress = useCallback(() => {
    clearProgress();
    setProgress(loadProgress());
  }, []);

  const addToTrip = useCallback((id: string) => {
    setProgress(prev => {
      if (prev.tripSelection.includes(id)) return prev;
      if (prev.tripSelection.length >= MAX_TRIP_STOPS) return prev;
      return { ...prev, tripSelection: [...prev.tripSelection, id] };
    });
  }, []);

  const removeFromTrip = useCallback((id: string) => {
    setProgress(prev => {
      if (!prev.tripSelection.includes(id)) return prev;
      return { ...prev, tripSelection: prev.tripSelection.filter(x => x !== id) };
    });
  }, []);

  const clearTrip = useCallback(() => {
    setProgress(prev => (prev.tripSelection.length === 0 ? prev : { ...prev, tripSelection: [] }));
  }, []);

  const reorderTrip = useCallback((fromIndex: number, toIndex: number) => {
    setProgress(prev => {
      const list = prev.tripSelection;
      if (
        fromIndex === toIndex ||
        fromIndex < 0 || fromIndex >= list.length ||
        toIndex < 0 || toIndex >= list.length
      ) return prev;
      const next = [...list];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, tripSelection: next };
    });
  }, []);

  const trackedMetaQuest = useMemo<Quest | null>(() => {
    if (!progress.trackedMetaQuestId) return null;
    return QUESTS.find(q => q.id === progress.trackedMetaQuestId && isMetaQuest(q)) ?? null;
  }, [progress.trackedMetaQuestId]);

  const tripQuests = useMemo<Quest[]>(() => {
    const byId = new Map(QUESTS.map(q => [q.id, q]));
    const out: Quest[] = [];
    for (const id of progress.tripSelection) {
      const q = byId.get(id);
      if (q && typeof q.lat === 'number' && typeof q.lng === 'number') out.push(q);
    }
    return out;
  }, [progress.tripSelection]);

  const value = useMemo<QuestContextValue>(
    () => ({
      quests: QUESTS,
      progress,
      totalXP,
      level,
      levelName,
      trackedMetaQuest,
      tripQuests,
      toggleComplete,
      toggleFavourite,
      updateDisplayName,
      setTrackedMetaQuest,
      setNote,
      markAchievementsSeen,
      resetProgress,
      addToTrip,
      removeFromTrip,
      clearTrip,
      reorderTrip,
    }),
    [
      progress,
      totalXP,
      level,
      levelName,
      trackedMetaQuest,
      tripQuests,
      toggleComplete,
      toggleFavourite,
      updateDisplayName,
      setTrackedMetaQuest,
      setNote,
      markAchievementsSeen,
      resetProgress,
      addToTrip,
      removeFromTrip,
      clearTrip,
      reorderTrip,
    ]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}
