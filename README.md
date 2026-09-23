# Endpoint Health Monitoring - Frontend

A small dashboard that polls a backend every 10 seconds and shows which
registered machines are online vs offline.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your backend isn't at http://localhost:4000
npm run dev
```

Open http://localhost:3000.

## How it works

- `app/page.tsx` - the dashboard. Fetches `GET /api/v1/machines` on load,
  then every 10s via `setInterval` inside `useEffect`. Handles loading
  (skeleton, first load only), error (inline banner, keeps polling in the
  background so it recovers on its own), and empty (`No machines yet`)
  states explicitly.
- `components/MachineCard.tsx` - one machine's card: name, a pill status
  tag with a colored + pulsing dot (online) or a plain dot (offline), and
  a "last seen" relative timestamp that ticks up locally between polls.
- `lib/formatRelativeTime.ts` - tiny pure function, no date library.
- `lib/types.ts` - `Machine` / `MachinesResponse` types matching the
  backend's response shape.

## Design system

Visual language follows the attached Monad style reference: warm
parchment canvas, serif headlines (`Untitled Serif`, substituted with
Georgia if the licensed font isn't installed), monospace body/UI text
(`ABC Diatype Mono`, substituted with JetBrains Mono / system mono), Lake
Blue as the single accent color, hairline Ash borders instead of shadows,
and pill-shaped tags/buttons. Tokens live in `tailwind.config.ts`.

If you have the actual Untitled Serif / ABC Diatype Mono font files,
drop them in `public/fonts/` and add `@font-face` rules to
`app/globals.css` - the Tailwind font stacks already reference them by
name first, so they'll pick up automatically.
