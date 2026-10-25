# BusAlert

Real-time bus tracking app built with Next.js (App Router), Firebase, and Leaflet.

Students can follow a live bus on a map, see route progress and ETA, and get delay
notifications. Drivers publish their GPS position, and admins manage stops and monitor
sign-ins.

## Roles

| Role    | Route        | Capabilities                                          |
| ------- | ------------ | ----------------------------------------------------- |
| Student | `/student`   | Follow buses, ETA, route timeline, notifications      |
| Driver  | `/driver`    | Publish live GPS location for their bus               |
| Admin   | `/admin`     | Manage stops, view signed-in users and analytics      |

Public pages: `/` (landing), `/login`, `/signup`, `/tracking/[busId]`, `/dashboard`.

## Stack

- **Next.js 16** (App Router, Route Handlers under `src/app/api`)
- **React 19**, **TypeScript**, **Tailwind CSS 4**
- **Firebase** — Auth + Firestore (`src/lib/firebase`)
- **Leaflet / react-leaflet** — live map (`src/components/RouteMap`)
- **Recharts** — admin analytics
- **lucide-react** — icons

## Project structure

```
src/
  app/          # routes: admin, dashboard, driver, login, signup, student, tracking, api
  components/   # BusCard, RouteMap, ETACard, StopTimeline, AuthGuard, ...
  context/      # AuthContext (session + role)
  lib/          # firebase, eta, geolocation, simulation, demoSimulation
  types/        # shared TypeScript types
```

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with your Firebase web app config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `npm run dev` | Start dev server         |
| `npm run build` | Production build       |
| `npm run start` | Serve production build  |
| `npm run lint`  | Run ESLint             |

## Deployment

Deploys to [Vercel](https://vercel.com) — set the `NEXT_PUBLIC_FIREBASE_*` variables in
the project settings before deploying.
