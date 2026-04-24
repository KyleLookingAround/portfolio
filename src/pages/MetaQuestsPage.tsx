import { useMemo } from 'react';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';
import {
  isMetaQuest,
  getMetaQuestProgress,
  isMetaQuestFullyComplete,
} from '../lib/progress';

interface MetaQuestsPageProps {
  onSelectQuest: (quest: Quest) => void;
}

export function MetaQuestsPage({ onSelectQuest }: MetaQuestsPageProps) {
  const { quests, progress, trackedMetaQuest, setTrackedMetaQuest } = useQuestContext();

  const metaQuests = useMemo<Quest[]>(
    () => quests.filter(isMetaQuest),
    [quests]
  );

  const trackedId = trackedMetaQuest?.id ?? null;
  const totalTrails = metaQuests.length;
  const completedTrails = metaQuests.filter(m =>
    isMetaQuestFullyComplete(m, progress.completed)
  ).length;

  return (
    <div className="flex flex-col">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-brand to-indigo-700 dark:from-indigo-800 dark:to-indigo-950 px-5 pt-12 pb-8">
        <p className="text-indigo-200 text-sm font-medium mb-1">Multi-stop adventures</p>
        <h1 className="text-2xl font-bold text-white mb-1">Stockport Trails</h1>
        <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
          Tick off every stop on a trail to unlock a bonus XP reward. Pick one to track and
          it&apos;ll stay front-and-centre on your Discover page.
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 bg-white/15 text-white text-sm px-3 py-1.5 rounded-full">
          <span aria-hidden="true">🏁</span>
          <span>
            {completedTrails} of {totalTrails} trails complete
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-3">
        {metaQuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3" aria-hidden="true">🗺️</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              No trails available yet
            </p>
          </div>
        ) : (
          metaQuests.map(meta => (
            <TrailCard
              key={meta.id}
              quest={meta}
              isTracked={trackedId === meta.id}
              onOpen={onSelectQuest}
              onToggleTrack={() =>
                setTrackedMetaQuest(trackedId === meta.id ? null : meta.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TrailCardProps {
  quest: Quest;
  isTracked: boolean;
  onOpen: (quest: Quest) => void;
  onToggleTrack: () => void;
}

function TrailCard({ quest, isTracked, onOpen, onToggleTrack }: TrailCardProps) {
  const { progress } = useQuestContext();
  const category = CATEGORY_MAP[quest.category];
  const { done, total } = getMetaQuestProgress(quest, progress.completed);
  const pct = total > 0 ? (done / total) * 100 : 0;
  const fullyDone = done === total && total > 0;

  function handleCardKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(quest);
    }
  }

  function handleTrackClick(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleTrack();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(quest)}
      onKeyDown={handleCardKey}
      className={[
        'relative rounded-2xl border p-4 cursor-pointer transition-all select-none',
        'bg-white dark:bg-surface-dark',
        isTracked
          ? 'border-brand dark:border-brand-dark ring-2 ring-brand/30 dark:ring-brand-dark/30 shadow-md'
          : fullyDone
            ? 'border-emerald-200 dark:border-emerald-800'
            : 'border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand-dark hover:shadow-md',
      ].join(' ')}
      aria-label={`${quest.title}${fullyDone ? ' (complete)' : ''}${isTracked ? ' (currently tracking)' : ''}`}
    >
      {/* Category colour bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: category.color }}
        aria-hidden="true"
      />

      <div className="pl-3">
        {/* Header row */}
        <div className="flex items-start gap-2">
          {quest.emoji && (
            <span className="text-2xl shrink-0 leading-none mt-0.5" aria-hidden="true">
              {quest.emoji}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-base leading-snug text-gray-900 dark:text-gray-100">
                {quest.title}
              </h2>
              {isTracked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-brand text-white">
                  <span aria-hidden="true">📌</span> Tracking
                </span>
              )}
              {fullyDone && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                  ✓ Complete
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {quest.description}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{ color: category.color, backgroundColor: `${category.color}18` }}
            >
              <span aria-hidden="true">{category.emoji}</span>
              {category.label}
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {done}/{total} stops
            </span>
          </div>
          <div
            className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`${quest.title} progress`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: category.color }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-accent font-semibold">
            +{quest.xp} bonus XP
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
            📍 {quest.location.split(',')[0]}
          </span>
          <button
            type="button"
            onClick={handleTrackClick}
            className={[
              'ml-auto text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0',
              isTracked
                ? 'bg-brand/10 dark:bg-brand-dark/20 text-brand dark:text-brand-dark hover:bg-brand/20 dark:hover:bg-brand-dark/30'
                : 'bg-brand text-white hover:bg-indigo-700',
            ].join(' ')}
            aria-pressed={isTracked}
            aria-label={isTracked ? `Stop tracking ${quest.title}` : `Track ${quest.title}`}
          >
            {isTracked ? '📌 Tracking' : 'Track'}
          </button>
        </div>
      </div>
    </article>
  );
}
