import { useRef, useState } from 'react';
import type { UserProgress } from '../types';
import { saveProgress } from '../lib/storage';

interface BackupSectionProps {
  progress: UserProgress;
}

function isValidBackup(parsed: unknown): parsed is UserProgress {
  if (!parsed || typeof parsed !== 'object') return false;
  const p = parsed as Record<string, unknown>;
  if (p.version !== 1 && p.version !== 2) return false;
  if (typeof p.displayName !== 'string') return false;
  if (!p.completed || typeof p.completed !== 'object') return false;
  if (!Array.isArray(p.favourites)) return false;
  if (!p.streak || typeof p.streak !== 'object') return false;
  return true;
}

export function BackupSection({ progress }: BackupSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; message: string } | null>(null);

  function handleExport() {
    try {
      const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stockport-quest-backup-${new Date().toLocaleDateString('en-CA')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ kind: 'ok', message: 'Backup downloaded.' });
    } catch {
      setStatus({ kind: 'error', message: 'Could not download backup.' });
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting same file
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!isValidBackup(parsed)) {
        setStatus({ kind: 'error', message: 'Could not read backup: unrecognised format.' });
        return;
      }
      saveProgress(parsed);
      setStatus({ kind: 'ok', message: 'Backup restored — reloading…' });
      setTimeout(() => window.location.reload(), 400);
    } catch {
      setStatus({ kind: 'error', message: 'Could not read backup.' });
    }
  }

  return (
    <section className="bg-white dark:bg-surface-dark rounded-2xl px-4 py-4">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Backup
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Your progress is stored only on this device. Download a backup file so you can restore it later or on another browser.
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-indigo-700 transition-colors"
        >
          ⬇️ Download backup
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ⬆️ Restore from backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="sr-only"
          aria-label="Choose backup file to restore"
        />
      </div>

      <p
        className={[
          'text-xs mt-3 min-h-[1em]',
          status?.kind === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400',
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        {status?.message ?? ''}
      </p>
    </section>
  );
}
