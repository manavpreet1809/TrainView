export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function formatPace(distanceKm: number, durationMinutes: number) {
  if (!Number.isFinite(distanceKm) || !Number.isFinite(durationMinutes) || distanceKm <= 0 || durationMinutes <= 0) return undefined;
  const seconds = Math.round(durationMinutes / distanceKm * 60);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}/km`;
}
export function mean(values: number[]): number | null {
  const valid = values.filter(value => Number.isFinite(value) && value > 0);
  return valid.length ? valid.reduce((a,b) => a+b,0) / valid.length : null;
}
