import { useQuestContext } from '../lib/QuestContext';
import { computeTotalXP, getLevelName } from '../lib/progress';
import { CATEGORIES } from '../data/categories';
import { AchievementsPanel } from '../components/AchievementsPanel';
import { HistoryTimeline } from '../components/HistoryTimeline';

const LEVEL_NAMES = [
  'Stockport Newcomer',
  'Underbanks Explorer',
  'Viaduct Wanderer',
  'Hat Works Historian',
  'Bramall Baron',
  'Reddish Vale Ranger',
  'Stockport Legend',
];

function xpForLevel(l: number): number {
  return 20 * (l - 1) * (l - 1);
}

export function ProgressPage() {
  const { quests, progress, totalXP, level, levelName } = useQuestContext();
  const completedCount = Object.keys(progress.completed).length;
  const totalCount = quests.length;

  const xpStart = xpForLevel(level);
  const xpEnd = xpForLevel(level + 1);
  const levelProgress = xpEnd > xpStart ? ((totalXP - xpStart) / (xpEnd - xpStart)) * 100 : 100;
  const xpToNext = Math.max(0, xpEnd - totalXP);

  const categoryStats = CATEGORIES.map(cat => {
    const catQuests = quests.filter(q => q.category === cat.id);
    const catDone = catQuests.filter(q => progress.completed[q.id]);
    const catXP = computeTotalXP(
      Object.fromEntries(catDone.map(q => [q.id, progress.completed[q.id]])),
      catQuests
    );
    const maxXP = catQuests.reduce((s, q) => s + q.xp, 0);
    return { cat, total: catQuests.length, done: catDone.length, xp: catXP, maxXP };
  });

  return (
    <div className="flex flex-col">
      <div className="px-5 pt-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Your Progress</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount} of {totalCount} quests completed
        </p>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Level card */}
        <section className="bg-gradient-to-br from-brand to-indigo-700 dark:from-indigo-800 dark:to-indigo-950 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-2xl font-bold">{levelName}</p>
              <p className="text-indigo-200 text-sm">Level {level}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalXP}</p>
              <p className="text-indigo-200 text-sm">total XP</p>
            </div>
          </div>

          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-1" role="progressbar" aria-valuenow={Math.round(levelProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="Level progress">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, levelProgress))}%` }}
            />
          </div>
          <p className="text-xs text-indigo-200">
            {level >= LEVEL_NAMES.length
              ? 'Max level reached!'
              : `${xpToNext} XP to ${getLevelName(level + 1)}`}
          </p>
        </section>

        {/* Level ladder */}
        <section aria-labelledby="levels-heading">
          <h2 id="levels-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Level Ladder
          </h2>
          <div className="space-y-2">
            {LEVEL_NAMES.map((name, i) => {
              const lvl = i + 1;
              const xpReq = xpForLevel(lvl);
              const reached = level >= lvl;
              const isCurrent = level === lvl;
              return (
                <div
                  key={name}
                  className={[
                    'flex items-center gap-3 rounded-xl p-3',
                    isCurrent ? 'bg-brand/10 dark:bg-brand/20 ring-1 ring-brand dark:ring-brand-dark' : 'bg-white dark:bg-surface-dark',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      reached ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {reached ? '✓' : lvl}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${reached ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                      {name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{xpReq} XP</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Achievements */}
        <AchievementsPanel progress={progress} quests={quests} />

        {/* Streak */}
        <section aria-labelledby="streak-heading" className="bg-white dark:bg-surface-dark rounded-2xl p-4">
          <h2 id="streak-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Streak
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-highlight">{progress.streak.current}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Current 🔥</p>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{progress.streak.longest}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Best 🏆</p>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{progress.favourites.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Saved ❤️</p>
            </div>
          </div>
        </section>

        {/* History timeline */}
        <HistoryTimeline completed={progress.completed} quests={quests} />

        {/* Per-category progress */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            By Category
          </h2>
          <div className="space-y-3">
            {categoryStats.map(({ cat, total, done, xp, maxXP }) => {
              const pct = total > 0 ? (done / total) * 100 : 0;
              return (
                <div key={cat.id} className="bg-white dark:bg-surface-dark rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span aria-hidden="true">{cat.emoji}</span>
                      {cat.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {done}/{total} · {xp}/{maxXP} XP
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${cat.label} progress`}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
