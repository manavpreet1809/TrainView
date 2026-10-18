import test from 'node:test';
import assert from 'node:assert/strict';
import { workoutsToCsv } from '../src/lib/workout-export.ts';
const row={id:'1',date:'2026-10-18T12:00:00Z',title:'Run, "fast"',type:'running',distanceKm:5,durationMinutes:30};
test('CSV preserves quoted fields, Unicode and empty optional measurements',()=>{
 const csv=workoutsToCsv([{...row,title:row.title+' 🌍'}]);
 assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"Run, ""fast"" 🌍"'));
 assert.ok(csv.endsWith(',"","","",""\r\n'));
 assert.equal(workoutsToCsv([]).split('\r\n').length,2);
});
test('CSV neutralizes spreadsheet formulas including leading whitespace',()=>{
 for(const title of ['=1+1',' +SUM(A1)','@test','-1+1','\tformula']) {
   assert.ok(workoutsToCsv([{...row,title}]).includes(`"'${title}"`));
 }
});
