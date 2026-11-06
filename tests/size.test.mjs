// v157 (roadmap 75h): the rules at any size. A map larger than the screen (48 x 32 here) is walked, spawned on and
// built on to its own edges, not the screen's.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T, W, H } from '../src/core/constants.js';
import { MAPS } from '../src/data/maps.js';
import { tilePath } from '../src/systems/routes.js';
import { slimes, spawnSlimes } from '../src/systems/monsters.js';
import { noFit } from '../src/systems/sites.js';
import { GROVE } from '../src/data/hidden.js';
import { VIGNETTES } from '../src/data/vignettes.js';
import { freshFarm } from './setup.mjs';

const BW = W * 2, BH = H * 2;
const field = () => Array.from({ length: BH }, (_, y) => Array.from({ length: BW }, (_, x) => (x === 0 || y === 0 || x === BW - 1 || y === BH - 1 ? 'T' : 'g')));
beforeEach(() => { freshFarm(); MAPS.big = { name: 'Test field', grid: field(), exits: {}, objects: [] }; });

test('neighbours find their way across a map larger than the screen', () => {
  try {
    const path = tilePath('big', [1, 1], [BW - 2, BH - 2]);
    assert.ok(path);
    assert.deepEqual(path[path.length - 1], [BW - 2, BH - 2]);
  } finally { delete MAPS.big; }
});

test('slimes spawn over the whole of a large map, on open grass and inside its edges', () => {
  try {
    Object.assign(G.S, { map: 'big', x: 8, y: 8 });
    spawnSlimes('big', 40);
    assert.equal(slimes.length, 40);
    for (const s of slimes) {
      const tx = Math.floor(s.x / T), ty = Math.floor(s.y / T);
      assert.equal(MAPS.big.grid[ty][tx], 'g');
    }
    assert.ok(slimes.some((s) => s.x >= W * T || s.y >= H * T), 'some beyond the first screen');
  } finally { delete MAPS.big; slimes.length = 0; }
});

test('a building fits anywhere on a larger farm, up to its own edges', () => {
  const was = MAPS.farm.grid;
  assert.ok(noFit('shed', W, 8), 'past the screen edge of today\'s farm: no room');
  try {
    MAPS.farm.grid = was.map((row, y) => [...row.map((t, x) => (x === W - 1 || y === H - 1 ? 'g' : t)), ...Array(W).fill('g')])
      .concat(Array.from({ length: H }, () => Array(BW).fill('g')));
    MAPS.farm.grid.forEach((row, y) => { row[BW - 1] = 'T'; if (y === BH - 1) row.fill('T'); });
    assert.equal(noFit('shed', W + 10, H + 10), null);
    assert.ok(noFit('shed', BW - 2, H + 10), 'still kept off the edge');
  } finally { MAPS.farm.grid = was; }
});

// v158 (roadmap 75i): the grove grew east and south to 40 x 24, so nothing a save holds there moved: the stumps,
// the cairn and the old pond keep their tiles, and the way in from Brackenwood lands at its new east edge.
test('the grove grew without moving anything a save holds', () => {
  const g = MAPS.grove.grid;
  assert.deepEqual([g[0].length, g.length], [40, 24]);
  for (const [x, y] of GROVE.stumps) assert.ok(['g', 'Y'].includes(g[y][x]), `stump ${x},${y}`);
  for (const v of VIGNETTES.grove) assert.equal(g[v.y][v.x], 'g', `the ${v.art}`);
  assert.equal(g[6][6], 'O');                                         // the old pond and its falls
  assert.deepEqual(MAPS.forest.exits['0,12'], { to: 'grove', x: 38, y: 12, dir: 'left' });
  assert.equal(MAPS.grove.exits['39,12'].to, 'forest');
});
