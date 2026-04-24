import type { CategoryId, Quest, UserProgress } from '../types';
import { isMetaQuest } from './progress';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  predicate: (progress: UserProgress, quests: Quest[]) => boolean;
}

function completedCount(progress: UserProgress, excludeMeta: boolean, quests: Quest[]): number {
  if (!excludeMeta) return Object.keys(progress.completed).length;
  const metaIds = new Set(quests.filter(isMetaQuest).map(q => q.id));
  return Object.keys(progress.completed).filter(id => !metaIds.has(id)).length;
}

function completedInCategory(progress: UserProgress, quests: Quest[], category: CategoryId): number {
  const catIds = new Set(quests.filter(q => q.category === category && !isMetaQuest(q)).map(q => q.id));
  let count = 0;
  for (const id of Object.keys(progress.completed)) {
    if (catIds.has(id)) count++;
  }
  return count;
}

function totalInCategory(quests: Quest[], category: CategoryId): number {
  return quests.filter(q => q.category === category && !isMetaQuest(q)).length;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-quest',
    title: 'First Steps',
    description: 'Complete your first quest.',
    emoji: '🚶',
    predicate: (p, q) => completedCount(p, true, q) >= 1,
  },
  {
    id: 'five-quests',
    title: 'Getting Started',
    description: 'Complete 5 quests.',
    emoji: '🌱',
    predicate: (p, q) => completedCount(p, true, q) >= 5,
  },
  {
    id: 'twenty-five-quests',
    title: 'Seasoned Explorer',
    description: 'Complete 25 quests.',
    emoji: '🗺️',
    predicate: (p, q) => completedCount(p, true, q) >= 25,
  },
  {
    id: 'fifty-quests',
    title: 'Half Centurion',
    description: 'Complete 50 quests.',
    emoji: '🏅',
    predicate: (p, q) => completedCount(p, true, q) >= 50,
  },
  {
    id: 'first-hard',
    title: 'Going Hard',
    description: 'Complete your first hard quest.',
    emoji: '💪',
    predicate: (p, q) => {
      const hardIds = new Set(q.filter(x => x.difficulty === 'hard' && !isMetaQuest(x)).map(x => x.id));
      return Object.keys(p.completed).some(id => hardIds.has(id));
    },
  },
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Keep a 7-day streak going.',
    emoji: '🔥',
    predicate: p => p.streak.longest >= 7 || p.streak.current >= 7,
  },
  {
    id: 'ten-favourites',
    title: 'Collector',
    description: 'Save 10 favourites.',
    emoji: '❤️',
    predicate: p => p.favourites.length >= 10,
  },
  {
    id: 'all-rounder',
    title: 'All-Rounder',
    description: 'Complete at least one quest from every category.',
    emoji: '🌈',
    predicate: (p, q) => {
      const categories: CategoryId[] = ['outdoors', 'food', 'culture', 'history', 'family', 'hidden', 'fitness', 'nightlife'];
      return categories.every(c => completedInCategory(p, q, c) >= 1);
    },
  },
  {
    id: 'first-trail',
    title: 'Trailblazer',
    description: 'Finish any multi-stop trail.',
    emoji: '🧭',
    predicate: (p, q) => q.some(x => isMetaQuest(x) && !!p.completed[x.id]),
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete every nightlife quest.',
    emoji: '🦉',
    predicate: (p, q) => {
      const total = totalInCategory(q, 'nightlife');
      return total > 0 && completedInCategory(p, q, 'nightlife') === total;
    },
  },
  {
    id: 'bookworm',
    title: 'Culture Vulture',
    description: 'Complete every culture quest.',
    emoji: '📚',
    predicate: (p, q) => {
      const total = totalInCategory(q, 'culture');
      return total > 0 && completedInCategory(p, q, 'culture') === total;
    },
  },
];

export function getUnlockedIds(progress: UserProgress, quests: Quest[]): string[] {
  return ACHIEVEMENTS.filter(a => a.predicate(progress, quests)).map(a => a.id);
}

export function getNewlyUnlocked(
  prevProgress: UserProgress,
  nextProgress: UserProgress,
  quests: Quest[]
): Achievement[] {
  const prevSet = new Set(
    ACHIEVEMENTS.filter(a => a.predicate(prevProgress, quests)).map(a => a.id)
  );
  const seenSet = new Set(nextProgress.seenAchievementIds);
  return ACHIEVEMENTS.filter(
    a => !prevSet.has(a.id) && !seenSet.has(a.id) && a.predicate(nextProgress, quests)
  );
}
