// Roadmap 85c: the Bestiary. Kinds are met when they share your map or fall; each defeat records what dropped;
// old saves start with every kind they have defeated as met.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { merge } from '../src/core/state.js';
import { MONSTERS } from '../src/data/weapons.js';
import { HOW, whereLives, BESTIARY_ORDER } from '../src/data/bestiary.js';
import { slimes, spawnSlimes, hitMonster } from '../src/systems/monsters.js';
import '../src/systems/bestiary.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

test('every kind has a card: a way of fighting and a place in the order', () => {
  assert.deepEqual([...BESTIARY_ORDER].sort(), Object.keys(MONSTERS).sort());
  for (const k of Object.keys(MONSTERS)) assert.ok(HOW[MONSTERS[k].move], `${k} says how it fights`);
  assert.equal(BESTIARY_ORDER[0], 'slime');
});

test('where a kind lives follows the spawn rules', () => {
  assert.equal(whereLives('slime'), 'Lives in the Hollow and the wild farm after dark.');
  assert.equal(whereLives('bat'), 'Lives in the Hollow from floor 12 and the Sunken Cavern.');
  assert.equal(whereLives('serpent'), 'Lives in the Hollow from floor 50, the Sunken Cavern, the Ember Vent and Smoke Peak.');
  assert.equal(whereLives('wraith'), 'Lives in the Sunken Cavern.');
  assert.equal(whereLives('golem'), 'Lives in the Ember Vent and Smoke Peak.');
});

test('a monster on your map is met; a defeat records its drops', () => {
  freshFarm();
  G.paused = false;
  placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1);
  const m = slimes[0];
  Object.assign(m, { kind: 'skeleton', floor: 1, hp: 5 });
  runUpdaters(0.01);
  assert.deepEqual(G.S.bestiary.seen, ['skeleton']);
  const real = Math.random;
  Math.random = () => 0;
  try { hitMonster(m, 100); } finally { Math.random = real; }
  assert.deepEqual(G.S.bestiary.drops.skeleton.sort(), ['boneshard', 'iron']);
});

test('the Bestiary is saved, and an old save meets every kind it has defeated', () => {
  const s = merge({ day: 40, gold: 0, v: 6, slain: { slime: 30, bat: 2, mite: 0 } });
  assert.deepEqual(s.bestiary.seen.sort(), ['bat', 'slime']);
  assert.deepEqual(s.bestiary.drops, {});
  const again = merge(JSON.parse(JSON.stringify({ ...s, bestiary: { seen: ['bat'], drops: { bat: ['leatherwing'] }, elites: ['bat'] } })));
  assert.deepEqual(again.bestiary, { seen: ['bat'], drops: { bat: ['leatherwing'] }, elites: ['bat'] });   // v260: elites
});
