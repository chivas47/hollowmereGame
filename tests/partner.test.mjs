// The second farmer: joining beside you, walking with your collision rules, following you onto a new map.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { placePlayer, blocked } from '../src/systems/world.js';
import { join, leave, partnerKeys, besideYou } from '../src/systems/partner.js';
import { freshFarm } from './setup.mjs';

beforeEach(() => { freshFarm(); G.P2 = null; G.keys = {}; });

test('they join on a free tile beside you, once, and can leave', () => {
  join();
  assert.ok(G.P2);
  assert.ok(!blocked(G.P2.x, G.P2.y));
  assert.ok(Math.abs(G.P2.x - G.S.x) + Math.abs(G.P2.y - G.S.y) <= 32);
  const first = G.P2; join(); assert.equal(G.P2, first);
  leave(); assert.equal(G.P2, null);
});

test('they walk with their own stick and stop when it lets go', () => {
  join();
  const x0 = G.P2.x, you = G.S.x;
  partnerKeys({ right: true }); runUpdaters(0.25);
  assert.ok(G.P2.x > x0); assert.equal(G.P2.dir, 'right'); assert.equal(G.S.x, you);
  partnerKeys({}); runUpdaters(0.1);
  assert.equal(G.P2.moving, false);
});

test('when you change map they are set down beside you there', () => {
  join();
  placePlayer('village', 10, 8, 'down'); emit('map:changed', 'village');
  assert.deepEqual({ x: G.P2.x, y: G.P2.y }, besideYou());
});

// v130: working together. Tools and doors need the systems that answer Use loaded, as in the game.
await import('../src/systems/farming.js');
await import('../src/systems/house.js');
const { partnerUse, partnerSlot } = await import('../src/systems/partner.js');
const { HOTBAR } = await import('../src/data/hotbar.js');
const { T } = await import('../src/core/constants.js');
const put = (who, tx, ty, dir) => Object.assign(who, { x: tx * T + 8, y: ty * T + 12, dir });

test('their hoe tills where they face and spends their energy, not yours', () => {
  join(); put(G.S, 2, 8, 'down'); put(G.P2, 10, 8, 'down');
  G.P2.slot = HOTBAR.indexOf('hoe');
  const mine = G.S.energy, theirs = G.S.partner.energy, me = { x: G.S.x, y: G.S.y, slot: G.S.slot };
  partnerUse();
  assert.ok(G.S.soil['10,9'], 'the tile in front of them is tilled');
  assert.equal(G.S.partner.energy, theirs - 2);
  assert.equal(G.S.energy, mine);
  assert.deepEqual({ x: G.S.x, y: G.S.y, slot: G.S.slot }, me);
  assert.ok(G.P2.anim, 'they swing the hoe');
});

test('their slot steps on its own', () => {
  join(); G.P2.slot = HOTBAR.indexOf('rod');
  const yours = G.S.slot; partnerSlot(1);
  assert.equal(G.P2.slot, (HOTBAR.indexOf('rod') + 1) % HOTBAR.length);
  assert.equal(G.S.slot, yours);
});

test('a door they open takes you both through', () => {
  join(); put(G.S, 12, 8, 'down'); put(G.P2, 3, 4, 'up');   // facing the farmhouse door
  partnerUse();
  assert.equal(G.S.map, 'house');
  assert.ok(Math.abs(G.P2.x - G.S.x) + Math.abs(G.P2.y - G.S.y) <= 32, 'you are beside them inside');
});

test('their energy is full again each morning', () => {
  G.S.partner.energy = 3; emit('day:start', {});
  assert.equal(G.S.partner.energy, G.S.maxEnergy);
});

// v131: their prompt, your bed and the night.
const { partnerPrompt } = await import('../src/systems/partner.js');
const { on } = await import('../src/core/events.js');
const { sleep } = await import('../src/systems/days.js');

test('their prompt names what their A does, over the tile they face', () => {
  assert.equal(partnerPrompt(), null);
  join(); put(G.P2, 3, 4, 'up');
  const p = partnerPrompt(), me = { x: G.S.x, y: G.S.y, dir: G.S.dir };
  assert.deepEqual([p.tx, p.ty], [3, 3]);
  assert.ok(p.text, 'the farmhouse door has a prompt');
  assert.deepEqual({ x: G.S.x, y: G.S.y, dir: G.S.dir }, me);
});

test('only your bed ends the day', () => {
  let asked = 0; on('ui:sleep', () => asked++);
  placePlayer('house', 2, 6, 'down'); join(); put(G.P2, 7, 5, 'up');   // facing the bed
  partnerUse();
  assert.equal(asked, 0);
  assert.equal(partnerPrompt().text, null);
});

test('after the night they wake beside you, and passing out tires them as it does you', () => {
  join(); G.S.partner.energy = 10;
  sleep(true);
  assert.equal(G.S.map, 'house');
  assert.ok(Math.abs(G.P2.x - G.S.x) + Math.abs(G.P2.y - G.S.y) <= 32);
  assert.equal(G.S.partner.energy, G.S.energy);
  assert.ok(G.S.energy < G.S.maxEnergy);
});

test('a farm with a bigger energy bar starts them at its top', async () => {
  const { merge } = await import('../src/core/state.js');
  assert.equal(merge({ day: 40, maxEnergy: 385 }).partner.energy, 385);
  assert.equal(merge({ day: 40, maxEnergy: 385, partner: { energy: 12 } }).partner.energy, 12);
});

// v134: they fish, one line at a time.
const { act } = await import('../src/systems/interact.js');
const { stepReel } = await import('../src/systems/fishing.js');
const castP2 = () => {   // you on the forest path, them facing the river
  placePlayer('forest', 10, 4, 'down'); join(); put(G.P2, 1, 7, 'down');
  G.P2.slot = HOTBAR.indexOf('rod'); G.P2.anim = null; G.fishing = null; G.lock = false;
  partnerUse();
};

test('their cast is their line: their energy, their pose, and you can still walk', () => {
  const mine = G.S.energy, theirs = G.S.partner.energy;
  castP2();
  assert.equal(G.fishing?.p2, true);
  assert.deepEqual([G.fishing.tx, G.fishing.ty], [1, 8]);
  assert.equal(G.S.partner.energy, theirs - 8);
  assert.equal(G.S.energy, mine);
  assert.equal(G.lock, false);
  assert.equal(G.P2.anim?.kind, 'rod');
  const x = G.P2.x; partnerKeys({ right: true }); runUpdaters(0.1);
  assert.equal(G.P2.x, x, 'their line holds them');
});

test('one line in the water at a time, and yours does not answer their bite', () => {
  castP2(); const line = G.fishing;
  put(G.S, 3, 7, 'down'); G.S.slot = HOTBAR.indexOf('rod');
  act();
  assert.equal(G.fishing, line, 'your cast is refused');
  Object.assign(line, { phase: 'bite', fish: 'carp', t: 1 });
  act();
  assert.equal(G.fishing.phase, 'bite', 'your Use leaves their bite alone');
});

test('their held A lifts their catch bar, not yours', () => {
  castP2(); Object.assign(G.fishing, { phase: 'bite', fish: 'carp', t: 1 });
  G.P2.anim = null; partnerUse();
  assert.equal(G.fishing.phase, 'reel');
  G.useHeld = true; G.P2.useHeld = false; G.fishing.prog = 0.5; stepReel(0.3);
  assert.equal(G.fishing.bar.y, 0, 'your Use does not lift it');
  G.useHeld = false; G.P2.useHeld = true; G.fishing.prog = 0.5; stepReel(0.3);
  assert.ok(G.fishing.bar.y > 0);
});

test('leaving brings their line in', () => {
  castP2(); leave();
  assert.equal(G.fishing, null);
});

// v135: the cast prompt.
const { promptFor } = await import('../src/core/registry.js');
const { tileAt } = await import('../src/systems/world.js');
test('the rod at water says it casts, and a bite on your line says hook it', () => {
  placePlayer('forest', 3, 7, 'down'); G.fishing = null;
  const ask = (item) => promptFor({ tx: 3, ty: 8, tile: tileAt(3, 8), mapId: 'forest', item });
  assert.equal(ask('rod'), 'Cast your line');
  assert.equal(ask('hoe'), null);
  castP2();
  assert.equal(ask('rod'), null, 'not while a line is out');
  G.fishing.phase = 'bite';
  assert.equal(ask('rod'), null, 'their bite is not yours to hook');
  assert.equal(partnerPrompt().text, 'Hook it');
});
