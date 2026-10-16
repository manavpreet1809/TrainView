import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRoute, routeDistanceKm } from '../src/lib/route-geometry.ts';
test('geometry rejects invalid positions, normalizes altitude and removes duplicates',()=>{
 assert.deepEqual(normalizeRoute([[0,0,NaN],[0,0,0],[91,0,0],[0,181,0],[NaN,0,0],[1,1,5]]),[[0,0,0],[1,1,5]]);
});
test('route sampling caps point count while retaining both endpoints',()=>{
 const points=Array.from({length:1499},(_,i)=>[i/100,1,0]); const result=normalizeRoute(points);
 assert.equal(result.length,750); assert.deepEqual(result[0],points[0]); assert.deepEqual(result.at(-1),points.at(-1));
});
test('distance uses geographic coordinates and handles empty tracks',()=>{
 assert.equal(routeDistanceKm([]),0); assert.ok(Math.abs(routeDistanceKm([[0,0,0],[0,1,0]])-111.195)<.01);
});
