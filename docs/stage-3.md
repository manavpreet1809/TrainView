# Stage 3: data reliability and accuracy

Each Garmin summary is parsed independently. Malformed JSON, invalid dates, unsafe IDs, nonnumeric or negative metrics are skipped without hiding valid workouts. Duplicate IDs use the first valid file in sorted filename order. Optional detail-file failures do not discard valid summaries. Setup and persistent notices report invalid and duplicate counts without exposing filenames or file contents.

Distance converts meters to kilometers; duration converts seconds to minutes. Pace rounding carries seconds correctly. Calendar grouping uses local date keys instead of UTC-truncated dates. Missing heart rate remains unavailable and comparisons require both periods. The seven-day workout total excludes future sessions. Missing optional load, intensity, and zone fields currently contribute zero; this limitation is documented.

Fabricated readiness, HRV, resting-heart-rate, sleep scores, and inferred race goals have been removed from analytics and coaching context. Daily load never falls back to intensity minutes. Chart and dashboard descriptions match their actual aggregation scopes. Coaching fallback reports service failure instead of inventing personalized advice.

Verification: eleven unit/integration tests, lint, strict TypeScript, production build, demo HTTP smoke checks, and imported-mode HTTP checks with mixed valid/corrupt/duplicate synthetic files. Real Garmin exports and live external services are not covered.

Commit policy: related implementation, tests, and documentation form one reviewable stage commit. No commit quota.
