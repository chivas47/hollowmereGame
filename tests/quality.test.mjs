// Item quality: tiers stored beside the bag total, Stardew's price multipliers and harvest odds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { addItem, counts, takeBest, unitValue, valueOf, rollCropQuality } from '../src/systems/quality.js';
import { freshFarm, withRolls } from './setup.mjs';

test('quality multiplies the sell price: 1, 1.25, 1.5 and 2', () => {
  assert.deepEqual([0, 1, 2, 3].map((t) => unitValue('turnip', t)), [40, 50, 60, 80]);
});

test('items keep their tier in the bag and the best is taken first', () => {
  freshFarm();
  addItem('turnip', 2);
  addItem('turnip', 1, 2);
  assert.deepEqual(counts('turnip'), [2, 0, 1, 0]);
  assert.equal(takeBest('turnip'), 2);
  assert.equal(takeBest('turnip'), 0);
  assert.equal(G.S.bag.turnip, 1);
});

test('items taken from the bag directly take plain ones first', () => {
  freshFarm();
  addItem('turnip', 1);
  addItem('turnip', 1, 3);
  G.S.bag.turnip = 1;   // a gift or a quest takes one without asking
  assert.deepEqual(counts('turnip'), [0, 0, 0, 1]);
  assert.equal(takeBest('turnip'), 3);
  assert.equal(takeBest('turnip'), -1);
});

test('shipping value adds every tier', () => {
  freshFarm();
  addItem('turnip', 1);
  addItem('turnip', 1, 3);
  assert.equal(valueOf('turnip'), 40 + 80);
});

test('harvest quality follows the farming level and soil booster', () => {
  // Level 0, no booster: prime under 0.01, fine under 0.02, no heirloom.
  assert.equal(withRolls([0.005], () => rollCropQuality(0)), 2);
  assert.equal(withRolls([0.015], () => rollCropQuality(0)), 1);
  assert.equal(withRolls([0.5], () => rollCropQuality(0)), 0);
  // Level 10 with the best booster: heirloom under 0.405, prime under 0.81.
  assert.equal(withRolls([0.3], () => rollCropQuality(10, 3)), 3);
  assert.equal(withRolls([0.6], () => rollCropQuality(10, 3)), 2);
  assert.equal(withRolls([0.9], () => rollCropQuality(10, 3)), 0);
});
