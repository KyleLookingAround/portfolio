# Stockport Quest Tracker

A free, offline-first progressive web app for residents and visitors of Stockport, UK. Discover 50 curated local adventures — walks, hidden gems, food stops, cultural landmarks — tick them off as you explore, earn XP, level up, and build a daily streak.

Built with React 19, TypeScript, Vite, and Tailwind CSS. No accounts, no backend, no tracking — all progress stays on your device.

## Features

- **50 curated quests** across 8 categories: Outdoors, Food & Drink, Culture, History, Family, Hidden Gems, Fitness, Nightlife
- **Three difficulty tiers** — Easy (10 XP), Medium (25 XP), Hard (50 XP)
- **Themed progression** — level up from Stockport Newcomer to Stockport Legend
- **Quest of the Day** — a deterministic daily suggestion
- **Daily streaks** — complete a quest every day to keep the fire going
- **Favourites** — save the places you want to come back to
- **Search & filter** — by category, difficulty, or hide what you've already done
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
├── components/      # BottomNav, QuestCard, QuestDetailSheet, ErrorBoundary
├── pages/           # DiscoverPage, QuestsPage, ProgressPage, ProfilePage
├── data/            # quests.ts (50 quests), categories.ts
├── lib/             # QuestContext, progress (XP/level/streak logic), storage
├── test/            # App.test.tsx, setup.ts
├── App.tsx          # Root: hash routing, theme, level-up toast
├── main.tsx         # React entry point
├── types.ts         # Quest, Category, UserProgress, etc.
└── index.css        # Tailwind directives
```

## How It Works

### Progression

XP is earned per quest based on difficulty (10 / 25 / 50). Your level is derived from total XP using a quadratic curve: level `n` requires `20 · (n − 1)²` XP. Seven themed ranks are unlocked along the way.

### Streaks

Complete at least one quest per day to extend your streak. Miss a day and the current streak resets to zero — but your longest-ever streak is kept forever.

### Data & Privacy

The app ships with zero telemetry. Your display name, completed quests, favourites, and streaks live only in your browser's `localStorage` (key `stockport-quest-progress-v1`). Use **Profile → Reset all progress** to wipe everything.

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
