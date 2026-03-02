# CLAUDE.md — AI Assistant Guide for StockportToday

This file provides guidance for AI assistants (Claude and others) working in this codebase. Read it fully before making changes.

---

## Project Overview

**StockportToday** is a client-side React dashboard that surfaces real-time local information for residents of Stockport, UK. It fetches data from several free public APIs and renders it as a responsive grid of widgets. There is no backend — all data is fetched directly in the browser.

- **Live site:** deployed to GitHub Pages at `/StockportToday/`
- **Package name:** `portfolio` (legacy name in package.json — the project is StockportToday)
- **Stockport coordinates:** LAT `53.4083`, LNG `-2.1494` (hardcoded in `src/lib/api.ts`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 (functional components + hooks) |
| Language | TypeScript 5 (strict mode) |
| Build | Vite 7 |
| Styling | Tailwind CSS 3 (utility classes only — no CSS modules) |
| Testing | Vitest 4 + @testing-library/react + jsdom |
| Linting | ESLint 9 (flat config) |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Repository Structure

```
StockportToday/
├── .github/workflows/deploy.yml   # CI/CD: build + deploy to gh-pages on push to main
├── public/                        # Static assets served as-is
├── src/
│   ├── components/                # One file per widget + shared components
│   │   ├── AirQualityWidget.tsx
│   │   ├── CrimeWidget.tsx
│   │   ├── ErrorBoundary.tsx      # Class component; wraps every widget
│   │   ├── FactsWidget.tsx
│   │   ├── FloodWidget.tsx
│   │   ├── Header.tsx
│   │   ├── LocalServicesWidget.tsx
│   │   ├── PlanningWidget.tsx
│   │   ├── StockportAIWidget.tsx
│   │   ├── TransportWidget.tsx
│   │   ├── WeatherWidget.tsx
│   │   └── WidgetCard.tsx         # Shared wrapper (loading skeleton, error state, retry)
│   ├── lib/
│   │   ├── api.ts                 # All API fetch functions + 8-second timeout logic
│   │   └── weatherCodes.ts        # WMO code → label + emoji mapping
│   ├── test/
│   │   ├── setup.ts               # Vitest global setup (@testing-library/jest-dom)
│   │   └── App.test.tsx           # Main test suite
│   ├── App.tsx                    # Root component; orchestrates widget statuses + grid layout
│   ├── index.css                  # Tailwind directives only
│   ├── main.tsx                   # React entry point (StrictMode)
│   └── types.ts                   # All TypeScript interfaces for API responses
├── .env.example                   # Template for optional env vars
├── API_KEYS.md                    # Guide for optional API keys
├── RESEARCH_SUMMARY.md            # Notes on API research and future enhancement ideas
├── README.md                      # User-facing documentation
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite + Vitest config (base: /StockportToday/)
├── tailwind.config.js
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

npm run dev          # Start Vite dev server (http://localhost:5173)
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

### Widget Pattern

Every data widget follows the same structure:

```tsx
interface MyWidgetProps {
  onStatusChange: (status: 'loading' | 'ready' | 'error') => void;
  // additional props as needed (e.g., data from parent)
}

export function MyWidget({ onStatusChange }: MyWidgetProps) {
  const [data, setData] = useState<MyType | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    onStatusChange('loading');
    try {
      const result = await fetchMyData();
      setData(result);
      setStatus('ready');
      onStatusChange('ready');
    } catch {
      setStatus('error');
      onStatusChange('error');
    }
  }, [onStatusChange]);

  useEffect(() => { load(); }, [load]);

  return (
    <WidgetCard title="My Widget" icon="..." status={status} onRetry={load}>
      {/* render data */}
    </WidgetCard>
  );
}
```

- Wrap all content in `<WidgetCard>` for consistent loading skeletons, error states, and retry buttons.
- Report status changes via `onStatusChange` so `App.tsx` can track which widgets have errors.
- Use `useCallback` on the `load` function to prevent infinite `useEffect` loops.

### App-Level Status Tracking

`App.tsx` maintains a `Record<string, WidgetStatus>` map. The `Header` reads this to show an error indicator. When adding a new widget:
1. Add a key to the status map in `App.tsx`.
2. Pass `onStatusChange` to the widget.
3. Wrap the widget in `<ErrorBoundary>` inside the grid.

### API Layer (`src/lib/api.ts`)

All fetch calls go through a shared `fetchJson<T>` helper that applies an 8-second `AbortController` timeout:

```ts
async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}
```

- Add new API functions in `api.ts` following this pattern.
- Add response types to `types.ts` — **no `any` types**.
- Stockport's coordinates (`LAT`, `LNG`) are exported constants from `api.ts`.

### TypeScript Conventions

- Strict mode is **on** — no implicit `any`, no unused locals/parameters.
- All API response shapes are defined as interfaces in `src/types.ts`.
- Component prop interfaces are defined inline in the same file as the component.
- Use `as const` for static lookup tables (e.g., `weatherCodes.ts`).

### Styling Conventions

- **Tailwind utility classes only** — no CSS modules, no inline styles.
- Brand colours: dark blue `#003A70`, light blue `#009FE3` (applied via arbitrary values or `bg-[#003A70]`).
- Status colours: blue/gray = normal, yellow = elevated, orange/red = high/alert.
- Responsive breakpoints: `sm:`, `md:`, `lg:` — mobile-first.
- The grid layout is defined in `App.tsx` using Tailwind grid classes.

### Error Boundary

`ErrorBoundary` is a class component that catches render errors. Every widget in `App.tsx` must be wrapped:

```tsx
<ErrorBoundary>
  <MyWidget onStatusChange={(s) => handleStatusChange('myWidget', s)} />
</ErrorBoundary>
```

---

## APIs in Use

All APIs are free and require no key by default. Optional keys can be added via `.env` (see `.env.example` and `API_KEYS.md`).

| Widget | API | Endpoint |
|--------|-----|----------|
| Weather | Open-Meteo | `api.open-meteo.com/v1/forecast` |
| Air Quality | Open-Meteo | `air-quality-api.open-meteo.com/v1/air-quality` |
| Crime | UK Police Data | `data.police.uk/api/crimes-street/all-crime` |
| Planning | planning.data.gov.uk | `/api/v1/entity/` |
| Flood | Environment Agency | `environment.data.gov.uk/flood-monitoring/` |

Crime data availability: the Police API may lag 2–4 months behind, so `fetchCrime()` searches back up to 4 months and uses the most recent available month.

---

## Testing

Tests live in `src/test/App.test.tsx`. The setup file is `src/test/setup.ts`.

**Testing approach:**
- Mock all API calls with `vi.mock('../lib/api')` — tests must not make real network requests.
- Test widget rendering, loading states, and error states.
- Use `@testing-library/react` (`render`, `screen`, `waitFor`) and `@testing-library/user-event`.
- Assert with `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toHaveClass`, etc.).

**Running tests:**
```bash
npm run test:run   # Must pass before any commit
```

When adding a new widget, add corresponding tests that:
1. Verify the widget renders in loading state.
2. Verify the widget renders correctly with mocked data.
3. Verify the error state appears when the API call fails.

---

## CI/CD

**`.github/workflows/deploy.yml`** triggers on push to `main`:
1. `npm ci`
2. `npm run build`
3. Deploys `dist/` to the `gh-pages` branch via `JamesIves/github-pages-deploy-action`.

The Vite base path (`/StockportToday/`) must match the GitHub Pages URL — **do not change it** without updating both `vite.config.ts` and the GitHub Pages repo settings.

---

## Environment Variables

No API keys are required for the app to function. Optional keys can be placed in `.env` (not committed):

```bash
cp .env.example .env
```

See `API_KEYS.md` for details on optional integrations (TfGM, NHS, Eventbrite).

---

## Common Tasks

### Adding a New Widget

1. Create `src/components/MyWidget.tsx` following the widget pattern above.
2. Add types to `src/types.ts`.
3. Add fetch function to `src/lib/api.ts`.
4. Register the widget in `App.tsx` (status map + grid placement + ErrorBoundary wrapper).
5. Write tests in `src/test/App.test.tsx`.
6. Run `npm run test:run && npm run lint` before committing.

### Updating API Coordinates

Edit the `LAT` and `LNG` constants at the top of `src/lib/api.ts`.

### Changing the Grid Layout

The dashboard grid is in `App.tsx`. It uses Tailwind CSS Grid classes. Adjust `col-span`, `row-span`, and breakpoint variants as needed.

### Modifying Brand Colours

Search for `#003A70` and `#009FE3` in the codebase. These are applied as Tailwind arbitrary values.

---

## What to Avoid

- **Do not** add a backend or database — this project is intentionally fully client-side.
- **Do not** use `any` in TypeScript — define proper interfaces in `types.ts`.
- **Do not** add inline styles or CSS modules — use Tailwind classes only.
- **Do not** skip `WidgetCard` wrapping for new widgets — it provides loading/error UI consistency.
- **Do not** change the Vite `base` path (`/StockportToday/`) without coordinating with GitHub Pages settings.
- **Do not** commit `.env` files.
- **Do not** make real network requests in tests — always mock API functions.
- **Do not** use `console.log` for debugging — remove before committing (ESLint may warn).

---

## Code Quality Checklist

Before committing:
- [ ] `npm run test:run` passes
- [ ] `npm run lint` passes with no errors
- [ ] No `any` types introduced
- [ ] New widgets wrapped in `<ErrorBoundary>` and registered in status map
- [ ] API fetch functions follow the `fetchJson<T>` + timeout pattern
- [ ] No real network calls in tests
