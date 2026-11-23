// v306 (roadmap 99): forgiving Use. The tile in front first, then under you, then the side tiles; ground tools stay
// exact on farmland, the weapon everywhere, and any tool at something solid in front stays on it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState } from '../src/core/state.js';
import { T } from '../src/core/constants.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { HOTBAR, SLOT_COUNT } from '../src/data/hotbar.js';
import { addPrompt } from '../src/core/registry.js';
import { reachTiles, useTarget, inReach } from '../src/systems/reach.js';

// A test-only prompt: "something" on the tiles in SPOTS, and a tile-independent one while EVERY is set.
const SPOTS = new Set(); let EVERY = false;
addPrompt(1, ({ tx, ty, mapId }) => (SPOTS.has(`${mapId}:${tx},${ty}`) ? 'Pick it up' : null));
addPrompt(0, () => (EVERY ? 'Eat it' : null));

// An open 3 x 3 block of walkable tiles on a map (and the two rows above it), so nothing real is in reach.
function openSpot(id) {
  const g = MAPS[id].grid, open = (x, y) => g[y]?.[x] && !SOLID.has(g[y][x]);
  for (let y = 4; y < g.length - 2; y++) for (let x = 2; x < g[0].length - 2; x++) {
    if ([-3, -2, -1, 0, 1].every((j) => [-1, 0, 1].every((i) => open(x + i, y + j)))) return { x, y };
  }
}
function stand(id, at, dir, tool) {
  G.S = newState(); G.cut = null;
  Object.assign(G.S, { map: id, x: at.x * T + T / 2, y: at.y * T + 12, dir, slot: tool === 'item' ? SLOT_COUNT - 1 : HOTBAR.indexOf(tool) });
  SPOTS.clear(); EVERY = false;
}

test('nothing in reach: Use stays on the tile in front, as before', () => {
  const at = openSpot('village'); stand('village', at, 'up', 'pick');
  assert.deepEqual(useTarget(), { tx: at.x, ty: at.y - 1 });
});

test('something beside the tile in front, under you or beside you is reached; the tile in front wins first', () => {
  const at = openSpot('village'); stand('village', at, 'up', 'pick');
  SPOTS.add(`village:${at.x + 1},${at.y - 1}`);
  assert.deepEqual(useTarget(), { tx: at.x + 1, ty: at.y - 1 }, 'the front diagonal');
  SPOTS.add(`village:${at.x},${at.y}`);
  assert.deepEqual(useTarget(), { tx: at.x, ty: at.y }, 'under you comes before the diagonals');
  SPOTS.add(`village:${at.x},${at.y - 1}`);
  assert.deepEqual(useTarget(), { tx: at.x, ty: at.y - 1 }, 'the tile in front comes first');
  assert.ok(!reachTiles().some((t) => t.ty > at.y), 'never behind you');
});

test('a prompt that is the same on every tile (eating what you hold) does not pull Use sideways', () => {
  const at = openSpot('village'); stand('village', at, 'up', 'item');
  EVERY = true; SPOTS.add(`village:${at.x - 1},${at.y - 1}`);
  assert.deepEqual(useTarget(), { tx: at.x - 1, ty: at.y - 1 });
  SPOTS.clear();
  assert.deepEqual(useTarget(), { tx: at.x, ty: at.y - 1 });
});

test('ground tools stay exact on farmland, the weapon everywhere', () => {
  const farm = openSpot('farm'); stand('farm', farm, 'up', 'hoe');
  SPOTS.add(`farm:${farm.x + 1},${farm.y - 1}`);
  assert.deepEqual(useTarget(), { tx: farm.x, ty: farm.y - 1 });
  assert.equal(reachTiles().length, 2, 'in front and under you');
  const v = openSpot('village'); stand('village', v, 'up', 'hoe');
  assert.equal(reachTiles().length, 6, 'off the farm the hoe reaches like hands');
  stand('village', v, 'up', 'sword');
  assert.equal(reachTiles().length, 2);
});

test('the mouse or a tap reaches the eight tiles around you and your own', () => {
  const at = openSpot('village'); stand('village', at, 'down', 'item');
  assert.equal(inReach(at.x, at.y), true); assert.equal(inReach(at.x + 1, at.y - 1), true);
  assert.equal(inReach(at.x + 2, at.y), false);
});

test('a tool aimed at something solid stays on it (a pickaxe at a rock never climbs the ladder beside it)', () => {
  const g = MAPS.village.grid; let at;
  for (let y = 2; y < g.length - 1 && !at; y++) for (let x = 1; x < g[0].length - 1; x++)
    if (!SOLID.has(g[y][x]) && SOLID.has(g[y - 1][x]) && g[y - 1][x] !== undefined) { at = { x, y }; break; }
  stand('village', at, 'up', 'pick');
  SPOTS.add(`village:${at.x + 1},${at.y - 1}`);
  assert.deepEqual(useTarget(), { tx: at.x, ty: at.y - 1 });
  stand('village', at, 'up', 'item'); SPOTS.add(`village:${at.x + 1},${at.y - 1}`);
  assert.deepEqual(useTarget(), { tx: at.x + 1, ty: at.y - 1 }, 'empty-handed, the thing beside it');
});

test('the tile outline is kept for tools that need a precise tile, all of them real hotbar tools', async () => {
  const { REACH } = await import('../src/data/reach.js');
  assert.deepEqual(REACH.outline, ['hoe', 'can', 'seeds', 'kit']);
  for (const k of REACH.outline) assert.ok(HOTBAR.includes(k), k);
});
