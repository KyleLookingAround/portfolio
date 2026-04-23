const TABS = [
  { hash: '#/discover', label: 'Discover', icon: '🧭' },
  { hash: '#/quests', label: 'Quests', icon: '📋' },
  { hash: '#/progress', label: 'Progress', icon: '📊' },
  { hash: '#/profile', label: 'Profile', icon: '👤' },
] as const;

interface BottomNavProps {
  activeHash: string;
}

export function BottomNav({ activeHash }: BottomNavProps) {
  const active = TABS.find(t => t.hash === activeHash)?.hash ?? '#/discover';

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 flex safe-area-pb"
      aria-label="Main navigation"
    >
      {TABS.map(tab => {
        const isActive = tab.hash === active;
        return (
          <a
            key={tab.hash}
            href={tab.hash}
            className={[
              'flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-xs font-medium transition-colors',
              isActive
                ? 'text-brand dark:text-brand-dark'
                : 'text-gray-500 dark:text-gray-400 hover:text-brand dark:hover:text-brand-dark',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-xl leading-none" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
