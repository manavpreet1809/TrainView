# TrainView release scope

1. Foundation: Next.js, TypeScript, Prisma schema, and shared UI.
2. Demo and setup: fictional activities, monitoring samples, configuration status, and local import instructions.
3. Data reliability: activity validation, duplicate detection, missing-value handling, and calendar reporting.
4. Dashboard and workouts: charts with data tables, search, sorting, type/date filters, details, and filtered CSV downloads.
5. Routes and coaching: FIT route parsing, Mapbox support with local route fallback and retry, offline demo coaching, streaming live coaching, cancellation, and timeouts.
6. Release: standalone and Docker packaging, health checks, patched framework dependencies, Vercel demo configuration, browser screenshots, and desktop/mobile workflow tests in CI.

The public demonstration uses synthetic data and offline coaching. Personal-data mode runs locally or in Docker. Public personal accounts, Garmin account synchronization, readiness/HRV/sleep imports, race-goal planning, and paid coaching hosting are outside this release.

Deployment remains pending until the owner connects Vercel and the live URL passes smoke verification. Live OpenAI, Mapbox, and personal FIT behavior require provider credentials and representative exports; automated demo checks do not certify these integrations.

Commit related implementation, tests, and documentation together. There is no commit quota.
