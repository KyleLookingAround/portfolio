import { useState, useEffect, useCallback } from 'react';
import { QuestContextProvider } from './lib/QuestContext';
import { BottomNav } from './components/BottomNav';
import { QuestDetailSheet } from './components/QuestDetailSheet';
import { DiscoverPage } from './pages/DiscoverPage';
import { QuestsPage } from './pages/QuestsPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import type { Quest } from './types';

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash || '#/discover');
  useEffect(() => {
    const handler = () => setHash(window.location.hash || '#/discover');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

interface LevelUpToastProps {
  message: string;
  onDismiss: () => void;
}

function LevelUpToast({ message, onDismiss }: LevelUpToastProps) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={[
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xs w-[calc(100%-2rem)]',
        'bg-brand text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-medium',
        'flex items-center justify-between gap-3',
        !prefersReduced ? 'animate-fade-in' : '',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-indigo-200 hover:text-white transition-colors shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export default function App() {
  const hash = useHashRoute();
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sq-theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // unavailable
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sq-theme', isDark ? 'dark' : 'light');
    } catch {
      // unavailable
    }
  }, [isDark]);

  const handleLevelUp = useCallback((message: string) => {
    setLevelUpMessage(message);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpMessage(null);
  }, []);

  const handleToggleDark = useCallback(() => {
    setIsDark(d => !d);
  }, []);

  const activePage = (() => {
    if (hash === '#/quests') return 'quests';
    if (hash === '#/progress') return 'progress';
    if (hash === '#/profile') return 'profile';
    return 'discover';
  })();

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0B0F1A] text-gray-900 dark:text-gray-100 pb-20">
        <QuestContextProvider>
          {/* Two-column layout on xl */}
          <div className="mx-auto w-full max-w-[480px] xl:max-w-none xl:grid xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
            <main>
              {activePage === 'discover' && (
                <DiscoverPage onSelectQuest={setSelectedQuest} onLevelUp={handleLevelUp} />
              )}
              {activePage === 'quests' && (
                <QuestsPage onSelectQuest={setSelectedQuest} onLevelUp={handleLevelUp} />
              )}
              {activePage === 'progress' && <ProgressPage />}
              {activePage === 'profile' && (
                <ProfilePage isDark={isDark} onToggleDark={handleToggleDark} />
              )}
            </main>
            <div className="hidden xl:flex xl:flex-col xl:items-center xl:justify-center xl:min-h-screen xl:border-l xl:border-gray-200 dark:xl:border-gray-700 xl:p-8 xl:text-center">
              <p className="text-6xl mb-4" aria-hidden="true">🗺️</p>
              <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Stockport Quest Tracker
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Discover dozens of curated adventures around Stockport, earn XP and level up as you explore.
              </p>
            </div>
          </div>

          {/* Detail sheet — overlays any tab */}
          {selectedQuest && (
            <QuestDetailSheet
              quest={selectedQuest}
              onClose={() => setSelectedQuest(null)}
              onLevelUp={handleLevelUp}
              onSelectQuest={setSelectedQuest}
            />
          )}
        </QuestContextProvider>

        <BottomNav activeHash={hash} />

        {levelUpMessage && (
          <LevelUpToast message={levelUpMessage} onDismiss={dismissLevelUp} />
        )}
      </div>
    </div>
  );
}
