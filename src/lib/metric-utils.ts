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

type SeriesActivity = {
  startTime: Date; distanceKm: number; trainingLoad: number;
  moderateMinutes: number; vigorousMinutes: number; averageHeartRate?: number;
};
function calendarDay(date: Date, offset = 0) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + offset);
  return result;
}
function monday(date: Date) {
  const result = calendarDay(date);
  result.setDate(result.getDate() - (result.getDay() + 6) % 7);
  return result;
}

// Always retain calendar gaps; zero means no recorded load, not verified rest.
export function buildTrainingSeries(activities: SeriesActivity[], now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid reporting date');
  const weeks = new Map<string, {week: string; distanceKm: number; longRunKm: number; trainingLoad: number; activityCount: number}>();
  const days = new Map<string, {date: string; acuteLoad: number; moderateMinutes: number; vigorousMinutes: number; heartRates: number[]; activityCount: number}>();
  const currentMonday = monday(now);
  for (let offset = -7; offset <= 0; offset++) {
    const week = localDateKey(calendarDay(currentMonday, offset * 7));
    weeks.set(week, {week, distanceKm: 0, longRunKm: 0, trainingLoad: 0, activityCount: 0});
  }
  for (let offset = -13; offset <= 0; offset++) {
    const date = localDateKey(calendarDay(now, offset));
    days.set(date, {date, acuteLoad: 0, moderateMinutes: 0, vigorousMinutes: 0, heartRates: [], activityCount: 0});
  }
  for (const activity of activities) {
    const time = activity.startTime.getTime();
    if (!Number.isFinite(time) || time > now.getTime()) continue;
    const week = weeks.get(localDateKey(monday(activity.startTime)));
    if (week) {
      week.distanceKm += activity.distanceKm;
      week.longRunKm = Math.max(week.longRunKm, activity.distanceKm);
      week.trainingLoad += activity.trainingLoad;
      week.activityCount++;
    }
    const day = days.get(localDateKey(activity.startTime));
    if (day) {
      day.acuteLoad += activity.trainingLoad;
      day.moderateMinutes += activity.moderateMinutes;
      day.vigorousMinutes += activity.vigorousMinutes;
      if (activity.averageHeartRate !== undefined) day.heartRates.push(activity.averageHeartRate);
      day.activityCount++;
    }
  }
  return {
    weeks: [...weeks.values()].map(week => ({
      ...week, distanceKm: Number(week.distanceKm.toFixed(1)),
      longRunKm: Number(week.longRunKm.toFixed(1)), trainingLoad: Math.round(week.trainingLoad),
    })),
    days: [...days.values()].map(({heartRates, ...day}) => {
      const average = mean(heartRates);
      return {...day, acuteLoad: Math.round(day.acuteLoad),
        moderateMinutes: Math.round(day.moderateMinutes), vigorousMinutes: Math.round(day.vigorousMinutes),
        avgHeartRate: average === null ? null : Math.round(average)};
    }),
  };
}

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00');
  return Number.isFinite(date.getTime()) && localDateKey(date) === value;
}
