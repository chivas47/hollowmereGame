// v321 (roadmap 112b): Wide acres, the 64 x 48 farm. The homestead corner is the same as the open field's, the land
// keeps room to farm, and a new farm on it starts with six times the clutter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { newState } from '../src/core/state.js';
import { MAPS, farmGrid } from '../src/data/maps.js';
import { LAYOUTS, farmSize } from '../src/data/layouts.js';
import { START_CLUTTER } from '../src/data/clearing.js';
import '../src/systems/layouts.js';
import '../src/systems/clearing.js';

test('Wide acres is 64 x 48 and keeps the open field homestead corner as it is', () => {
  assert.deepEqual(farmSize('wide'), { w: 64, h: 48 });
  const open = farmGrid(), wide = farmGrid(64, 48); LAYOUTS.wide.apply(wide);
  for (let y = 0; y < 13; y++) for (let x = 0; x < 22; x++) assert.equal(wide[y][x], open[y][x], `${x},${y}`);
});

test('Wide acres has eight times the open field and far more tillable grass', () => {
  const count = (g) => g.flat().filter((t) => t === 'g').length;
  const open = farmGrid(), wide = farmGrid(64, 48); LAYOUTS.wide.apply(wide);
  assert.ok(count(wide) > 6 * count(open), `${count(wide)} grass tiles against ${count(open)}`);
  assert.ok(wide.flat().filter((t) => t === 'O').length >= 40, 'two ponds to fish');
});

test('a new farm on Wide acres starts with six times the clutter, an open field with the usual', () => {
  const scattered = (layout) => {
    G.S = newState(); G.S.layout = layout; G.S.debris = undefined;
    emit('game:loaded');
    return Object.values(G.S.debris).filter((d) => d.kind !== 'grass').length;
  };
  const base = Object.entries(START_CLUTTER.new).filter(([k]) => k !== 'grass').reduce((n, [, v]) => n + v, 0);
  assert.equal(scattered('open'), base);
  assert.equal(scattered('wide'), base * LAYOUTS.wide.perks.clutter);
  assert.equal(MAPS.farm.grid.length, 48);
  scattered('open');   // and back: a smaller farm loads after a larger one without tripping over the old tiles
});
