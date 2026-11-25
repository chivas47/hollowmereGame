// Roadmap 87c1: the Hollow's creatures drawn in four frames, with a lighter outline (rim) on the dark kinds so they
// read on the Hollow's dark floor. Checks the sheet and its settings agree: a missing band draws a creature blank.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MONSTERS, livesIn } from '../src/data/monsters.js';
import { MONSTERS as SHEET } from '../src/data/sprites.js';

const png = readFileSync(new URL('../assets/sprites/monsters.png', import.meta.url));
const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
const hollow = Object.keys(MONSTERS).filter((k) => livesIn(k, 'hollow'));   // v303: not the Duskmarch's
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

// Roadmap 87c2: the deep dungeons' kinds each have a shape of their own (polish find 41), and the dark ones a rim.
const deep = Object.keys(MONSTERS).filter((k) => !livesIn(k, 'hollow') && (livesIn(k, 'cavern') || livesIn(k, 'vent')));
test('no deep kind borrows another kind\'s shape', () => {
  assert.equal(deep.length, 17);
  const shapes = deep.map((k) => SHEET.kinds[k].shape || k);
  assert.equal(new Set(shapes).size, 17, shapes.join(', '));
  const hollowShapes = new Set(hollow.map((k) => SHEET.kinds[k].shape || k));
  for (const k of deep) assert.ok(!hollowShapes.has(SHEET.kinds[k].shape || k), `${k} has its own shape`);
});
test('the deep dungeons\' dark kinds have a lighter outline', () => {
  const dark = deep.filter((k) => lum(MONSTERS[k].color) < 85);
  assert.deepEqual(dark.sort(), ['cragshell', 'cragspitter', 'golem', 'hound', 'magmaram', 'stormwing']);
  for (const k of dark) assert.ok(SHEET.kinds[k].rim && lum(SHEET.kinds[k].rim) > lum(MONSTERS[k].color) + 40, `${k}'s rim stands out`);
});

// Roadmap 87c3: the night creatures have shapes of their own; the gourd lurker sleeps as a pumpkin (find 42) and the
// firefly moth glows.
test('every creature has a shape of its own now', () => {
  const night = Object.keys(MONSTERS).filter((k) => livesIn(k, 'night'));
  assert.deepEqual(night.sort(), ['bramble', 'frostwisp', 'gourd', 'moth']);
  for (const k of night) assert.ok(!SHEET.kinds[k].shape && SHEET.layers.includes(`${k}.body`), `${k} has its own bands`);
  const all = Object.keys(MONSTERS).filter((k) => !MONSTERS[k].boss).map((k) => SHEET.kinds[k].shape || k);
  assert.deepEqual(all.filter((s, i) => all.indexOf(s) !== i), [], 'no two kinds share a shape (polish find 41)');
  // v347: a boss may wear its kin's shape, drawn bigger and in its own colour (the Gravewarden, a rattler grown huge).
  for (const k of Object.keys(MONSTERS).filter((x) => MONSTERS[x].boss)) {
    const kin = SHEET.kinds[k].shape || k;
    assert.ok(MONSTERS[k].boss.scale >= 1.5 || kin === k, `${k} stands apart by size`);
    if (MONSTERS[kin]) assert.notEqual(MONSTERS[k].color, MONSTERS[kin].color, `${k} has its own colour`);
  }
});
test('the gourd lurker sleeps as a pumpkin, other mimics as a rock', () => {
  assert.equal(SHEET.kinds.gourd.sleep, 'gourdsleep');
  assert.ok(SHEET.layers.includes('gourdsleep.body') && SHEET.kinds.gourdsleep);
  assert.equal(SHEET.kinds.crab.sleep, undefined, 'the pebble crab still sleeps as crabrock');
});
test('the firefly moth glows', () => {
  assert.ok(SHEET.layers.includes('moth.glow') && SHEET.kinds.moth.glow && SHEET.kinds.moth.halo);
});

// v349: until the sheet loads (or if it never does) every creature is drawn in code, by the drawing its sheet entry
// names (`code`); before, a list in render/sprites.js named some and the crag shellback's pointed nowhere and threw.
test('every creature and mimic disguise names a code drawing that exists, and draws without the sheet', async () => {
  globalThis.performance ??= { now: () => 0 };
  const { CODE_ART, drawMonster } = await import('../src/render/sprites.js');
  const sleeps = Object.values(SHEET.kinds).map((k) => k.sleep).filter(Boolean);
  for (const k of [...Object.keys(MONSTERS), ...sleeps]) {
    assert.ok(SHEET.kinds[k], `${k} has a sheet entry`);
    assert.ok(CODE_ART[SHEET.kinds[k].code], `${k}: code drawing ${SHEET.kinds[k].code}`);
  }
  const drawn = [], c = new Proxy({}, { get: (t, p) => (p in t ? t[p] : (...a) => { if (p === 'fillRect') drawn.push(a); }), set: (t, p, v) => { t[p] = v; return true; } });
  for (const k of Object.keys(MONSTERS)) {
    drawn.length = 0;
    assert.doesNotThrow(() => drawMonster(c, 50, 50, k, '#808080', false, 0.3), k);
    assert.ok(drawn.length > 0, `${k} draws something`);
  }
});
