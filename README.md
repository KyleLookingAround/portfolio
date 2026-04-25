# Stockport Quest Tracker

A free, offline-first progressive web app for residents and visitors of Stockport, UK. Discover curated local adventures — walks, hidden gems, food stops, cultural landmarks — tick them off as you explore, earn XP, level up, and build a daily streak.

Built with React 19, TypeScript, Vite, and Tailwind CSS. No accounts, no backend, no tracking — all progress stays on your device.

## Features

- **Curated quests** across 8 categories: Outdoors, Food & Drink, Culture, History, Family, Hidden Gems, Fitness, Nightlife
- **Three difficulty tiers** — Easy (10 XP), Medium (25 XP), Hard (50 XP)
- **Themed progression** — level up from Stockport Newcomer to Stockport Legend
- **Quest of the Day** — a deterministic daily suggestion
- **Daily streaks** — complete a quest every day to keep the fire going
- **Favourites** — save the places you want to come back to
- **Trails** — multi-stop themed routes that auto-complete when every stop is ticked off, awarding bonus XP
- **Plan your own trail** — pick any set of quests to build a custom trail, then track it like a built-in one
- **Share trails** — generate a link that opens a preview on another device and saves with one tap
- **Trail overlay** — toggle the currently-tracked trail on top of the quest map alongside the easy/medium/hard filters
- **Search & filter** — by category, difficulty, favourites, or hide what you've already done
- **Map view** — interactive Leaflet map with category legend and "find me" geolocation
- **Achievements & history** — unlock badges as you progress, scroll through a timeline of completions
- **Backup & restore** — export/import your progress as a JSON file
- **Dark mode** — with system-preference default and manual override
- **Installable PWA** — add to your home screen, works offline
- **Accessible** — keyboard navigation, ARIA labelling, respects `prefers-reduced-motion`

## Tech Stack

- **React 19** with hooks and StrictMode
- **TypeScript 5** (strict mode)
- **Vite 7** + `vite-plugin-pwa`
- **Tailwind CSS 3** (class-based dark mode)
- **Vitest 4** + Testing Library for unit and integration tests
- **ESLint 9** (flat config)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
git clone https://github.com/KyleLookingAround/StockportToday.git
cd StockportToday
npm install
```

### Development

```bash
npm run dev
```

Open <http://localhost:5173/StockportToday/> in your browser.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run the full test suite once (CI mode) |
| `npm run test:ui` | Open the Vitest UI dashboard |

## Project Structure

```
src/
├── components/      # BottomNav, QuestCard, QuestDetailSheet, ErrorBoundary,
│                    # QuestsMap, TrailMap, MapControls, DiscoverMiniMap,
│                    # BackupSection, HistoryTimeline
├── pages/           # DiscoverPage, QuestsPage, MetaQuestsPage, PlanTrailPage,
│                    # ImportTrailPage, ProgressPage, ProfilePage
├── data/            # quests.ts, categories.ts, quest-coords.ts
├── lib/             # QuestContext, progress (XP/level/streak/meta logic),
│                    # storage, achievements, trailShare, planTrailNav
├── test/            # App.test.tsx, setup.ts
├── App.tsx          # Root: hash routing, theme, toast queue
├── main.tsx         # React entry point
├── types.ts         # Quest, Category, UserProgress, CustomMetaQuest, etc.
└── index.css        # Tailwind directives
```

## How It Works

### Progression

XP is earned per quest based on difficulty (10 / 25 / 50). Your level is derived from total XP using a quadratic curve: level `n` requires `20 · (n − 1)²` XP. Seven themed ranks are unlocked along the way.

### Streaks

Complete at least one quest per day to extend your streak. Miss a day and the current streak resets to zero — but your longest-ever streak is kept forever.

### Trails

Trails are meta-quests: a single themed entry that bundles several individual quests as ordered stops. Tick off every stop and the trail auto-completes, awarding a bonus XP reward on top of the per-stop XP. Pick one to **track** and it stays front-and-centre on Discover and can be overlaid on the Quests map.

You can also build your own from the Trails tab: tap **Plan your own trail**, name it, choose stops, and save. Tap **Share** on a custom trail to generate a link — opening it on another device shows a preview screen where the recipient can save the trail to their own collection. Sharing happens entirely via URL encoding; no server is involved.

### Data & Privacy

The app ships with zero telemetry. Your display name, completed quests, favourites, streaks, and custom trails live only in your browser's `localStorage` (key `stockport-quest-progress-v1`). Use **Profile → Reset all progress** to wipe everything, or **Profile → Backup** to download a JSON snapshot you can restore later.

## Deployment

The app deploys to GitHub Pages automatically on every push to `main` via `.github/workflows/deploy.yml`. The built `dist/` folder is pushed to the `gh-pages` branch.

The Vite `base` path, PWA `scope`, and `start_url` are all `/StockportToday/` — if you fork this under a different repo name, update all three in `vite.config.ts`.

## Contributing

Issues and pull requests are welcome. Before opening a PR:

```bash
npm run test:run
npm run lint
```

See [CLAUDE.md](./CLAUDE.md) for deeper architectural notes and conventions.

## License

MIT

## Acknowledgements

All quest descriptions are written for this project. Place names, landmarks, and attractions belong to the people and organisations of Stockport — go visit them.
