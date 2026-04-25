import { useMemo } from 'react';
import type { CategoryId, Quest, UserProgress } from '../types';
import { ACHIEVEMENTS, getUnlockedIds } from '../lib/achievements';

interface AchievementsPanelProps {
  progress: UserProgress;
  quests: Quest[];
  onNavigate?: (category: CategoryId) => void;
}

export function AchievementsPanel({ progress, quests, onNavigate }: AchievementsPanelProps) {
  const unlockedIds = useMemo(() => new Set(getUnlockedIds(progress, quests)), [progress, quests]);
  const unlockedCount = unlockedIds.size;

  return (
    <section
      aria-labelledby="achievements-heading"
      className="bg-white dark:bg-surface-dark rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          id="achievements-heading"
          className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
        >
          <span aria-hidden="true">🏆</span> Achievements
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {unlockedCount} of {ACHIEVEMENTS.length}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map(a => {
          const unlocked = unlockedIds.has(a.id);
          return (
            <li
              key={a.id}
              className={[
                'flex items-start gap-2 rounded-xl border p-2.5',
                unlocked
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-gray-200 dark:border-gray-700 opacity-60',
              ].join(' ')}
              aria-label={`${a.title} — ${unlocked ? 'unlocked' : 'locked'}`}
            >
              <span
                className={[
                  'text-xl shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
                  unlocked ? 'bg-accent/20' : 'bg-gray-100 dark:bg-gray-700 grayscale',
                ].join(' ')}
                aria-hidden="true"
              >
                {a.emoji}
              </span>
              <div className="min-w-0">
                <p className={[
                  'text-xs font-semibold truncate',
                  unlocked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
                ].join(' ')}>
                  {a.title}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight line-clamp-2">
                  {a.description}
                </p>
                {!unlocked && a.filterCategory && onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate(a.filterCategory!)}
                    aria-label={`Find ${a.title} quests`}
                    className="text-[10px] text-brand dark:text-brand-dark font-medium hover:underline mt-0.5"
                  >
                    Find quests →
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
