export type CategoryId =
  | 'outdoors'
  | 'food'
  | 'culture'
  | 'history'
  | 'family'
  | 'hidden'
  | 'fitness'
  | 'nightlife';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: CategoryId;
  difficulty: Difficulty;
  xp: number;
  emoji?: string;
  tags?: string[];
  // When non-empty, this quest is a meta-quest whose completion is derived
  // from all listed member quest ids. Its `xp` is a bonus awarded on top of
  // the members' XP when the set is fully completed.
  memberQuestIds?: string[];
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export interface StreakData {
  lastActiveDate: string;
  current: number;
  longest: number;
}

export interface UserProgress {
  version: 1;
  displayName: string;
  completed: Record<string, string>;
  favourites: string[];
  streak: StreakData;
  // Id of the meta-quest the user has chosen to focus on. Null if none selected.
  trackedMetaQuestId: string | null;
}
