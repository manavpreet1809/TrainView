# Demo and onboarding

Run `npm run dev:demo` and open http://localhost:3000/setup. No Garmin account or personal exports are needed. The mode is also available through `TRAINVIEW_DEMO_MODE=true` when building or starting the app. Restart after configuration changes.

Sixteen synthetic sessions cover two weeks; dates are rebased to the current local day. Thirty days of synthetic steps populate the monitoring card without database queries. One fictional loop near 0 latitude/longitude demonstrates the route API; a Mapbox token enables the interactive basemap, while a local SVG route preview works without it. The route is not a real workout location. Other sample sessions have no route.

Demo mode never falls through to personal data when a sample is missing. AI replies are offline even if an API key is configured. Maps may contact Mapbox. Imported mode does not silently substitute demo records when imports are missing.

The setup page reports activity-file counts and optional integration availability without revealing keys or absolute filesystem paths. It does not validate the complete database schema or verify credentials with remote services. The data notice remains visible on dashboard, workouts, chat, and setup pages.

To return to personal exports, set TRAINVIEW_DEMO_MODE=false, configure GARMIN_DATA_ROOT and DATABASE_URL, and restart. Never run db:setup against an imported monitoring database without a backup.

## Smoke verification

With a demo server running, run `npm run test:smoke`. Set TRAINVIEW_TEST_URL if it uses a port other than 3000. Checks cover all pages, the fictional route, unknown-route isolation, offline chat, and message validation.
