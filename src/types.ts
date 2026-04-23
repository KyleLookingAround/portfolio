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
}
