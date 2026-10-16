import assert from 'node:assert/strict';

const base = process.env.TRAINVIEW_TEST_URL || 'http://127.0.0.1:3000';
for (const route of ['/', '/workouts', '/chat', '/setup']) {
  const response = await fetch(new URL(route, base));
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.match(html, /Demo mode: all workouts/);
  assert.doesNotMatch(html, /readiness score of|Eight-day rolling average|NaN/);
  if (route === '/') assert.match(html, /no score is inferred/);
}
const route = await fetch(new URL('/api/workouts/demo-01/map', base));
assert.equal(route.status, 200);
assert.equal((await route.json()).coordinates.length, 81);
const missing = await fetch(new URL('/api/workouts/999999999/map', base));
assert.deepEqual((await missing.json()).coordinates, []);
const reply = await fetch(new URL('/api/chat', base), {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'What is my training load?' }),
});
assert.equal(reply.status, 200);
assert.match(await reply.text(), /Live AI coaching is disabled in demo mode/);
const invalid = await fetch(new URL('/api/chat', base), {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
});
assert.equal(invalid.status, 400);
console.log('Demo pages, route isolation, offline coaching, and validation passed.');

for (const value of [null, [], {message: 4}, {message: ' '}]) {
  const response = await fetch(new URL('/api/chat', base), {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(value)});
  assert.equal(response.status, 400);
}
const oversized = await fetch(new URL('/api/chat', base), {method: 'POST', body: JSON.stringify({message:'x'.repeat(4001)})});
assert.equal(oversized.status, 413);
const unsafe = await fetch(new URL('/api/workouts/not-an-id/map', base));
assert.equal(unsafe.status, 400);
assert.match(route.headers.get('cache-control'), /no-store/);
console.log('Invalid chat shapes, oversized messages, route validation and private cache headers passed.');
