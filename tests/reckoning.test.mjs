// Bram's reckoning: Stardew's 21 points, the lamps, the morning he judges, the carved lid and asking again.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { merge } from '../src/core/state.js';
import { RECKONING, RECKON_POINTS } from '../src/data/reckoning.js';
import { score, askAgain } from '../src/systems/reckoning.js';
import { freshFarm } from './setup.mjs';

beforeEach(() => freshFarm());

test('the points add up to Stardew\'s 21', () => {
  assert.equal(RECKON_POINTS.reduce((a, p) => a + p.points, 0), 21);
});

test('a new farm scores nothing and lights one lamp', () => {
  assert.deepEqual([score().points, score().lamps], [0, 1]);
});

test('lamps follow the points: 4 for two, 8 for three, 12 for four', () => {
  G.S.earned = 1000000;   // seven points
  assert.deepEqual([score().points, score().lamps], [7, 2]);
  Object.assign(G.S, { cavernOpen: true, boatFixed: true }); G.S.restore.done = true;   // +2 access, +3 the old wing restored by hand
  assert.deepEqual([score().points, score().lamps], [12, 4]);
  G.S.restore.rival = true;   // bought by Ashgrove: the 2 points for restoring it by hand are lost
  assert.deepEqual([score().points, score().lamps], [10, 3]);
});

test('Bram judges on Spring 1 of year three, not before', () => {
  G.S.day = RECKONING.day - 1; emit('day:start', {});
  assert.equal(G.S.reckoning.done, 0);
  G.S.day = RECKONING.day; emit('day:start', {});
  assert.equal(G.S.reckoning.done, RECKONING.day);
  assert.equal(G.S.reckoning.pending, true);
});

test('four lamps carve the bin lid: a gleamfruit every morning', () => {
  Object.assign(G.S, { day: RECKONING.day, earned: 1000000, cavernOpen: true, boatFixed: true }); G.S.restore.done = true;
  emit('day:start', {});
  assert.equal(G.S.reckoning.lid, true);
  assert.equal(G.S.bag.gleamfruit, 1);
  G.S.day++; emit('day:start', {});
  assert.equal(G.S.bag.gleamfruit, 2);
});

test('a starstone for Bram asks him to look again the next morning', () => {
  G.S.bag.starstone = 1;
  assert.equal(askAgain('bram', 'starstone'), null);   // not judged yet: an ordinary gift
  G.S.day = RECKONING.day; emit('day:start', {});
  assert.equal(askAgain('ines', 'starstone'), null);
  assert.match(askAgain('bram', 'starstone'), /another look/);
  assert.equal(G.S.bag.starstone, 0);
  G.S.earned = 50000; G.S.day++; emit('day:start', {});
  assert.equal(G.S.reckoning.points, 1);
  assert.equal(G.S.reckoning.again, 0);
});

test('saves from before the reckoning get it unjudged', () => {
  assert.deepEqual(merge({ day: 300, gold: 0 }).reckoning, { done: 0, points: 0, lamps: 0, pending: false, again: 0, lid: false });
});
