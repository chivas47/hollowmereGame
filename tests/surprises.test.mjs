// v218 (roadmap 78c): overnight surprises. At most one a night, none bad: a crop fairy ripens a patch of growing
// crops, a meteorite lands, a stone owl turns up by the house, an odd stone figure appears in the field.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { SURPRISES, OWL_NEAR } from '../src/data/surprises.js';
import { DEBRIS } from '../src/data/clearing.js';
import { PLACEABLES } from '../src/data/crafting.js';
import { rollSurprise, HAPPEN, nightRandom } from '../src/systems/surprises.js';
import { isRipe } from '../src/systems/farming.js';
import { parsePlaceKey } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const start = () => { const S = freshFarm({ day: 3 }); emit('game:loaded'); return S; };
const rolls = (...r) => { let i = 0; return () => (i < r.length ? r[i++] : 0.99); };

test('the four surprises, rare, in Stardew\'s order, none bad', () => {
  assert.deepEqual(SURPRISES.map((s) => s.key), ['fairy', 'meteorite', 'owl', 'figure']);
  for (const s of SURPRISES) assert.ok(s.chance > 0 && s.chance <= 0.01, s.key);
  assert.ok(DEBRIS.meteorite && PLACEABLES.stoneowl.kind === 'decor' && PLACEABLES.oddfigure.kind === 'decor');
});

test('most nights nothing happens, and never more than one thing', () => {
  start();
  assert.equal(rollSurprise(rolls(0.5, 0.5, 0.5, 0.5)), null);
  const s = rollSurprise(rolls(0.9, 0.0, 0.0, 0.0));   // the fairy misses, then the meteorite lands; the rest are not rolled
  assert.equal(s.key, 'meteorite');
  assert.equal(Object.values(G.S.debris).filter((d) => d.kind === 'meteorite').length, 1);
  assert.equal(Object.values(G.S.placed).filter((p) => p.kind === 'stoneowl' || p.kind === 'oddfigure').length, 0);
});

test('the crop fairy ripens a patch of growing crops, and skips winter and empty fields', () => {
  start();
  assert.equal(HAPPEN.fairy(), null, 'nothing growing');
  for (const [x, y] of [[10, 10], [11, 10], [10, 11], [15, 15]]) G.S.soil[`${x},${y}`] = { w: false, crop: { type: 'turnip', age: 0 } };
  assert.deepEqual(rollSurprise(rolls(0, 0)), { key: 'fairy', crops: 3 });   // the fairy comes and picks the first growing tile, (10, 10)
  assert.ok(isRipe(G.S.soil['10,10'].crop) && isRipe(G.S.soil['11,10'].crop) && isRipe(G.S.soil['10,11'].crop));
  assert.ok(!isRipe(G.S.soil['15,15'].crop), 'a crop outside the patch is untouched');
  G.S.day = 3 + 28 * 3;   // winter
  G.S.soil['15,15'].crop.age = 0;
  assert.equal(HAPPEN.fairy(), null);
});

test('the owl sits in front of the house; the figure anywhere on free ground; both can be picked up', () => {
  start();
  const owl = HAPPEN.owl();
  assert.ok(owl && owl.x >= OWL_NEAR.x0 && owl.x <= OWL_NEAR.x1 && owl.y >= OWL_NEAR.y0 && owl.y <= OWL_NEAR.y1);
  assert.equal(G.S.placed[`${owl.x},${owl.y}`].kind, 'stoneowl');
  const fig = HAPPEN.figure();
  assert.equal(G.S.placed[`${fig.x},${fig.y}`].kind, 'oddfigure');
  assert.equal(G.S.kit.stoneowl, 0, 'it is on the farm, not in the kit');
  assert.ok(Object.keys(G.S.placed).every((k) => parsePlaceKey(k).map === 'farm'));
});

test('each night of a farm always rolls the same: reloading cannot change it', () => {
  start();
  const a = nightRandom(40), b = nightRandom(40), c = nightRandom(41);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()], seqC = [c(), c(), c()];
  assert.deepEqual(seqA, seqB);
  assert.notDeepEqual(seqA, seqC);
});
