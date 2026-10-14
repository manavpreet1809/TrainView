# Stage 2: demo data and onboarding

Delivered explicit synthetic-data mode, sixteen rolling-date workouts, thirty days of steps, one fictional GPS loop, offline demo coaching, setup status, a setup page, persistent source notices, environment guidance, targeted tests, and CI verification.

Personal exports and monitoring queries are bypassed in demo mode. Missing local data remains an empty state in real mode. Optional integration keys are reported only as configured or absent. No credentials or personal records are committed.

Verification passed: five targeted tests, lint, TypeScript, production build, and HTTP smoke checks for all four pages, fictional-route coordinates, unknown-route isolation, offline coaching, and invalid chat input. The demo server ran with nonexistent Garmin and database paths to verify personal-data isolation. Real Garmin exports and live external integrations remain unverified.
