import { useMemo, useState } from 'react';
import { CATEGORY_MAP } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';
import { decodeTrail } from '../lib/trailShare';

interface DecodedTrail {
  title: string;
  emoji?: string;
  memberQuestIds: string[];
}

function readPayloadFromHash(): string | null {
  const hash = window.location.hash;
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) return null;
  const params = new URLSearchParams(hash.slice(queryStart + 1));
  return params.get('d');
}

function readDecodedFromHash(): DecodedTrail | 'invalid' {
  const payload = readPayloadFromHash();
  if (!payload) return 'invalid';
  const wire = decodeTrail(payload);
  if (!wire) return 'invalid';
  return { title: wire.t, emoji: wire.e, memberQuestIds: wire.m };
}

export function ImportTrailPage() {
  const { quests, createCustomTrail } = useQuestContext();
  const [decoded] = useState<DecodedTrail | 'invalid'>(() => readDecodedFromHash());
  const [saved, setSaved] = useState(false);

  const questById = useMemo(() => new Map(quests.map(q => [q.id, q])), [quests]);

  const resolvedMembers = useMemo(() => {
    if (decoded === 'invalid') return [];
    return decoded.memberQuestIds.map(id => ({ id, quest: questById.get(id) ?? null }));
  }, [decoded, questById]);

  const validIds = useMemo(
    () => resolvedMembers.filter(m => m.quest !== null).map(m => m.id),
    [resolvedMembers]
  );

  function handleSave() {
    if (decoded === 'invalid' || validIds.length < 2) return;
    createCustomTrail({
      title: decoded.title,
      emoji: decoded.emoji,
      memberQuestIds: validIds,
    });
    setSaved(true);
    window.location.hash = '#/trails';
  }

  function handleCancel() {
    window.location.hash = '#/trails';
  }

  if (decoded === 'invalid') {
    return (
      <div className="flex flex-col">
        <div className="bg-gradient-to-br from-brand to-indigo-700 dark:from-indigo-800 dark:to-indigo-950 px-5 pt-12 pb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Import trail</h1>
        </div>
        <div className="px-4 py-8 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">🤔</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
            This share link couldn&apos;t be read
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            The link is malformed or out of date.
          </p>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-brand text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Trails
          </button>
        </div>
      </div>
    );
  }

  const missingCount = resolvedMembers.length - validIds.length;
  const canSave = !saved && validIds.length >= 2;

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-br from-brand to-indigo-700 dark:from-indigo-800 dark:to-indigo-950 px-5 pt-12 pb-6">
        <p className="text-indigo-200 text-sm font-medium mb-1">Shared with you</p>
        <h1 className="text-2xl font-bold text-white mb-1">
          {decoded.emoji ? `${decoded.emoji} ` : ''}{decoded.title}
        </h1>
        <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
          Save this trail to your own collection — you can track it from the Trails tab.
        </p>
      </div>

      <div className="px-4 py-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
            Stops ({validIds.length})
          </p>
          <ol className="space-y-1">
            {resolvedMembers.map((m, i) => {
              if (!m.quest) {
                return (
                  <li
                    key={`${m.id}-${i}`}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-xs text-amber-800 dark:text-amber-300"
                  >
                    <span aria-hidden="true">⚠️</span>
                    <span className="flex-1 truncate">Unknown stop ({m.id})</span>
                    <span className="text-[10px] uppercase tracking-wide font-semibold">Skipped</span>
                  </li>
                );
              }
              const cat = CATEGORY_MAP[m.quest.category];
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700"
                >
                  <span
                    className="shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm truncate text-gray-900 dark:text-gray-100">
                    {m.quest.title}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {m.quest.location.split(',')[0]}
                  </span>
                </li>
              );
            })}
          </ol>
          {missingCount > 0 && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2">
              {missingCount} stop{missingCount === 1 ? '' : 's'} couldn&apos;t be matched and will be skipped.
            </p>
          )}
        </div>

        <div className="sticky bottom-20 -mx-4 px-4 py-3 bg-[#FAFAF9]/95 dark:bg-[#0B0F1A]/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={[
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
              canSave
                ? 'bg-brand text-white hover:bg-indigo-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            Save trail
          </button>
        </div>
      </div>
    </div>
  );
}
