import { useState, useMemo, useEffect, useRef } from 'react';
import type { CategoryId, Quest } from '../types';
import { CATEGORIES } from '../data/categories';
import { useQuestContext } from '../lib/QuestContext';
import { QuestCard } from '../components/QuestCard';

interface QuestsPageProps {
  onSelectQuest: (quest: Quest) => void;
  onLevelUp?: (message: string) => void;
}

export function QuestsPage({ onSelectQuest, onLevelUp }: QuestsPageProps) {
  const { quests, progress } = useQuestContext();

  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(() => {
    const saved = sessionStorage.getItem('sq-filter-category') as CategoryId | null;
    if (saved) sessionStorage.removeItem('sq-filter-category');
    return saved;
  });
  const [activeDifficulty, setActiveDifficulty] = useState<Quest['difficulty'] | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
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
    return quests.filter(q => {
      if (activeCategory && q.category !== activeCategory) return false;
      if (activeDifficulty && q.difficulty !== activeDifficulty) return false;
      if (hideCompleted && progress.completed[q.id]) return false;
      if (term) {
        const haystack = [q.title, q.description, q.location, ...(q.tags ?? [])].join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [quests, activeCategory, activeDifficulty, hideCompleted, search, progress.completed]);

  const hasFilters = activeCategory !== null || activeDifficulty !== null || hideCompleted || search !== '';

  function clearFilters() {
    setActiveCategory(null);
    setActiveDifficulty(null);
    setHideCompleted(false);
    setRawSearch('');
    setSearch('');
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="sticky top-0 z-30 bg-[#FAFAF9] dark:bg-[#0B0F1A] border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quests</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} of {quests.length}
          </span>
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

          <label className="ml-auto flex items-center gap-1.5 cursor-pointer select-none">
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

      {/* Quest list */}
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
            />
          ))
        )}
      </div>
    </div>
  );
}
