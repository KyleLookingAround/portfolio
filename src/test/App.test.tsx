import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Progress logic ──────────────────────────────────────────────────────────

import {
  computeLevel,
  getLevelName,
  computeTotalXP,
  hashDateString,
  getQuestOfTheDay,
  checkStreakReset,
  updateStreak,
} from '../lib/progress';
import type { Quest, UserProgress } from '../types';

const MOCK_QUESTS: Quest[] = [
  { id: 'q1', title: 'Quest One', description: 'Desc', location: 'Loc', category: 'outdoors', difficulty: 'easy', xp: 10 },
  { id: 'q2', title: 'Quest Two', description: 'Desc', location: 'Loc', category: 'food', difficulty: 'medium', xp: 25 },
  { id: 'q3', title: 'Quest Three', description: 'Desc', location: 'Loc', category: 'history', difficulty: 'hard', xp: 50 },
];

describe('computeLevel', () => {
  it('returns 1 at 0 XP', () => expect(computeLevel(0)).toBe(1));
  it('returns 2 at 20 XP', () => expect(computeLevel(20)).toBe(2));
  it('returns 3 at 80 XP', () => expect(computeLevel(80)).toBe(3));
  it('returns 4 at 180 XP', () => expect(computeLevel(180)).toBe(4));
  it('returns 5 at 320 XP', () => expect(computeLevel(320)).toBe(5));
  it('stays at level 1 below 20 XP', () => expect(computeLevel(19)).toBe(1));
});

describe('getLevelName', () => {
  it('returns Stockport Newcomer for level 1', () => expect(getLevelName(1)).toBe('Stockport Newcomer'));
  it('returns Underbanks Explorer for level 2', () => expect(getLevelName(2)).toBe('Underbanks Explorer'));
  it('returns Stockport Legend for level 7', () => expect(getLevelName(7)).toBe('Stockport Legend'));
  it('caps at Stockport Legend for levels beyond 7', () => expect(getLevelName(99)).toBe('Stockport Legend'));
});

describe('computeTotalXP', () => {
  it('returns 0 with no completed quests', () =>
    expect(computeTotalXP({}, MOCK_QUESTS)).toBe(0));

  it('sums XP for completed quests', () =>
    expect(computeTotalXP({ q1: '2024-01-01', q2: '2024-01-02' }, MOCK_QUESTS)).toBe(35));

  it('ignores unknown quest IDs', () =>
    expect(computeTotalXP({ unknown: '2024-01-01' }, MOCK_QUESTS)).toBe(0));
});

describe('hashDateString', () => {
  it('returns a non-negative number', () => {
    expect(hashDateString('2024-01-15')).toBeGreaterThanOrEqual(0);
  });
  it('is deterministic', () => {
    expect(hashDateString('2024-06-01')).toBe(hashDateString('2024-06-01'));
  });
  it('differs for different dates', () => {
    expect(hashDateString('2024-01-01')).not.toBe(hashDateString('2024-01-02'));
  });
});

describe('getQuestOfTheDay', () => {
  it('returns a quest from the available list', () => {
    const qotd = getQuestOfTheDay(MOCK_QUESTS, {});
    expect(MOCK_QUESTS).toContainEqual(qotd);
  });
  it('skips already-completed quests', () => {
    const qotd = getQuestOfTheDay(MOCK_QUESTS, { q1: 'x', q2: 'x' });
    expect(qotd?.id).toBe('q3');
  });
  it('returns null when all quests are completed', () => {
    const qotd = getQuestOfTheDay(MOCK_QUESTS, { q1: 'x', q2: 'x', q3: 'x' });
    expect(qotd).toBeNull();
  });
});

// ─── Streak logic ─────────────────────────────────────────────────────────────

function makeProgress(overrides: Partial<UserProgress['streak']> = {}): UserProgress {
  return {
    version: 1,
    displayName: 'Test',
    completed: {},
    favourites: [],
    streak: { lastActiveDate: '', current: 0, longest: 0, ...overrides },
  };
}

describe('updateStreak', () => {
  const TODAY = new Date().toLocaleDateString('en-CA');
  const YESTERDAY = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
  const TWO_DAYS_AGO = new Date(Date.now() - 2 * 86400000).toLocaleDateString('en-CA');

  it('starts streak at 1 when no prior activity', () => {
    const result = updateStreak(makeProgress(), TODAY);
    expect(result.streak.current).toBe(1);
    expect(result.streak.lastActiveDate).toBe(TODAY);
  });

  it('increments streak when last active was yesterday', () => {
    const p = makeProgress({ lastActiveDate: YESTERDAY, current: 3, longest: 3 });
    const result = updateStreak(p, TODAY);
    expect(result.streak.current).toBe(4);
    expect(result.streak.longest).toBe(4);
  });

  it('resets streak to 1 when last active was two days ago', () => {
    const p = makeProgress({ lastActiveDate: TWO_DAYS_AGO, current: 5, longest: 5 });
    const result = updateStreak(p, TODAY);
    expect(result.streak.current).toBe(1);
    expect(result.streak.longest).toBe(5);
  });

  it('no-ops when already active today', () => {
    const p = makeProgress({ lastActiveDate: TODAY, current: 2, longest: 2 });
    const result = updateStreak(p, TODAY);
    expect(result.streak.current).toBe(2);
  });
});

describe('checkStreakReset', () => {
  it('zeroes current streak if last active date is old', () => {
    const p = makeProgress({ lastActiveDate: '2000-01-01', current: 7, longest: 10 });
    const result = checkStreakReset(p);
    expect(result.streak.current).toBe(0);
    expect(result.streak.longest).toBe(10);
  });

  it('leaves streak intact if no prior activity', () => {
    const p = makeProgress({ lastActiveDate: '', current: 0, longest: 0 });
    const result = checkStreakReset(p);
    expect(result.streak.current).toBe(0);
  });
});

// ─── Storage ──────────────────────────────────────────────────────────────────

import { loadProgress, saveProgress, clearProgress } from '../lib/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default progress when storage is empty', () => {
    const p = loadProgress();
    expect(p.version).toBe(1);
    expect(p.displayName).toBe('Explorer');
    expect(p.completed).toEqual({});
    expect(p.favourites).toEqual([]);
  });

  it('round-trips progress through save and load', () => {
    const p: UserProgress = {
      version: 1,
      displayName: 'Kyle',
      completed: { q1: '2024-01-01T00:00:00.000Z' },
      favourites: ['q2'],
      streak: { lastActiveDate: '2024-01-01', current: 3, longest: 5 },
    };
    saveProgress(p);
    const loaded = loadProgress();
    expect(loaded).toEqual(p);
  });

  it('returns default when stored data has wrong version', () => {
    localStorage.setItem('stockport-quest-progress-v1', JSON.stringify({ version: 2, foo: 'bar' }));
    const p = loadProgress();
    expect(p.displayName).toBe('Explorer');
  });

  it('returns default when stored data is corrupt JSON', () => {
    localStorage.setItem('stockport-quest-progress-v1', 'not-json{{');
    const p = loadProgress();
    expect(p.displayName).toBe('Explorer');
  });

  it('clearProgress removes the key', () => {
    saveProgress({ version: 1, displayName: 'X', completed: {}, favourites: [], streak: { lastActiveDate: '', current: 0, longest: 0 } });
    clearProgress();
    expect(localStorage.getItem('stockport-quest-progress-v1')).toBeNull();
  });
});

// ─── QuestContext ─────────────────────────────────────────────────────────────

import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QuestContextProvider, useQuestContext } from '../lib/QuestContext';

function wrapper({ children }: { children: ReactNode }) {
  return <QuestContextProvider>{children}</QuestContextProvider>;
}

describe('QuestContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides the full quest list', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    expect(result.current.quests.length).toBeGreaterThan(0);
  });

  it('toggleComplete marks a quest completed', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const id = result.current.quests[0].id;
    act(() => { result.current.toggleComplete(id); });
    expect(result.current.progress.completed[id]).toBeTruthy();
  });

  it('toggleComplete un-marks a completed quest', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const id = result.current.quests[0].id;
    act(() => { result.current.toggleComplete(id); });
    act(() => { result.current.toggleComplete(id); });
    expect(result.current.progress.completed[id]).toBeUndefined();
  });

  it('toggleFavourite adds a quest to favourites', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const id = result.current.quests[0].id;
    act(() => { result.current.toggleFavourite(id); });
    expect(result.current.progress.favourites).toContain(id);
  });

  it('toggleFavourite removes an already-favourited quest', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const id = result.current.quests[0].id;
    act(() => { result.current.toggleFavourite(id); });
    act(() => { result.current.toggleFavourite(id); });
    expect(result.current.progress.favourites).not.toContain(id);
  });

  it('totalXP is 0 initially', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    expect(result.current.totalXP).toBe(0);
  });

  it('totalXP increases after completing a quest', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const quest = result.current.quests[0];
    act(() => { result.current.toggleComplete(quest.id); });
    expect(result.current.totalXP).toBe(quest.xp);
  });

  it('updateDisplayName changes the display name', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    act(() => { result.current.updateDisplayName('Alice'); });
    expect(result.current.progress.displayName).toBe('Alice');
  });

  it('resetProgress clears completed and favourites', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const id = result.current.quests[0].id;
    act(() => { result.current.toggleComplete(id); result.current.toggleFavourite(id); });
    act(() => { result.current.resetProgress(); });
    expect(result.current.progress.completed).toEqual({});
    expect(result.current.progress.favourites).toEqual([]);
  });
});

// ─── BottomNav ────────────────────────────────────────────────────────────────

import { BottomNav } from '../components/BottomNav';

describe('BottomNav', () => {
  it('renders all four tab labels', () => {
    render(<BottomNav activeHash="#/discover" />);
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('marks the active tab with aria-current="page"', () => {
    render(<BottomNav activeHash="#/quests" />);
    const link = screen.getByText('Quests').closest('a');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive tabs with aria-current', () => {
    render(<BottomNav activeHash="#/quests" />);
    const discoverLink = screen.getByText('Discover').closest('a');
    expect(discoverLink).not.toHaveAttribute('aria-current');
  });

  it('falls back to discover tab for unknown hash', () => {
    render(<BottomNav activeHash="#/unknown" />);
    const discoverLink = screen.getByText('Discover').closest('a');
    expect(discoverLink).toHaveAttribute('aria-current', 'page');
  });
});

// ─── QuestCard ────────────────────────────────────────────────────────────────

import { QuestCard } from '../components/QuestCard';

const SAMPLE_QUEST: Quest = {
  id: 'test-quest',
  title: 'Test Quest',
  description: 'A test description',
  location: 'Test Location, Stockport',
  category: 'outdoors',
  difficulty: 'easy',
  xp: 10,
  emoji: '🌿',
};

describe('QuestCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderCard(props: Partial<Parameters<typeof QuestCard>[0]> = {}) {
    const onSelect = vi.fn();
    render(
      <QuestContextProvider>
        <QuestCard quest={SAMPLE_QUEST} onSelect={onSelect} {...props} />
      </QuestContextProvider>
    );
    return { onSelect };
  }

  it('renders the quest title', () => {
    renderCard();
    expect(screen.getByText('Test Quest')).toBeInTheDocument();
  });

  it('renders the XP value', () => {
    renderCard();
    expect(screen.getByText('+10 XP')).toBeInTheDocument();
  });

  it('renders the difficulty label', () => {
    renderCard();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('calls onSelect when the card is clicked', async () => {
    const { onSelect } = renderCard();
    // article has exact aria-label "Test Quest"; action buttons contain longer labels
    const card = screen.getByRole('button', { name: 'Test Quest' });
    await userEvent.click(card);
    expect(onSelect).toHaveBeenCalledWith(SAMPLE_QUEST);
  });

  it('complete button does not propagate click to card', async () => {
    const { onSelect } = renderCard();
    const completeBtn = screen.getByLabelText(/Mark Test Quest as complete/);
    await userEvent.click(completeBtn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('favourite button does not propagate click to card', async () => {
    const { onSelect } = renderCard();
    const favBtn = screen.getByLabelText(/Add Test Quest to favourites/);
    await userEvent.click(favBtn);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

// ─── QuestsPage ───────────────────────────────────────────────────────────────

import { QuestsPage } from '../pages/QuestsPage';

describe('QuestsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderPage() {
    const onSelect = vi.fn();
    render(
      <QuestContextProvider>
        <QuestsPage onSelectQuest={onSelect} />
      </QuestContextProvider>
    );
    return { onSelect };
  }

  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Quests' })).toBeInTheDocument();
  });

  it('renders quest count summary', () => {
    renderPage();
    // "50 of 50" or similar
    expect(screen.getByText(/of 50/)).toBeInTheDocument();
  });

  it('shows empty state when search yields no results', async () => {
    renderPage();
    const input = screen.getByPlaceholderText('Search quests…');
    await userEvent.type(input, 'xyzzy12345noresult');
    await waitFor(() => {
      expect(screen.getByText('No quests match your filters')).toBeInTheDocument();
    });
  });

  it('clear filters button removes search and shows quests again', async () => {
    renderPage();
    const input = screen.getByPlaceholderText('Search quests…');
    await userEvent.type(input, 'xyzzy12345noresult');
    await waitFor(() => screen.getByText('Clear filters'));
    await userEvent.click(screen.getByText('Clear filters'));
    await waitFor(() => {
      expect(screen.queryByText('No quests match your filters')).not.toBeInTheDocument();
    });
  });
});

// ─── DiscoverPage ─────────────────────────────────────────────────────────────

import { DiscoverPage } from '../pages/DiscoverPage';

describe('DiscoverPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the hero heading', () => {
    const onSelect = vi.fn();
    const onLevelUp = vi.fn();
    render(
      <QuestContextProvider>
        <DiscoverPage onSelectQuest={onSelect} onLevelUp={onLevelUp} />
      </QuestContextProvider>
    );
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });

  it('renders a Quest of the Day section', () => {
    const onSelect = vi.fn();
    const onLevelUp = vi.fn();
    render(
      <QuestContextProvider>
        <DiscoverPage onSelectQuest={onSelect} onLevelUp={onLevelUp} />
      </QuestContextProvider>
    );
    expect(screen.getByText(/Quest of the Day/i)).toBeInTheDocument();
  });
});

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

import ErrorBoundary from '../components/ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>All good</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    spy.mockRestore();
  });
});
