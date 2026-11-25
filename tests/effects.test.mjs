// Roadmap 87d: hits and defeats burst in what the creature is made of, so every kind needs a material, and the hit
// and defeat events carry the kind and colour the effects read.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on } from '../src/core/events.js';
import { MONSTERS } from '../src/data/monsters.js';
import { MATERIAL, MATERIALS } from '../src/data/animation.js';
import { slimes, spawnSlimes, hitMonster } from '../src/systems/monsters.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

test('every kind is made of a known material (unlisted ones are fur)', () => {
  for (const k of Object.keys(MONSTERS)) assert.ok(MATERIALS[MATERIAL[k] || 'fur'], k);
  for (const [k, m] of Object.entries(MATERIALS)) assert.ok(m.cols === null || m.cols.length >= 2, `${k} has colours`);
  for (const k of Object.keys(MATERIAL)) assert.ok(MONSTERS[k], `${k} is a real kind`);
});

test('a hit and a defeat say which kind and colour', () => {
  freshFarm();
  G.paused = false; placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1); slimes.length = 1;
  const m = Object.assign(slimes[0], { kind: 'skeleton', color: '#e8e0d0', hp: 10 });
  const seen = [];
  on('monster:hit', (e) => seen.push(['hit', e.kind, e.color]));
  on('monster:slain', (e) => seen.push(['slain', e.kind, e.color]));
  hitMonster(m, 3); hitMonster(m, 20);
  assert.deepEqual(seen.filter(([, k]) => k === 'skeleton'), [['hit', 'skeleton', '#e8e0d0'], ['hit', 'skeleton', '#e8e0d0'], ['slain', 'skeleton', '#e8e0d0']]);
});
