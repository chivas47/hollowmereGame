// v146: rain days. In rain or a storm the neighbours shelter (home, the Lantern, the clinic) instead of standing
// out in it; Juno and Kit go out anyway; a dry day is unchanged; nobody shares a tile indoors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleFor, rainDay } from '../src/data/schedules.js';
import { NPCS, RAIN_LINES } from '../src/data/npcs.js';
import { MAPS, SOLID } from '../src/data/maps.js';

const OUT = new Set(['farm', 'village', 'town', 'beach', 'forest', 'wilds', 'mere']);   // v161: the mere too
const week = [1, 2, 3, 4, 5, 6, 7];

test('in the rain nobody but Juno, Kit and Ferran has a block outdoors', () => {   // v161: Ferran's eels like the rain
  for (const def of NPCS) for (const d of week) {
    const wet = rainDay(def.id, scheduleFor(def, d));
    if (['juno', 'kit', 'ferran'].includes(def.id)) { assert.deepEqual(wet, scheduleFor(def, d)); continue; }
    for (const b of wet) assert.ok(!OUT.has(b.map), `${def.id} out in the rain on ${b.map}, day ${d}`);
  }
});

test('blocks already indoors stay as they were', () => {
  const corvin = NPCS.find((x) => x.id === 'corvin');
  assert.deepEqual(rainDay('corvin', scheduleFor(corvin, 1)), scheduleFor(corvin, 1));
  const maren = NPCS.find((x) => x.id === 'maren'), wet = rainDay('maren', scheduleFor(maren, 1));
  const clinic = wet.find((b) => b.from === 9 * 60).map;
  assert.ok(wet.some((b) => b.map === clinic && b.from === 15 * 60 && b.to === 18 * 60), 'the clinic stays open for the colds');
});

test('shelter spots are floor, and nobody shares one at the same time', () => {
  for (const d of week) for (let t = 6 * 60; t < 26 * 60; t += 10) {
    const seen = new Map();
    for (const def of NPCS) {
      const b = rainDay(def.id, scheduleFor(def, d)).find((x) => t >= x.from && t < x.to);
      if (!b || !b.stay || OUT.has(b.map)) continue;
      const [x, y] = b.path[b.path.length - 1], g = MAPS[b.map].grid;
      assert.ok(!SOLID.has(g[y][x]), `${def.id} on a solid tile ${x},${y} of ${b.map}`);
      const k = `${b.map}:${x},${y}`;
      assert.ok(!seen.has(k), `${def.id} and ${seen.get(k)} on ${k} at ${t}, day ${d}`);
      seen.set(k, def.id);
    }
  }
});

test('everyone has a rain line', () => {
  for (const def of NPCS) assert.ok(RAIN_LINES[def.id], def.id);
});
