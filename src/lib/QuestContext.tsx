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
import type { CustomMetaQuest, Quest, UserProgress } from '../types';
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

export const CUSTOM_TRAIL_PREFIX = 'custom-';

export function isCustomTrailId(id: string): boolean {
  return id.startsWith(CUSTOM_TRAIL_PREFIX);
}

function customAsQuest(c: CustomMetaQuest): Quest {
  return {
    id: c.id,
    title: c.title,
    description: `Your custom trail · ${c.memberQuestIds.length} ${c.memberQuestIds.length === 1 ? 'stop' : 'stops'}`,
    location: 'Stockport',
    category: 'outdoors',
    difficulty: 'medium',
    xp: 0,
    emoji: c.emoji ?? '🥾',
    memberQuestIds: c.memberQuestIds,
  };
}

function mergeQuests(custom: CustomMetaQuest[]): Quest[] {
  if (custom.length === 0) return QUESTS;
  return [...QUESTS, ...custom.map(customAsQuest)];
}

interface QuestContextValue {
  quests: Quest[];
  progress: UserProgress;
  totalXP: number;
  level: number;
  levelName: string;
  trackedMetaQuest: Quest | null;
  toggleComplete: (id: string) => ToggleCompleteResult;
  toggleFavourite: (id: string) => void;
  updateDisplayName: (name: string) => void;
  setTrackedMetaQuest: (id: string | null) => void;
  setNote: (id: string, value: string) => void;
  markAchievementsSeen: (ids: string[]) => void;
  resetProgress: () => void;
  createCustomTrail: (input: {
    title: string;
    emoji?: string;
    memberQuestIds: string[];
  }) => string;
  updateCustomTrail: (
    id: string,
    patch: Partial<Omit<CustomMetaQuest, 'id' | 'createdAt'>>
  ) => void;
  deleteCustomTrail: (id: string) => void;
}

const QuestContext = createContext<QuestContextValue | null>(null);

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

  const quests = useMemo(
    () => mergeQuests(progress.customMetaQuests),
    [progress.customMetaQuests]
  );

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
      const merged = mergeQuests(prev.customMetaQuests);
      // Meta-quests cannot be toggled directly — their state is derived.
      const target = merged.find(q => q.id === id);
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

      // Sync every meta-quest (built-in + custom) whose derived state may have changed.
      for (const meta of merged) {
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
      const merged = mergeQuests(prev.customMetaQuests);
      const target = merged.find(q => q.id === id);
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

  const createCustomTrail = useCallback(
    (input: { title: string; emoji?: string; memberQuestIds: string[] }): string => {
      const id = `${CUSTOM_TRAIL_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const trail: CustomMetaQuest = {
        id,
        title: input.title.trim() || 'My Trail',
        emoji: input.emoji,
        memberQuestIds: [...input.memberQuestIds],
        createdAt: new Date().toISOString(),
      };
      setProgress(prev => ({
        ...prev,
        customMetaQuests: [...prev.customMetaQuests, trail],
      }));
      return id;
    },
    []
  );

  const updateCustomTrail = useCallback(
    (id: string, patch: Partial<Omit<CustomMetaQuest, 'id' | 'createdAt'>>) => {
      setProgress(prev => {
        const idx = prev.customMetaQuests.findIndex(c => c.id === id);
        if (idx === -1) return prev;
        const next = [...prev.customMetaQuests];
        const current = next[idx];
        next[idx] = {
          ...current,
          ...patch,
          title: patch.title !== undefined ? patch.title.trim() || current.title : current.title,
          memberQuestIds: patch.memberQuestIds
            ? [...patch.memberQuestIds]
            : current.memberQuestIds,
        };
        return { ...prev, customMetaQuests: next };
      });
    },
    []
  );

  const deleteCustomTrail = useCallback((id: string) => {
    setProgress(prev => {
      if (!prev.customMetaQuests.some(c => c.id === id)) return prev;
      const next = {
        ...prev,
        customMetaQuests: prev.customMetaQuests.filter(c => c.id !== id),
      };
      if (prev.trackedMetaQuestId === id) {
        next.trackedMetaQuestId = null;
      }
      // Also drop a derived completion record if one exists.
      if (prev.completed[id]) {
        const nextCompleted = { ...prev.completed };
        delete nextCompleted[id];
        next.completed = nextCompleted;
      }
      return next;
    });
  }, []);

  const trackedMetaQuest = useMemo<Quest | null>(() => {
    if (!progress.trackedMetaQuestId) return null;
    return quests.find(q => q.id === progress.trackedMetaQuestId && isMetaQuest(q)) ?? null;
  }, [quests, progress.trackedMetaQuestId]);

  const value = useMemo<QuestContextValue>(
    () => ({
      quests,
      progress,
      totalXP,
      level,
      levelName,
      trackedMetaQuest,
      toggleComplete,
      toggleFavourite,
      updateDisplayName,
      setTrackedMetaQuest,
      setNote,
      markAchievementsSeen,
      resetProgress,
      createCustomTrail,
      updateCustomTrail,
      deleteCustomTrail,
    }),
    [
      quests,
      progress,
      totalXP,
      level,
      levelName,
      trackedMetaQuest,
      toggleComplete,
      toggleFavourite,
      updateDisplayName,
      setTrackedMetaQuest,
      setNote,
      markAchievementsSeen,
      resetProgress,
      createCustomTrail,
      updateCustomTrail,
      deleteCustomTrail,
    ]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}
