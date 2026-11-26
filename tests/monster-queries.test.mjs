// v350: Guild goals pick their creatures by a query (data/monsters.js kindsWhere) instead of hand-written lists, and
// each creature can be pushed more or less by a blow (knockback). Neither changes play today.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { MONSTERS, ZONES, kindsWhere, knockbackOf } from '../src/data/monsters.js';
import { GOALS } from '../src/data/guild.js';
import { slimes, spawnSlimes, hitMonster } from '../src/systems/monsters.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

// What each goal counted when its kinds were written out by hand (v349); the queries must pick exactly these.
const BEFORE = {
  slime: ['slime'], mite: ['mite'], bat: ['bat'], skeleton: ['skeleton'], serpent: ['serpent'], wraith: ['wraith'], rex: ['rex'], sprite: ['sprite'],
  hollowchargers: ['beetle', 'boar', 'ram', 'gloomhound'], sandchargers: ['scuttler', 'bull'], ventchargers: ['hound', 'magmaram'],
  mimics: ['crab'], burrowers: ['mole', 'lurker'], swarms: ['puff', 'dustdevil', 'ashswarm', 'stormwing'],
  shooters: ['spitter', 'sandspitter', 'cragspitter'], splitters: ['mossslime', 'emberslime'], phasers: ['wisp', 'shade'],
  armored: ['shellback', 'cragshell'], nightfolk: ['bramble', 'moth', 'gourd', 'frostwisp'],
};

test('every goal counts exactly the creatures it did, picked by its query', () => {
  assert.deepEqual(Object.keys(GOALS).sort(), Object.keys(BEFORE).sort());
  for (const [g, kinds] of Object.entries(BEFORE)) {
    assert.deepEqual(GOALS[g].kinds, kinds, g);
    assert.deepEqual(kindsWhere(GOALS[g].who), kinds, `${g}: kinds is its query's`);
  }
  for (const g of Object.values(GOALS)) {
    const q = g.who, keys = Object.keys(q);
    assert.ok(keys.every((k) => ['kind', 'move', 'zones', 'tag'].includes(k)), `${g.label}: query fields`);
    if (q.zones) assert.ok(q.zones.every((z) => ZONES.includes(z)), `${g.label}: zones`);
  }
});

test('a query picks by kind, way of fighting, where it lives and family; a new kind that fits counts', () => {
  assert.deepEqual(kindsWhere({ kind: 'bat' }), ['bat']);
  assert.deepEqual(kindsWhere({ kind: 'nobody' }), []);
  assert.deepEqual(kindsWhere({ tag: 'slime' }), ['slime', 'mossslime', 'emberslime', 'mossmother']);   // v368
  assert.ok(kindsWhere({ move: 'swarm' }).includes('wasp') && !kindsWhere({ move: 'swarm', zones: ['hollow', 'cavern', 'vent'] }).includes('wasp'));
  MONSTERS.testcharger = { ...MONSTERS.boar, name: 'Test charger' };
  try { assert.ok(kindsWhere(GOALS.hollowchargers.who).includes('testcharger'), 'a new Hollow charger counts toward the Hollow chargers'); }
  finally { delete MONSTERS.testcharger; }
});

test('knockback: the usual push by default, less for a heavy kind, none for an immovable one', () => {
  freshFarm(); G.paused = false; G.P2 = null;
  placePlayer('farm', 6, 9, 'right');
  for (const k of Object.keys(MONSTERS)) assert.ok(knockbackOf(k) >= 0, `${k}: knockback`);
  const push = (kb) => {
    const was = MONSTERS.golem.knockback;
    if (kb === undefined) delete MONSTERS.golem.knockback; else MONSTERS.golem.knockback = kb;
    try { spawnSlimes('farm', 1, 'golem'); slimes.length = 1; const m = slimes[0]; m.hp = 1e6; hitMonster(m, 1, 100, -40); return [m.kx, m.ky]; }
    finally { if (was === undefined) delete MONSTERS.golem.knockback; else MONSTERS.golem.knockback = was; }
  };
  assert.deepEqual(push(undefined), [100, -40], 'default 1: as before');
  assert.deepEqual(push(0.5), [50, -20]);
  assert.deepEqual(push(0), [0, -0]);
});

// v355: knockback by weight. Heavy kinds hold their ground, light ones fly; chargers that rely on being driven into
// a wall (and dazed) keep their knockback.
test('knockback tuning: heavy kinds hold, light ones fly, the hounds still bounce off walls', () => {
  for (const k of ['golem', 'magmaram', 'cragshell', 'ram', 'bull', 'shellback']) assert.ok(knockbackOf(k) < 1, `${k} is heavy`);
  for (const k of ['bat', 'puff', 'dustdevil', 'ashswarm', 'stormwing']) assert.ok(knockbackOf(k) > 1, `${k} is light`);
  for (const k of ['gloomhound', 'hound']) assert.equal(knockbackOf(k), 1, `${k} keeps its knockback`);
  assert.ok(knockbackOf('golem') < knockbackOf('ram') && knockbackOf('ram') < knockbackOf('boar'), 'heavier, less');
});
