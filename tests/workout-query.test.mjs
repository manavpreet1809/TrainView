import test from 'node:test';
import assert from 'node:assert/strict';
import { queryWorkouts } from '../src/lib/workout-query.ts';
const rows = [
 {id:'a',date:new Date(2026,9,10,23,59).toISOString(),title:'Morning Hills',type:'running',location:'Park',tags:['tempo'],distanceKm:5,trainingLoad:100},
 {id:'b',date:new Date(2026,9,11,0,1).toISOString(),title:'Easy Ride',type:'cycling',tags:['recovery'],distanceKm:20},
 {id:'c',date:new Date(2026,9,12,12).toISOString(),title:'Evening Run',type:'running',tags:[],distanceKm:5,trainingLoad:80},
];
const defaults = {search:'',type:'',from:'',to:'',sort:'date',direction:'desc'};
const query = overrides => queryWorkouts(rows,{...defaults,...overrides});
test('search matches title location and tags without case or whitespace sensitivity',()=>{
 assert.deepEqual(query({search:' HILLS '}).map(x=>x.id),['a']);
 assert.deepEqual(query({search:'park'}).map(x=>x.id),['a']);
 assert.deepEqual(query({search:'RECOVERY'}).map(x=>x.id),['b']);
});
test('type and inclusive local-date filters combine',()=>{
 assert.deepEqual(query({type:'running',from:'2026-10-10',to:'2026-10-10'}).map(x=>x.id),['a']);
 assert.deepEqual(query({from:'2026-10-11',to:'2026-10-12'}).map(x=>x.id),['c','b']);
 assert.equal(query({from:'2026-10-12',to:'2026-10-10'}).length,0);
 assert.equal(query({search:'not found'}).length,0);
});
test('sort is stable, respects direction, handles missing load, and preserves input',()=>{
 assert.deepEqual(query({sort:'distanceKm',direction:'asc'}).map(x=>x.id),['a','c','b']);
 assert.deepEqual(query({sort:'trainingLoad',direction:'desc'}).map(x=>x.id),['a','c','b']);
 assert.deepEqual(rows.map(x=>x.id),['a','b','c']);
 assert.equal(queryWorkouts([],defaults).length,0);
});
