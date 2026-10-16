import test from 'node:test';
import assert from 'node:assert/strict';
import { RouteCache } from '../src/lib/route-cache.ts';
test('cache invalidates changed files and evicts least-recently-used tracks',()=>{
 const cache=new RouteCache(2); cache.set('a','v1',1);cache.set('b','v1',2);
 assert.equal(cache.get('a','v1'),1);cache.set('c','v1',3); assert.equal(cache.get('b','v1'),undefined);
 assert.equal(cache.get('a','v2'),undefined); assert.equal(cache.get('c','v1'),3);
});
