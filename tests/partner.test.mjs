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

test('they cannot fish yet, and their slot steps on its own', () => {
  join(); G.P2.slot = HOTBAR.indexOf('rod');
  partnerUse();
  assert.equal(G.fishing ?? null, null);
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
