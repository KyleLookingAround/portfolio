import { useState, useMemo, useEffect, useRef } from 'react';
import type { CategoryId, Quest } from '../types';
import { CATEGORIES } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';
import { QuestCard } from '../components/QuestCard';
import { QuestsMap } from '../components/QuestsMap';

type SortMode = 'alpha' | 'xp-desc' | 'difficulty' | 'recent';

const DIFFICULTY_RANK: Record<Quest['difficulty'], number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

interface QuestsPageProps {
  onSelectQuest: (quest: Quest) => void;
  onLevelUp?: (message: string) => void;
  onAchievements?: (items: { id: string; message: string }[]) => void;
}

export function QuestsPage({ onSelectQuest, onLevelUp, onAchievements }: QuestsPageProps) {
  const { quests, progress } = useQuestContext();

  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(() => {
    const saved = sessionStorage.getItem('sq-filter-category') as CategoryId | null;
    if (saved) sessionStorage.removeItem('sq-filter-category');
    return saved;
  });
  const [activeDifficulty, setActiveDifficulty] = useState<Quest['difficulty'] | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [favouritesOnly, setFavouritesOnly] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('sq-filter-favourites');
    if (saved) sessionStorage.removeItem('sq-filter-favourites');
    return saved === '1';
  });
  const [sortMode, setSortMode] = useState<SortMode>('alpha');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(rawSearch), 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [rawSearch]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const favSet = new Set(progress.favourites);
    const matched = quests.filter(q => {
      if (activeCategory && q.category !== activeCategory) return false;
      if (activeDifficulty && q.difficulty !== activeDifficulty) return false;
      if (hideCompleted && progress.completed[q.id]) return false;
      if (favouritesOnly && !favSet.has(q.id)) return false;
      if (term) {
        const haystack = [q.title, q.description, q.location, ...(q.tags ?? [])].join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    return sortQuests(matched, sortMode, progress.completed);
  }, [quests, activeCategory, activeDifficulty, hideCompleted, favouritesOnly, search, sortMode, progress.completed, progress.favourites]);

  const hasFilters =
    activeCategory !== null ||
    activeDifficulty !== null ||
    hideCompleted ||
    favouritesOnly ||
    sortMode !== 'alpha' ||
    search !== '';

  function clearFilters() {
    setActiveCategory(null);
    setActiveDifficulty(null);
    setHideCompleted(false);
    setFavouritesOnly(false);
    setSortMode('alpha');
    setRawSearch('');
    setSearch('');
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="sticky top-0 z-30 bg-[#FAFAF9] dark:bg-[#0B0F1A] border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quests</h1>
          <div className="flex items-center gap-2">
            <span aria-live="polite" aria-atomic="true" className="text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} of {quests.length}
            </span>
            <div
              role="group"
              aria-label="View mode"
              className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 p-0.5"
            >
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={[
                  'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-300',
                ].join(' ')}
              >
                📋 List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                aria-pressed={viewMode === 'map'}
                className={[
                  'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                  viewMode === 'map'
                    ? 'bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-300',
                ].join(' ')}
              >
                🗺️ Map
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true">🔍</span>
          <input
            type="search"
            placeholder="Search quests…"
            value={rawSearch}
            onChange={e => setRawSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={[
              'shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap',
              activeCategory === null
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
            ].join(' ')}
            aria-pressed={activeCategory === null}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(c => c === cat.id ? null : cat.id)}
              className={[
                'shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap',
                activeCategory === cat.id
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              ].join(' ')}
              style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
              aria-pressed={activeCategory === cat.id}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['easy', 'medium', 'hard'] as const).map(diff => (
            <button
              key={diff}
              type="button"
              onClick={() => setActiveDifficulty(d => d === diff ? null : diff)}
              className={[
                'text-xs px-2.5 py-1 rounded-full font-medium transition-colors capitalize',
                activeDifficulty === diff
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
              ].join(' ')}
              aria-pressed={activeDifficulty === diff}
            >
              {diff}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setFavouritesOnly(v => !v)}
            className={[
              'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
              favouritesOnly
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            ].join(' ')}
            aria-pressed={favouritesOnly}
          >
            {favouritesOnly ? '❤️ Favourites' : '🤍 Favourites'}
          </button>

          <label className="ml-auto flex items-center gap-1.5">
            <span className="sr-only">Sort quests by</span>
            <select
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-brand"
              aria-label="Sort quests"
            >
              <option value="alpha">A–Z</option>
              <option value="xp-desc">XP (high→low)</option>
              <option value="difficulty">Difficulty (easy→hard)</option>
              <option value="recent">Recently done</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-xs text-gray-600 dark:text-gray-300">Hide done</span>
            <button
              type="button"
              role="switch"
              aria-checked={hideCompleted}
              onClick={() => setHideCompleted(h => !h)}
              className={[
                'relative w-9 h-5 rounded-full transition-colors',
                hideCompleted ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  hideCompleted ? 'translate-x-4' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Quest list / map */}
      {viewMode === 'map' ? (
        <div className="flex-1 py-3">
          <QuestsMap
            quests={filtered}
            completed={progress.completed}
            onSelectQuest={onSelectQuest}
          />
        </div>
      ) : (
        <div className="flex-1 px-4 py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-4xl mb-3" aria-hidden="true">🔎</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No quests match your filters</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-brand text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filtered.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onSelect={onSelectQuest}
                onLevelUp={onLevelUp}
                onAchievements={onAchievements}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function sortQuests(
  list: Quest[],
  mode: SortMode,
  completed: Record<string, string>
): Quest[] {
  const copy = list.slice();
  if (mode === 'alpha') {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else if (mode === 'xp-desc') {
    copy.sort((a, b) => b.xp - a.xp || a.title.localeCompare(b.title));
  } else if (mode === 'difficulty') {
    copy.sort(
      (a, b) =>
        DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
        a.title.localeCompare(b.title)
    );
  } else if (mode === 'recent') {
    copy.sort((a, b) => {
      const da = completed[a.id] ?? '';
      const db = completed[b.id] ?? '';
      if (da === db) return a.title.localeCompare(b.title);
      // Incomplete quests (empty string) sort to the bottom.
      if (!da) return 1;
      if (!db) return -1;
      return db.localeCompare(da);
    });
  }
  return copy;
}
