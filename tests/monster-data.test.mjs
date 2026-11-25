// v345: every creature lives in one table (data/monsters.js) with plain-number stats, its zones and its loot.
// These tests keep that table well-formed, so a balance patch or a new kind cannot quietly break a spawn, the
// Bestiary or a stat.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MONSTERS, ZONES, statAt, statsAt, livesIn, kindsFor, kindsIn, UNDEAD, CHARGE } from '../src/data/monsters.js';
import { HOW } from '../src/data/bestiary.js';
import { LOOT } from '../src/data/loot.js';
import { fixture } from '../tools/monster_stats.mjs';

const KINDS = Object.keys(MONSTERS);
const goodStat = (s) => (typeof s === 'number' && s >= 0)
  || (Array.isArray(s) && (s.length === 2 || s.length === 3) && s[0] >= 0 && s[1] > 0 && (s[2] === undefined || s[2] > 0));

test('stats are the ones in the fixture (after an intended change: node tools/monster_stats.mjs --fixture)', () => {
  const want = JSON.parse(readFileSync(new URL('./fixtures/monster-stats.json', import.meta.url)));
  assert.deepEqual(fixture(), want);
});

test('every kind is well formed', () => {
  for (const k of KINDS) {
    const d = MONSTERS[k];
    assert.ok(d.name, `${k} has a name`);
    assert.ok(d.zones?.length && d.zones.every((z) => ZONES.includes(z)), `${k}: zones ${d.zones}`);
    for (const s of ['hp', 'dmg', 'speed']) assert.ok(goodStat(d[s]), `${k}.${s} is a number or [base, every, cap?]`);
    assert.ok(d.xp > 0, `${k} gives XP`);
    assert.ok(HOW[d.move], `${k}: move ${d.move} has a Bestiary line`);
    assert.ok(d.loot?.length, `${k} has loot`);
    if (livesIn(k, 'hollow')) assert.ok(d.from >= 1 && (d.to ?? Infinity) >= d.from, `${k}: Hollow floors`);
    else assert.equal(d.from, undefined, `${k}: from only means something in the Hollow`);
    assert.equal(!!d.season, livesIn(k, 'night'), `${k}: a night creature has a season, and only it`);
    assert.equal(!!d.lives, livesIn(k, 'duskmarch'), `${k}: a Duskmarch creature has its Bestiary line, and only it`);
    if (d.move === 'swarm') assert.ok(d.pack?.[0] >= 1 && d.pack[1] >= d.pack[0], `${k}: a swarm has a pack`);
    if (d.move === 'charge') for (const f of ['windup', 'rush', 'time', 'recover', 'range', 'times', 'stun']) assert.ok(d[f] > 0, `${k}: charger ${f}`);
  }
  assert.deepEqual(Object.keys(LOOT), KINDS, 'the loot lookup is the table');
});

test('statAt reads every stat format', () => {
  assert.equal(statAt('rattler', 'hp', 99), 18, 'a plain number is the same on every floor');
  assert.equal(statAt('skeleton', 'hp', 30), 12 + 10, '[base, every]');
  assert.equal(statAt('slime', 'speed', 5), 18 + 10, 'every 0.5 is +2 a floor');
  assert.equal(statAt('slime', 'speed', 50), 18 + 20, 'the cap stops the growth');
  assert.equal(statAt('boar', 'hp', 30), CHARGE.tough * (8 + 10), "a charger's health is times its tough");
  assert.equal(statAt('bristle', 'hp', 1), CHARGE.tough * 7);
  assert.deepEqual(statsAt('mite', 10), { hp: 4, dmg: 9, speed: 14 });
});

test('spawn lists come from zones and floors', () => {
  assert.deepEqual(kindsFor('peak', 3), kindsFor('vent', 3), 'the Smoke Peak has the Vent\'s creatures');
  assert.ok(kindsFor('hollow', 40).includes('crab') && !kindsFor('hollow', 41).includes('crab'), 'to is the last floor');
  assert.ok(!kindsFor('hollow', 2).includes('mite') && kindsFor('hollow', 3).includes('mite'), 'from is the first');
  for (const z of ['hollow', 'cavern', 'vent']) for (const k of kindsFor(z, 200)) assert.ok(livesIn(k, z), `${k} in ${z}`);
  for (const k of [...kindsIn('night'), ...kindsIn('duskmarch')]) for (const z of ['hollow', 'cavern', 'vent']) assert.ok(!kindsFor(z, 100).includes(k), `${k} never in a dungeon`);
  assert.equal(kindsIn('night').length, 4, 'one night creature a season');
});

test('undead is a tag on the kind', () => {
  assert.deepEqual(UNDEAD, KINDS.filter((k) => MONSTERS[k].tags.includes('undead')));
  assert.ok(UNDEAD.includes('skeleton') && UNDEAD.includes('haunt') && !UNDEAD.includes('slime'));
});

// v345: spawn weights. Every kind is weight 1 today, so floors are exactly what an even draw made.
test('spawn weights: a weighted draw, per zone, and even when every weight is 1', async () => {
  const { pickKind, spawnShare, weightIn } = await import('../src/data/monsters.js');
  for (const k of KINDS) { const w = MONSTERS[k].weight; assert.ok(w === undefined || typeof w === 'number' ? !(w < 0) : Object.keys(w).every((z) => ZONES.includes(z) && w[z] >= 0), `${k}: weight`); }
  const kinds = kindsFor('hollow', 60);
  for (let i = 0; i < kinds.length; i++) assert.equal(pickKind(kinds, 'hollow', () => (i + 0.5) / kinds.length), kinds[i], 'weight 1: the even draw');
  const share = spawnShare('hollow', 60);
  assert.ok(Math.abs(Object.values(share).reduce((a, b) => a + b, 0) - 1) < 1e-9);
  const was = MONSTERS.slime.weight;
  try {
    MONSTERS.slime.weight = { hollow: 3, vent: 0 };
    assert.equal(weightIn('slime', 'hollow'), 3); assert.equal(weightIn('slime', 'cavern'), 1, 'a zone left out counts 1');
    const s = spawnShare('hollow', 1);   // the slime and the pebble crab
    assert.equal(s.slime, 0.75); assert.equal(s.crab, 0.25);
    assert.equal(pickKind(['slime', 'crab'], 'hollow', () => 0.74), 'slime'); assert.equal(pickKind(['slime', 'crab'], 'hollow', () => 0.76), 'crab');
    MONSTERS.slime.weight = 0;
    assert.equal(pickKind(['slime', 'crab'], 'hollow', () => 0), 'crab', 'weight 0: never picked');
  } finally { if (was === undefined) delete MONSTERS.slime.weight; else MONSTERS.slime.weight = was; }
});
