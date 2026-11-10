// v227 (roadmap 80a): weapon specials. The sword blocks (a touching monster is thrown back and you take no harm),
// the dagger stabs several times straight ahead, the club slams the ground around you and dazes what it hits. Each
// waits out its cooldown (Stardew's: sword 1.5 s, dagger 3 s, club 6 s), and only works with the weapon in hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T } from '../src/core/constants.js';
import { runUpdaters } from '../src/core/registry.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { SPECIALS, WEAPONS } from '../src/data/weapons.js';
import { slimes, spawnSlimes } from '../src/systems/monsters.js';
import { special, specialWait, resetSpecials } from '../src/systems/specials.js';
import { hurtPlayer } from '../src/systems/health.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const WEAPON_SLOT = HOTBAR.indexOf('sword');
function arena(weapon, n = 1) {
  freshFarm({ weapon, slot: WEAPON_SLOT });
  G.paused = false; G.hurtT = 0; G.dialog = { you: false, p2: false }; G.P2 = null;
  resetSpecials();
  placePlayer('farm', 8, 8, 'right');
  spawnSlimes('farm', n);
  for (const m of slimes) Object.assign(m, { hp: 1000, x: G.S.x + 12, y: G.S.y, kx: 0, ky: 0, frozen: 0 });
  return slimes;
}
const tick = (s, dt = 0.02) => { for (let t = 0; t < s; t += dt) runUpdaters(dt); };

test('Stardew\'s cooldowns: sword 1.5 s, dagger 3 s, club 6 s', () => {
  assert.deepEqual([SPECIALS.sword.cooldown, SPECIALS.dagger.cooldown, SPECIALS.club.cooldown], [1.5, 3, 6]);
  for (const k of ['sword', 'dagger', 'club']) assert.ok(Object.values(WEAPONS).some((w) => w.kind === k), `there is a ${k} to use it with`);
});

test('the special only works with the weapon in hand, and not again until it cools down', () => {
  arena('oldblade');
  G.S.slot = 0;
  assert.equal(special(), false, 'not with the hoe');
  G.S.slot = WEAPON_SLOT;
  assert.equal(special(), true);
  assert.equal(special(), false, 'cooling down');
  tick(SPECIALS.sword.cooldown + 0.05);
  assert.equal(specialWait(), 0);
  assert.equal(special(), true, 'ready again');
});

test('a block turns a monster\'s touch: no harm, and it is thrown back', () => {
  const [m] = arena('oldblade');
  m.x = G.S.x + 4; m.speed = 0; m.dmg = 30;
  const hp = G.S.hp;
  special();
  tick(0.1);
  assert.equal(G.S.hp, hp, 'no harm taken');
  assert.ok(m.x - G.S.x > 4, 'it was pushed away');
  hurtPlayer(30, m.x, m.y);
  assert.equal(G.S.hp, hp, 'any hit is turned while blocking');
});

test('without a block the same touch hurts', () => {
  const [m] = arena('oldblade');
  m.x = G.S.x + 4; m.speed = 0; m.dmg = 30;
  const hp = G.S.hp;
  tick(0.1);
  assert.ok(G.S.hp < hp);
});

test('the dagger stabs its count of times straight ahead, and misses what is behind you', () => {
  const [front, back] = arena('dirk', 2);
  back.x = G.S.x - 12;
  front.speed = 0; back.speed = 0;
  const sp = SPECIALS.dagger;
  special();
  tick(sp.stabs * sp.every + 0.1);
  const hits = 1000 - front.hp;
  assert.ok(hits >= WEAPONS.dirk.damage * sp.mult * sp.stabs * 0.99, `${sp.stabs} stabs landed (took ${hits})`);
  assert.equal(back.hp, 1000, 'nothing behind you was hit');
});

test('the club slams everything around you after its leap, and dazes it', () => {
  const [a, b, far] = arena('club', 3);
  b.x = G.S.x - 20; far.x = G.S.x + SPECIALS.club.radius + 30;
  for (const m of [a, b, far]) m.speed = 0;
  special();
  assert.equal(a.hp, 1000, 'nothing yet: you are in the air');
  tick(SPECIALS.club.windup + 0.05);
  assert.ok(a.hp < 1000 && b.hp < 1000, 'both sides hit');
  assert.equal(far.hp, 1000, 'out of reach');
  assert.ok(a.frozen > 0.5, 'dazed');
});
