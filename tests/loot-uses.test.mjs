// Roadmap 85b: uses for monster loot. Recipes that had stand-ins for Stardew's monster materials take the real
// ones now (bait, wild bait, lightning rod, great bomb); bone meal grinds bone shards into soil boosters; the
// crawler steak is learnt at combat 1; the umbrite band is an ember ring and a glow ring in one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { RECIPES } from '../src/data/crafting.js';
import { DISHES } from '../src/data/cooking.js';
import { ITEMS } from '../src/data/items.js';
import { LOOT, LOOT_ITEMS } from '../src/data/loot.js';
import { MONSTERS } from '../src/data/weapons.js';
import { craft, learnt } from '../src/systems/crafting.js';
import { knows } from '../src/systems/cooking.js';
import { wearing } from '../src/systems/gear.js';
import { freshFarm } from './setup.mjs';

test('every recipe and dish needs real items', () => {
  for (const [k, rc] of Object.entries(RECIPES)) for (const it of Object.keys(rc.needs)) assert.ok(ITEMS[it], `${k} needs ${it}`);
  for (const [k, d] of Object.entries(DISHES)) for (const it of Object.keys(d.needs)) assert.ok(ITEMS[it], `${k} needs ${it}`);
});

test('the stand-ins are gone: Stardew\'s monster materials, refitted to ours', () => {
  assert.deepEqual(RECIPES.bait.needs, { chitin: 1 });                                 // 1 bug meat
  assert.deepEqual(RECIPES.wildbait.needs, { fiber: 10, gel: 5, chitin: 5 });          // 10 fiber, 5 slime, 5 bug meat
  assert.deepEqual(RECIPES.lightningrod.needs, { ironbar: 1, leatherwing: 5, stone: 10 });   // 5 bat wings
  assert.deepEqual(RECIPES.greatbomb.needs, { gold: 4, sunmote: 1, gloommote: 1 });    // 4 gold ore, solar and void essence
});

test('every monster material has a use, and each one the Hollow alone can supply', () => {
  const hollow = Object.keys(MONSTERS).filter((k) => !MONSTERS[k].cavernOnly && !MONSTERS[k].ventOnly);
  for (const it of Object.keys(LOOT_ITEMS)) {
    if (it === 'wispsilk') continue;   // its uses come with the lantern wisp (roadmap 85f)
    const used = Object.values(RECIPES).some((rc) => rc.needs[it]) || Object.values(DISHES).some((d) => d.needs[it]);
    assert.ok(used, `${it} has a use`);
    assert.ok(hollow.some((k) => LOOT[k].some(([x]) => x === it)), `${it} drops in the Hollow`);
  }
});

test('bone meal turns 5 bone shards into 5 soil boosters', () => {
  freshFarm();
  G.S.bag.boneshard = 12;
  const before = G.S.kit.booster || 0;
  assert.equal(craft('bonemeal', 2), 2);
  assert.equal(G.S.bag.boneshard, 2);
  assert.equal(G.S.kit.booster, before + 10);
  assert.equal(G.S.kit.bonemeal, undefined, 'no kit object of its own');
});

test('the umbrite band is learnt at combat 9 and counts as the ember and glow rings', () => {
  freshFarm();
  assert.equal(learnt(RECIPES.umbriteband), false);
  G.S.skills.combat = 1e6;
  assert.equal(learnt(RECIPES.umbriteband), true);
  Object.assign(G.S.bag, { umbritebar: 5, sunmote: 50, gloommote: 50 });
  assert.equal(craft('umbriteband'), 1);
  assert.equal(G.S.bag.umbriteband, 1);
  assert.ok(ITEMS.umbriteband.ring);
  G.S.rings = ['umbriteband'];
  assert.ok(wearing('umbriteband') && wearing('emberring') && wearing('glowring'));
  assert.ok(!wearing('tidering'));
});

test('the crawler steak is learnt the morning after combat level 1', () => {
  freshFarm();
  emit('day:start', {});
  assert.equal(knows('crawlersteak'), false);
  G.S.skills.combat = 50;   // level 1
  const report = {};
  emit('day:start', report);
  assert.equal(knows('crawlersteak'), true);
  assert.ok(report.recipes.some((r) => r.includes('Crawler steak')));
});
