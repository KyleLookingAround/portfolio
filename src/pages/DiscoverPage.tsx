import type { Quest } from '../types';
import { useQuestContext } from '../lib/QuestContext';
import { getQuestOfTheDay, getMetaQuestProgress, isMetaQuest, xpForLevel } from '../lib/progress';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { QuestCard } from '../components/QuestCard';

interface DiscoverPageProps {
  onSelectQuest: (quest: Quest) => void;
  onLevelUp: (message: string) => void;
  onAchievements?: (items: { id: string; message: string }[]) => void;
}

export function DiscoverPage({ onSelectQuest, onLevelUp, onAchievements }: DiscoverPageProps) {
  const { quests, progress, level, levelName, totalXP, trackedMetaQuest } = useQuestContext();
  const questOfDay = getQuestOfTheDay(quests, progress.completed);
  const completedCount = Object.keys(progress.completed).length;

  const trackedProgress = trackedMetaQuest
    ? getMetaQuestProgress(trackedMetaQuest, progress.completed)
    : null;
  const nextTrackedStop = trackedMetaQuest
    ? (trackedMetaQuest.memberQuestIds ?? [])
        .map(id => quests.find(q => q.id === id))
        .find((q): q is Quest => !!q && !progress.completed[q.id])
    : null;

  const featuredByCategory = CATEGORIES.map(cat => ({
    category: cat,
    quest: quests.find(q => q.category === cat.id && !progress.completed[q.id]),
  })).filter(item => item.quest !== undefined) as Array<{ category: typeof CATEGORIES[number]; quest: Quest }>;

  const favouriteQuests = progress.favourites
    .map(id => quests.find(q => q.id === id))
    .filter((q): q is Quest => !!q);

  const incompleteNonMeta = quests.filter(
    q => !progress.completed[q.id] && !isMetaQuest(q)
  );

  function handleSurpriseMe() {
    if (incompleteNonMeta.length === 0) return;
    const pick = incompleteNonMeta[Math.floor(Math.random() * incompleteNonMeta.length)];
    onSelectQuest(pick);
  }

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

        {/* Surprise me */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSurpriseMe}
            disabled={incompleteNonMeta.length === 0}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            🎲 Surprise me
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-6">
        {/* Tracked trail */}
        {trackedMetaQuest && trackedProgress && (
          <TrackedTrailSection
            trail={trackedMetaQuest}
            done={trackedProgress.done}
            total={trackedProgress.total}
            nextStop={nextTrackedStop ?? null}
            onOpenTrail={() => onSelectQuest(trackedMetaQuest)}
            onOpenStop={onSelectQuest}
          />
        )}

        {!trackedMetaQuest && (
          <a
            href="#/trails"
            className="block rounded-2xl border border-dashed border-brand/40 dark:border-brand-dark/40 bg-brand/5 dark:bg-brand-dark/10 p-4 hover:bg-brand/10 dark:hover:bg-brand-dark/15 transition-colors no-underline"
          >
            <p className="text-sm font-semibold text-brand dark:text-brand-dark flex items-center gap-1.5">
              <span aria-hidden="true">🗺️</span> Pick a trail to track
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Focus on a multi-stop adventure and we&apos;ll keep it pinned here.
            </p>
          </a>
        )}

        {/* Favourites rail */}
        {favouriteQuests.length > 0 && (
          <section aria-labelledby="favourites-heading">
            <div className="flex items-center justify-between mb-3">
              <h2
                id="favourites-heading"
                className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
              >
                <span aria-hidden="true">❤️</span> Your favourites
              </h2>
              {favouriteQuests.length > 3 && (
                <a
                  href="#/quests"
                  onClick={() => sessionStorage.setItem('sq-filter-favourites', '1')}
                  className="text-xs font-semibold text-brand dark:text-brand-dark no-underline hover:underline"
                >
                  See all ({favouriteQuests.length})
                </a>
              )}
            </div>
            <div className="space-y-3">
              {favouriteQuests.slice(0, 3).map(quest => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onSelect={onSelectQuest}
                  onLevelUp={onLevelUp}
                  onAchievements={onAchievements}
                />
              ))}
            </div>
          </section>
        )}

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
              onAchievements={onAchievements}
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

interface TrackedTrailSectionProps {
  trail: Quest;
  done: number;
  total: number;
  nextStop: Quest | null;
  onOpenTrail: () => void;
  onOpenStop: (quest: Quest) => void;
}

function TrackedTrailSection({
  trail,
  done,
  total,
  nextStop,
  onOpenTrail,
  onOpenStop,
}: TrackedTrailSectionProps) {
  const category = CATEGORY_MAP[trail.category];
  const pct = total > 0 ? (done / total) * 100 : 0;
  const complete = done === total && total > 0;

  return (
    <section
      aria-labelledby="tracked-trail-heading"
      className="rounded-2xl border border-brand/30 dark:border-brand-dark/30 bg-white dark:bg-surface-dark overflow-hidden"
    >
      <button
        type="button"
        onClick={onOpenTrail}
        className="w-full text-left px-4 pt-4 pb-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-brand text-white">
            <span aria-hidden="true">📌</span> Tracking
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
            style={{ color: category.color, backgroundColor: `${category.color}18` }}
          >
            <span aria-hidden="true">{category.emoji}</span>
            {category.label}
          </span>
          <span className="text-xs text-accent font-semibold ml-auto">
            +{trail.xp} bonus XP
          </span>
        </div>
        <h2
          id="tracked-trail-heading"
          className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug"
        >
          {trail.emoji && <span className="mr-1.5" aria-hidden="true">{trail.emoji}</span>}
          {trail.title}
        </h2>
        <div className="flex items-center justify-between text-xs mt-3 mb-1">
          <span className="text-gray-500 dark:text-gray-400">
            {complete ? 'Trail complete!' : `${done} of ${total} stops`}
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {Math.round(pct)}%
          </span>
        </div>
        <div
          className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${trail.title} progress`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: category.color }}
          />
        </div>
      </button>

      {nextStop && !complete && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-3 mb-1.5">
            Next stop
          </p>
          <button
            type="button"
            onClick={() => onOpenStop(nextStop)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand-dark hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            {nextStop.emoji && (
              <span className="text-xl shrink-0" aria-hidden="true">{nextStop.emoji}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {nextStop.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                📍 {nextStop.location.split(',')[0]}
              </p>
            </div>
            <span className="text-xs text-accent font-semibold shrink-0">+{nextStop.xp}</span>
          </button>
        </div>
      )}
    </section>
  );
}

function XPProgressBar({ xp, level }: { xp: number; level: number }) {
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
