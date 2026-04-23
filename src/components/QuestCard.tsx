import { useCallback } from 'react';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';
import { isMetaQuest, getMetaQuestProgress } from '../lib/progress';

interface QuestCardProps {
  quest: Quest;
  onSelect: (quest: Quest) => void;
  onLevelUp?: (message: string) => void;
  compact?: boolean;
}

const DIFFICULTY_LABEL: Record<Quest['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const DIFFICULTY_COLOR: Record<Quest['difficulty'], string> = {
  easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
  hard: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
};

export function QuestCard({ quest, onSelect, onLevelUp, compact = false }: QuestCardProps) {
  const { progress, toggleComplete, toggleFavourite } = useQuestContext();
  const isCompleted = Boolean(progress.completed[quest.id]);
  const isFavourite = progress.favourites.includes(quest.id);
  const category = CATEGORY_MAP[quest.category];
  const meta = isMetaQuest(quest);
  const metaProgress = meta ? getMetaQuestProgress(quest, progress.completed) : null;

  const handleCardClick = useCallback(() => {
    onSelect(quest);
  }, [quest, onSelect]);

  const handleCardKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(quest);
    }
  }, [quest, onSelect]);

  const handleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleComplete(quest.id);
    if (result.levelDelta > 0 && onLevelUp) {
      onLevelUp(`Level up! You are now a ${result.levelName} 🎉`);
    }
  }, [quest.id, toggleComplete, onLevelUp]);

  const handleFavourite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavourite(quest.id);
  }, [quest.id, toggleFavourite]);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKey}
      className={[
        'relative rounded-2xl border cursor-pointer transition-all select-none',
        'bg-white dark:bg-surface-dark',
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-800 opacity-75'
          : 'border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand-dark hover:shadow-md',
        compact ? 'p-3' : 'p-4',
      ].join(' ')}
      aria-label={`${quest.title}${isCompleted ? ' (completed)' : ''}`}
    >
      {/* Category colour bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: category.color }}
        aria-hidden="true"
      />

      <div className={compact ? 'pl-3' : 'pl-4'}>
        {/* Header row */}
        <div className="flex items-start gap-2 pr-16">
          {quest.emoji && (
            <span className="text-xl shrink-0 leading-none mt-0.5" aria-hidden="true">
              {quest.emoji}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3
              className={[
                'font-semibold leading-snug',
                compact ? 'text-sm' : 'text-base',
                'text-gray-900 dark:text-gray-100',
                isCompleted && 'line-through text-gray-400 dark:text-gray-500',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {quest.title}
            </h3>
            {!compact && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {quest.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
            style={{ color: category.color, backgroundColor: `${category.color}18` }}
          >
            <span aria-hidden="true">{category.emoji}</span>
            {category.label}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[quest.difficulty]}`}
          >
            {DIFFICULTY_LABEL[quest.difficulty]}
          </span>
          <span className="text-xs text-accent font-semibold ml-auto">
            +{quest.xp}{meta ? ' bonus' : ' XP'}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            📍 {quest.location.split(',')[0]}
          </span>
        </div>
      </div>

      {/* Action buttons — absolutely positioned to avoid nesting interactive elements */}
      <button
        type="button"
        className="absolute top-3 right-9 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={handleFavourite}
        aria-label={isFavourite ? `Remove ${quest.title} from favourites` : `Add ${quest.title} to favourites`}
      >
        <span aria-hidden="true">{isFavourite ? '❤️' : '🤍'}</span>
      </button>
      {meta && metaProgress ? (
        <div
          className={[
            'absolute top-2.5 right-2 px-2 py-0.5 rounded-full text-xs font-semibold pointer-events-none',
            isCompleted
              ? 'bg-accent/10 text-accent'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
          ].join(' ')}
          role="progressbar"
          aria-valuenow={metaProgress.done}
          aria-valuemin={0}
          aria-valuemax={metaProgress.total}
          aria-label={`${metaProgress.done} of ${metaProgress.total} stops completed`}
        >
          {isCompleted ? '✅ ' : ''}{metaProgress.done}/{metaProgress.total}
        </div>
      ) : (
        <button
          type="button"
          className={[
            'absolute top-3 right-2 p-1.5 rounded-full transition-colors',
            isCompleted
              ? 'text-accent hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
          ].join(' ')}
          onClick={handleComplete}
          aria-label={isCompleted ? `Mark ${quest.title} as incomplete` : `Mark ${quest.title} as complete`}
        >
          <span aria-hidden="true">{isCompleted ? '✅' : '○'}</span>
        </button>
      )}
    </article>
  );
}
