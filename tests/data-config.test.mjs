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
