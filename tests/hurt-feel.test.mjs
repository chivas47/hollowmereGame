// Roadmap 93b: getting hit says how much it took, the farmer reads red for a moment, and the low-health warning
// starts under a quarter of top health.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on } from '../src/core/events.js';
import { HURT } from '../src/data/animation.js';
import { hurtPlayer, lowHealth, tinted } from '../src/systems/health.js';
import '../src/systems/animation.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

test('a hurt says how much it took, and shows it as a red number', () => {
  freshFarm({ hp: 100, maxHp: 100 });
  G.paused = false; G.hurtT = 0; G.block = 0; G.dialog.you = null;
  placePlayer('farm', 6, 9, 'right');
  const seen = [];
  on('player:hurt', (e) => seen.push(e));
  G.fx.floats.length = 0;
  hurtPlayer(10, G.S.x + 10, G.S.y);
  assert.equal(seen.length, 1);
  assert.equal(seen[0].who, 'you');
  assert.equal(seen[0].n, 100 - G.S.hp, 'the number is what was lost after defense');
  assert.ok(G.fx.floats.some((f) => f.text === `-${seen[0].n}` && f.col === HURT.col));
});

test('the red tint runs at the start of the safe time only', () => {
  assert.ok(tinted(1));
  assert.ok(!tinted(1 - HURT.tint - 0.01));
  assert.ok(!tinted(0));
});

test('low health is under a quarter, and not at zero', () => {
  assert.ok(lowHealth(20, 100));
  assert.ok(!lowHealth(25, 100));
  assert.ok(!lowHealth(0, 100));
});
