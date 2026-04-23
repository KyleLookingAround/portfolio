# CLAUDE.md — AI Assistant Guide for Stockport Quest Tracker

This file provides guidance for AI assistants (Claude and others) working in this codebase. Read it fully before making changes.

---

## Project Overview

**Stockport Quest Tracker** is a client-side React PWA that presents 50 curated quests (activities, walks, viewpoints, food spots, hidden gems) around Stockport, UK. Users tick quests off, earn XP, level up through themed ranks, build daily streaks, and save favourites. Everything runs offline — there is no backend and no network APIs.

- **Live site:** deployed to GitHub Pages at `/StockportToday/`
- **Package name:** `stockport-quest-tracker`
- **Persistence:** all progress lives in `localStorage` under key `stockport-quest-progress-v1`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 (functional components + hooks) |
| Language | TypeScript 5 (strict mode) |
| Build | Vite 7 |
| PWA | `vite-plugin-pwa` (autoUpdate, manifest + icon) |
| Styling | Tailwind CSS 3 (`darkMode: 'class'`) — utility classes only |
| Routing | Hash-based (`window.location.hash`) — no router library |
| Testing | Vitest 4 + @testing-library/react + jsdom |
| Linting | ESLint 9 (flat config) |
| CI/CD | GitHub Actions → `gh-pages` branch |

---

## Repository Structure

```
StockportToday/
├── .github/workflows/deploy.yml   # CI/CD: build + deploy to gh-pages on push to main
├── public/
│   ├── icon.svg                   # PWA icon (referenced by manifest)
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx          # Fixed bottom tab bar (4 hash-linked tabs)
│   │   ├── ErrorBoundary.tsx      # Class component; wraps page content
│   │   ├── QuestCard.tsx          # Tappable card with favourite + complete buttons
│   │   └── QuestDetailSheet.tsx   # Modal bottom-sheet with full quest info + actions
│   ├── pages/
│   │   ├── DiscoverPage.tsx       # Hero, Quest of the Day, category grid
│   │   ├── QuestsPage.tsx         # Full list with search, category/difficulty filters
│   │   ├── ProgressPage.tsx       # Level card, level ladder, streaks, per-category progress
│   │   └── ProfilePage.tsx        # Name edit, stats, dark-mode toggle, reset
│   ├── data/
│   │   ├── quests.ts              # 50 curated Quest objects
│   │   └── categories.ts          # 8 categories with labels, emoji, brand colour
│   ├── lib/
│   │   ├── QuestContext.tsx       # React context: quests, progress, level, XP, actions
│   │   ├── progress.ts            # Pure XP/level/streak/QoTD functions
│   │   └── storage.ts             # localStorage load/save/clear
│   ├── test/
│   │   ├── setup.ts               # Vitest global setup (@testing-library/jest-dom)
│   │   └── App.test.tsx           # Unit + integration tests
│   ├── App.tsx                    # Root: hash routing, theme, level-up toast
│   ├── index.css                  # Tailwind directives + body font
│   ├── main.tsx                   # React entry point (StrictMode)
│   ├── types.ts                   # Quest, Category, UserProgress, StreakData, CategoryId, Difficulty
│   └── vite-env.d.ts
├── index.html                     # HTML entry (title, meta, theme-color #4F46E5)
├── vite.config.ts                 # Vite + VitePWA + Vitest config (base: /StockportToday/)
├── tailwind.config.js             # Brand colours, category colours, animations
├── postcss.config.js
├── eslint.config.js               # Flat ESLint config
├── tsconfig.json                  # References app / node / test configs
├── tsconfig.app.json              # Strict TS for src/ (excludes tests)
├── tsconfig.test.json             # TS config for test files
└── tsconfig.node.json             # TS config for vite.config.ts
```

---

## Development Commands

```bash
npm install          # Install dependencies

npm run dev          # Start Vite dev server (http://localhost:5173/StockportToday/)
npm run build        # tsc -b && vite build → dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run test         # Vitest watch mode (interactive)
npm run test:run     # Single test run (use in CI / before committing)
npm run test:ui      # Vitest UI dashboard
```

**Always run `npm run test:run` and `npm run lint` before committing changes.**

---

## Architecture & Key Patterns

### State Ownership

All quest data and user progress lives in a single React context: `QuestContextProvider` in `src/lib/QuestContext.tsx`. Components read it via the `useQuestContext()` hook and never touch `localStorage` directly.

The context exposes:

```ts
interface QuestContextValue {
  quests: Quest[];              // static catalogue from data/quests.ts
  progress: UserProgress;       // persisted user state
  totalXP: number;              // memoised from progress.completed
  level: number;                // derived from totalXP
  levelName: string;            // from progress.ts LEVEL_NAMES
  toggleComplete: (id: string) => { levelDelta, newLevel, levelName };
  toggleFavourite: (id: string) => void;
  updateDisplayName: (name: string) => void;
  resetProgress: () => void;
}
```

`toggleComplete` returns a level delta so callers can trigger the level-up toast in `App.tsx`.

### Routing

Hash-based — no library. `useHashRoute()` in `App.tsx` listens for `hashchange` and derives `activePage` from `#/discover | #/quests | #/progress | #/profile`. `BottomNav` renders `<a href="#/...">` links; the active tab is styled via `aria-current="page"`.

To navigate with side effects (e.g. DiscoverPage → QuestsPage with a pre-selected category filter), the current pattern is to write a sentinel into `sessionStorage` before navigating, which `QuestsPage` reads and deletes on mount.

### Progress, XP, and Levels

Pure functions in `src/lib/progress.ts`:

- `computeTotalXP(completed, quests)` — sum `quest.xp` for completed ids.
- `computeLevel(xp)` — `floor(sqrt(xp / 20)) + 1` (quadratic scaling: level `n` needs `20·(n-1)²` XP).
- `getLevelName(level)` — maps to 7 hard-coded themed names (Stockport Newcomer → Stockport Legend); caps at the last name.
- `updateStreak(progress, today)` — increments if last active was yesterday, resets to 1 if older, no-ops if already today.
- `checkStreakReset(progress)` — zeroes the current streak on load if the last-active date is older than yesterday (called once when loading from storage).
- `getQuestOfTheDay(quests, completed)` — deterministic daily pick: `hashDateString(today) % availableQuests.length`.

XP by difficulty (from `XP_BY_DIFFICULTY`): **easy = 10, medium = 25, hard = 50**. Each quest also has an explicit `xp` field in `data/quests.ts`, so always sum via `computeTotalXP` rather than recomputing from difficulty.

### Persistence

`src/lib/storage.ts` exposes `loadProgress()` / `saveProgress()` / `clearProgress()` against the key `stockport-quest-progress-v1`. Load is defensive: invalid JSON or mismatched `version` falls back to `defaultProgress()`. Every `try/catch` swallows storage errors silently — this is intentional (private mode, quota, SSR).

If the `UserProgress` shape changes, bump the `version` field and write a migration (or reset) in `loadProgress`.

### Theme

Dark mode is toggled on `<div>` in `App.tsx` via the `dark` class (Tailwind `darkMode: 'class'`). The initial value reads `localStorage['sq-theme']`, falls back to `prefers-color-scheme`. Changes are persisted in a `useEffect`.

### Data Model

See `src/types.ts`:

```ts
type CategoryId = 'outdoors' | 'food' | 'culture' | 'history' | 'family' | 'hidden' | 'fitness' | 'nightlife';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Quest {
  id: string;           // kebab-case, prefixed with category (e.g. 'outdoors-vernon-park')
  title: string;
  description: string;  // 1–2 sentences, written from the reader's perspective
  location: string;     // "Place name, Stockport" — first comma-segment is shown in cards
  category: CategoryId;
  difficulty: Difficulty;
  xp: number;           // must match XP_BY_DIFFICULTY[difficulty]
  emoji?: string;
  tags?: string[];
}
```

### TypeScript Conventions

- Strict mode is **on** — no implicit `any`, no unused locals/parameters.
- All domain shapes live in `src/types.ts`.
- Use `as const` for static lookup tables (e.g. `LEVEL_NAMES`, `XP_BY_DIFFICULTY`).
- Prefer discriminated string unions (`CategoryId`, `Difficulty`) over open strings.

### Styling Conventions

- **Tailwind utility classes only** — no CSS modules, no inline styles (except dynamic colours from category data).
- Brand palette (in `tailwind.config.js`): `brand` (indigo `#4F46E5` / dark `#818CF8`), `accent` (emerald `#10B981`), `highlight` (amber `#F59E0B`), `surface.dark` (`#151B2B`).
- Category colours are defined twice — once in `tailwind.config.js` under `colors.category.*`, and once in `src/data/categories.ts`. Keep them in sync.
- Mobile-first. The app is capped at `max-w-[480px]` until `xl`, where a decorative right column appears.
- Animations: `fade-in` (toast) and `slide-up` (detail sheet). Respect `prefers-reduced-motion` when adding new ones — existing code checks it at render time.

### Accessibility

- Every interactive element has an `aria-label` or visible text.
- The detail sheet is `role="dialog"` + `aria-modal="true"`, closes on Escape, locks body scroll, and auto-focuses the close button.
- Toggle switches use `role="switch"` + `aria-checked`.
- Progress bars use `role="progressbar"` + `aria-valuenow/min/max`.
- Keep the existing patterns when adding UI.

### Error Boundary

`ErrorBoundary` is a class component. It is exported as **default** from `src/components/ErrorBoundary.tsx` (this differs from the other components, which are named exports). Retain this pattern when wrapping new risky sub-trees.

### PWA

`vite-plugin-pwa` is configured in `vite.config.ts` with `registerType: 'autoUpdate'`. The manifest scope and `start_url` are both `/StockportToday/` and must match the Vite `base`. If you rename the repo or change Pages routing, update **all three** in lockstep. `workbox.runtimeCaching` is currently empty — all assets are precached by the plugin default.

---

## Testing

Tests live in `src/test/App.test.tsx`. Setup in `src/test/setup.ts` imports `@testing-library/jest-dom`.

**What's covered:**
- Pure progress functions (`computeLevel`, `getLevelName`, `computeTotalXP`, `hashDateString`, `getQuestOfTheDay`, `updateStreak`, `checkStreakReset`).
- Storage round-trip (`loadProgress`, `saveProgress`, `clearProgress`).
- Integration tests that mount `<App />` and drive it with `user-event`.

**Testing approach:**
- Pure functions: import and assert directly — no mocks needed.
- Integration: use `render(<App />)`. Clear `localStorage` in `beforeEach` to isolate state.
- No network mocking required — the app makes no fetch calls.
- Use `@testing-library/react` (`render`, `screen`, `waitFor`) and `@testing-library/user-event`.

When adding a new feature, add tests that:
1. Cover the happy path via user interactions (not implementation details).
2. Cover edge cases in any new pure function (empty input, boundary values).
3. Verify persistence if the feature writes to `localStorage`.

---

## CI/CD

**`.github/workflows/deploy.yml`** triggers on push to `main`:
1. `npm ci`
2. `npm run build`
3. Deploys `dist/` to the `gh-pages` branch via `JamesIves/github-pages-deploy-action@v4`.

The Vite base path (`/StockportToday/`) and the PWA manifest `scope` / `start_url` must all match the GitHub Pages URL — **do not change one without changing all three**.

The workflow does **not** currently run tests or lint. If you rely on CI to catch regressions, add `npm run test:run` and `npm run lint` steps before the build.

---

## Common Tasks

### Adding a New Quest

1. Append to `QUESTS` in `src/data/quests.ts`.
2. `id` must be unique and kebab-case, conventionally prefixed with the category (e.g. `food-marble-brewery`).
3. Pick a single `category` from `CategoryId` and a `difficulty`.
4. Set `xp` to match `XP_BY_DIFFICULTY[difficulty]` — don't invent values.
5. `location` should end with `, Stockport` (or a nearby place name) — only the first comma-segment renders in cards.
6. No tests to update — the context reads the array dynamically.

### Adding a New Category

1. Add to `CategoryId` union in `src/types.ts`.
2. Append to `CATEGORIES` in `src/data/categories.ts` with label, emoji, hex colour.
3. Add the matching hex to `tailwind.config.js` under `colors.category.*`.
4. Existing UI (Discover grid, Quests filter chips, Progress breakdown) iterates over `CATEGORIES` and picks up the new entry automatically.

### Adding a New Page / Tab

1. Create `src/pages/MyPage.tsx` exporting a named function component.
2. Add the tab entry to the `TABS` array in `src/components/BottomNav.tsx` with a hash (`#/mypage`), label, and icon emoji.
3. In `App.tsx`, extend the `activePage` derivation and render `<MyPage />` inside the `<main>`.
4. Keep the bottom padding (`pb-20`) on the root so content clears the fixed nav.

### Changing the Level Curve

Edit `computeLevel` in `src/lib/progress.ts` and keep the inverse `xpForLevel` (currently duplicated in `DiscoverPage` and `ProgressPage`) in sync. If you add new level names, append to `LEVEL_NAMES` — `getLevelName` caps at the last entry, so progression keeps working.

### Changing Brand Colours

Search `tailwind.config.js` for `brand`, `accent`, `highlight`. Also update `theme-color` in `index.html` and the PWA `theme_color` / `background_color` in `vite.config.ts` to match.

---

## What to Avoid

- **Do not** add a backend, API, or analytics — this app is intentionally offline-first with zero network calls.
- **Do not** use `any` in TypeScript — define types in `src/types.ts`.
- **Do not** read or write `localStorage` outside `src/lib/storage.ts`. (The theme key `sq-theme` in `App.tsx` is the one exception; don't add more.)
- **Do not** introduce a router library — hash routing is deliberate to keep the bundle small and GitHub Pages-friendly.
- **Do not** hard-code per-quest XP anywhere in logic — always read from the `Quest.xp` field.
- **Do not** change the Vite `base` (`/StockportToday/`) without also updating the PWA `scope` and `start_url` in `vite.config.ts`.
- **Do not** commit real-user progress fixtures or personal names in test data.
- **Do not** use `console.log` for debugging — remove before committing. (`ErrorBoundary.componentDidCatch` legitimately uses `console.error`.)

---

## Code Quality Checklist

Before committing:
- [ ] `npm run test:run` passes
- [ ] `npm run lint` passes with no errors
- [ ] No `any` types introduced
- [ ] New quests have `xp` matching `XP_BY_DIFFICULTY[difficulty]`
- [ ] New categories added in `types.ts`, `categories.ts`, and `tailwind.config.js`
- [ ] No direct `localStorage` access outside `src/lib/storage.ts`
- [ ] No network fetches introduced
- [ ] Accessibility attributes (`aria-label`, `role`, keyboard handlers) on new interactive elements
