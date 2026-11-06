// Saves: old saves must keep loading (PROJECT_INSTRUCTIONS rule 6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newState, merge, exportSave, importSave } from '../src/core/state.js';
import { SEED_SLOT, OLD_FIRST_SEED_SLOT } from '../src/data/hotbar.js';

test('a new farm survives a save and load unchanged', () => {
  const s = newState();
  assert.deepEqual(merge(JSON.parse(JSON.stringify(s))), s);
});

test('a bare old save gains every field a new farm has', () => {
  const s = merge({ day: 10, gold: 300 });
  for (const k of Object.keys(newState())) assert.ok(k in s, `missing ${k}`);
  assert.equal(s.day, 10);
  assert.equal(s.gold, 300);
});

test('unknown places, crops and slots fall back to safe defaults', () => {
  const s = merge({ day: 1, gold: 0, map: 'gone', seedSel: 'gone', slot: 99, layout: 'gone' });
  assert.equal(s.map, 'farm');
  assert.equal(s.seedSel, 'turnip');
  assert.equal(s.slot, 0);
  assert.equal(s.layout, 'open');
});

test('v8: a crop slot from before the seed slot becomes the seed slot', () => {
  const s = merge({ day: 5, gold: 0, slot: OLD_FIRST_SEED_SLOT + 2 });
  assert.equal(s.slot, SEED_SLOT);
  assert.equal(s.seedSel, 'melon');
});

test('v28: eggs saved outside the coop move into coop goods', () => {
  const s = merge({ day: 5, gold: 0, eggs: 3, coopGoods: { egg: 1 } });
  assert.equal(s.coopGoods.egg, 4);
  assert.equal(s.eggs, 0);
});

test('v32: a save from before earnings were counted uses the gold on hand', () => {
  assert.equal(merge({ day: 5, gold: 750 }).earned, 750);
});

test('v48: a farm already under way gets no welcome letter', () => {
  assert.ok(merge({ day: 4, gold: 0 }).mailRead.includes('welcome'));
  assert.ok(!merge({ day: 2, gold: 0, mailRead: [] }).mailRead.includes('welcome'));
});

test('a save file exports and imports back to the same farm', () => {
  const s = newState();
  s.gold = 1234;
  assert.deepEqual(importSave(exportSave(s)), merge(JSON.parse(JSON.stringify(s))));
});

test('importing rejects files that are not a farm, with a reason', () => {
  assert.throws(() => importSave('not json'), /not valid JSON/);
  assert.throws(() => importSave('{"game":"hollowmere-farm","S":{}}'), /does not contain a Hollowmere farm/);
});

test('v159: a farmer saved where the new village has a bench moves to the lane; one on open ground stays', () => {
  const at = (x, y) => ({ x: x * 16 + 8, y: y * 16 + 12 });
  const bench = merge({ day: 9, gold: 0, v: 3, map: 'village', ...at(5, 12) });   // the green's bench
  assert.deepEqual({ x: bench.x, y: bench.y }, at(10, 1));
  const open = merge({ day: 9, gold: 0, v: 3, map: 'village', ...at(12, 7) });    // by the fountain
  assert.deepEqual({ x: open.x, y: open.y }, at(12, 7));
  const town = merge({ day: 9, gold: 0, v: 3, map: 'town', ...at(11, 5) });       // the Anvil's old spot, a bench now
  assert.deepEqual({ x: town.x, y: town.y }, at(10, 22));
});
