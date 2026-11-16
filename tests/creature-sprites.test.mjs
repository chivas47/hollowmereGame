// Roadmap 87c1: the Hollow's creatures drawn in four frames, with a lighter outline (rim) on the dark kinds so they
// read on the Hollow's dark floor. Checks the sheet and its settings agree: a missing band draws a creature blank.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MONSTERS } from '../src/data/weapons.js';
import { MONSTERS as SHEET } from '../src/data/sprites.js';

const png = readFileSync(new URL('../assets/sprites/monsters.png', import.meta.url));
const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
const hollow = Object.keys(MONSTERS).filter((k) => !MONSTERS[k].cavernOnly && !MONSTERS[k].ventOnly && !MONSTERS[k].surfaceOnly);
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255); };
const FLOOR = '#3b3430';   // the Hollow's floor (render/tiles.js CAVE_COLS.rock)

test('the sheet has four frames and a band for every layer', () => {
  assert.equal(width, SHEET.size * 4, 'four frames a row');
  assert.equal(height, SHEET.size * SHEET.layers.length, 'one band per layer');
});

test('every kind has its body, outline and ink bands, and a glow band when it glows', () => {
  for (const [kind, k] of Object.entries(SHEET.kinds)) {
    const shape = k.shape || kind;
    for (const band of ['body', 'line', 'ink']) assert.ok(SHEET.layers.includes(`${shape}.${band}`), `${kind}: ${shape}.${band}`);
    if (SHEET.layers.includes(`${shape}.glow`)) assert.ok(k.glow, `${kind} tints its shape's glow`);
  }
});

test('the Hollow has 16 kinds, all on the sheet', () => {
  assert.equal(hollow.length, 16, hollow.join(', '));
  for (const k of hollow) assert.ok(SHEET.kinds[k], k);
});

test('the Hollow\'s dark kinds have an outline lighter than the floor and than their body', () => {
  const dark = hollow.filter((k) => MONSTERS[k].color && lum(MONSTERS[k].color) < 85);
  assert.deepEqual(dark.sort(), ['bat', 'beetle', 'gloomhound', 'mite', 'puff', 'spitter']);
  for (const k of dark) {
    const rim = SHEET.kinds[k].rim;
    assert.ok(rim, `${k} has a rim`);
    assert.ok(lum(rim) > lum(MONSTERS[k].color) + 40 && lum(rim) > lum(FLOOR) + 60, `${k}'s rim stands out`);
  }
});
