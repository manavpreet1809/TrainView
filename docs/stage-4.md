# Stage 4: dashboard and workout workflows

Workout search matches titles, types, locations, and tags. Type and inclusive local-date filters combine with stable sorting. Reversed ranges show an accessible error; clear filters restores the list. Result counts explicitly distinguish filtered rows from all-import summary cards. The query never mutates the input data.

The table scrolls horizontally, announces sorting, and gives each details button a specific session label. Workout dialogs scroll within the viewport, show distance, and explain unavailable split records. Navigation exposes the current page and collapsed link names. Inactive export and filter controls were removed.

Dashboard charts now reserve a bounded plotting area, explain empty datasets, and format calendar labels without UTC date shifts. Recent sessions have an explicit empty state. Workout cards accurately describe their all-import scope and do not call every activity a run or label a load threshold as workout quality.

Verification passed: 14 tests, lint, TypeScript, production build, HTTP smoke checks, and browser checks of search, type filtering, inclusive dates, invalid-range feedback, clearing filters, distance sorting, and session details. Browser verification caught a date-input update issue, corrected with input event handling. Small-screen layout rules were reviewed; comprehensive device and assistive-technology testing remains release work.

Maps and live coaching integrations remain the next stage. This change is committed with its tests and documentation as one coherent unit.
