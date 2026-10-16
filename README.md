# TrainView: Fitness Analytics and AI Coaching

A personal fitness dashboard for workout analytics, GPS routes, and optional AI coaching. Built by Manavpreet Singh.

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

## Garmin data

Export your own records using GarminDB separately, then set `GARMIN_DATA_ROOT` to its HealthData directory. TrainView reads `FitFiles/Activities/activity_<id>.json` summaries and `<id>_ACTIVITY.fit` routes. Monitoring tables use the SQLite database selected by `DATABASE_URL`; a fresh database contains no records. TrainView does not log in to Garmin or automatically synchronize your watch.

## Features

- Distance, training load, intensity, and heart-rate dashboards
- Searchable workout history with activity/date filters, accessible sorting, session details, and Mapbox GPS routes
- Optional streaming AI coaching
- Responsive interface with light and dark themes

## Data accuracy and privacy

Activity summaries are validated individually; invalid files and duplicate activity IDs are skipped and counted on `/setup`. Missing optional numeric load, intensity, and zone fields contribute zero to totals. Missing heart rate stays unavailable. Readiness, HRV, resting heart rate, sleep scores, and race goals are not imported or inferred. These dashboards are not medical guidance.

Activity files and monitoring records stay local by default. Enabling AI coaching sends a training summary and your question to OpenAI. Maps contact Mapbox. Never publish real health exports, GPS tracks, databases, credentials, or session files. This version has no user authentication: use it locally, not as a public server with personal data.

## Development

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

See [configuration](docs/configuration.md), [architecture](docs/architecture.md), and [roadmap](docs/roadmap.md).
