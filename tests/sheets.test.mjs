// v297: the preloaded sheet list matches the PNGs in assets/sprites/, so a new sheet is not left to load mid-play.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { SHEET_FILES } from '../src/data/sprites.js';
import { missingWhile, ready } from '../src/render/sheets.js';

test('SHEET_FILES lists every sprite sheet PNG', () => {
  const pngs = readdirSync(new URL('../assets/sprites/', import.meta.url)).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort();
  assert.deepEqual([...SHEET_FILES].sort(), pngs);
});

test('missingWhile notes the sheets a drawing asked for that had not loaded', () => {
  const { value, missing } = missingWhile(() => { ready('trees'); missingWhile(() => ready('props')); return 7; });
  assert.equal(value, 7);
  assert.deepEqual([...missing].sort(), ['props', 'trees']);   // a nested drawing's misses count for the outer one too
});

// v298: the mine names its own map when its tiles change, so the renderer keeps every other map it has drawn.
test('a mine floor and a broken rock redraw only the mine', async () => {
  const { G } = await import('../src/core/game.js');
  const { newState } = await import('../src/core/state.js');
  const { on } = await import('../src/core/events.js');
  const { MAPS } = await import('../src/data/maps.js');
  const { enterMine, breakRock } = await import('../src/systems/mine.js');
  G.S = newState();
  const seen = [];
  on('world:changed', (ids) => seen.push(ids));
  enterMine(3);
  assert.ok(seen.length && seen.every((ids) => ids === 'mine'), JSON.stringify(seen));
  const g = MAPS.mine.grid, rocks = Object.keys((await import('../src/systems/mine.js')).MINE.rocks);
  assert.ok(rocks.length, 'floor 3 has rocks');
  {
    seen.length = 0;
    const [x, y] = rocks[0].split(',').map(Number);
    G.S.energy = 270; for (let i = 0; i < 20 && g[y][x] !== 'f' && g[y][x] !== 'L' && g[y][x] !== '!'; i++) breakRock(x, y, true);
    assert.ok(seen.includes('mine') && seen.every((ids) => ids === 'mine'), JSON.stringify(seen));
  }
});
