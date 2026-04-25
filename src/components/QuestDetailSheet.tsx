import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';
import { isMetaQuest, getMetaQuestProgress, DIFFICULTY_LABEL } from '../lib/progress';
import { TrailMap } from './TrailMap';

interface QuestDetailSheetProps {
  quest: Quest;
  onClose: () => void;
  onLevelUp: (message: string) => void;
  onAchievements?: (items: { id: string; message: string }[]) => void;
  onSelectQuest: (quest: Quest) => void;
}

export function QuestDetailSheet({ quest, onClose, onLevelUp, onAchievements, onSelectQuest }: QuestDetailSheetProps) {
  const {
    quests,
    progress,
    toggleComplete,
    toggleFavourite,
    trackedMetaQuest,
    setTrackedMetaQuest,
    setNote,
  } = useQuestContext();
  const existingNote = progress.notes[quest.id] ?? '';
  const [noteDraft, setNoteDraft] = useState(existingNote);
  const [lastQuestId, setLastQuestId] = useState(quest.id);
  if (lastQuestId !== quest.id) {
    setLastQuestId(quest.id);
    setNoteDraft(existingNote);
  }
  const isCompleted = Boolean(progress.completed[quest.id]);
  const isFavourite = progress.favourites.includes(quest.id);
  const category = CATEGORY_MAP[quest.category];
  const closeRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTracked = trackedMetaQuest?.id === quest.id;

  const meta = isMetaQuest(quest);
  const memberQuests = useMemo<Quest[]>(() => {
    if (!meta || !quest.memberQuestIds) return [];
    const byId = new Map(quests.map(q => [q.id, q]));
    return quest.memberQuestIds
      .map(id => byId.get(id))
      .filter((q): q is Quest => !!q);
  }, [meta, quest.memberQuestIds, quests]);
  const metaProgress = meta ? getMetaQuestProgress(quest, progress.completed) : null;

  // Parent meta-quests that include this quest as a member.
  const parentMetaQuests = useMemo<Quest[]>(() => {
    if (meta) return [];
    return quests.filter(q => isMetaQuest(q) && q.memberQuestIds?.includes(quest.id));
  }, [meta, quest.id, quests]);

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
    if (result.unlockedAchievements.length > 0 && onAchievements) {
      onAchievements(
        result.unlockedAchievements.map(a => ({
          id: a.id,
          message: `${a.emoji} Achievement unlocked: ${a.title}`,
        }))
      );
    }
  }, [quest.id, toggleComplete, onLevelUp, onAchievements]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.location + ', Stockport, UK')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      {/* Backdrop — opaque + blurred so any underlying map is fully defocused */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          'relative bg-white dark:bg-surface-dark rounded-t-3xl shadow-2xl min-h-[80vh] max-h-[95vh] overflow-y-auto',
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
            <span className="text-sm text-accent font-semibold ml-auto">
              +{quest.xp}{meta ? ' bonus XP' : ' XP'}
            </span>
          </div>

          {/* Part-of: parent meta-quest pills */}
          {parentMetaQuests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Part of">
              {parentMetaQuests.map(parent => (
                <button
                  key={parent.id}
                  type="button"
                  onClick={() => onSelectQuest(parent)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-brand/10 dark:bg-brand-dark/20 text-brand dark:text-brand-dark hover:bg-brand/20 dark:hover:bg-brand-dark/30 transition-colors"
                >
                  <span aria-hidden="true">🧭</span>
                  Part of: {parent.title}
                </button>
              ))}
            </div>
          )}

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
            {meta && metaProgress ? (
              <div className="flex flex-col gap-3">
                <div
                  className={[
                    'w-full py-3 px-4 rounded-xl text-sm font-semibold text-center',
                    isCompleted
                      ? 'bg-accent/10 text-accent'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
                  ].join(' ')}
                  role="progressbar"
                  aria-valuenow={metaProgress.done}
                  aria-valuemin={0}
                  aria-valuemax={metaProgress.total}
                >
                  {isCompleted
                    ? `✅ Trail complete — ${metaProgress.done}/${metaProgress.total} stops`
                    : `🗺️ ${metaProgress.done} of ${metaProgress.total} stops ticked — complete them all to earn +${quest.xp} bonus XP`}
                </div>
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => setTrackedMetaQuest(isTracked ? null : quest.id)}
                    className={[
                      'w-full py-3 rounded-xl text-sm font-semibold transition-colors',
                      isTracked
                        ? 'bg-brand/10 dark:bg-brand-dark/20 text-brand dark:text-brand-dark hover:bg-brand/20 dark:hover:bg-brand-dark/30'
                        : 'bg-brand text-white hover:bg-indigo-700',
                    ].join(' ')}
                    aria-pressed={isTracked}
                  >
                    {isTracked ? '📌 Tracking — tap to stop' : '📌 Track this trail'}
                  </button>
                )}
              </div>
            ) : (
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
            )}

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
                aria-label={`Open ${quest.location} in Google Maps (opens in new tab)`}
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

          {/* Your notes */}
          <div className="mt-6">
            <label htmlFor={`note-${quest.id}`} className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
              Your notes
            </label>
            <textarea
              id={`note-${quest.id}`}
              rows={4}
              maxLength={500}
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              onBlur={() => {
                if (noteDraft !== existingNote) setNote(quest.id, noteDraft);
              }}
              placeholder="Add a memory, tip, or who you went with…"
              aria-describedby={`note-hint-${quest.id}`}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
            <p id={`note-hint-${quest.id}`} className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Saved to this device only · {noteDraft.length}/500
            </p>
          </div>

          {/* Member checklist (meta-quest only) */}
          {meta && memberQuests.length > 0 && (
            <div className="mt-6">
              <TrailMap
                members={memberQuests}
                completed={progress.completed}
                onSelectQuest={onSelectQuest}
              />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">
                Trail stops
              </h3>
              <ul className="flex flex-col gap-2">
                {memberQuests.map(member => {
                  const memberDone = Boolean(progress.completed[member.id]);
                  const memberCategory = CATEGORY_MAP[member.category];
                  return (
                    <li key={member.id}>
                      <button
                        type="button"
                        onClick={() => onSelectQuest(member)}
                        className={[
                          'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
                          memberDone
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand-dark hover:bg-gray-50 dark:hover:bg-gray-700/50',
                        ].join(' ')}
                        aria-label={`${member.title}${memberDone ? ' (completed)' : ''} — open details`}
                      >
                        <span
                          className={[
                            'inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-full text-xs',
                            memberDone
                              ? 'bg-accent text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-400',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          {memberDone ? '✓' : ''}
                        </span>
                        {member.emoji && (
                          <span className="text-lg shrink-0" aria-hidden="true">{member.emoji}</span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div
                            className={[
                              'text-sm font-medium truncate',
                              memberDone
                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                : 'text-gray-900 dark:text-gray-100',
                            ].join(' ')}
                          >
                            {member.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            📍 {member.location.split(',')[0]}
                          </div>
                        </div>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ color: memberCategory.color, backgroundColor: `${memberCategory.color}18` }}
                        >
                          +{member.xp}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
