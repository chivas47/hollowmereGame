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
