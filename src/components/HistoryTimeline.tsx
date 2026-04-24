import { useMemo } from 'react';
import type { Quest } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { getLocalDateStr } from '../lib/progress';

interface HistoryTimelineProps {
  completed: Record<string, string>;
  quests: Quest[];
}

interface Entry {
  quest: Quest;
  iso: string;
  date: Date;
}

type Bucket = 'today' | 'week' | 'month' | 'earlier';

const BUCKET_LABELS: Record<Bucket, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
  earlier: 'Earlier',
};

function bucketOf(iso: string, today: string): Bucket {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'earlier';
  const dayStr = d.toLocaleDateString('en-CA');
  if (dayStr === today) return 'today';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) return 'week';
  if (diffDays < 30) return 'month';
  return 'earlier';
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function HistoryTimeline({ completed, quests }: HistoryTimelineProps) {
  const { entries, grouped } = useMemo(() => {
    const byId = new Map(quests.map(q => [q.id, q]));
    const today = getLocalDateStr();
    const list: Entry[] = [];
    for (const [id, iso] of Object.entries(completed)) {
      const quest = byId.get(id);
      if (!quest) continue;
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) continue;
      list.push({ quest, iso, date });
    }
    list.sort((a, b) => b.date.getTime() - a.date.getTime());

    const grouped: Record<Bucket, Entry[]> = { today: [], week: [], month: [], earlier: [] };
    for (const entry of list) {
      grouped[bucketOf(entry.iso, today)].push(entry);
    }
    return { entries: list, grouped };
  }, [completed, quests]);

  if (entries.length === 0) {
    return null;
  }

  const order: Bucket[] = ['today', 'week', 'month', 'earlier'];

  return (
    <section aria-labelledby="history-heading">
      <h2
        id="history-heading"
        className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3"
      >
        History
      </h2>
      <div className="space-y-4">
        {order.map(bucket => {
          const items = grouped[bucket];
          if (items.length === 0) return null;
          return (
            <div key={bucket}>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                {BUCKET_LABELS[bucket]}
              </p>
              <ul className="bg-white dark:bg-surface-dark rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
                {items.map(({ quest, iso }) => {
                  const cat = CATEGORY_MAP[quest.category];
                  return (
                    <li
                      key={quest.id}
                      className="flex items-center gap-2.5 px-3 py-2"
                    >
                      {quest.emoji && (
                        <span className="text-lg shrink-0" aria-hidden="true">{quest.emoji}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {quest.title}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: cat.color }}
                        >
                          {cat.emoji} {cat.label}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        {formatRelative(iso)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
