// Roadmap 92a (Nuno, November 2026): the village pen's sheep and cows live (they graze, walk, call, inside the
// rails), and birds and pen animals are drawn from sheets of their own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { BIRDS_SHEET, PENSTOCK } from '../src/data/sprites.js';
import { RANCH_PEN } from '../src/data/ranch.js';
import { drawBird } from '../src/render/wildlife.js';
import { penHerd, penBounds, stepPen, penFrame } from '../src/systems/pen.js';
import { birdFrame } from '../src/systems/atmosphere.js';
import { BIRD_SPECIES, BIRD_PLACES, birdsFor } from '../src/data/atmosphere.js';
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

test('grounded birds get a firm contact shadow while lifted birds keep a soft shadow', () => {
  const calls = [];
  const ctx = { fillStyle: '', fillRect(x, y, w, h) { calls.push({ x, y, w, h, color: this.fillStyle }); } };
  const songbird = Object.values(BIRD_SPECIES).find((sp) => sp.shape === 'song');
  drawBird(ctx, 10, 20, 2, false, songbird);
  assert.deepEqual(calls.slice(0, 2), [
    { x: 8, y: 21, w: 4, h: 1, color: 'rgba(0,0,0,.24)' },
    { x: 6, y: 22, w: 8, h: 1, color: 'rgba(0,0,0,.12)' },
  ]);

  calls.length = 0;
  drawBird(ctx, 10, 20, 4, false, songbird, 1);
  assert.deepEqual(calls[0], { x: 7, y: 21, w: 6, h: 1, color: 'rgba(0,0,0,.10)' });
});

// Roadmap 92b (Nuno): different birds on the island and in each biome, season and weather.
const kinds = (...a) => birdsFor(...a).map(([k]) => k).sort();
test('every species is drawn from a shape on the sheet, in three colours', () => {
  for (const [k, sp] of Object.entries(BIRD_SPECIES)) {
    assert.ok(BIRDS_SHEET.shapes.includes(sp.shape), `${k}'s shape is on the sheet`);
    assert.equal(sp.colors.length, 3, k);
  }
  for (const list of Object.values(BIRD_PLACES)) for (const [k] of list) assert.ok(BIRD_SPECIES[k], k);
  assert.ok(new Set(Object.values(BIRD_SPECIES).map((s) => s.shape)).size >= 5, 'five shapes, not one recoloured');
});
test('each place has its own birds', () => {
  assert.deepEqual(kinds('beach', 'Summer', 'sun'), ['gull']);
  assert.deepEqual(kinds('island', 'Summer', 'sun'), ['gull', 'lorikeet', 'parrot']);
  assert.deepEqual(kinds('desert', 'Summer', 'sun'), ['quail']);
  assert.ok(kinds('mountain', 'Summer', 'sun').includes('finch'));
  assert.ok(!kinds('farm', 'Summer', 'sun').includes('parrot') && !kinds('island', 'Summer', 'sun').includes('sparrow'));
  assert.deepEqual(kinds('mine', 'Summer', 'sun'), [], 'none underground');
});
test('seasons change who is about: robins in spring, blue tits in summer, bullfinches and crows in winter', () => {
  assert.ok(kinds('forest', 'Spring', 'sun').includes('robin'));
  assert.ok(kinds('farm', 'Summer', 'sun').includes('bluetit') && !kinds('farm', 'Winter', 'snow').includes('bluetit'));
  assert.ok(kinds('farm', 'Winter', 'snow').includes('bullfinch') && kinds('farm', 'Winter', 'snow').includes('crow'));
});
test('weather: no birds in a storm, only crows and gulls in rain and mist', () => {
  assert.deepEqual(kinds('farm', 'Autumn', 'storm'), []);
  assert.deepEqual(kinds('farm', 'Autumn', 'rain'), ['crow']);
  assert.deepEqual(kinds('beach', 'Spring', 'rain'), ['gull']);
  assert.deepEqual(kinds('forest', 'Summer', 'mist'), [], 'no hardy birds in the summer woods');
});

// Roadmap 92c (Nuno): birds pecked like they were on speed, and sat on top of ferns and other tall plants.
test('a bird pecks about once a second, not five times', async () => {
  const { PECK } = await import('../src/systems/atmosphere.js');
  let changes = 0, last = null;
  for (let t = 0; t < 10; t += 0.01) { const f = birdFrame({ mode: 'peck', peck: t, flee: false }); if (f !== last) changes++; last = f; }
  assert.ok(changes <= 2 * Math.ceil(10 / PECK.every) + 1, `${changes} head moves in 10 s`);
  assert.ok(changes >= 10, 'it still pecks');
});
test('birds land on bare ground or low cover, never in a fern or tall grass', async () => {
  const { faunaNow, TALL_COVER } = await import('../src/systems/atmosphere.js');
  const { coverKind } = await import('../src/render/scenery.js');
  const { runUpdaters } = await import('../src/core/registry.js');
  const { today } = await import('../src/core/time.js');
  freshFarm();
  let seen = 0;
  for (const map of ['forest', 'wilds', 'island', 'mountain', 'mere']) for (const day of [3, 31, 59]) {
    Object.assign(G.S, { map, day, weather: 'sun', time: 600, x: -999, y: -999 });
    runUpdaters(0.01);
    for (const b of faunaNow().birds) {
      seen++;
      const k = coverKind(map, Math.floor(b.x / 16), Math.floor((b.y - 10) / 16), today().season);
      assert.ok(!TALL_COVER.has(k), `${b.sp} on ${map} day ${day} stands in ${k}`);
    }
  }
  assert.ok(seen > 30, `${seen} birds checked`);
});

// Roadmap 92d (Nuno: "birds just completely vanish in thin air when it gets dark"): wildlife comes and goes
// gradually. Birds fly off at dusk and when the weather turns; new ones fly in when it improves; insects fade.
async function onFarm(time, weather = 'sun', day = 31) {
  const { runUpdaters } = await import('../src/core/registry.js');
  freshFarm();
  Object.assign(G.S, { map: 'farm', day, weather, time, x: -999, y: -999 });
  runUpdaters(0.01);
  return runUpdaters;
}
test('at dusk the birds fly off one by one; none are cut from the sky', async () => {
  const { faunaNow, BIRD_DAY } = await import('../src/systems/atmosphere.js');
  const run = await onFarm(17 * 60);
  const n = faunaNow().birds.length;
  assert.ok(n > 0);
  const seen = new Set();
  G.S.time = BIRD_DAY.leave[0] - 1; run(0.05);
  for (let m = BIRD_DAY.leave[0]; m <= BIRD_DAY.leave[1]; m += 2) {
    G.S.time = m;
    for (let i = 0; i < 20; i++) { run(0.05); for (const b of faunaNow().birds) if (b.flee) seen.add(b); }
    for (const b of faunaNow().birds) if (!b.flee) assert.ok(b.leaveAt > m, 'only birds whose time has not come stay');
  }
  assert.equal(seen.size, n, 'every bird took off: none simply vanished');
  for (let i = 0; i < 200; i++) run(0.05);
  assert.equal(faunaNow().birds.length, 0, 'gone once they have flown off the map');
});
test('arriving after dusk there are no birds; arriving by day there are', async () => {
  const { faunaNow } = await import('../src/systems/atmosphere.js');
  await onFarm(20 * 60, 'sun', 32);
  assert.equal(faunaNow().birds.length, 0);
  await onFarm(9 * 60, 'sun', 33);
  assert.ok(faunaNow().birds.length > 0);
});
test('when rain comes, the songbirds fly off and the rest of the wildlife is not rebuilt', async () => {
  const { faunaNow } = await import('../src/systems/atmosphere.js');
  const run = await onFarm(10 * 60, 'sun', 59);   // autumn: sparrows, robins, crows
  const before = faunaNow(), ids = [...before.birds];
  G.S.weather = 'rain'; run(0.05);
  assert.equal(faunaNow(), before, 'the same wildlife, not a new set');
  for (const b of ids) assert.equal(b.flee, b.sp !== 'crow', `${b.sp}: ${b.sp === 'crow' ? 'stays' : 'flies off'}`);
});
test('when the sky clears, new birds fly in and land', async () => {
  const { faunaNow } = await import('../src/systems/atmosphere.js');
  const run = await onFarm(10 * 60, 'storm', 31);
  assert.equal(faunaNow().birds.length, 0, 'none in a storm');
  G.S.weather = 'sun'; run(0.05);
  const birds = faunaNow().birds;
  assert.ok(birds.length > 0 && birds.every((b) => b.land), 'they come flying in');
  for (let i = 0; i < 200; i++) run(0.05);
  assert.ok(faunaNow().birds.every((b) => !b.land && !b.flee), 'and settle on the ground');
});
test('butterflies fade out as evening comes instead of vanishing', async () => {
  const { faunaNow } = await import('../src/systems/atmosphere.js');
  const run = await onFarm(17 * 60 + 59, 'sun', 30);
  assert.equal(faunaNow().fade.bugs, 1);
  G.S.time = 18 * 60 + 1; run(0.5);
  const f = faunaNow().fade.bugs;
  assert.ok(f > 0 && f < 1, `half faded: ${f}`);
  run(2);
  assert.equal(faunaNow().fade.bugs, 0);
});
