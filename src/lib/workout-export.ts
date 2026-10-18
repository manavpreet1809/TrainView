import type { Workout } from '../types/garmin';

// Prevent spreadsheet formula interpretation while preserving CSV delimiters.
function cell(value: string | number | undefined) {
  let text = value === undefined ? '' : String(value);
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function workoutsToCsv(workouts: Workout[]) {
  const header = ['Activity ID','Date (ISO 8601)','Title','Type','Distance (km)','Duration (min)','Average pace','Average HR (bpm)','Training load','Calories'];
  const rows = workouts.map(row => [row.id,row.date,row.title,row.type,row.distanceKm,row.durationMinutes,row.averagePace,row.averageHeartRate,row.trainingLoad,row.calories]);
  return '\uFEFF' + [header, ...rows].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
