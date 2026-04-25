import { useMemo, useState } from 'react';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { isCustomTrailId, useQuestContext } from '../lib/QuestContext';
import {
  isMetaQuest,
  getMetaQuestProgress,
  isMetaQuestFullyComplete,
} from '../lib/progress';
import { buildShareUrl } from '../lib/trailShare';
import { navigateToPlanTrailEdit, navigateToPlanTrailNew } from '../lib/planTrailNav';

interface MetaQuestsPageProps {
  onSelectQuest: (quest: Quest) => void;
}

export function MetaQuestsPage({ onSelectQuest }: MetaQuestsPageProps) {
  const {
    quests,
    progress,
    trackedMetaQuest,
    setTrackedMetaQuest,
    deleteCustomTrail,
  } = useQuestContext();

  const metaQuests = useMemo<Quest[]>(
    () => quests.filter(isMetaQuest),
    [quests]
  );

  const trackedId = trackedMetaQuest?.id ?? null;
  const totalTrails = metaQuests.length;
  const completedTrails = metaQuests.filter(m =>
    isMetaQuestFullyComplete(m, progress.completed)
  ).length;

  function handleNew() {
    navigateToPlanTrailNew();
  }

  function handleDelete(quest: Quest) {
    if (!isCustomTrailId(quest.id)) return;
    if (!window.confirm(`Delete "${quest.title}"? This can't be undone.`)) return;
    deleteCustomTrail(quest.id);
  }

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

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-sm px-3 py-1.5 rounded-full">
            <span aria-hidden="true">🏁</span>
            <span>
              {completedTrails} of {totalTrails} trails complete
            </span>
          </span>
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 bg-white text-brand text-sm font-semibold px-3 py-1.5 rounded-full shadow hover:bg-indigo-50 transition-colors"
          >
            <span aria-hidden="true">＋</span>
            <span>Plan your own trail</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-3">
        {metaQuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3" aria-hidden="true">🗺️</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              No trails available yet
            </p>
            <button
              type="button"
              onClick={handleNew}
              className="mt-3 px-4 py-2 bg-brand text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Plan your own trail
            </button>
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
              onEdit={isCustomTrailId(meta.id) ? () => navigateToPlanTrailEdit(meta.id) : undefined}
              onDelete={isCustomTrailId(meta.id) ? () => handleDelete(meta) : undefined}
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
  onEdit?: () => void;
  onDelete?: () => void;
}

function TrailCard({ quest, isTracked, onOpen, onToggleTrack, onEdit, onDelete }: TrailCardProps) {
  const { progress } = useQuestContext();
  const category = CATEGORY_MAP[quest.category];
  const { done, total } = getMetaQuestProgress(quest, progress.completed);
  const pct = total > 0 ? (done / total) * 100 : 0;
  const fullyDone = done === total && total > 0;
  const isCustom = onEdit !== undefined && onDelete !== undefined;
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  function handleCardKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(quest);
    }
  }

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = buildShareUrl({
      title: quest.title,
      emoji: quest.emoji,
      memberQuestIds: quest.memberQuestIds ?? [],
    });
    const shareData = {
      title: quest.title,
      text: `Stockport trail: ${quest.title}`,
      url,
    };
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      canShare?: (data: ShareData) => boolean;
    };
    if (nav.share && (!nav.canShare || nav.canShare(shareData))) {
      try {
        await nav.share(shareData);
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      setShareStatus('failed');
      setTimeout(() => setShareStatus('idle'), 2500);
    }
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
              {isCustom && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-brand dark:text-brand-dark">
                  Yours
                </span>
              )}
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
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {quest.xp > 0 && (
            <span className="text-xs text-accent font-semibold">
              +{quest.xp} bonus XP
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
            📍 {quest.location.split(',')[0]}
          </span>
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            {isCustom && (
              <>
                <button
                  type="button"
                  onClick={handleShare}
                  onMouseDown={stop}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label={`Share ${quest.title}`}
                >
                  {shareStatus === 'copied' ? '✓ Copied' : shareStatus === 'failed' ? 'Try again' : '🔗 Share'}
                </button>
                <button
                  type="button"
                  onClick={e => { stop(e); onEdit?.(); }}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label={`Edit ${quest.title}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={e => { stop(e); onDelete?.(); }}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                  aria-label={`Delete ${quest.title}`}
                >
                  Delete
                </button>
              </>
            )}
            <button
              type="button"
              onClick={e => { stop(e); onToggleTrack(); }}
              className={[
                'text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0',
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
      </div>
    </article>
  );
}
