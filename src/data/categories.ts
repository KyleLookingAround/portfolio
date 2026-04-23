import type { Category, CategoryId } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'outdoors', label: 'Outdoors', emoji: '🌿', color: '#16A34A' },
  { id: 'food', label: 'Food & Drink', emoji: '🍽️', color: '#F97316' },
  { id: 'culture', label: 'Culture', emoji: '🎭', color: '#A855F7' },
  { id: 'history', label: 'History', emoji: '🏛️', color: '#B45309' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', color: '#EC4899' },
  { id: 'hidden', label: 'Hidden Gems', emoji: '💎', color: '#0EA5E9' },
  { id: 'fitness', label: 'Fitness', emoji: '🏃', color: '#DC2626' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌙', color: '#6366F1' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
) as Record<CategoryId, Category>;
