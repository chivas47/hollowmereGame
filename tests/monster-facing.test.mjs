// v364: every creature faces the way it goes. The sheet's art faces right and m.face flips it; walkers, flyers,
// crawlers, swarms and the armored never turned before, so they walked backwards to the left.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { MONSTERS, statAt } from '../src/data/monsters.js';
import { slimes, spawnSlimes } from '../src/systems/monsters.js';
import { resetSpecials } from '../src/systems/specials.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const tick = (s, dt = 0.02) => { for (let t = 0; t < s; t += dt) runUpdaters(dt); };
function one(kind, gap, extra = {}) {
  freshFarm();
  G.paused = false; G.hurtT = 0; G.dialog = { you: false, p2: false }; G.P2 = null; resetSpecials();
  G.S.hp = G.S.maxHp = 1e6; G.S.time = 12 * 60;
  placePlayer('farm', 12, 9, 'down');
  spawnSlimes('farm', 1);
  slimes.length = 1;
  const m = slimes[0];
  for (const f of ['cs', 'bs', 'bt', 'hidden', 'ph']) delete m[f];
  Object.assign(m, { kind, hp: 1e6, dmg: 0, speed: statAt(kind, 'speed', 10), x: G.S.x + gap, y: G.S.y - 3, kx: 0, ky: 0, frozen: 0, rest: 99, face: gap > 0 ? false : true, ...extra });
  if (MONSTERS[kind].move === 'burrow') Object.assign(m, { bs: 'up', bt: 99 });
  return m;
}
const KINDS = Object.keys(MONSTERS).filter((k) => !MONSTERS[k].boss);

test('every creature turns to face you, on either side', () => {
  for (const kind of KINDS) {
    const left = one(kind, 40); tick(0.1);
    assert.equal(left.face, true, `${kind} with you on its left faces left`);
    const right = one(kind, -40); tick(0.1);
    assert.equal(right.face, false, `${kind} with you on its right faces right`);
  }
});

test('a wandering creature faces where it wanders, not back at you', () => {
  for (const kind of ['serpent', 'mite', 'boar', 'shellback', 'wasp', 'shambler']) {
    const m = one(kind, 400); m.y = G.S.y - 3;
    m.tx = m.x + 60; m.ty = m.y;   // wandering right, away from you far to its left
    tick(0.1);
    assert.equal(m.face, false, `${kind} wanders right facing right`);
  }
});
