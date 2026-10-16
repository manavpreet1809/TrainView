import type { Workout } from '../types/garmin';

export type SortKey = 'date' | 'type' | 'distanceKm' | 'trainingLoad';
export type WorkoutQuery = {
  search: string; type: string; from: string; to: string;
  sort: SortKey; direction: 'asc' | 'desc';
};
export function queryWorkouts(workouts: Workout[], query: WorkoutQuery) {
  const search = query.search.trim().toLowerCase();
  if (query.from && query.to && query.from > query.to) return [];
  return workouts.filter(workout => {
    const date = new Date(workout.date);
    const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const text = [workout.title, workout.type, workout.location ?? '', ...workout.tags].join(' ').toLowerCase();
    return (!search || text.includes(search)) && (!query.type || workout.type === query.type)
      && (!query.from || day >= query.from) && (!query.to || day <= query.to);
  }).sort((a,b) => {
    const value = (row: Workout): number | string => query.sort === 'date' ? new Date(row.date).getTime() : query.sort === 'type' ? row.type : row[query.sort] ?? 0;
    const left = value(a), right = value(b);
    const result = typeof left === 'number' && typeof right === 'number' ? left-right : String(left).localeCompare(String(right));
    return (query.direction === 'asc' ? result : -result) || a.id.localeCompare(b.id);
  });
}
