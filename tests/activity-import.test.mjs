import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseActivity, readActivityImport } from '../src/lib/activity-import.ts';
const sample = { activityId: 1, beginTimestamp: Date.UTC(2026,9,10,12), distance: 5000, duration: 1800, activityType: { typeKey: ' Trail-Running ' } };
test('imports normalize units and types without manufacturing optional HR', () => {
  const row = parseActivity(sample, 'activity_1.json');
  assert.equal(row.distanceKm, 5); assert.equal(row.durationMinutes, 30);
  assert.equal(row.type, 'trail_running'); assert.equal(row.averageHeartRate, undefined);
  assert.equal(row.trainingLoad, 0);
});
test('rejects missing dates, unsafe IDs, invalid metrics and calendar rollovers', () => {
  for (const patch of [{beginTimestamp:undefined}, {activityId:'../secret'}, {distance:-1}, {duration:'1800'}, {averageHR:Infinity}, {beginTimestamp:undefined,startTimeLocal:'2026-02-30 08:00:00'}]) {
    assert.throws(() => parseActivity({...sample,...patch}, 'activity_1.json'));
  }
});
test('corrupt files and optional details do not discard valid files; duplicates are deterministic', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'trainview-import-'));
  try {
    const dir = path.join(root,'FitFiles','Activities'); await fs.mkdir(dir,{recursive:true});
    await fs.writeFile(path.join(dir,'activity_1.json'),JSON.stringify(sample));
    await fs.writeFile(path.join(dir,'activity_2.json'),'{broken');
    await fs.writeFile(path.join(dir,'activity_3.json'),JSON.stringify({...sample,activityId:1}));
    await fs.writeFile(path.join(dir,'activity_4.json'),JSON.stringify({...sample,activityId:4,beginTimestamp:sample.beginTimestamp+1000}));
    await fs.writeFile(path.join(dir,'activity_details_1.json'),'{bad optional detail');
    const report = await readActivityImport(root);
    assert.equal(report.scanned,4); assert.equal(report.skipped,1); assert.equal(report.duplicates,1);
    assert.deepEqual(report.activities.map(row=>row.id),['4','1']);
    assert.equal(report.activities[1].hasPolyline,false); assert.equal(report.state,'ready');
  } finally { await fs.rm(root,{recursive:true,force:true}); }
});
test('missing and empty folders are distinguished', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'trainview-empty-'));
  try {
    assert.equal((await readActivityImport(root)).state,'missing');
    await fs.mkdir(path.join(root,'FitFiles','Activities'),{recursive:true});
    assert.equal((await readActivityImport(root)).state,'empty');
  } finally { await fs.rm(root,{recursive:true,force:true}); }
});
