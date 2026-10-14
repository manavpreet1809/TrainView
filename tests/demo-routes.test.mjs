import test from 'node:test';
import assert from 'node:assert/strict';
import { getDemoCoordinates } from '../src/lib/demo/routes.ts';

test('fictional route is bounded, closed, and only available for its sample', () => {
  const points = getDemoCoordinates('demo-01');
  assert.equal(points.length, 81);
  assert.ok(points.every(([lat, lon, alt]) => Math.abs(lat) <= .011 && Math.abs(lon) <= .011 && Number.isFinite(alt)));
  assert.ok(Math.abs(points[0][0] - points.at(-1)[0]) < 1e-10);
  assert.deepEqual(getDemoCoordinates('123'), []);
});
