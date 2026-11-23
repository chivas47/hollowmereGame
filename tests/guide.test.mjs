// v308 (roadmap 100), v310 (roadmap 102): the guided first day. The field is one looping step: each moment it names
// the next real action (till, plant, water, refill), the tool to take, and points at a tile that action fits, for
// every seed, not only the first. Then the village, a hello and bed; farms from before the guide load with it off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { T } from '../src/core/constants.js';
import { MAPS } from '../src/data/maps.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { GUIDE, FARM } from '../src/data/guide.js';
import { advance, aimAt, guideOn, facts, farmAction, guideLine } from '../src/systems/guide.js';

function fresh() {
  const S = newState(); S.firstWeek.arrived = true; S.profile = { name: 'Test' };
  Object.assign(S, { map: 'farm', x: 3 * T + 8, y: 4 * T + 12, dir: 'down', slot: HOTBAR.indexOf('hoe'), seedSel: 'turnip' });
  G.S = S; return S;
}
const hold = (S, k) => { S.slot = HOTBAR.indexOf(k); };
const key = (a) => `${a.tx},${a.ty}`;
// What the line says the arrow is for must be true of the tile it points at.
function agrees(S) {
  const l = guideLine(S), a = l.aim, t = S.soil[key(a)], k = farmAction(S);
  if (k === 'till') assert.ok(!t, `till points at grass, not ${JSON.stringify(t)}`);
  if (k === 'plant') assert.ok(t && !t.crop, 'plant points at empty soil');
  if (k === 'water') assert.ok(t?.crop && !t.w, 'water points at a dry seed');
  return { l, a, k };
}
// Does the action at the tile the arrow shows, as the player would.
function doIt(S) {
  const { a, k } = agrees(S);
  hold(S, FARM[k].slot);
  if (k === 'till') S.soil[key(a)] = { w: false, crop: null };
  if (k === 'plant') { assert.ok(S.seeds[S.seedSel] > 0, 'never told to plant from an empty type'); S.soil[key(a)].crop = { type: S.seedSel, age: 0 }; S.seeds[S.seedSel]--; }
  if (k === 'swap') S.seedSel = Object.keys(S.seeds).find((x) => S.seeds[x] > 0);
  if (k === 'water') { S.soil[key(a)].w = true; S.water--; }
  if (k === 'refill') S.water = S.maxw;
  return k;
}

test('a new farm starts on the field, only after the opening', () => {
  const S = fresh();
  assert.equal(guideOn(S), true);
  assert.equal(advance(S, true).id, 'farm');
  S.firstWeek.arrived = false; assert.equal(guideOn(S), false, 'not during the opening');
});

test('the first round goes till, plant, water, one tile, asking for each tool in turn', () => {
  const S = fresh(), seen = [];
  for (let i = 0; i < 3; i++) {
    const k = farmAction(S); seen.push(k);
    hold(S, 'rod');
    assert.equal(guideLine(S).say, FARM[k].take, 'asks for the tool first'); assert.equal(guideLine(S).slot, FARM[k].slot);
    hold(S, FARM[k].slot);
    assert.equal(guideLine(S).say, FARM[k].say, 'then says what to do'); assert.equal(guideLine(S).use, true);
    doIt(S);
  }
  assert.deepEqual(seen, ['till', 'plant', 'water']);
});

test('it keeps rotating for every seed, and the arrow never points at land that does not fit the action', () => {
  const S = fresh(), seen = [];
  for (let i = 0; i < 40 && farmAction(S); i++) seen.push(doIt(S));
  const f = facts(S);
  assert.equal(f.seeds, 0); assert.equal(f.dry, 0); assert.equal(f.crops, 9, 'six turnips and three radishes');
  for (const k of ['till', 'plant', 'water']) assert.equal(seen.filter((x) => x === k).length, 9, `${k} nine times: ${seen}`);
  assert.equal(seen.filter((x) => x === 'swap').length, 1, 'told once to switch to the radishes when the turnips run out');
  assert.ok(seen.lastIndexOf('till') > 2 && seen.lastIndexOf('plant') > 3, 'tilling and planting come back after the first round');
  advance(S, true); assert.equal(GUIDE[S.firstWeek.guide.step].id, 'village');
});

test('after the first round, what you hold comes first; new rows grow beside the field', () => {
  const S = fresh();
  for (let i = 0; i < 3; i++) doIt(S);
  hold(S, 'hoe'); assert.equal(farmAction(S), 'till');
  const a = guideLine(S).aim, near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([x, y]) => S.soil[`${a.tx + x},${a.ty + y}`]);
  assert.ok(near, 'the next tile to till touches the field');
  hold(S, 'can'); assert.notEqual(farmAction(S), 'water', 'nothing dry: the can does not keep you watering');
});

test('an empty can sends you to the well', () => {
  const S = fresh();
  doIt(S); doIt(S); S.water = 0; hold(S, 'can');
  assert.equal(farmAction(S), 'refill');
  const a = guideLine(S).aim; assert.ok(['W', 'O'].includes(MAPS.farm.grid[a.ty][a.tx]), 'the arrow is on the well or the pond');
});

test('the rest of the day: the village, a hello, then bed; the guide ends on day two', () => {
  const S = fresh();
  for (const k of Object.keys(S.seeds)) S.seeds[k] = 0;
  advance(S, true); assert.equal(GUIDE[S.firstWeek.guide.step].id, 'village');
  assert.ok(aimAt('village', S), 'the arrow points at the way to the village');
  S.map = 'village'; advance(S, true); assert.equal(GUIDE[S.firstWeek.guide.step].id, 'hello');
  S.npcs[Object.keys(S.npcs)[0]].talked = 1; advance(S, true); assert.equal(GUIDE[S.firstWeek.guide.step].id, 'bed');
  S.map = 'farm'; assert.ok(aimAt('bed', S), 'the farmhouse door');
  S.day = 2; assert.equal(advance(S, true), null); assert.equal(S.firstWeek.guide.off, true); assert.equal(guideOn(S), false);
});

test('saves: before the guide it is off; mid-guide keeps its step; a v308 guide starts the new steps from the top', () => {
  const old = JSON.parse(JSON.stringify(newState())); old.firstWeek = { arrived: true, done: {}, over: false };
  assert.equal(merge(old).firstWeek.guide.off, true);
  const mid = JSON.parse(JSON.stringify(newState())); mid.firstWeek.arrived = true; mid.firstWeek.guide.step = 2;
  assert.equal(merge(mid).firstWeek.guide.step, 2);
  const v308 = JSON.parse(JSON.stringify(newState())); v308.firstWeek.arrived = true; v308.firstWeek.guide = { step: 6, off: false };
  assert.deepEqual(merge(v308).firstWeek.guide, { step: 0, off: false, v: 2 });
  const unseen = JSON.parse(JSON.stringify(newState())); unseen.firstWeek = { arrived: false, done: {}, over: false };
  assert.equal(merge(unseen).firstWeek.guide.off, false, 'a farm that has not seen the opening yet still gets the guide');
});
