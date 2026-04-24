import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
  isMetaQuest,
  getMetaQuestProgress,
  isMetaQuestFullyComplete,
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

const META_QUEST: Quest = {
  id: 'meta-1',
  title: 'Trail Master',
  description: 'Complete all members',
  location: 'Stockport',
  category: 'culture',
  difficulty: 'hard',
  xp: 50,
  memberQuestIds: ['q1', 'q2', 'q3'],
};

describe('isMetaQuest', () => {
  it('returns true when memberQuestIds is non-empty', () => {
    expect(isMetaQuest(META_QUEST)).toBe(true);
  });
  it('returns false for regular quests', () => {
    expect(isMetaQuest(MOCK_QUESTS[0])).toBe(false);
  });
  it('returns false when memberQuestIds is an empty array', () => {
    expect(isMetaQuest({ ...META_QUEST, memberQuestIds: [] })).toBe(false);
  });
});

describe('getMetaQuestProgress', () => {
  it('reports 0/N when no members are complete', () => {
    expect(getMetaQuestProgress(META_QUEST, {})).toEqual({ done: 0, total: 3 });
  });
  it('counts completed members', () => {
    expect(getMetaQuestProgress(META_QUEST, { q1: 'x', q3: 'x' })).toEqual({ done: 2, total: 3 });
  });
  it('ignores completed non-member quests', () => {
    expect(getMetaQuestProgress(META_QUEST, { other: 'x' })).toEqual({ done: 0, total: 3 });
  });
});

describe('isMetaQuestFullyComplete', () => {
  it('returns false when no members complete', () => {
    expect(isMetaQuestFullyComplete(META_QUEST, {})).toBe(false);
  });
  it('returns false when some members complete', () => {
    expect(isMetaQuestFullyComplete(META_QUEST, { q1: 'x', q2: 'x' })).toBe(false);
  });
  it('returns true when all members complete', () => {
    expect(isMetaQuestFullyComplete(META_QUEST, { q1: 'x', q2: 'x', q3: 'x' })).toBe(true);
  });
  it('returns false for an empty-members meta-quest', () => {
    expect(isMetaQuestFullyComplete({ ...META_QUEST, memberQuestIds: [] }, {})).toBe(false);
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
    version: 2,
    displayName: 'Test',
    completed: {},
    favourites: [],
    streak: { lastActiveDate: '', current: 0, longest: 0, ...overrides },
    trackedMetaQuestId: null,
    notes: {},
    seenAchievementIds: [],
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
    expect(p.version).toBe(2);
    expect(p.displayName).toBe('Explorer');
    expect(p.completed).toEqual({});
    expect(p.favourites).toEqual([]);
    expect(p.trackedMetaQuestId).toBeNull();
    expect(p.notes).toEqual({});
    expect(p.seenAchievementIds).toEqual([]);
  });

  it('round-trips progress through save and load', () => {
    const p: UserProgress = {
      version: 2,
      displayName: 'Kyle',
      completed: { q1: '2024-01-01T00:00:00.000Z' },
      favourites: ['q2'],
      streak: { lastActiveDate: '2024-01-01', current: 3, longest: 5 },
      trackedMetaQuestId: 'culture-frog-trail',
      notes: { q1: 'Lovely morning walk' },
      seenAchievementIds: ['first-quest'],
    };
    saveProgress(p);
    const loaded = loadProgress();
    expect(loaded).toEqual(p);
  });

  it('migrates a v1 save to v2 with defaults for new fields', () => {
    localStorage.setItem(
      'stockport-quest-progress-v1',
      JSON.stringify({
        version: 1,
        displayName: 'Legacy',
        completed: { q1: 'x' },
        favourites: ['q2'],
        streak: { lastActiveDate: '', current: 0, longest: 0 },
      })
    );
    const loaded = loadProgress();
    expect(loaded.version).toBe(2);
    expect(loaded.displayName).toBe('Legacy');
    expect(loaded.completed).toEqual({ q1: 'x' });
    expect(loaded.favourites).toEqual(['q2']);
    expect(loaded.trackedMetaQuestId).toBeNull();
    expect(loaded.notes).toEqual({});
    expect(loaded.seenAchievementIds).toEqual([]);
  });

  it('returns default when stored data has unknown version', () => {
    localStorage.setItem('stockport-quest-progress-v1', JSON.stringify({ version: 99, foo: 'bar' }));
    const p = loadProgress();
    expect(p.displayName).toBe('Explorer');
  });

  it('returns default when stored data is corrupt JSON', () => {
    localStorage.setItem('stockport-quest-progress-v1', 'not-json{{');
    const p = loadProgress();
    expect(p.displayName).toBe('Explorer');
  });

  it('clearProgress removes the key', () => {
    saveProgress({
      version: 2,
      displayName: 'X',
      completed: {},
      favourites: [],
      streak: { lastActiveDate: '', current: 0, longest: 0 },
      trackedMetaQuestId: null,
      notes: {},
      seenAchievementIds: [],
    });
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

// ─── Meta-quest integration ──────────────────────────────────────────────────

describe('QuestContext — meta-quests', () => {
  beforeEach(() => { localStorage.clear(); });

  it('auto-completes a meta-quest when all members are done, awarding bonus XP', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const meta = result.current.quests.find(q => q.id === 'culture-frog-trail');
    expect(meta).toBeDefined();
    const memberIds = meta!.memberQuestIds!;
    const expectedMemberXP = memberIds.reduce(
      (sum, id) => sum + (result.current.quests.find(q => q.id === id)?.xp ?? 0),
      0
    );

    act(() => {
      for (const id of memberIds) {
        result.current.toggleComplete(id);
      }
    });

    expect(result.current.progress.completed[meta!.id]).toBeTruthy();
    expect(result.current.totalXP).toBe(expectedMemberXP + meta!.xp);
  });

  it('reverts meta-quest completion when a member is un-ticked', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const meta = result.current.quests.find(q => q.id === 'culture-frog-trail')!;
    const memberIds = meta.memberQuestIds!;

    act(() => {
      for (const id of memberIds) result.current.toggleComplete(id);
    });
    expect(result.current.progress.completed[meta.id]).toBeTruthy();

    act(() => { result.current.toggleComplete(memberIds[0]); });
    expect(result.current.progress.completed[meta.id]).toBeUndefined();
  });

  it('does not mark the meta-quest when only some members are complete', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const meta = result.current.quests.find(q => q.id === 'culture-frog-trail')!;
    const memberIds = meta.memberQuestIds!;

    act(() => {
      result.current.toggleComplete(memberIds[0]);
      result.current.toggleComplete(memberIds[1]);
    });
    expect(result.current.progress.completed[meta.id]).toBeUndefined();
  });

  it('toggleComplete on a meta-quest id is a no-op', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const meta = result.current.quests.find(q => q.id === 'culture-frog-trail')!;
    act(() => { result.current.toggleComplete(meta.id); });
    expect(result.current.progress.completed[meta.id]).toBeUndefined();
    expect(result.current.totalXP).toBe(0);
  });

  it('setTrackedMetaQuest stores a valid meta-quest id', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    act(() => { result.current.setTrackedMetaQuest('culture-frog-trail'); });
    expect(result.current.progress.trackedMetaQuestId).toBe('culture-frog-trail');
    expect(result.current.trackedMetaQuest?.id).toBe('culture-frog-trail');
  });

  it('setTrackedMetaQuest ignores non-meta quest ids', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const regularQuest = result.current.quests.find(q => !q.memberQuestIds)!;
    act(() => { result.current.setTrackedMetaQuest(regularQuest.id); });
    expect(result.current.progress.trackedMetaQuestId).toBeNull();
    expect(result.current.trackedMetaQuest).toBeNull();
  });

  it('setTrackedMetaQuest(null) clears the tracked trail', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    act(() => { result.current.setTrackedMetaQuest('culture-frog-trail'); });
    act(() => { result.current.setTrackedMetaQuest(null); });
    expect(result.current.progress.trackedMetaQuestId).toBeNull();
  });

  it('auto-clears the tracked trail once it is fully complete', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const meta = result.current.quests.find(q => q.id === 'outdoors-fred-perry-way')!;
    act(() => { result.current.setTrackedMetaQuest(meta.id); });
    expect(result.current.progress.trackedMetaQuestId).toBe(meta.id);
    act(() => {
      for (const id of meta.memberQuestIds!) {
        result.current.toggleComplete(id);
      }
    });
    expect(result.current.progress.completed[meta.id]).toBeTruthy();
    expect(result.current.progress.trackedMetaQuestId).toBeNull();
  });
});

describe('meta-quest crossover', () => {
  beforeEach(() => { localStorage.clear(); });

  // A quest may belong to multiple meta-quests simultaneously (for example a pub
  // that appears on both an ale trail and a historic pub trail). Toggling that
  // shared member must re-evaluate every parent independently.
  it('completing a shared member credits every parent meta-quest', () => {
    const SHARED = 'shared-quest';
    const sharedQuests: Quest[] = [
      { id: SHARED, title: 'Shared', description: '', location: '', category: 'food', difficulty: 'easy', xp: 10 },
      { id: 'only-a', title: 'Only A', description: '', location: '', category: 'food', difficulty: 'easy', xp: 10 },
      { id: 'only-b', title: 'Only B', description: '', location: '', category: 'food', difficulty: 'easy', xp: 10 },
    ];
    const metaA: Quest = {
      id: 'meta-a', title: 'Trail A', description: '', location: '', category: 'food', difficulty: 'hard', xp: 50,
      memberQuestIds: [SHARED, 'only-a'],
    };
    const metaB: Quest = {
      id: 'meta-b', title: 'Trail B', description: '', location: '', category: 'food', difficulty: 'hard', xp: 50,
      memberQuestIds: [SHARED, 'only-b'],
    };

    // Complete only the shared one + only-a → meta-a done, meta-b not.
    const completed: Record<string, string> = { [SHARED]: 'x', 'only-a': 'x' };
    expect(isMetaQuestFullyComplete(metaA, completed)).toBe(true);
    expect(isMetaQuestFullyComplete(metaB, completed)).toBe(false);

    // Also complete only-b → both meta-quests done.
    completed['only-b'] = 'x';
    expect(isMetaQuestFullyComplete(metaA, completed)).toBe(true);
    expect(isMetaQuestFullyComplete(metaB, completed)).toBe(true);

    // Un-ticking the shared member reverts both.
    delete completed[SHARED];
    expect(isMetaQuestFullyComplete(metaA, completed)).toBe(false);
    expect(isMetaQuestFullyComplete(metaB, completed)).toBe(false);
    // Sanity: progress helper still counts correctly.
    expect(getMetaQuestProgress(metaA, completed).done).toBe(1);
    expect(getMetaQuestProgress(metaB, completed).done).toBe(1);
    // Reference to unused sharedQuests so it's clear what the set models.
    expect(sharedQuests.length).toBe(3);
  });
});

describe('meta-quest crossover (real data)', () => {
  beforeEach(() => { localStorage.clear(); });

  // culture-frog-tudor is a member of both the Frog Trail (17 stops) and the
  // Bramhall Circuit (5 stops). Ticking it should contribute to both trails'
  // progress counters in parallel.
  it('a shared member counts towards every parent meta-quest in the real data', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    const tudor = result.current.quests.find(q => q.id === 'culture-frog-tudor')!;
    const frogTrail = result.current.quests.find(q => q.id === 'culture-frog-trail')!;
    const bramhall = result.current.quests.find(q => q.id === 'history-bramhall-circuit')!;

    // Both trails list the Tudor Frog as a member.
    expect(frogTrail.memberQuestIds).toContain(tudor.id);
    expect(bramhall.memberQuestIds).toContain(tudor.id);

    act(() => { result.current.toggleComplete(tudor.id); });

    expect(getMetaQuestProgress(frogTrail, result.current.progress.completed).done).toBe(1);
    expect(getMetaQuestProgress(bramhall, result.current.progress.completed).done).toBe(1);
  });
});

// ─── MetaQuestsPage ───────────────────────────────────────────────────────────

import { MetaQuestsPage } from '../pages/MetaQuestsPage';

describe('MetaQuestsPage', () => {
  beforeEach(() => { localStorage.clear(); });

  function renderPage() {
    const onSelect = vi.fn();
    render(
      <QuestContextProvider>
        <MetaQuestsPage onSelectQuest={onSelect} />
      </QuestContextProvider>
    );
    return { onSelect };
  }

  it('renders the Trails heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Stockport Trails/i })).toBeInTheDocument();
  });

  it('lists every meta-quest as a card', () => {
    renderPage();
    // Each of the five known trails should be present.
    expect(screen.getByText(/Complete the One Stockport Frog Trail/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete the Stockport Ale Trail/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete the Underbanks Street Art Trail/i)).toBeInTheDocument();
    expect(screen.getByText(/Stockport Blue Plaque Trail/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete the Fred Perry Way/i)).toBeInTheDocument();
  });

  it('Track button toggles tracking for a trail', async () => {
    renderPage();
    const trackBtn = screen.getByLabelText(/Track Complete the Fred Perry Way/i);
    await userEvent.click(trackBtn);
    // Now the same trail has a Tracking badge and its button offers to stop tracking.
    expect(screen.getByLabelText(/Stop tracking Complete the Fred Perry Way/i)).toBeInTheDocument();
  });

  it('opens the trail detail when the card is clicked', async () => {
    const { onSelect } = renderPage();
    const card = screen.getByRole('button', { name: /^Complete the Fred Perry Way/i });
    await userEvent.click(card);
    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0][0].id).toBe('outdoors-fred-perry-way');
  });
});

// ─── BottomNav ────────────────────────────────────────────────────────────────

import { BottomNav } from '../components/BottomNav';

describe('BottomNav', () => {
  it('renders all five tab labels', () => {
    render(<BottomNav activeHash="#/discover" />);
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Trails')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('marks the Trails tab as active when hash is #/trails', () => {
    render(<BottomNav activeHash="#/trails" />);
    const link = screen.getByText('Trails').closest('a');
    expect(link).toHaveAttribute('aria-current', 'page');
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
    // "N of N" where both numbers match
    expect(screen.getByText(/^\d+ of \d+$/)).toBeInTheDocument();
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

// ─── Achievements ─────────────────────────────────────────────────────────────

import { ACHIEVEMENTS, getUnlockedIds, getNewlyUnlocked } from '../lib/achievements';

function emptyProgress(): UserProgress {
  return {
    version: 2,
    displayName: 'Test',
    completed: {},
    favourites: [],
    streak: { lastActiveDate: '', current: 0, longest: 0 },
    trackedMetaQuestId: null,
    notes: {},
    seenAchievementIds: [],
  };
}

describe('achievements', () => {
  it('ACHIEVEMENTS contains at least 10 entries with unique ids', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    const ids = new Set(ACHIEVEMENTS.map(a => a.id));
    expect(ids.size).toBe(ACHIEVEMENTS.length);
  });

  it('unlocks First Steps after completing one easy quest', () => {
    const quests: Quest[] = [
      { id: 'easy-one', title: 'Easy', description: '', location: '', category: 'outdoors', difficulty: 'easy', xp: 10 },
    ];
    const prog = emptyProgress();
    expect(getUnlockedIds(prog, quests)).not.toContain('first-quest');
    prog.completed['easy-one'] = '2026-01-01';
    expect(getUnlockedIds(prog, quests)).toContain('first-quest');
  });

  it('unlocks Going Hard only once a hard quest is completed', () => {
    const quests: Quest[] = [
      { id: 'easy-one', title: 'E', description: '', location: '', category: 'outdoors', difficulty: 'easy', xp: 10 },
      { id: 'hard-one', title: 'H', description: '', location: '', category: 'outdoors', difficulty: 'hard', xp: 50 },
    ];
    const prog = emptyProgress();
    prog.completed['easy-one'] = 'x';
    expect(getUnlockedIds(prog, quests)).not.toContain('first-hard');
    prog.completed['hard-one'] = 'x';
    expect(getUnlockedIds(prog, quests)).toContain('first-hard');
  });

  it('Collector unlocks at 10 favourites', () => {
    const quests: Quest[] = [];
    const prog = emptyProgress();
    prog.favourites = Array.from({ length: 9 }, (_, i) => `q-${i}`);
    expect(getUnlockedIds(prog, quests)).not.toContain('ten-favourites');
    prog.favourites.push('q-10');
    expect(getUnlockedIds(prog, quests)).toContain('ten-favourites');
  });

  it('getNewlyUnlocked skips achievements already seen', () => {
    const quests: Quest[] = [
      { id: 'easy-one', title: 'E', description: '', location: '', category: 'outdoors', difficulty: 'easy', xp: 10 },
    ];
    const prev = emptyProgress();
    const next = emptyProgress();
    next.completed['easy-one'] = '2026-01-01';
    // Fresh unlock: should be returned.
    expect(getNewlyUnlocked(prev, next, quests).some(a => a.id === 'first-quest')).toBe(true);
    // If already seen, it should not be returned.
    next.seenAchievementIds = ['first-quest'];
    expect(getNewlyUnlocked(prev, next, quests).some(a => a.id === 'first-quest')).toBe(false);
  });

  it('getNewlyUnlocked returns only the diff between prev and next', () => {
    const quests: Quest[] = [
      { id: 'q1', title: 'A', description: '', location: '', category: 'outdoors', difficulty: 'easy', xp: 10 },
    ];
    const prev = emptyProgress();
    prev.completed['q1'] = 'x';
    const next = emptyProgress();
    next.completed['q1'] = 'x';
    // First Steps was already unlocked in prev, so it should not appear here.
    expect(getNewlyUnlocked(prev, next, quests).some(a => a.id === 'first-quest')).toBe(false);
  });
});

// ─── Notes (setNote) ──────────────────────────────────────────────────────────

describe('QuestContext — notes', () => {
  beforeEach(() => { localStorage.clear(); });

  it('setNote stores the trimmed value', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    act(() => { result.current.setNote('q1', '  My note  '); });
    expect(result.current.progress.notes['q1']).toBe('My note');
  });

  it('setNote with empty string removes the key', () => {
    const { result } = renderHook(() => useQuestContext(), { wrapper });
    act(() => { result.current.setNote('q1', 'something'); });
    expect(result.current.progress.notes['q1']).toBe('something');
    act(() => { result.current.setNote('q1', ''); });
    expect(result.current.progress.notes['q1']).toBeUndefined();
  });

  it('notes persist through storage round-trip', () => {
    const { result, unmount } = renderHook(() => useQuestContext(), { wrapper });
    act(() => { result.current.setNote('q1', 'Lovely day'); });
    unmount();
    const { result: result2 } = renderHook(() => useQuestContext(), { wrapper });
    expect(result2.current.progress.notes['q1']).toBe('Lovely day');
  });
});

// ─── QuestsPage sort/filter extensions ────────────────────────────────────────

describe('QuestsPage — sort and favourites', () => {
  beforeEach(() => { localStorage.clear(); });

  it('renders the sort dropdown', () => {
    render(
      <QuestContextProvider>
        <QuestsPage onSelectQuest={vi.fn()} />
      </QuestContextProvider>
    );
    expect(screen.getByLabelText('Sort quests')).toBeInTheDocument();
  });

  it('Favourites chip filters to favourited quests only', async () => {
    render(
      <QuestContextProvider>
        <QuestsPage onSelectQuest={vi.fn()} />
      </QuestContextProvider>
    );
    // Pick the first incomplete quest card's favourite button and favourite it.
    const favBtns = screen.getAllByLabelText(/Add .+ to favourites/);
    await userEvent.click(favBtns[0]);
    // Activate the Favourites filter chip. The chip starts with 🤍, flips to ❤️ on toggle.
    const favChip = screen.getByRole('button', { name: /^🤍 Favourites$/ });
    await userEvent.click(favChip);
    // Now only favourites remain; the filtered counter should reflect that.
    expect(screen.getByText(/^1 of \d+$/)).toBeInTheDocument();
  });

  it('switches to map view when the Map toggle is clicked', async () => {
    render(
      <QuestContextProvider>
        <QuestsPage onSelectQuest={vi.fn()} />
      </QuestContextProvider>
    );
    const mapBtn = screen.getByRole('button', { name: /Map/i });
    await userEvent.click(mapBtn);
    // The pin-summary copy appears only in map mode.
    expect(screen.getByText(/\d+ pins · \d+ done · \d+ to go/)).toBeInTheDocument();
  });

  it('toggling a map legend chip hides that category from the pin summary', async () => {
    render(
      <QuestContextProvider>
        <QuestsPage onSelectQuest={vi.fn()} />
      </QuestContextProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: /Map/i }));

    const legend = screen.getByRole('group', { name: /Toggle category visibility/i });
    const summaryBefore = screen.getByText(/(\d+) pins · \d+ done · \d+ to go/);
    const beforeCount = Number(summaryBefore.textContent!.match(/^(\d+) pins/)![1]);

    // Pick the first legend chip (any category that has pins). Read its
    // count from the label so we can assert the summary drops by exactly that.
    const chips = within(legend).getAllByRole('button');
    expect(chips.length).toBeGreaterThan(0);
    const firstChip = chips[0];
    expect(firstChip).toHaveAttribute('aria-pressed', 'true');
    const chipCount = Number(firstChip.textContent!.match(/\((\d+)\)/)![1]);

    await userEvent.click(firstChip);

    expect(firstChip).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByText(new RegExp(`^${beforeCount - chipCount} pins · `))
    ).toBeInTheDocument();
  });
});

// ─── Quest coordinates integrity ──────────────────────────────────────────────

describe('QUEST_COORDS', () => {
  it('every key references a real quest id', async () => {
    const { QUEST_COORDS } = await import('../data/quest-coords');
    const { QUESTS } = await import('../data/quests');
    const ids = new Set(QUESTS.map(q => q.id));
    const orphans = Object.keys(QUEST_COORDS).filter(id => !ids.has(id));
    expect(orphans).toEqual([]);
  });
});

// ─── DiscoverPage — Surprise me and Favourites rail ───────────────────────────

describe('DiscoverPage — Surprise me', () => {
  beforeEach(() => { localStorage.clear(); });

  it('opens a detail sheet for a random quest when Surprise me is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <QuestContextProvider>
        <DiscoverPage onSelectQuest={onSelect} onLevelUp={vi.fn()} />
      </QuestContextProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: /Surprise me/i }));
    expect(onSelect).toHaveBeenCalled();
    // It should have been called with a real Quest object that is not completed.
    const picked = onSelect.mock.calls[0][0] as Quest;
    expect(picked.id).toBeTruthy();
  });
});

// ─── Backup section ───────────────────────────────────────────────────────────

import { BackupSection } from '../components/BackupSection';

describe('BackupSection', () => {
  beforeEach(() => { localStorage.clear(); });

  function sampleProgress(): UserProgress {
    return {
      version: 2,
      displayName: 'Kyle',
      completed: { q1: '2024-01-01' },
      favourites: ['q2'],
      streak: { lastActiveDate: '2024-01-01', current: 1, longest: 1 },
      trackedMetaQuestId: null,
      notes: { q1: 'a note' },
      seenAchievementIds: [],
    };
  }

  it('renders Download and Restore buttons', () => {
    render(<BackupSection progress={sampleProgress()} />);
    expect(screen.getByRole('button', { name: /Download backup/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restore from backup/i })).toBeInTheDocument();
  });

  it('shows an error when an invalid file is imported', async () => {
    render(<BackupSection progress={sampleProgress()} />);
    const input = screen.getByLabelText(/Choose backup file to restore/i) as HTMLInputElement;
    const badFile = new File(['not json at all'], 'backup.json', { type: 'application/json' });
    // Use fireEvent since userEvent doesn't reliably handle hidden file inputs.
    Object.defineProperty(input, 'files', { value: [badFile], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await waitFor(() => {
      expect(screen.getByText(/Could not read backup/i)).toBeInTheDocument();
    });
  });
});

// ─── History timeline ────────────────────────────────────────────────────────

import { HistoryTimeline } from '../components/HistoryTimeline';

describe('HistoryTimeline', () => {
  const QUESTS_FIXTURE: Quest[] = [
    { id: 'q1', title: 'Quest One', description: '', location: '', category: 'outdoors', difficulty: 'easy', xp: 10, emoji: '🌿' },
    { id: 'q2', title: 'Quest Two', description: '', location: '', category: 'food', difficulty: 'easy', xp: 10, emoji: '🍽️' },
  ];

  it('renders nothing when there are no completions', () => {
    const { container } = render(<HistoryTimeline completed={{}} quests={QUESTS_FIXTURE} />);
    expect(container.firstChild).toBeNull();
  });

  it('buckets a just-completed quest into Today', () => {
    const now = new Date().toISOString();
    render(<HistoryTimeline completed={{ q1: now }} quests={QUESTS_FIXTURE} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Quest One')).toBeInTheDocument();
  });

  it('buckets an older completion into Earlier', () => {
    const longAgo = new Date(Date.now() - 200 * 86400000).toISOString();
    render(<HistoryTimeline completed={{ q1: longAgo }} quests={QUESTS_FIXTURE} />);
    expect(screen.getByText('Earlier')).toBeInTheDocument();
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });
});
