// Roadmap 85d1: three new ways to fight. The pebble crab (mimic) sits as a rock until woken and its first hit only
// cracks its shell; the burrow mole (burrow) moves under the floor where nothing touches it and comes up near you;
// soot puffs (swarm) come as a pack in one spawn slot. Each lives in its own band of the Hollow's floors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { MONSTERS, MIMIC, BURROW } from '../src/data/weapons.js';
import { MONSTERS as SHEET } from '../src/data/sprites.js';
import { slimes, spawnSlimes, hitMonster, untouchable } from '../src/systems/monsters.js';
import '../src/systems/bestiary.js';
import { enterMine, leaveMine } from '../src/systems/mine.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const tick = (s, dt = 0.02) => { for (let t = 0; t < s; t += dt) runUpdaters(dt); };
function one(kind, gap) {
  freshFarm();
  G.paused = false; G.hurtT = 0; G.dialog = { you: false, p2: false }; G.P2 = null;
  placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1);
  slimes.length = 1;
  const m = slimes[0], d = MONSTERS[kind];
  Object.assign(m, { kind, hp: d.hp(10), dmg: d.dmg(10), speed: d.speed(10), x: G.S.x + gap, y: G.S.y, tx: G.S.x + gap, ty: G.S.y, kx: 0, ky: 0, frozen: 0, color: d.color });
  if (d.move === 'mimic') m.hidden = true;
  if (d.move === 'burrow') { m.bs = 'under'; m.bt = BURROW.under; }
  return m;
}

test('three new kinds, each with its way of fighting, drawn on the sheet', () => {
  assert.equal(MONSTERS.crab.move, 'mimic');
  assert.equal(MONSTERS.mole.move, 'burrow');
  assert.equal(MONSTERS.puff.move, 'swarm');
  for (const k of ['crab', 'crabrock', 'mole', 'puff']) {
    assert.ok(SHEET.kinds[k], `${k} has sheet settings`);
    assert.ok(SHEET.layers.includes(`${k}.body`) && SHEET.layers.includes(`${k}.ink`), `${k} has bands`);
  }
});

test('they keep to their bands of floors; a swarm comes as a pack', () => {
  const seen = (floors) => { const out = new Map(); for (const f of floors) for (let i = 0; i < 6; i++) { enterMine(f); for (const m of slimes) out.set(m.kind, (out.get(m.kind) || 0) + 1); } return out; };
  freshFarm();
  const deep = seen([45, 60, 75]);
  assert.ok(!deep.has('crab') && !deep.has('mole'), 'no crabs or moles past their floors');
  const shallow = seen([10, 20, 30]);
  assert.ok(!shallow.has('puff'), 'no puffs above floor 40');
  assert.ok(shallow.has('crab') && shallow.has('mole') && deep.has('puff'), 'each turns up on its floors');
  for (let i = 0; i < 20; i++) {
    enterMine(50);
    const n = slimes.filter((m) => m.kind === 'puff').length;
    assert.ok(n === 0 || n >= MONSTERS.puff.pack[0], `puffs come in packs (${n})`);
  }
  leaveMine();
});

test('a pebble crab sleeps as a rock, wakes when you come close, and its first hit only cracks its shell', () => {
  const m = one('crab', 60), x0 = m.x, hp = m.hp;
  tick(0.5);
  assert.equal(m.hidden, true);
  assert.equal(m.x, x0, 'a rock does not move');
  assert.ok(!G.S.bestiary.seen.includes('crab'), 'a disguised crab is not met yet');
  m.x = G.S.x + MIMIC.wake - 2;
  tick(0.05);
  assert.equal(m.hidden, false, 'woken by stepping beside it');
  hitMonster(m, 5);
  assert.equal(m.hp, hp, 'the first hit only cracks the shell');
  hitMonster(m, 5);
  assert.equal(m.hp, hp - 5);
  assert.ok(G.S.bestiary.seen.includes('crab'));
});

test('a hit wakes a sleeping crab too', () => {
  const m = one('crab', 60), hp = m.hp;
  hitMonster(m, 5);
  assert.equal(m.hidden, false);
  assert.equal(m.hp, hp);
});

test('a burrow mole cannot be touched under the floor, comes up near you, then digs down again', () => {
  const m = one('mole', 60), hp = m.hp, x0 = m.x;
  G.S.hp = G.S.maxHp = 1000;
  assert.ok(untouchable(m));
  hitMonster(m, 5);
  assert.equal(m.hp, hp, 'no hit lands under the floor');
  tick(0.3);
  assert.ok(m.x < x0, 'the mound slides after you');
  m.x = G.S.x + 4; m.y = G.S.y;   // right under your feet
  tick(BURROW.tell / 2);
  assert.equal(m.bs, 'rise');
  assert.equal(G.S.hp, 1000, 'rising, it does not hurt yet');
  m.x = G.S.x + 30;   // step away before it is up
  tick(BURROW.tell);
  assert.equal(m.bs, 'up');
  hitMonster(m, 5);
  assert.equal(m.hp, hp - 5, 'up, it can be hit');
  tick(BURROW.up + 0.1);
  assert.equal(m.bs, 'under', 'and it digs down again');
});

test('soot puffs weave toward you', () => {
  const m = one('puff', 60), x0 = m.x;
  tick(0.5);
  assert.ok(m.x < x0);
});

// Roadmap 85d2: the same three ways in the deep dungeons.
test('the deep dungeons get a burrower and two swarms of their own', () => {
  assert.equal(MONSTERS.lurker.move, 'burrow');
  assert.ok(MONSTERS.lurker.ventOnly);
  assert.equal(MONSTERS.dustdevil.move, 'swarm');
  assert.ok(MONSTERS.dustdevil.cavernOnly);
  assert.equal(MONSTERS.ashswarm.move, 'swarm');
  assert.ok(MONSTERS.ashswarm.ventOnly);
  assert.ok(SHEET.layers.includes('lurker.body') && SHEET.kinds.lurker);
  for (const k of ['dustdevil', 'ashswarm']) assert.equal(SHEET.kinds[k].shape, 'puff', `${k} is drawn as a puff`);
  freshFarm();
  const kinds = (zone) => { const out = new Set(); for (let i = 1; i <= 9; i++) { enterMine(i, zone); slimes.forEach((m) => out.add(m.kind)); } return out; };
  const cavern = kinds('cavern'), vent = kinds('vent');
  assert.ok(cavern.has('dustdevil') && !cavern.has('lurker') && !cavern.has('ashswarm'));
  assert.ok(vent.has('lurker') && vent.has('ashswarm') && !vent.has('dustdevil'));
  const hollow = kinds('hollow');
  for (const k of ['lurker', 'dustdevil', 'ashswarm']) assert.ok(!hollow.has(k), `no ${k} in the Hollow`);
  leaveMine();
});

test('a lava lurker burrows like a mole', () => {
  const m = one('lurker', 60), hp = m.hp;
  hitMonster(m, 5);
  assert.equal(m.hp, hp);
  m.x = G.S.x + 4;
  tick(BURROW.tell + 0.05);
  assert.equal(m.bs, 'up');
});
