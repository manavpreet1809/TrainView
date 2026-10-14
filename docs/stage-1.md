# Stage 1: foundation

## Delivered

TrainView branding and package metadata; documented local configuration; optional integration keys; excluded private records and databases; Node version guidance; Prisma setup scripts; corrected chart, map, FIT decoder, and race-plan TypeScript definitions; local system fonts; error and not-found pages; GitHub Actions verification.

Dashboard, workouts, and chat pages render dynamically so exports added after a production build can be read on subsequent requests.

## Verification

- ESLint and TypeScript checks passed.
- Final production build passed, including dynamic dashboard, workouts, and chat routes.
- Empty local SQLite schema initialization passed.
- Personal Garmin exports and live OpenAI/Mapbox integrations were not tested.

## Remaining stages

Measured versus estimated metric corrections remain Stage 4. Demo data is Stage 2. No real health records, keys, or GPS tracks are included in this foundation.
