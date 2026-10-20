# Live coaching and maps

TrainView preserves the GarminFlow architecture: GarminDB exports supply activities, FIT files supply routes, Mapbox renders optional interactive maps, and OpenAI answers questions using recorded training summaries.

## Local setup

1. Copy `.env.example` to `.env`. Keep this file out of Git.
2. Set `TRAINVIEW_DEMO_MODE=false`.
3. Point `GARMIN_DATA_ROOT` at your GarminDB HealthData folder. If you have a monitoring database, configure its `DATABASE_URL`; back it up before schema changes.
4. Set `OPENAI_API_KEY` privately in the local environment. `OPENAI_MODEL` defaults to `gpt-4o-mini`; overrides must support Chat Completions, streaming, temperature, and max_completion_tokens.
5. Set `NEXT_PUBLIC_MAPBOX_TOKEN` to a browser-safe public Mapbox token restricted to the origins you use. Never put an OpenAI secret in a NEXT_PUBLIC variable.
6. Run `npm ci`, then `npm run dev`. For a new, empty local monitoring database only, run `npm run db:setup` before starting.
7. Open Data setup. It distinguishes configured integrations from verified provider responses.

No credentials are required for dashboard analytics, local route previews, CSV downloads, or the public sample-data demo. Provider keys are never committed or requested through chat.

## Verify your own integrations

- Open an activity with a matching FIT file. Confirm its route matches the exported location. With Mapbox enabled, verify the basemap, zoom controls, full view, flyover, pause, and reset. Loading or initialization failures fall back to the local route shape after at most 15 seconds.
- In AI Coach, confirm the page says live coaching is configured. Ask about a recorded workout and compare the answer with its details. Use Stop during a response and submit another question. Configuration does not guarantee an API key is valid.
- Temporarily remove the OpenAI key and restart. Verify offline summaries work. Remove the Mapbox token and restart to verify the route preview.
- Review your provider usage dashboards after testing. Live responses can be inaccurate and are not used to calculate dashboard metrics.

Each coaching request has a 30-second timeout and an 800 completion-token cap. These are per-request bounds, not an account spending cap. Set provider budgets for your own account.

## Automated evidence

CI checks request authentication headers, model selection, output-token bounds, fragmented UTF-8 streaming, provider rejection, interrupted streams, cancellation, and timeouts using injected fake responses. Existing browser tests cover client cancellation and local route retry. These checks make no paid provider requests and do not prove a real key, Mapbox basemap, or personal export works.

The Vercel demonstration continues to force synthetic data and offline coaching. Public personal accounts and paid public AI access require a separate authenticated design and persistent usage controls.

## Original project and remaining verification

The implemented integrations follow the original GarminFlow purpose. An exact file-by-file comparison with the original downloaded folder and validation of your personal Garmin exports remain unverified in this environment because local filesystem command execution is unavailable. Do not treat automated synthetic tests as proof of real-world data accuracy.
