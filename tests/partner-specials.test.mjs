// v231 (roadmap 80d): farmer two's weapon specials. Their own cooldown, their moves from where they stand, and their
// block guards them.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T } from '../src/core/constants.js';
import { runUpdaters } from '../src/core/registry.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { SPECIALS } from '../src/data/weapons.js';
import { placePlayer } from '../src/systems/world.js';
import { join } from '../src/systems/partner.js';
import { slimes, spawnSlimes } from '../src/systems/monsters.js';
import { hurtPartner } from '../src/systems/health.js';
import { special, specialWait, resetSpecials } from '../src/systems/specials.js';
import { freshFarm } from './setup.mjs';

const SWORD = HOTBAR.indexOf('sword');
const tick = (s, dt = 0.02) => { for (let t = 0; t < s; t += dt) runUpdaters(dt); };

beforeEach(() => {
  freshFarm({ slot: 0 }); G.P2 = null; G.keys = {}; G.paused = false; G.hurtT = 0; G.dialog = { you: false, p2: false };
  placePlayer('farm', 3, 9, 'right');
  join();
  Object.assign(G.P2, { map: 'farm', x: 14 * T + 8, y: 9 * T + 12, dir: 'right', slot: SWORD, hurtT: 0, keys: {} });
  resetSpecials();
});

test('their special needs their weapon in hand, not yours, and has its own cooldown', () => {
  G.S.weapon = 'oldblade';
  assert.equal(special('you'), false, 'you hold the hoe');
  assert.equal(special('p2'), true, 'they hold the weapon');
  assert.ok(specialWait('p2') > 0);
  assert.equal(specialWait('you'), 0);
  G.P2.slot = 0; G.S.slot = SWORD;
  assert.equal(special('you'), true, 'yours is still ready');
});

test('their block guards them, not you', () => {
  G.S.weapon = 'oldblade';
  special('p2');
  assert.ok(G.P2.block > 0 && !(G.block > 0));
  const theirs = G.S.partner.hp = G.S.maxHp;
  hurtPartner(30, G.P2.x + 4, G.P2.y);
  assert.equal(G.S.partner.hp, theirs, 'the hit is turned');
});

test('their quick stab lands in front of them, not of you', () => {
  G.S.weapon = 'dirk';
  spawnSlimes('farm', 2);
  const [near, far] = slimes;
  Object.assign(near, { x: G.P2.x + 12, y: G.P2.y, hp: 1000, speed: 0, kx: 0, ky: 0, frozen: 0 });
  Object.assign(far, { x: G.S.x + 12, y: G.S.y, hp: 1000, speed: 0, kx: 0, ky: 0, frozen: 0 });
  const you = { x: G.S.x, y: G.S.y };
  special('p2');
  tick(SPECIALS.dagger.stabs * SPECIALS.dagger.every + 0.1);
  assert.ok(near.hp < 1000, 'the monster by them was stabbed');
  assert.equal(far.hp, 1000, 'nothing by you was');
  assert.deepEqual({ x: G.S.x, y: G.S.y }, you, 'you were put back where you stood');
});

// v232 (roadmap 80e): their cooldown shows as a bar under their feet, only while it runs, only on the map on screen.
test('a cooldown bar shows under them while their special cools down', async () => {
  const { collectEntities } = await import('../src/core/registry.js');
  const bars = () => collectEntities().filter((e) => e.y === G.P2.y + 0.5).length;
  G.S.weapon = 'oldblade';
  assert.equal(bars(), 0, 'none while ready');
  special('p2');
  assert.equal(bars(), 1);
  G.P2.map = 'wilds';
  assert.equal(bars(), 0, 'not drawn on a map you are not on');
  G.P2.map = 'farm';
  tick(SPECIALS.sword.cooldown + 0.05);
  assert.equal(bars(), 0, 'gone once ready');
});
