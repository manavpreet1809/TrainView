# Running the demo as a release bundle

## Docker demo

With Docker running:

```sh
docker compose up --build --wait
```

Open http://localhost:3000. Compose binds the port to localhost, uses synthetic records, and supplies no personal exports or provider keys. Stop it with `docker compose down`. The image runs as a non-root user and exposes `/api/health` for its health check. The build context excludes local environment files, databases, FIT files, CSV datasets, and unrelated output.

For a public demonstration, use the demo image behind your hosting platform's HTTPS endpoint and keep TRAINVIEW_DEMO_MODE=true. No live coaching or Mapbox credentials are needed. 

## Standalone Node bundle

Build on the same operating system and architecture as the deployment target because Prisma uses native engines:

```sh
npm ci
npm run build
npm run package:standalone
```

The deployment directory is `.next/standalone`. Static files, public assets, and Prisma engines are included. Local `.env` files are removed from the generated bundle. Configure runtime environment variables through the hosting service. Start a demo with:

```sh
TRAINVIEW_DEMO_MODE=true HOSTNAME=127.0.0.1 PORT=3000 node .next/standalone/server.js
```

For personal exports, keep the service local and supply absolute GARMIN_DATA_ROOT and database paths. The standalone server runs from its deployment directory, so relative paths may differ from development. Do not initialize an existing monitoring database without a backup.

## Verification

```sh
npm run check
npm run build
npm run test:production
npm run test:standalone
```

The smoke runner checks pages, demo routes, chat input validation, private response headers, health status, and filtered CSV downloads. The standalone check catches missing runtime assets and native engines. CI additionally builds and starts the Docker demo on Linux.

`GET /api/health` returns `{ "status": "ok", "mode": "demo" }` or local mode when configuration is valid. Invalid configuration returns 503 with a generic error. This is liveness/configuration validation, not a guarantee that Garmin files, SQLite tables, Mapbox, or OpenAI are available. It never returns keys, filesystem paths, or records.

## Optional provider verification

CI exercises Chromium on desktop and mobile viewports, including navigation, filters, CSV export, dialogs, themes with denied storage, offline coaching, and client cancellation. Screenshots and failure traces are retained in the browser-release-report artifact. These checks do not certify every browser or accessibility requirement. Live OpenAI responses, Mapbox terrain/playback, and personal FIT exports require your own credentials and data. Personal-data and paid-coaching public hosting requires access controls and rate limiting before exposure. Keep screenshots and demo videos synthetic.

## Vercel public demo

Import `manavpreet1809/TrainView` into your Vercel account, choose Next.js, and deploy the main branch. The checked-in `vercel.json` supplies the build command and non-secret demo defaults; no API keys or database provisioning are required. Vercel's `VERCEL=1` environment flag forces synthetic mode even if TRAINVIEW_DEMO_MODE is changed to false. Real-data mode is for local or Docker use.

The public demo shows fictional workouts and routes, calendar charts, filtered CSV exports, and offline coaching. It does not connect to Garmin. Do not upload personal data or API keys to this demo project.

Verify the deployed URL by opening Dashboard, Workouts, AI Coach, and Data setup, and checking `/api/health` returns demo mode. Vercel provisioning and a verified live URL require access to the owner's Vercel account.
