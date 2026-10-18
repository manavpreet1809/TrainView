# Running the demo as a release bundle

## Docker demo

With Docker running:

```sh
docker compose up --build --wait
```

Open http://localhost:3000. Compose binds the port to localhost, uses synthetic records, and supplies no personal exports or provider keys. Stop it with `docker compose down`. The image runs as a non-root user and exposes `/api/health` for its health check. The build context excludes local environment files, databases, FIT files, CSV datasets, and unrelated output.

For a public demonstration, use the demo image behind your hosting platform's HTTPS endpoint and keep TRAINVIEW_DEMO_MODE=true. No live coaching or Mapbox credentials are needed. No public hosting has been provisioned by this change.

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

## Remaining release checks

Live OpenAI responses, Mapbox terrain/playback, real FIT exports, proxy cancellation behavior, and broader device/accessibility checks still need validation. Personal-data and paid-coaching public hosting requires access controls and rate limiting before exposure. Keep screenshots and demo videos synthetic.
