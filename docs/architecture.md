# Architecture

Next.js App Router serves React dashboard, workouts, and chat pages. Server-side loaders in `src/lib/garmin-data.ts` read GarminDB JSON summaries, decode FIT routes, and aggregate metrics. Prisma reads SQLite monitoring tables. Client components render Recharts charts and Mapbox routes.

`POST /api/chat` builds a training summary and streams an OpenAI response; missing keys and upstream failures return fallback guidance. `GET /api/workouts/[id]/map` supplies route coordinates. No account system or background ingestion worker exists.

Keep filesystem access, database queries, and private keys in server modules. Mapbox tokens are intentionally browser-visible. Do not expose this app with personal records until access controls are implemented.
