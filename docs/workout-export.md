# Exporting workouts

In Workouts, choose search text, activity type, inclusive local dates, and a sort order. Select **Export filtered CSV** to download those matching records in that order. An empty result disables the button. Cards continue to describe all imported activities.

The CSV includes ID, ISO date/time, title, type, kilometers, minutes, pace, average heart rate, recorded training load, and calories. Unavailable optional values are blank. Missing import load values currently contribute zero, as documented for dashboard totals. GPS points and private filesystem paths are excluded.

CSV fields are quoted, embedded quotes escaped, and Unicode preserved with a UTF-8 byte-order mark. Formula-like text is prefixed with an apostrophe to prevent accidental spreadsheet execution; this may be visible in plain-text editors. The endpoint validates filter parameters and returns an attachment with no-store headers.

The file is generated on demand by your running TrainView instance. It is not uploaded to a cloud service by the export action. Keep exported personal workout files private. Synthetic demo exports are suitable for portfolio examples.
