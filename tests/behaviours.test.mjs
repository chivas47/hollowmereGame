// Roadmap 85d1: three new ways to fight. The pebble crab (mimic) sits as a rock until woken and its first hit only
// cracks its shell; the burrow mole (burrow) moves under the floor where nothing touches it and comes up near you;
// soot puffs (swarm) come as a pack in one spawn slot. Each lives in its own band of the Hollow's floors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { MONSTERS, MIMIC, BURROW, SHOOT, SPLIT } from '../src/data/weapons.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { T } from '../src/core/constants.js';
import { MONSTERS as SHEET } from '../src/data/sprites.js';
import { slimes, spawnSlimes, hitMonster, untouchable, shots } from '../src/systems/monsters.js';
import '../src/systems/bestiary.js';
import '../src/systems/guild.js';
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

// Roadmap 85e1: shooters.
test('three spitters, one in each dungeon, drawn from one tinted shape', () => {
  assert.equal(MONSTERS.spitter.move, 'shoot');
  assert.ok(MONSTERS.spitter.from >= 70 && !MONSTERS.spitter.cavernOnly && !MONSTERS.spitter.ventOnly);
  assert.ok(MONSTERS.sandspitter.cavernOnly);
  assert.ok(MONSTERS.cragspitter.ventOnly);
  for (const k of ['spitter', 'sandspitter', 'cragspitter']) {
    assert.equal(SHEET.kinds[k].shape, 'spitter');
    assert.equal(SHEET.kinds[k].glow, MONSTERS[k].glow, `${k}'s mouth is the colour of its globs`);
  }
  assert.ok(SHEET.layers.includes('spitter.glow'));
});

function spitter(gap) {
  const m = one('spitter', gap);
  shots.length = 0;
  G.S.hp = G.S.maxHp = 1000; G.block = 0;
  m.st = SHOOT.every;
  return m;
}

test('a spitter backs off when you come close and keeps its distance', () => {
  const m = spitter(20), x0 = m.x;
  tick(0.3);
  assert.ok(m.x > x0, 'it backs away');
  const far = spitter(SHOOT.far + 4), x1 = far.x;
  tick(0.3);
  assert.ok(far.x < x1, 'and closes in from too far');
});

test('it glows, then spits a glob that hurts you', () => {
  const m = spitter(70);
  m.st = 0.01;
  tick(0.05);
  assert.equal(m.aim, true, 'the tell');
  assert.equal(shots.length, 0);
  tick(SHOOT.tell);
  assert.equal(shots.length, 1);
  assert.ok(shots[0].vx < 0, 'aimed at you');
  tick(1);
  assert.equal(shots.length, 0);
  assert.ok(G.S.hp < 1000, 'it hit');
});

test('the sword\'s block sends a glob back into the spitter', () => {
  const m = spitter(70), hp = m.hp;
  m.st = 99;
  shots.push({ x: G.S.x + 20, y: G.S.y - 6, vx: -SHOOT.speed, vy: 0, t: SHOOT.life, dmg: 10, color: '#fff', back: false });
  G.block = 5;
  tick(0.4);
  G.block = 0;
  assert.equal(G.S.hp, 1000, 'no harm through the block');
  tick(1);
  assert.ok(m.hp < hp, 'its own glob hit it');
});

test('a glob stops at a wall', () => {
  freshFarm();
  const g = MAPS.farm.grid;
  let wall = null;
  for (let y = 2; y < g.length - 2 && !wall; y++) for (let x = 2; x < g[0].length - 2; x++) if (SOLID.has(g[y][x]) && !SOLID.has(g[y][x - 1])) { wall = [x, y]; break; }
  one('spitter', 300); shots.length = 0;
  shots.push({ x: (wall[0] - 1) * T + 8, y: wall[1] * T + 8, vx: SHOOT.speed, vy: 0, t: SHOOT.life, dmg: 10, color: '#fff', back: false });
  tick(0.3);
  assert.equal(shots.length, 0);
});

// Roadmap 85e2: splitters.
test('a big moss slime splits in two smaller ones that do not split again', () => {
  const m = one('mossslime', 60);
  m.floor = 30;
  hitMonster(m, 1e6);
  const kids = slimes.filter((o) => o.kind === 'mossslime');
  assert.equal(kids.length, SPLIT.n);
  for (const k of kids) {
    assert.ok(k.small);
    assert.equal(k.hp, Math.ceil(MONSTERS.mossslime.hp(30) * SPLIT.hp));
  }
  kids.forEach((k) => hitMonster(k, 1e6));
  assert.equal(slimes.filter((o) => o.kind === 'mossslime').length, 0, 'the pieces stay down');
  assert.equal(G.S.slain.mossslime, 3, 'each piece counts');
});

test('splitters keep to their places and draw as slimes', () => {
  assert.equal(MONSTERS.mossslime.move, 'split');
  assert.ok(MONSTERS.mossslime.from >= 20 && MONSTERS.mossslime.to <= 60);
  assert.ok(MONSTERS.emberslime.ventOnly);
  for (const k of ['mossslime', 'emberslime']) assert.equal(SHEET.kinds[k].shape, 'slime');
});
