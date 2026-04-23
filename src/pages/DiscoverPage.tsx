import type { Quest } from '../types';
import { useQuestContext } from '../lib/QuestContext';
import { getQuestOfTheDay } from '../lib/progress';
import { CATEGORIES } from '../data/categories';
import { QuestCard } from '../components/QuestCard';

interface DiscoverPageProps {
  onSelectQuest: (quest: Quest) => void;
  onLevelUp: (message: string) => void;
}

export function DiscoverPage({ onSelectQuest, onLevelUp }: DiscoverPageProps) {
  const { quests, progress, level, levelName, totalXP } = useQuestContext();
  const questOfDay = getQuestOfTheDay(quests, progress.completed);
  const completedCount = Object.keys(progress.completed).length;

  const featuredByCategory = CATEGORIES.map(cat => ({
    category: cat,
    quest: quests.find(q => q.category === cat.id && !progress.completed[q.id]),
  })).filter(item => item.quest !== undefined) as Array<{ category: typeof CATEGORIES[number]; quest: Quest }>;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-brand to-indigo-700 dark:from-indigo-800 dark:to-indigo-950 px-5 pt-12 pb-8">
        <p className="text-indigo-200 text-sm font-medium mb-1">Stockport Quest Tracker</p>
        <h1 className="text-2xl font-bold text-white mb-4">
          {progress.displayName === 'Explorer' ? 'Welcome, Explorer' : `Welcome, ${progress.displayName}`}
        </h1>

        {/* Level + XP bar */}
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white font-semibold">{levelName}</p>
              <p className="text-indigo-200 text-xs">Level {level}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{totalXP} XP</p>
              <p className="text-indigo-200 text-xs">{completedCount} quests done</p>
            </div>
          </div>
          <XPProgressBar xp={totalXP} level={level} />
        </div>

        {/* Streak pill */}
        {progress.streak.current > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 text-sm px-3 py-1.5 rounded-full">
            <span aria-hidden="true">🔥</span>
            <span>{progress.streak.current}-day streak</span>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-5 space-y-6">
        {/* Quest of the day */}
        <section aria-labelledby="qotd-heading">
          <h2
            id="qotd-heading"
            className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2"
          >
            <span aria-hidden="true">⭐</span> Quest of the Day
          </h2>

          {questOfDay ? (
            <QuestCard
              quest={questOfDay}
              onSelect={onSelectQuest}
              onLevelUp={onLevelUp}
            />
          ) : (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5 text-center">
              <p className="text-2xl mb-2" aria-hidden="true">🏆</p>
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                You&apos;ve completed everything!
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                You&apos;re a true Stockport Legend.
              </p>
            </div>
          )}
        </section>

        {/* Explore by category */}
        {featuredByCategory.length > 0 && (
          <section aria-labelledby="featured-heading">
            <h2
              id="featured-heading"
              className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2"
            >
              <span aria-hidden="true">🗺️</span> Explore by Category
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => {
                const count = quests.filter(q => q.category === cat.id).length;
                const done = quests.filter(q => q.category === cat.id && progress.completed[q.id]).length;
                return (
                  <a
                    key={cat.id}
                    href="#/quests"
                    onClick={() => {
                      // Signal category filter via hash state — handled in QuestsPage on next render
                      sessionStorage.setItem('sq-filter-category', cat.id);
                    }}
                    className="flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-3 hover:border-brand dark:hover:border-brand-dark transition-colors no-underline"
                  >
                    <span
                      className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                      style={{ backgroundColor: `${cat.color}18` }}
                      aria-hidden="true"
                    >
                      {cat.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {cat.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {done}/{count}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function XPProgressBar({ xp, level }: { xp: number; level: number }) {
  const xpForLevel = (l: number) => 20 * (l - 1) * (l - 1);
  const xpStart = xpForLevel(level);
  const xpEnd = xpForLevel(level + 1);
  const progress = xpEnd > xpStart ? ((xp - xpStart) / (xpEnd - xpStart)) * 100 : 100;

  return (
    <div className="h-2 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full bg-accent rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
