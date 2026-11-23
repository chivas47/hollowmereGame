// v308 (roadmap 100): the guided first day. Steps move on by themselves as the farmer does each thing, never back;
// the arrow finds grass, soil and dry seeds near you; farms from before the guide load with it off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { T } from '../src/core/constants.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { GUIDE } from '../src/data/guide.js';
import { advance, aimAt, guideOn, facts } from '../src/systems/guide.js';

function fresh() {
  const S = newState(); S.firstWeek.arrived = true; S.profile = { name: 'Test' };
  Object.assign(S, { map: 'farm', x: 3 * T + 8, y: 4 * T + 12, dir: 'down' });
  G.S = S; return S;
}
const step = (S) => GUIDE[S.firstWeek.guide.step]?.id;

test('a new farm starts by tilling (the hoe is in hand), or by taking the hoe; only after the opening', () => {
  const S = fresh();
  assert.equal(guideOn(S), true);
  assert.equal(advance(fresh(), true).id, 'till');
  S.slot = HOTBAR.indexOf('rod'); assert.equal(advance(S, true).id, 'hoe');
  S.firstWeek.arrived = false; assert.equal(guideOn(S), false, 'not during the opening');
});

test('each step moves on as it is done, and picking another tool never goes back', () => {
  const S = fresh();
  S.slot = HOTBAR.indexOf('hoe'); advance(S, true); assert.equal(step(S), 'till');
  S.slot = HOTBAR.indexOf('can'); advance(S, true); assert.equal(step(S), 'till', 'still tilling');
  const g = aimAt('grass', S); assert.ok(g, 'an arrow on grass');
  S.soil[`${g.tx},${g.ty}`] = { w: false, crop: null }; advance(S, true); assert.equal(step(S), 'seeds');
  assert.deepEqual(aimAt('soil', S), g, 'the arrow moves to the tilled soil');
  S.slot = HOTBAR.indexOf('seeds'); advance(S, true); assert.equal(step(S), 'plant');
  S.soil[`${g.tx},${g.ty}`].crop = { type: 'turnip', age: 0 }; advance(S, true); assert.equal(step(S), 'can');
  assert.deepEqual(aimAt('dry', S), g);
  S.slot = HOTBAR.indexOf('can'); advance(S, true); assert.equal(step(S), 'water');
  S.soil[`${g.tx},${g.ty}`].w = true; advance(S, true); assert.equal(step(S), 'rest');
  S.slot = HOTBAR.indexOf('hoe'); advance(S, true); assert.equal(step(S), 'rest', 'never back to an earlier step');
});

test('the rest of the day: the village, a hello, then bed; the guide ends on day two', () => {
  const S = fresh();
  for (const k of Object.keys(S.seeds)) S.seeds[k] = 0;
  S.soil['20,10'] = { w: true, crop: { type: 'turnip', age: 0 } };
  advance(S, true); assert.equal(step(S), 'village');
  assert.ok(aimAt('village', S), 'the arrow points at the way to the village');
  S.map = 'village'; advance(S, true); assert.equal(step(S), 'hello');
  S.npcs[Object.keys(S.npcs)[0]].talked = 1; advance(S, true); assert.equal(step(S), 'bed');
  S.map = 'farm'; assert.ok(aimAt('bed', S), 'the farmhouse door');
  S.day = 2; assert.equal(advance(S, true), null); assert.equal(S.firstWeek.guide.off, true); assert.equal(guideOn(S), false);
});

test('a farm saved before the guide loads with it off; a new one mid-guide keeps its step', () => {
  const old = JSON.parse(JSON.stringify(newState())); old.firstWeek = { arrived: true, done: {}, over: false };
  assert.equal(merge(old).firstWeek.guide.off, true);
  const mid = JSON.parse(JSON.stringify(newState())); mid.firstWeek.arrived = true; mid.firstWeek.guide = { step: 3, off: false };
  assert.deepEqual(merge(mid).firstWeek.guide, { step: 3, off: false });
  const unseen = JSON.parse(JSON.stringify(newState())); unseen.firstWeek = { arrived: false, done: {}, over: false };
  assert.equal(merge(unseen).firstWeek.guide.off, false, 'a farm that has not seen the opening yet still gets the guide');
});

test('facts count seeds, crops and watered crops', () => {
  const S = fresh();
  S.soil['1,1'] = { w: true, crop: { type: 'turnip' } }; S.soil['2,1'] = { w: false, crop: null };
  const f = facts(S); assert.equal(f.tilled, 2); assert.equal(f.crops, 1); assert.equal(f.wet, 1);
});
