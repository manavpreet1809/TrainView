import test from 'node:test';
import assert from 'node:assert/strict';
import { getDataConfig } from '../src/lib/data-config.ts';

test('demo mode is explicit and invalid values fail closed', () => {
  assert.equal(getDataConfig({}).demo, false);
  assert.equal(getDataConfig({ TRAINVIEW_DEMO_MODE: ' TRUE ' }).demo, true);
  assert.throws(() => getDataConfig({ TRAINVIEW_DEMO_MODE: 'yes' }), /true or false/);
});
test('blank paths and optional credentials have safe defaults', () => {
  const config = getDataConfig({ GARMIN_DATA_ROOT: ' ', OPENAI_API_KEY: ' ', NEXT_PUBLIC_MAPBOX_TOKEN: '' });
  assert.ok(config.root.endsWith('HealthData'));
  assert.equal(config.coach, false);
  assert.equal(config.maps, false);
});

test('Vercel always serves synthetic data, even with local mode requested', () => {
  assert.equal(getDataConfig({ VERCEL: '1', TRAINVIEW_DEMO_MODE: 'false' }).demo, true);
  assert.equal(getDataConfig({ VERCEL: '1' }).demo, true);
  assert.equal(getDataConfig({ VERCEL: '0', TRAINVIEW_DEMO_MODE: 'false' }).demo, false);
});

test('coaching status separates configured local mode from public demo mode', () => {
  assert.equal(getDataConfig({}).coachingMode, 'offline');
  assert.equal(getDataConfig({ OPENAI_API_KEY: 'test-key' }).coachingMode, 'live');
  assert.equal(getDataConfig({ OPENAI_API_KEY: 'test-key', VERCEL: '1' }).coachingMode, 'demo');
  assert.equal(getDataConfig({ OPENAI_API_KEY: 'test-key', TRAINVIEW_DEMO_MODE: 'true' }).coachingMode, 'demo');
  assert.equal(getDataConfig({ OPENAI_MODEL: '  ' }).coachingModel, 'gpt-4o-mini');
  assert.equal(getDataConfig({ OPENAI_MODEL: ' my-model ' }).coachingModel, 'my-model');
});
