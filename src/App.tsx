import { useState, useEffect, useCallback, useRef } from 'react';
import { QuestContextProvider, useQuestContext } from './lib/QuestContext';
import { BottomNav } from './components/BottomNav';
import { QuestDetailSheet } from './components/QuestDetailSheet';
import { DiscoverPage } from './pages/DiscoverPage';
import { QuestsPage } from './pages/QuestsPage';
import { MetaQuestsPage } from './pages/MetaQuestsPage';
import { PlanTrailPage } from './pages/PlanTrailPage';
import { ImportTrailPage } from './pages/ImportTrailPage';
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

type ToastItem =
  | { kind: 'level'; seq: number; message: string }
  | { kind: 'achievement'; seq: number; id: string; message: string };

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

function Toast({ message, onDismiss }: ToastProps) {
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
  const [toastQueue, setToastQueue] = useState<ToastItem[]>([]);
  const seqRef = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem('sq-theme', isDark ? 'dark' : 'light');
    } catch {
      // unavailable
    }
  }, [isDark]);

  const pushToast = useCallback((message: string) => {
    setToastQueue(q => [...q, { kind: 'level', seq: ++seqRef.current, message }]);
  }, []);

  const pushAchievementToasts = useCallback((items: { id: string; message: string }[]) => {
    if (items.length === 0) return;
    setToastQueue(q => [
      ...q,
      ...items.map<ToastItem>(i => ({ kind: 'achievement', seq: ++seqRef.current, id: i.id, message: i.message })),
    ]);
  }, []);

  const dismissToast = useCallback(() => {
    setToastQueue(q => q.slice(1));
  }, []);

  const handleToggleDark = useCallback(() => {
    setIsDark(d => !d);
  }, []);

  const activePage = (() => {
    if (hash === '#/quests') return 'quests';
    if (hash === '#/trails') return 'trails';
    if (hash === '#/plan-trail') return 'plan-trail';
    if (hash.startsWith('#/import-trail')) return 'import-trail';
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
                <DiscoverPage
                  onSelectQuest={setSelectedQuest}
                  onLevelUp={pushToast}
                  onAchievements={pushAchievementToasts}
                />
              )}
              {activePage === 'quests' && (
                <QuestsPage
                  onSelectQuest={setSelectedQuest}
                  onLevelUp={pushToast}
                  onAchievements={pushAchievementToasts}
                />
              )}
              {activePage === 'trails' && (
                <MetaQuestsPage onSelectQuest={setSelectedQuest} />
              )}
              {activePage === 'plan-trail' && <PlanTrailPage />}
              {activePage === 'import-trail' && <ImportTrailPage />}
              {activePage === 'progress' && <ProgressPage onSelectQuest={setSelectedQuest} />}
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
              onLevelUp={pushToast}
              onAchievements={pushAchievementToasts}
              onSelectQuest={setSelectedQuest}
            />
          )}

          <AchievementSeenFlusher toastQueue={toastQueue} />
        </QuestContextProvider>

        <BottomNav activeHash={hash} />

        {toastQueue.length > 0 && (
          <Toast
            key={toastQueue[0].seq}
            message={toastQueue[0].message}
            onDismiss={dismissToast}
          />
        )}
      </div>
    </div>
  );
}

// Marks achievement toasts as seen once they have been enqueued, so they
// don't retrigger after a subsequent completion.
function AchievementSeenFlusher({ toastQueue }: { toastQueue: ToastItem[] }) {
  const { markAchievementsSeen } = useQuestContext();
  const lastMarkedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const toMark: string[] = [];
    for (const item of toastQueue) {
      if (item.kind === 'achievement' && !lastMarkedRef.current.has(item.id)) {
        toMark.push(item.id);
        lastMarkedRef.current.add(item.id);
      }
    }
    if (toMark.length > 0) markAchievementsSeen(toMark);
  }, [toastQueue, markAchievementsSeen]);

  return null;
}
