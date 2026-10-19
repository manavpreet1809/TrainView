# Calendar reporting and chart accessibility

Weekly charts now show eight Monday-based calendar weeks, including the current partial week. Daily load/heart-rate and intensity charts show the fourteen local calendar dates ending today. Missing periods retain their position instead of being compressed out of the timeline. Future and invalid dates are excluded. When no activities have been imported, the existing empty state remains.

Zero recorded load or minutes means there are no contributing records; it is not confirmation that the person rested. Missing heart rate remains unavailable. Daily heart rate is the arithmetic mean of positive recorded session averages, not a time-weighted or resting measurement. The daily table includes activity counts so a gap can be distinguished from recorded sessions with missing measurements.

Each chart includes an expandable table with labeled columns, explicit unavailable values, and keyboard-accessible horizontal scrolling. Dates include the full calendar date in tables; the intensity chart therefore remains understandable when weekday labels repeat.

Export filter dates are checked against actual calendar dates, rejecting rollover dates such as February 30. Tests cover empty periods, multiple sessions, future records, invalid reporting dates, year boundaries, leap days, and daylight-saving transitions in America/Edmonton.

The prior deployment commit passed GitHub CI, including the Linux Docker build and container health checks. This calendar-reporting change is verified through branch CI because the local command runner was unavailable. Live provider and real-export validation, public hosting, and final media remain release work.
