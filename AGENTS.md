# BusAlert

College bus tracking/alert app. Next.js 16 (App Router) + Tailwind v4 + Firebase (Firestore, Auth, Analytics).

## Repo structure

- **Root `package.json`** is a thin workspace wrapper — the real app is `busalert/`.
- All commands below run from `busalert/`.
- Source: `busalert/src/app/` (routes), `busalert/src/components/`, `busalert/src/lib/`, `busalert/src/types/`.

## Commands

From `busalert/`:

```bash
npm run dev        # Next.js dev server (localhost:3000)
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint (core-web-vitals + typescript)
```

No test suite, typecheck script, or formatter is configured.

## Critical: missing packages

`firebase` and `recharts` are imported in source but **not listed in `package.json`**. The app will fail `next build` until these are installed. No other dependencies are missing.

## Route structure

```
/                  → Landing (still default Next.js boilerplate)
/login             → Email/password login with role selector (student/driver/admin)
/admin             → Fleet analytics dashboard (uses Recharts)
/driver            → Driver trip control, demo mode, route map
/student           → Student ETA, "leave now" alerts, schedule
/dashboard/        → EMPTY directory — login redirects here but nothing renders
```

**Post-login redirect is broken:** login page redirects to `/dashboard/{role}` but the actual pages live at `/{role}`.

## Firebase

- Config is hardcoded demo placeholders in `src/lib/firebase/index.ts` — not real credentials.
- Production needs `NEXT_PUBLIC_FIREBASE_*` env vars (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID).
- No `.env` files exist. `.gitignore` already excludes `.env*`.
- `getAnalytics()` is called at module level — will fail during SSR.
- Several pages reference `auth`, `db`, `setDoc` without importing them from the firebase lib.

## Deploy

- Default target: **Vercel** (Next.js app, no `vercel.json` needed for defaults).
- No CI/CD, Docker, or middleware configs exist.
- `next.config.ts` is minimal (`reactStrictMode: true` only).
- `reactStrictMode: true` is enabled.

## Next.js 16 notes

`busalert/AGENTS.md` contains auto-generated Next.js agent rules. This version has breaking changes vs earlier Next.js — consult `node_modules/next/dist/docs/` before modifying framework-level code.

## TypeScript

- Path alias: `@/*` → `./src/*` (configured in `tsconfig.json`).
- Strict mode enabled.
- Target: ES2017, module: ESNext, bundler resolution.

## Known empty directories (planned, unimplemented)

- `src/app/dashboard/` — no pages
- `src/components/StopList/` — no component
- `src/lib/demoSimulation/` — no simulation logic
