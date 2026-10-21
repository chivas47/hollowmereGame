// Buying seeds and shipping: gold out at the stall, gold in overnight.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { buy, ship } from '../src/systems/economy.js';
import { addItem } from '../src/systems/quality.js';
import { freshFarm } from './setup.mjs';

test('seeds cost gold and only sell in their season', () => {
  freshFarm({ gold: 100, day: 1 });
  const before = G.S.seeds.turnip;
  assert.ok(buy('turnip', 2));
  assert.equal(G.S.gold, 50);
  assert.equal(G.S.seeds.turnip, before + 2);
  assert.ok(!buy('turnip', 3), 'not enough gold');
  assert.ok(!buy('melon', 1), 'melons are not sold in spring');
  assert.equal(G.S.gold, 50);
});

test('shipped goods pay out at the end of the day; ore and stone stay', () => {
  freshFarm({ gold: 0, earned: 0, bin: 0 });
  addItem('turnip', 2, 1);
  addItem('stone', 5);
  ship();
  assert.equal(G.S.bin, 100);
  assert.equal(G.S.bag.turnip, 0);
  assert.equal(G.S.bag.stone, 5);
  const report = {};
  emit('day:end', report);
  assert.equal(report.payout, 100);
  assert.equal(G.S.gold, 100);
  assert.equal(G.S.earned, 100);
  assert.equal(G.S.bin, 0);
});
