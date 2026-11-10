// v216 (roadmap 78a): the seed maker turns a crop the seed stall stocks into 1 to 3 of its seeds, sometimes with
// mixed seeds; the seeds go to the seed pouch. Learnt at Farming 9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { MACHINES, RECIPES, SEED_MAKER, seedStock, seedYield } from '../src/data/crafting.js';
import { CROPS } from '../src/data/crops.js';
import { loadMachine, collectMachine, accepted } from '../src/systems/artisan.js';
import { placeKey } from '../src/systems/world.js';
import { learnt } from '../src/systems/crafting.js';
import { freshFarm, withRolls } from './setup.mjs';

test('only crops the seed stall stocks go in', () => {
  for (const k of ['turnip', 'melon', 'corn', 'gleamfruit', 'frostkale']) assert.ok(seedStock(k) && MACHINES.seedmaker.accepts(k), k);
  for (const k of ['rubystalk', 'fiberseed', 'wildspring', 'mixed', 'leek', 'plum', 'egg']) assert.ok(!MACHINES.seedmaker.accepts(k), k);
  const stocked = Object.keys(CROPS).filter(seedStock);
  assert.ok(stocked.every((k) => !CROPS[k].shop && !CROPS[k].crafted && !CROPS[k].packet));
});

test('a crop makes 1 to 3 seeds, and mixed seeds only on a low roll', () => {
  assert.deepEqual(seedYield(0, 0.99), { seeds: SEED_MAKER.min, mixed: 0 });
  assert.deepEqual(seedYield(0.999, 0.99), { seeds: SEED_MAKER.max, mixed: 0 });
  assert.equal(seedYield(0.5, 0.0, 0).mixed, SEED_MAKER.mixedMin);
  assert.equal(seedYield(0.5, 0.0, 0.999).mixed, SEED_MAKER.mixedMax);
  for (let i = 0; i < 200; i++) { const y = seedYield(Math.random(), Math.random(), Math.random()); assert.ok(y.seeds >= 1 && y.seeds <= 3 && y.mixed >= 0 && y.mixed <= 5); }
});

test('the recipe is Stardew\'s and needs Farming 9', () => {
  assert.deepEqual(RECIPES.seedmaker.needs, { wood: 25, coal: 10, goldbar: 1 });
  assert.deepEqual(RECIPES.seedmaker.skill, ['farming', 9]);
  freshFarm();
  assert.ok(!learnt(RECIPES.seedmaker), 'not known on a new farm');
});

test('loading a crop and collecting puts seeds in the pouch, not the bag', () => {
  freshFarm({ map: 'farm' });
  G.S.placed[placeKey('farm', 5, 5)] = { kind: 'seedmaker' };
  G.S.bag.corn = 2; G.S.bag.rubystalk = 1;
  assert.deepEqual(accepted(5, 5), ['corn'], 'the ruby stalk is not offered');
  const corn = G.S.seeds.corn, mixed = G.S.seeds.mixed;
  assert.ok(withRolls([0.5, 0.05, 0.5], () => loadMachine(5, 5, 'corn')));   // 2 seeds, and 3 mixed
  assert.equal(G.S.bag.corn, 1);
  assert.equal(collectMachine(5, 5), 'seed:corn');
  assert.equal(G.S.seeds.corn, corn + 2);
  assert.equal(G.S.seeds.mixed, mixed + 3);
  assert.equal(G.S.bag['seed:corn'], undefined, 'nothing odd lands in the bag');
  assert.equal(G.S.placed[placeKey('farm', 5, 5)].item, null);
  assert.ok(!loadMachine(5, 5, 'rubystalk'));
});
