// v164 (roadmap 75f): Pudding, the village cat: where she is follows the date and the hour, so a reload shows the
// same cat; she is in at night and in wet or snowy weather, naps in the afternoon and walks between her spots.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catAt } from '../src/systems/cat.js';
import { CAT } from '../src/data/atmosphere.js';
import { MAPS } from '../src/data/maps.js';

test('her spots are in the village, on a bench, the hedge or open ground', () => {
  for (const [x, y] of CAT.spots) assert.ok(['ƀ', 'ħ', 'P', 'g'].includes(MAPS[CAT.map].grid[y][x]), `${x},${y}`);
});

test('the same day and hour put her in the same place; she is in at night and in rain or snow', () => {
  assert.deepEqual(catAt(9, 10 * 60), catAt(9, 10 * 60));
  assert.equal(catAt(9, 6 * 60), null); assert.equal(catAt(9, 21 * 60), null);
  assert.equal(catAt(9, 10 * 60, 'rain'), null); assert.equal(catAt(9, 10 * 60, 'snow'), null);
});

test('she naps in the afternoon and walks to a new spot at the start of a block', () => {
  assert.equal(catAt(9, 14 * 60).asleep, true);
  assert.equal(catAt(9, 10 * 60).asleep, false);
  const start = CAT.from + CAT.every;   // the second block: on her way, unless both blocks drew the same spot
  const days = [...Array(30)].map((_, d) => catAt(d + 1, start + 5));
  assert.ok(days.some((p) => p.moving), 'on some day she is on the move between spots');
});
