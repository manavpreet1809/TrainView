# TrainView: Fitness Analytics and AI Coaching

A personal fitness dashboard for workout analytics, GPS routes, and optional AI coaching.

## Quick start

Use Node.js 22 and npm. Copy `.env.example` to `.env`, then run:

```sh
npm ci
npm run db:setup
npm run dev
```

Open http://localhost:3000. Without imported activities, the dashboard shows empty states. Mapbox and OpenAI keys are optional.

## Garmin data

Export your own records using GarminDB separately, then set `GARMIN_DATA_ROOT` to its HealthData directory. TrainView reads `FitFiles/Activities/activity_<id>.json` summaries and `<id>_ACTIVITY.fit` routes. Monitoring tables use the SQLite database selected by `DATABASE_URL`; a fresh database contains no records. TrainView does not log in to Garmin or automatically synchronize your watch.

## Features

- Distance, training load, intensity, and heart-rate dashboards
- Sortable workout history and Mapbox GPS routes
- Optional streaming AI coaching
- Responsive interface with light and dark themes

## Data accuracy and privacy

Some readiness, HRV, resting-heart-rate, and sleep values currently use heuristic estimates rather than imported measurements. Race-plan content is a placeholder derived from activity history. These areas are scheduled for correction; do not treat them as measured health data or medical guidance.

Activity files and monitoring records stay local by default. Enabling AI coaching sends a training summary and your question to OpenAI. Maps contact Mapbox. Never publish real health exports, GPS tracks, databases, credentials, or session files. This version has no user authentication: use it locally, not as a public server with personal data.

## Development

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

See [configuration](docs/configuration.md), [architecture](docs/architecture.md), and [roadmap](docs/roadmap.md).
