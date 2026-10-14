import test from 'node:test';
import assert from 'node:assert/strict';
import fixtures from '../src/lib/demo/activities.json' with { type: 'json' };

test('synthetic activity identifiers are unique and metrics are valid', () => {
  assert.equal(fixtures.length, 16);
  assert.equal(new Set(fixtures.map(row => row.id)).size, fixtures.length);
  for (const row of fixtures) {
    assert.match(row.id, /^demo-/);
    assert.ok(row.distanceKm > 0 && row.durationMinutes > 0);
    assert.ok(row.maxHeartRate >= row.averageHeartRate);
    assert.ok(row.daysAgo >= 0 && row.daysAgo < 16);
  }
});
