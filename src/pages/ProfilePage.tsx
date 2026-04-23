import { useState, useRef } from 'react';
import { useQuestContext } from '../lib/QuestContext';

interface ProfilePageProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function ProfilePage({ isDark, onToggleDark }: ProfilePageProps) {
  const { progress, updateDisplayName, resetProgress, totalXP, level, levelName } = useQuestContext();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.displayName);
  const [confirmReset, setConfirmReset] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const completedCount = Object.keys(progress.completed).length;

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateDisplayName(nameInput);
    setEditingName(false);
  }

  function handleResetClick() {
    if (confirmReset) {
      resetProgress();
      setNameInput('Explorer');
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand to-indigo-700 dark:from-indigo-800 dark:to-indigo-950 px-5 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl mb-3" aria-hidden="true">
          🧗
        </div>
        {editingName ? (
          <form onSubmit={handleNameSubmit} className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              maxLength={30}
              autoFocus
              className="bg-white/20 text-white placeholder-indigo-300 rounded-lg px-3 py-1.5 text-base font-semibold border border-white/30 focus:outline-none focus:border-white"
              aria-label="Display name"
            />
            <button type="submit" className="text-white text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
              Save
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => { setEditingName(true); setNameInput(progress.displayName); }}
            className="group flex items-center gap-2 text-white"
            aria-label="Edit display name"
          >
            <span className="text-xl font-bold">{progress.displayName}</span>
            <span className="text-white/60 group-hover:text-white/90 text-sm transition-colors" aria-hidden="true">✏️</span>
          </button>
        )}
        <p className="text-indigo-200 text-sm mt-1">{levelName} · Level {level}</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700">
        {[
          { label: 'Quests', value: completedCount },
          { label: 'XP Earned', value: totalXP },
          { label: 'Streak', value: `${progress.streak.current}🔥` },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-4 gap-0.5">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Dark mode toggle */}
        <section className="bg-white dark:bg-surface-dark rounded-2xl divide-y divide-gray-100 dark:divide-gray-700">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={onToggleDark}
              className={[
                'relative w-11 h-6 rounded-full transition-colors',
                isDark ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600',
              ].join(' ')}
              aria-label="Toggle dark mode"
            >
              <span
                className={[
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  isDark ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-white dark:bg-surface-dark rounded-2xl px-4 py-4 space-y-1">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">About</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Stockport Quest Tracker is a free, offline app for residents and visitors. Discover dozens of curated activities, earn XP, and build your streak as you explore Greater Manchester&apos;s hidden gem.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
            No account required · All data stays on your device · No ads
          </p>
        </section>

        {/* Danger zone */}
        <section className="bg-white dark:bg-surface-dark rounded-2xl px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Danger Zone</h2>
          {confirmReset ? (
            <div className="space-y-2">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                This will erase all your progress, XP, and streaks. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetClick}
                  className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Yes, reset everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResetClick}
              className="w-full py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Reset all progress
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
