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

// v236 (roadmap 82a): the bin's picker.
import { shipStacks, shipItems, shipAll, takeBack } from '../src/systems/economy.js';
import { merge, newState } from '../src/core/state.js';

test('the bin ships only what is picked, at its quality', () => {
  freshFarm({ gold: 0, bin: 0 });
  addItem('turnip', 3);       // plain 35g
  addItem('turnip', 2, 1);    // fine 43g
  const fine = shipStacks().find((s) => s.k === 'turnip' && s.t === 1);
  assert.equal(fine.n, 2);
  const r = shipItems([{ k: 'turnip', t: 1, n: 1 }]);
  assert.equal(r.count, 1);
  assert.equal(G.S.bin, fine.unit);
  assert.equal(G.S.bag.turnip, 4, 'three plain and one fine left');
  assert.deepEqual(G.S.qbag.turnip, [1, 0, 0]);
});

test('the bin never takes more than you carry, nor materials', () => {
  freshFarm({ gold: 0, bin: 0 });
  addItem('turnip', 1);
  addItem('stone', 5);
  assert.equal(shipItems([{ k: 'turnip', t: 0, n: 9 }, { k: 'stone', t: 0, n: 5 }, { k: 'turnip', t: 2, n: 1 }]).count, 1);
  assert.equal(G.S.bag.turnip, 0);
  assert.equal(G.S.bag.stone, 5);
  assert.ok(!shipStacks().some((s) => s.k === 'stone'));
});

test('Ship all keeps items pinned in the Bag', () => {
  freshFarm({ gold: 0, bin: 0 });
  G.S.bagFav = ['turnip'];
  addItem('turnip', 2);
  addItem('melon', 1);
  shipAll();
  assert.equal(G.S.bag.turnip, 2, 'pinned stays');
  assert.equal(G.S.bag.melon, 0);
  assert.equal(shipItems([{ k: 'turnip', t: 0, n: 2 }]).count, 2, 'a pinned item still ships when picked');
});

test('the last stack put in can come back until night, with its gold', () => {
  freshFarm({ gold: 0, earned: 0, bin: 0 });
  addItem('turnip', 2);
  addItem('melon', 1, 2);
  shipItems([{ k: 'turnip', t: 0, n: 2 }]);
  const before = G.S.bin;
  shipItems([{ k: 'melon', t: 2, n: 1 }]);
  assert.equal(G.S.binLast.k, 'melon');
  assert.ok(takeBack());
  assert.equal(G.S.bin, before);
  assert.equal(G.S.bag.melon, 1);
  assert.deepEqual(G.S.qbag.melon, [0, 1, 0], 'back at its quality');
  assert.ok(!takeBack(), 'only the last stack');
  shipItems([{ k: 'melon', t: 2, n: 1 }]);
  emit('day:end', {});
  assert.equal(G.S.binLast, null, 'paid out: final');
  assert.ok(!takeBack());
});

test('old saves load without a last stack; a broken one is dropped', () => {
  const old = { ...newState() }; delete old.binLast;
  assert.equal(merge(old).binLast, null);
  assert.equal(merge({ ...newState(), binLast: { k: 'nope', t: 0, n: 1, value: 5 } }).binLast, null);
  assert.deepEqual(merge({ ...newState(), binLast: { k: 'turnip', t: 1, n: 2, value: 86 } }).binLast, { k: 'turnip', t: 1, n: 2, value: 86 });
});
