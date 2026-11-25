// Roadmap 87a: a swing does not reach a creature that walks if a rock or wall stands between you; flyers, phasers,
// flying swarms and burrowers that are up are hit over it. Bombs are not swings and still reach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T } from '../src/core/constants.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { MONSTERS, BURROW } from '../src/data/monsters.js';
import { slimes, spawnSlimes, strikeArea, hitMonster, inSight } from '../src/systems/monsters.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

// A rock put on open farm grass for the test (and taken away after), with open grass two tiles either side.
const RX = 10, RY = 11;
let kept = null;
function wall() {
  const g = MAPS.farm.grid;
  if (kept === null) kept = g[RY][RX];
  for (const dx of [-2, -1, 1, 2]) assert.ok(!SOLID.has(g[RY][RX + dx]), 'open either side');
  g[RY][RX] = 'r';
  assert.ok(SOLID.has('r'));
  return [RX, RY];
}
test.after(() => { if (kept !== null) MAPS.farm.grid[RY][RX] = kept; });
function across(kind) {
  freshFarm();
  G.paused = false; G.dialog = { you: false, p2: false }; G.P2 = null;
  const [x, y] = wall();
  placePlayer('farm', x - 1, y, 'right');
  spawnSlimes('farm', 1); slimes.length = 1;
  const m = slimes[0];
  Object.assign(m, { kind, hp: 1e6, x: (x + 1) * T + 8, y: G.S.y, kx: 0, ky: 0, hidden: false, shell: false, bs: undefined, ph: undefined, frozen: 0 });
  if (MONSTERS[kind].move === 'burrow') { m.bs = 'up'; m.bt = BURROW.up; }
  if (MONSTERS[kind].move === 'phase') { m.ph = 'solid'; m.pt = 9; }
  return m;
}
const swing = (m) => { const hp = m.hp; strikeArea(G.S.x + 12, G.S.y - 4, 60, 1); return hp - m.hp; };

test('a rock between you and a walker stops the swing', () => {
  for (const kind of ['slime', 'skeleton', 'beetle', 'crab', 'spitter', 'shellback', 'mossslime']) {
    const m = across(kind);
    assert.equal(inSight(m), false, `${kind} is behind the rock`);
    assert.equal(swing(m), 0, `${kind} is not hit`);
  }
});

test('flyers, phasers, flying swarms and burrowers that are up are hit over the rock', () => {
  for (const kind of ['bat', 'serpent', 'wisp', 'stormwing', 'mole']) {
    const m = across(kind);
    assert.ok(inSight(m), `${kind} is in reach`);
    assert.ok(swing(m) > 0, `${kind} is hit`);
  }
});

test('in the open the walker is hit, and a bomb reaches it behind a rock', () => {
  const m = across('skeleton');
  m.x = G.S.x + 14;   // beside you, nothing between
  assert.ok(swing(m) > 0);
  const n = across('skeleton'), hp = n.hp;
  hitMonster(n, 40);   // bombs and the blast ring hit directly
  assert.equal(n.hp, hp - 40);
});
