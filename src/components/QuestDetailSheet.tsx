import { useEffect, useRef, useCallback } from 'react';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';

interface QuestDetailSheetProps {
  quest: Quest;
  onClose: () => void;
  onLevelUp: (message: string) => void;
}

const DIFFICULTY_LABEL: Record<Quest['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function QuestDetailSheet({ quest, onClose, onLevelUp }: QuestDetailSheetProps) {
  const { progress, toggleComplete, toggleFavourite } = useQuestContext();
  const isCompleted = Boolean(progress.completed[quest.id]);
  const isFavourite = progress.favourites.includes(quest.id);
  const category = CATEGORY_MAP[quest.category];
  const closeRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleComplete = useCallback(() => {
    const result = toggleComplete(quest.id);
    if (result.levelDelta > 0) {
      onLevelUp(`Level up! You are now a ${result.levelName} 🎉`);
    }
  }, [quest.id, toggleComplete, onLevelUp]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.location + ', Stockport, UK')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          'relative bg-white dark:bg-surface-dark rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto',
          !prefersReduced ? 'animate-slide-up' : '',
        ].join(' ')}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Close button */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="px-5 pb-8">
          {/* Category + emoji header */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full font-medium"
              style={{ color: category.color, backgroundColor: `${category.color}18` }}
            >
              <span aria-hidden="true">{category.emoji}</span>
              {category.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {DIFFICULTY_LABEL[quest.difficulty]}
            </span>
            <span className="text-sm text-accent font-semibold ml-auto">+{quest.xp} XP</span>
          </div>

          {/* Title */}
          <h2
            id="sheet-title"
            className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1"
          >
            {quest.emoji && (
              <span className="mr-2" aria-hidden="true">{quest.emoji}</span>
            )}
            {quest.title}
          </h2>

          {/* Location */}
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4">
            <span aria-hidden="true">📍</span>
            {quest.location}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {quest.description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleComplete}
              className={[
                'w-full py-3 rounded-xl text-sm font-semibold transition-colors',
                isCompleted
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-accent text-white hover:bg-emerald-600',
              ].join(' ')}
            >
              {isCompleted ? '↩ Mark as incomplete' : '✓ Mark as complete'}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toggleFavourite(quest.id)}
                className={[
                  'flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors',
                  isFavourite
                    ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                ].join(' ')}
              >
                {isFavourite ? '❤️ Saved' : '🤍 Save'}
              </button>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                🗺️ Open in Maps
              </a>
            </div>
          </div>

          {/* Tags */}
          {quest.tags && quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5" aria-label="Tags">
              {quest.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
