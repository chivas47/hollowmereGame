// v341 (roadmap 118c): a farm saved at 24 x 16 grows to its layout's big size on load, east and south only: everything
// saved keeps its tile, the ways out move to the new edges and the new land starts wild.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { MAPS } from '../src/data/maps.js';
import { BIG } from '../src/data/layouts.js';
import '../src/systems/layouts.js';
import '../src/systems/clearing.js';

const saved = (name) => JSON.parse(readFileSync(new URL(`saves/${name}.json`, import.meta.url)));
const OLD = (k) => { const [x, y] = k.split(',').map(Number); return x < 23 && y < 15; };
const load = (s) => { G.S = s; emit('game:loaded'); return G.S; };

for (const name of ['v15', 'v50', 'v90', 'v117']) {
  test(`a ${name} farm grows to ${BIG.w} x ${BIG.h} with everything where it was`, () => {
    const old = saved(name), s = merge(old);
    assert.equal(s.bigFarm, true);
    assert.deepEqual(s.grownFrom, { w: 24, h: 16 });
    const before = { soil: Object.keys(s.soil), placed: Object.keys(s.placed), debris: Object.keys(s.debris || {}) };
    load(s);
    assert.equal(MAPS.farm.grid.length, BIG.h); assert.equal(MAPS.farm.grid[0].length, BIG.w);
    assert.deepEqual(Object.keys(s.soil), before.soil);
    assert.deepEqual(Object.keys(s.placed), before.placed);
    for (const k of before.debris) if (s.debris[k] === undefined) assert.fail(`${k} lost`);
    assert.equal(s.grownFrom, null, 'the new land is cluttered once');
  });
}

test('the new land gets new-farm clutter and the old land none', () => {
  const s = merge(saved('v117')), had = new Set(Object.keys(s.debris || {}));
  load(s);
  const added = Object.keys(s.debris).filter((k) => !had.has(k));
  assert.ok(added.length >= 200, `${added.length} pieces of clutter`);
  assert.ok(added.every((k) => !OLD(k)), 'nothing new inside the old fences');
});

test('the ways out move to the new edges and the neighbouring maps set you down by them', () => {
  load(merge(saved('v90')));
  assert.ok(MAPS.farm.exits[`${BIG.w - 1},4`]); assert.equal(MAPS.farm.exits['23,4'], undefined);
  assert.equal(MAPS.wilds.exits['0,4'].x, BIG.w - 2);
  assert.equal(MAPS.farm.grid[4][23], 'P', 'the old road east is road on');
});

test('a big farm, or Wide acres, does not grow again', () => {
  const big = newState(); big.layout = 'river'; big.bigFarm = true; big.v = 10;
  assert.equal(merge(big).grownFrom, null);
  const wide = newState(); wide.layout = 'wide'; wide.v = 10; delete wide.bigFarm;
  const w = merge(wide); assert.equal(w.grownFrom, null); assert.equal(w.bigFarm, false);
});

test('a farm grown once loads the same again', () => {
  const s = load(merge(saved('v50')));
  const again = merge(JSON.parse(JSON.stringify(s)));
  assert.equal(again.grownFrom, null); assert.equal(again.bigFarm, true);
});
