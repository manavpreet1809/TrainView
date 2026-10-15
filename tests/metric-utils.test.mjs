import test from 'node:test';
import assert from 'node:assert/strict';
import { localDateKey, formatPace, mean } from '../src/lib/metric-utils.ts';
test('pace carries rounded seconds into the next minute', () => {
  assert.equal(formatPace(1,5.999), '6:00/km');
  assert.equal(formatPace(0,30),undefined);
  assert.equal(formatPace(5,0),undefined);
});
test('local date keys preserve the calendar date and missing HR is not zero', () => {
  assert.equal(localDateKey(new Date(2026,0,1,23,59)), '2026-01-01');
  assert.equal(mean([]),null); assert.equal(mean([0,NaN]),null);
  assert.equal(mean([120,0,140]),130);
});
