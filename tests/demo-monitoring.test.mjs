import test from 'node:test';
import assert from 'node:assert/strict';
import { getDemoSteps } from '../src/lib/demo/monitoring.ts';

test('sample monitoring spans thirty unique days across a year boundary', () => {
  const rows = getDemoSteps(new Date(2026, 0, 2, 12));
  assert.equal(rows.length, 30);
  assert.equal(rows[0].day, '2026-01-02');
  assert.equal(rows[2].day, '2025-12-31');
  assert.equal(new Set(rows.map(row => row.day)).size, 30);
  assert.ok(rows.every(row => row.steps > 0));
});
