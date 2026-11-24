// v333 (roadmap 116b): what farmer two does shows up for them. Their gains fly to them, their swings' effects belong
// to their map (each half of split screen draws its own map's), and a hit on them shows over them without shaking you.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { placePlayer } from '../src/systems/world.js';
import { join, asFarmer, partnerPrompt } from '../src/systems/partner.js';
import { burst } from '../src/systems/animation.js';
import { freshFarm } from './setup.mjs';

beforeEach(() => {
  freshFarm(); G.P2 = null; G.keys = {}; G.fishing = null; G.lock = false; G.dialog = { you: false, p2: false }; G.paused = false; G.shake = null;
  runUpdaters(0.01);   // pickups wake up a frame after loading
});
const apart = () => { join(); Object.assign(G.P2, { map: 'village', x: 160, y: 140 }); };

test('what farmer two gathers flies to them, from their map; what you gather flies to you', () => {
  apart();
  asFarmer('p2', () => { G.S.bag.turnip += 3; });
  const theirs = G.fx.pickups.at(-1);
  assert.equal(theirs.who, 'p2'); assert.equal(theirs.map, 'village'); assert.equal(theirs.key, 'turnip');
  G.S.bag.turnip += 1; emit('state:changed');
  const mine = G.fx.pickups.at(-1);
  assert.equal(mine.who, 'you'); assert.equal(mine.map, G.S.map);
});

test('their prompt, worked out every frame, never flies anything to them', () => {
  apart();
  const n = G.fx.pickups.length;
  G.S.bag.turnip += 2;   // something of yours not yet announced
  partnerPrompt();
  assert.equal(G.fx.pickups.length, n);
  emit('state:changed');
  assert.equal(G.fx.pickups.at(-1).who, 'you');
});

test('effects made as farmer two belong to their map, and stay when you walk elsewhere', () => {
  apart();
  asFarmer('p2', () => burst(160, 140, ['#fff'], 4));
  assert.ok(G.fx.parts.length > 0 && G.fx.parts.every((q) => q.map === 'village'));
  placePlayer('beach', 5, 5, 'down'); emit('map:changed', 'beach');
  assert.ok(G.fx.parts.some((q) => q.map === 'village'), 'farmer two is still there');
  G.P2.map = 'forest'; emit('map:changed', 'forest');
  assert.ok(!G.fx.parts.some((q) => q.map === 'village'), 'nobody is there now');
});

test('a hit on farmer two shows over them on their map and does not shake your screen', () => {
  apart();
  emit('player:hurt', { who: 'p2', n: 7, x: 160, y: 140, map: 'village' });
  const f = G.fx.floats.at(-1);
  assert.equal(f.text, '-7'); assert.equal(f.map, 'village');
  assert.equal(G.shake, null);
  emit('player:hurt', { who: 'you', n: 3, x: G.S.x, y: G.S.y, map: G.S.map });
  assert.ok(G.shake, 'yours does');
});
