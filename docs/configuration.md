# Configuration

| Variable | Purpose |
| --- | --- |
| TRAINVIEW_DEMO_MODE | Set true for synthetic records and offline coaching. Vercel deployments always use synthetic mode. |
| DATABASE_URL | SQLite URL; use `file:./dev.db` for local development. |
| GARMIN_DATA_ROOT | Absolute HealthData directory; defaults to the project HealthData directory. |
| NEXT_PUBLIC_MAPBOX_TOKEN | Optional browser-visible Mapbox token. Restrict allowed origins in Mapbox. |
| OPENAI_API_KEY | Optional server-only key for coaching. Never prefix it with NEXT_PUBLIC_. |

Copy `.env.example` to `.env` before installation. After schema changes, run `npm run db:generate`. Use `npm run db:setup` only for a local development database. Back up existing imported databases before changing their schema. Restart the dev server after changing environment variables.
