import { useMemo, useState } from 'react';
import type { CustomMetaQuest, Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { isMetaQuest } from '../lib/progress';
import { isCustomTrailId, useQuestContext } from '../lib/QuestContext';
import { consumePlanTrailEditId } from '../lib/planTrailNav';

const EMOJI_CHOICES = ['🥾', '🌳', '🏞️', '🧭', '☕', '🍻', '🎨', '🏛️', '🌸', '🦊'];
const MIN_STOPS = 2;
const MAX_TITLE_LEN = 40;

interface InitialState {
  editingId: string | null;
  title: string;
  emoji: string | undefined;
  selectedIds: string[];
}

export function PlanTrailPage() {
  const { quests, progress, createCustomTrail, updateCustomTrail } = useQuestContext();

  const [initial] = useState<InitialState>(() => {
    const id = consumePlanTrailEditId();
    if (!id) {
      return { editingId: null, title: '', emoji: undefined, selectedIds: [] };
    }
    const trail = progress.customMetaQuests.find(c => c.id === id);
    if (!trail) {
      return { editingId: null, title: '', emoji: undefined, selectedIds: [] };
    }
    return {
      editingId: trail.id,
      title: trail.title,
      emoji: trail.emoji,
      selectedIds: trail.memberQuestIds,
    };
  });
  const editingId = initial.editingId;
  const [title, setTitle] = useState<string>(initial.title);
  const [emoji, setEmoji] = useState<string | undefined>(initial.emoji);
  const [selectedIds, setSelectedIds] = useState<string[]>(initial.selectedIds);
  const [search, setSearch] = useState('');

  // The catalogue of pickable quests: real (non-meta) quests with a known category.
  const pickable = useMemo<Quest[]>(
    () => quests.filter(q => !isMetaQuest(q) && !isCustomTrailId(q.id)),
    [quests]
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pickable;
    return pickable.filter(q => {
      const haystack = [q.title, q.location, ...(q.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [pickable, search]);

  const selectedQuests = useMemo<Quest[]>(() => {
    const byId = new Map(quests.map(q => [q.id, q]));
    const out: Quest[] = [];
    for (const id of selectedIds) {
      const q = byId.get(id);
      if (q) out.push(q);
    }
    return out;
  }, [quests, selectedIds]);

  const trimmedTitle = title.trim();
  const canSave = trimmedTitle.length > 0 && selectedIds.length >= MIN_STOPS;

  function toggleQuest(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function moveSelection(fromIndex: number, toIndex: number) {
    setSelectedIds(prev => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 || fromIndex >= prev.length ||
        toIndex < 0 || toIndex >= prev.length
      ) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function handleSave() {
    if (!canSave) return;
    const payload: Pick<CustomMetaQuest, 'title' | 'emoji' | 'memberQuestIds'> = {
      title: trimmedTitle,
      emoji,
      memberQuestIds: selectedIds,
    };
    if (editingId) {
      updateCustomTrail(editingId, payload);
    } else {
      createCustomTrail(payload);
    }
    window.location.hash = '#/trails';
  }

  function handleCancel() {
    window.location.hash = '#/trails';
  }

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-br from-brand to-indigo-700 dark:from-indigo-800 dark:to-indigo-950 px-5 pt-12 pb-6">
        <p className="text-indigo-200 text-sm font-medium mb-1">Build your own trail</p>
        <h1 className="text-2xl font-bold text-white mb-1">
          {editingId ? 'Edit trail' : 'Plan your own trail'}
        </h1>
        <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
          Pick a handful of quests to string together, give the trail a name, and track it
          back on your Trails tab.
        </p>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="trail-title"
            className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5"
          >
            Trail name
          </label>
          <input
            id="trail-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE_LEN))}
            placeholder="e.g. Sunday Underbanks Wander"
            maxLength={MAX_TITLE_LEN}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            {trimmedTitle.length}/{MAX_TITLE_LEN}
          </p>
        </div>

        {/* Emoji */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
            Icon
          </p>
          <div role="radiogroup" aria-label="Trail icon" className="flex flex-wrap gap-1.5">
            {EMOJI_CHOICES.map(e => {
              const active = emoji === e;
              return (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setEmoji(active ? undefined : e)}
                  className={[
                    'w-9 h-9 inline-flex items-center justify-center rounded-full text-lg transition-colors border',
                    active
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 hover:border-brand',
                  ].join(' ')}
                >
                  <span aria-hidden="true">{e}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected list */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Stops ({selectedIds.length})
            </p>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          {selectedIds.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              Pick at least {MIN_STOPS} quests below to build your trail.
            </p>
          ) : (
            <ol className="space-y-1">
              {selectedQuests.map((q, i) => {
                const cat = CATEGORY_MAP[q.category];
                return (
                  <li
                    key={q.id}
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
                      {q.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveSelection(i, i - 1)}
                      disabled={i === 0}
                      aria-label={`Move ${q.title} up`}
                      className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-brand hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      <span aria-hidden="true">▲</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSelection(i, i + 1)}
                      disabled={i === selectedQuests.length - 1}
                      aria-label={`Move ${q.title} down`}
                      className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-brand hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      <span aria-hidden="true">▼</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleQuest(q.id)}
                      aria-label={`Remove ${q.title} from trail`}
                      className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
            Add quests
          </p>
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true">🔍</span>
            <input
              type="search"
              placeholder="Search quests…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
          <ul className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
            {filtered.map(q => {
              const active = selectedSet.has(q.id);
              const cat = CATEGORY_MAP[q.category];
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => toggleQuest(q.id)}
                    aria-pressed={active}
                    className={[
                      'w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-colors',
                      active
                        ? 'bg-brand/10 dark:bg-brand-dark/20 border-brand dark:border-brand-dark'
                        : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 hover:border-brand',
                    ].join(' ')}
                  >
                    <span
                      className="shrink-0 w-5 h-5 inline-flex items-center justify-center rounded-full text-xs"
                      style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                      aria-hidden="true"
                    >
                      {q.emoji ?? cat.emoji}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm truncate text-gray-900 dark:text-gray-100">
                        {q.title}
                      </span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {q.location.split(',')[0]}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={[
                        'shrink-0 w-5 h-5 inline-flex items-center justify-center rounded-md text-xs font-bold',
                        active ? 'bg-brand text-white' : 'border border-gray-300 dark:border-gray-600 text-transparent',
                      ].join(' ')}
                    >
                      ✓
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-xs text-gray-500 dark:text-gray-400 italic px-2 py-2">
                No matching quests.
              </li>
            )}
          </ul>
        </div>

        {/* Footer actions */}
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
            {editingId ? 'Save changes' : 'Save trail'}
          </button>
        </div>
      </div>
    </div>
  );
}

