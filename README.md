# TrainView: Fitness Analytics and AI Coaching

A personal fitness dashboard for workout analytics, GPS routes, and optional AI coaching. Built by Manavpreet Singh.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-7C3AED?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-0F766E?style=flat-square&logo=react&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-15803D?style=flat-square&logo=sqlite&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-C2410C?style=flat-square&logo=docker&logoColor=white)

[Open the live synthetic demo](https://trainview-sooty.vercel.app).

## Quick start

Use Node.js 22.18 or newer and npm. Copy `.env.example` to `.env`, then run:

```sh
npm ci
npm run db:setup
npm run dev
```

Open http://localhost:3000. Without imported activities, the dashboard shows empty states. Mapbox and OpenAI keys are optional.

## Try the demo

Run `npm run dev:demo` to explore synthetic workouts and steps without Garmin exports. Visit `/setup` for configuration status and import instructions. Demo AI coaching stays offline, and its GPS route is fictional. See [demo mode](docs/demo.md).

## Run the packaged demo

With Docker running, use `docker compose up --build --wait` and open http://localhost:3000. It uses synthetic data and needs no Garmin account or API keys. See [deployment](docs/deployment.md) for standalone Node packaging and verification limits.

## Vercel demo

Import this repository into Vercel using the Next.js preset. No credentials are needed for the synthetic demo. Vercel deployments always use demo data; personal imports remain available locally and in Docker. See [deployment instructions](docs/deployment.md#vercel-public-demo).

## Garmin data

Export your own records using GarminDB separately, then set `GARMIN_DATA_ROOT` to its HealthData directory. TrainView reads `FitFiles/Activities/activity_<id>.json` summaries and `<id>_ACTIVITY.fit` routes. Monitoring tables use the SQLite database selected by `DATABASE_URL`; a fresh database contains no records. TrainView does not log in to Garmin or automatically synchronize your watch.

## Live integrations

Local OpenAI coaching and Mapbox routes are implemented. Follow [live setup and verification](docs/live-integrations.md) to configure your own keys privately. Provider availability and personal exports still require real-world verification; CI uses mocked provider responses.

## Features

- Calendar-based distance, training load, intensity, and heart-rate dashboards with accessible data tables
- Searchable workout history with activity/date filters, accessible sorting, session details, filtered CSV export, and GPS routes with a local preview when interactive maps are unavailable
- Optional streaming AI coaching with a Stop action, request validation, and timeouts
- Responsive interface with light and dark themes

## Data accuracy and privacy

Activity summaries are validated individually; invalid files and duplicate activity IDs are skipped and counted on `/setup`. Missing optional numeric load, intensity, and zone fields contribute zero to totals. Missing heart rate stays unavailable. Readiness, HRV, resting heart rate, sleep scores, and race goals are not imported or inferred. Charts cover eight calendar weeks (including the current partial week) and fourteen calendar days. Empty periods show zero recorded load or minutes; missing heart rate remains unavailable, not zero. These dashboards are not medical guidance.

Activity files and monitoring records stay local by default. Enabling AI coaching sends a training summary and your question to OpenAI. Maps contact Mapbox. Never publish real health exports, GPS tracks, databases, credentials, or session files. This version has no user authentication: use it locally, not as a public server with personal data.

## Development

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:production
npm run test:standalone
npx playwright install chromium
npx playwright test
npm start
```

See [workout export](docs/workout-export.md), [deployment](docs/deployment.md), [configuration](docs/configuration.md), [architecture](docs/architecture.md), and [roadmap](docs/roadmap.md).
