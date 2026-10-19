import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrainingSeries, isCalendarDate } from '../src/lib/metric-utils.ts';
const record = (date, overrides = {}) => ({
  startTime: date, distanceKm: 5, trainingLoad: 50,
  moderateMinutes: 20, vigorousMinutes: 5, ...overrides,
});
test('calendar windows preserve empty days and weeks instead of compressing history', () => {
  const now = new Date(2026, 9, 19, 12);
  const series = buildTrainingSeries([record(new Date(2026, 9, 17, 8))], now);
  assert.equal(series.weeks.length, 8);
  assert.equal(series.days.length, 14);
  assert.equal(series.days[0].date, '2026-10-06');
  assert.equal(series.days.at(-1).date, '2026-10-19');
  assert.equal(series.weeks.at(-1).week, '2026-10-19');
  assert.equal(series.weeks.at(-1).distanceKm, 0);
  assert.equal(series.weeks.at(-2).distanceKm, 5);
  assert.equal(series.days.at(-1).avgHeartRate, null);
  assert.equal(series.days.at(-1).activityCount, 0);
});
test('aggregation excludes future, invalid, and out-of-window records', () => {
  const now = new Date(2026, 9, 19, 12);
  const input = [record(new Date(2026,9,19,13)), record(new Date(2020,0,1)), record(new Date(NaN))];
  const series = buildTrainingSeries(input, now);
  assert.equal(series.weeks.reduce((sum, row) => sum + row.distanceKm, 0), 0);
  assert.equal(series.days.reduce((sum, row) => sum + row.acuteLoad, 0), 0);
});
test('same-day totals preserve units and missing HR stays unavailable', () => {
  const now = new Date(2026,0,2,12);
  const series = buildTrainingSeries([
    record(new Date(2026,0,2,8), {averageHeartRate: 120}),
    record(new Date(2026,0,2,9), {averageHeartRate: 140}),
    record(new Date(2026,0,2,10)),
  ], now);
  const day = series.days.at(-1);
  assert.equal(day.acuteLoad, 150);
  assert.equal(day.moderateMinutes, 60);
  assert.equal(day.vigorousMinutes, 15);
  assert.equal(day.avgHeartRate, 130);
  assert.equal(day.activityCount, 3);
  assert.equal(series.days[0].date, '2025-12-20');
});
test('reporting does not mutate records or the reporting date', () => {
  const now = new Date(2026,9,19,12), date = new Date(2026,9,19,8);
  const timestamps = [now.getTime(), date.getTime()];
  buildTrainingSeries([record(date)], now);
  assert.deepEqual([now.getTime(),date.getTime()], timestamps);
  assert.throws(() => buildTrainingSeries([],new Date(NaN)), /Invalid reporting date/);
});
test('calendar dates reject rollover dates and accept real leap days', () => {
  assert.equal(isCalendarDate('2024-02-29'), true);
  for (const value of ['2026-02-29','2026-02-30','2026-13-01','2026-1-01','not a date']) {
    assert.equal(isCalendarDate(value), false);
  }
});
test('local calendar windows cross daylight-saving changes without duplicate dates', () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = 'America/Edmonton';
    for (const now of [new Date(2026,2,10,12),new Date(2026,10,3,12)]) {
      const series = buildTrainingSeries([],now);
      assert.equal(series.days.length,14);
      assert.equal(new Set(series.days.map(row=>row.date)).size,14);
      assert.ok(series.days.every(row=>row.avgHeartRate===null));
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
