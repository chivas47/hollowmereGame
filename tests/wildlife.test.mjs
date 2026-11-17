// Roadmap 92a (Nuno, November 2026): the village pen's sheep and cows live (they graze, walk, call, inside the
// rails), and birds and pen animals are drawn from sheets of their own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { BIRDS_SHEET, PENSTOCK } from '../src/data/sprites.js';
import { RANCH_PEN } from '../src/data/ranch.js';
import { penHerd, penBounds, stepPen, penFrame } from '../src/systems/pen.js';
import { birdFrame } from '../src/systems/atmosphere.js';
import { freshFarm } from './setup.mjs';

const size = (name) => { const b = readFileSync(new URL(`../assets/sprites/${name}.png`, import.meta.url)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test('the sheets have the frames and bands the code draws', () => {
  assert.deepEqual(size('birds'), [BIRDS_SHEET.size * 8, BIRDS_SHEET.size * BIRDS_SHEET.layers.length]);
  assert.deepEqual(size('penstock'), [PENSTOCK.size * 8, PENSTOCK.size * PENSTOCK.rows.length]);
});

test('the pen animals stay inside the rails for a long afternoon, and graze, walk and call', () => {
  freshFarm();
  G.S.map = 'village'; emit('map:changed', 'village');
  const herd = penHerd(), b = penBounds(), seen = new Set(), frames = new Set();
  assert.equal(herd.length, RANCH_PEN.sheep.length + RANCH_PEN.cows.length);
  assert.deepEqual([...new Set(herd.map((a) => a.kind))].sort(), ['cow', 'sheep']);
  for (let t = 0; t < 600; t += 0.05) {
    stepPen(0.05);
    for (const a of herd) {
      assert.ok(a.x >= b.left - 0.01 && a.x <= b.right + 0.01 && a.y >= b.top - 0.01 && a.y <= b.bottom + 0.01, `${a.kind} at ${a.x.toFixed(1)},${a.y.toFixed(1)} stays in the pen`);
      seen.add(a.state); frames.add(penFrame(a));
    }
  }
  for (const s of ['graze', 'walk', 'stand', 'call']) assert.ok(seen.has(s), `they ${s}`);
  for (const f of frames) assert.ok(f >= 0 && f < 8);
  assert.ok(frames.has(1) && frames.has(4) && frames.has(5) && frames.has(6), 'walk beats and grazing both show');
});

test('a bird pecks, looks and hops on the ground, and flaps through its wing frames when it flies off', () => {
  const ground = new Set(['peck', 'look', 'hop', 'stand'].flatMap((mode) => [0, 0.2, 0.4, 0.6].map((peck) => birdFrame({ mode, peck, flee: false }))));
  assert.ok(ground.has(0) && ground.has(1) && ground.has(2) && ground.has(3));
  const air = new Set([0, 0.05, 0.2, 0.27, 0.34, 0.41].map((age) => birdFrame({ flee: true, age })));
  assert.ok(air.has(4) && air.has(5) && air.has(6) && air.has(7), [...air].join());
});
