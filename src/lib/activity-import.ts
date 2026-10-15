import fs from 'node:fs/promises';
import path from 'node:path';

export type ImportedActivity = {
  id: string; name: string; type: string; distanceKm: number; durationMinutes: number;
  trainingLoad: number; averageHeartRate?: number; maxHeartRate?: number; calories?: number;
  moderateMinutes: number; vigorousMinutes: number; startTime: Date; hrZones: number[];
  fitFile: string; hasPolyline: boolean;
};
export type ImportReport = {
  activities: ImportedActivity[]; scanned: number; skipped: number; duplicates: number;
  state: 'ready' | 'empty' | 'missing' | 'unavailable';
};
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
function number(value: unknown, required = false): number {
  if (value == null && !required) return 0;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('Invalid numeric metric');
  return value;
}
export function parseActivity(value: unknown, filename: string): ImportedActivity {
  const row = object(value);
  const id = String(row.activityId ?? filename.match(/^activity_(\d+)\.json$/i)?.[1] ?? '');
  if (!/^\d+$/.test(id)) throw new Error('Invalid activity identifier');
  let startTime: Date;
  if (typeof row.beginTimestamp === 'number' && Number.isFinite(row.beginTimestamp)) {
    startTime = new Date(row.beginTimestamp);
  } else if (typeof row.startTimeLocal === 'string' && /^\d{4}-\d\d-\d\d[ T]\d\d:\d\d:\d\d(?:\.\d+)?$/.test(row.startTimeLocal)) {
    const text = row.startTimeLocal.replace(' ', 'T');
    startTime = new Date(text);
    const expected = text.slice(0, 10);
    const actual = `${startTime.getFullYear()}-${String(startTime.getMonth()+1).padStart(2,'0')}-${String(startTime.getDate()).padStart(2,'0')}`;
    if (actual !== expected) throw new Error('Invalid local date');
  } else throw new Error('Missing valid activity date');
  if (!Number.isFinite(startTime.getTime()) || startTime.getTime() <= 0) throw new Error('Invalid activity date');
  const type = object(row.activityType).typeKey;
  const normalized = typeof type === 'string' && type.trim() ? type.trim().toLowerCase().replace(/[\s-]+/g, '_') : 'unknown';
  return {
    id, name: typeof row.activityName === 'string' && row.activityName.trim() ? row.activityName.trim() : normalized.replaceAll('_', ' '),
    type: normalized, startTime,
    distanceKm: number(row.distance, true) / 1000,
    durationMinutes: number(row.duration, true) / 60,
    trainingLoad: number(row.activityTrainingLoad),
    averageHeartRate: row.averageHR == null ? undefined : number(row.averageHR) || undefined,
    maxHeartRate: row.maxHR == null ? undefined : number(row.maxHR) || undefined,
    calories: row.calories == null ? undefined : number(row.calories),
    moderateMinutes: number(row.moderateIntensityMinutes), vigorousMinutes: number(row.vigorousIntensityMinutes),
    hrZones: [1,2,3,4,5].map(zone => number(row[`hrTimeInZone_${zone}`])),
    fitFile: '', hasPolyline: false,
  };
}
export async function readActivityImport(root: string): Promise<ImportReport> {
  const directory = path.join(root, 'FitFiles', 'Activities');
  const report: ImportReport = { activities: [], scanned: 0, skipped: 0, duplicates: 0, state: 'empty' };
  let files: string[];
  try { files = (await fs.readdir(directory)).filter(file => /^activity_\d+\.json$/i.test(file)).sort(); }
  catch (error) { report.state = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'missing' : 'unavailable'; return report; }
  const seen = new Set<string>();
  for (const file of files) {
    report.scanned++;
    try {
      const activity = parseActivity(JSON.parse(await fs.readFile(path.join(directory, file), 'utf8')), file);
      if (seen.has(activity.id)) { report.duplicates++; continue; }
      seen.add(activity.id);
      activity.fitFile = path.join(directory, `${activity.id}_ACTIVITY.fit`);
      try {
        const detail = object(JSON.parse(await fs.readFile(path.join(directory, `activity_details_${activity.id}.json`), 'utf8')));
        activity.hasPolyline = object(detail.metadataDTO).hasPolyline === true;
      } catch { /* Optional detail failure does not discard a valid summary. */ }
      report.activities.push(activity);
    } catch { report.skipped++; }
  }
  report.activities.sort((a,b) => b.startTime.getTime()-a.startTime.getTime());
  report.state = report.activities.length ? 'ready' : 'empty';
  return report;
}
