// Roadmap 85a: loot tables. Every monster drops from its own table of rows, each rolled on its own; six monster
// materials (Stardew's bug meat, bat wing, bone fragment and essences by role) sell from the bin and sit in the
// Bag's Materials tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { MONSTERS } from '../src/data/weapons.js';
import { ITEMS } from '../src/data/items.js';
import { ITEM_KIND } from '../src/data/bag.js';
import { LOOT, LOOT_ITEMS, rollLoot, lootPerDefeat } from '../src/data/loot.js';
import { slimes, spawnSlimes, hitMonster } from '../src/systems/monsters.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

test('every monster has a loot table of real items with sane rows', () => {
  for (const k of Object.keys(MONSTERS)) {
    assert.ok(LOOT[k]?.length >= 2, `${k} has two or more rows`);
    for (const [item, chance, min, max] of LOOT[k]) {
      assert.ok(ITEMS[item], `${k}: ${item} is an item`);
      assert.ok(chance > 0 && chance <= 1, `${k}: ${item} chance`);
      assert.ok(min >= 1 && max >= min, `${k}: ${item} counts`);
    }
  }
  assert.deepEqual(Object.keys(LOOT).sort(), Object.keys(MONSTERS).sort(), 'no table for a monster that does not exist');
});

test('the six materials sell at the Stardew scale, ship from the bin and drop from some monster', () => {
  const want = { chitin: 8, leatherwing: 15, boneshard: 12, wispsilk: 40, sunmote: 40, gloommote: 50 };
  assert.deepEqual(Object.fromEntries(Object.entries(LOOT_ITEMS).map(([k, it]) => [k, it.sell])), want);
  for (const k of Object.keys(want)) {
    assert.equal(ITEMS[k].material, undefined, `${k} is sold, not kept`);
    assert.equal(ITEM_KIND[k], 'material', `${k} is in the Materials tab`);
    assert.ok(Object.values(LOOT).some((rows) => rows.some(([it]) => it === k)), `${k} drops somewhere`);
  }
});

test('each row rolls on its own; counts fall between min and max; the thief ring doubles them', () => {
  assert.deepEqual(rollLoot('skeleton', () => 0), { boneshard: 1, iron: 1 });
  assert.deepEqual(rollLoot('skeleton', () => 0.99), {});
  assert.deepEqual(rollLoot('skeleton', () => 0, 2), { boneshard: 2, iron: 2 });
  // the bone row hits (0.5 < 0.6) and rolls its top count; the iron row misses (0.5 >= 0.2)
  const rolls = [0.5, 0.99, 0.5];
  assert.deepEqual(rollLoot('skeleton', () => rolls.shift()), { boneshard: 2 });
  assert.deepEqual(rollLoot('nobody'), {});
});

test('slimes give more gel than before (0.6 a kill), and gel stays their main drop', () => {
  const per = lootPerDefeat('slime');
  assert.ok(per.gel > 0.6 && per.gel < 1.5);
  assert.ok(per.copper < per.gel);
});

test('defeating a monster puts its loot in the bag', () => {
  freshFarm();
  G.paused = false;
  placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1);
  const m = slimes[0];
  Object.assign(m, { kind: 'skeleton', floor: 1, hp: 5 });
  const real = Math.random;
  Math.random = () => 0;
  try { hitMonster(m, 100); } finally { Math.random = real; }
  assert.ok(!slimes.includes(m), 'it fell');
  assert.equal(G.S.bag.boneshard, 1);
  assert.equal(G.S.bag.iron, 1);
});
