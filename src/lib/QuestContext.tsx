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
import { QUESTS } from '../data/quests';
import { loadProgress, saveProgress, clearProgress } from './storage';
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

interface ToggleCompleteResult {
  levelDelta: number;
  newLevel: number;
  levelName: string;
}

interface QuestContextValue {
  quests: Quest[];
  progress: UserProgress;
  totalXP: number;
  level: number;
  levelName: string;
  toggleComplete: (id: string) => ToggleCompleteResult;
  toggleFavourite: (id: string) => void;
  updateDisplayName: (name: string) => void;
  resetProgress: () => void;
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

      if (!isCompleted) {
        updated = updateStreak(updated, today);
      }

      const xpAfter = computeTotalXP(updatedCompleted, QUESTS);
      const levelAfter = computeLevel(xpAfter);
      levelDelta = levelAfter - levelBefore;
      newLevel = levelAfter;
      newLevelName = getLevelName(levelAfter);

      return updated;
    });

    return { levelDelta, newLevel, levelName: newLevelName };
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

  const resetProgress = useCallback(() => {
    clearProgress();
    setProgress(loadProgress());
  }, []);

  const value = useMemo<QuestContextValue>(
    () => ({
      quests: QUESTS,
      progress,
      totalXP,
      level,
      levelName,
      toggleComplete,
      toggleFavourite,
      updateDisplayName,
      resetProgress,
    }),
    [progress, totalXP, level, levelName, toggleComplete, toggleFavourite, updateDisplayName, resetProgress]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}
