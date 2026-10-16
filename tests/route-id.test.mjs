import test from 'node:test';
import assert from 'node:assert/strict';
import { isRouteId } from '../src/lib/route-id.ts';
test('route IDs reject path traversal, encodings and oversized names',()=>{
  for(const id of ['123','demo-01']) assert.equal(isRouteId(id),true);
  for(const id of ['../secret','%2e%2e','1/2','1\\2','', '1'.repeat(33),null]) assert.equal(isRouteId(id),false);
});
