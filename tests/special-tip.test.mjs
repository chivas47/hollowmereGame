// Roadmap 94c (Nuno, from polish find 47): the weapon special's tip shows on the mine floor only until the special has
// been used once; that is saved, and old saves start without it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { newState, merge } from '../src/core/state.js';
import { special, specialTip, resetSpecials } from '../src/systems/specials.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const SLOT = HOTBAR.indexOf('sword');

test('the tip waits for the weapon in hand in the mine, and stops once the special is used', () => {
  freshFarm({ weapon: 'oldblade', slot: 0 });
  G.paused = false; G.dialog = { you: false, p2: false }; G.P2 = null;
  resetSpecials();
  placePlayer('farm', 8, 8, 'right');
  G.S.slot = SLOT;
  assert.equal(specialTip(), false, 'not on the farm');
  G.S.map = 'mine';
  assert.equal(specialTip(), true);
  G.S.map = 'farm';
  assert.equal(special(), true);
  assert.equal(G.S.specialUsed, true);
  G.S.map = 'mine';
  assert.equal(specialTip(), false, 'used once: quiet for good');
});

test('specialUsed is saved, and old saves start without it', () => {
  const old = newState(); delete old.specialUsed;
  assert.equal(merge(JSON.parse(JSON.stringify(old))).specialUsed, false);
  assert.equal(merge(JSON.parse(JSON.stringify({ ...newState(), specialUsed: true }))).specialUsed, true);
});
