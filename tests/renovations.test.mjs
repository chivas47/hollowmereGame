// v170 (roadmap 75n): the corner room, a 20,000g renovation that opens a 4 by 3 room off the living room's west side.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState } from '../src/core/state.js';
import { houseGrid, MAPS } from '../src/data/maps.js';
import { RENOVATIONS } from '../src/data/furniture.js';
import { buyRenovation } from '../src/systems/house.js';

const floor = (g) => g.flat().filter((c) => c === 'h').length;

test('the corner room costs 20,000g and adds twelve tiles of floor joined to the living room, at every house tier', () => {
  assert.equal(RENOVATIONS.corner.cost, 20000);
  for (const tier of [0, 1, 2, 3]) {
    const before = houseGrid(tier, []), after = houseGrid(tier, ['corner']);
    assert.equal(floor(after) - floor(before), 13, `tier ${tier}: 12 tiles and the doorway`);
    assert.equal(after[11][5], 'h'); assert.equal(after[11][6], 'h', 'the doorway opens onto the living room');
    for (let y = 3; y <= 8; y++) for (let x = 0; x < 24; x++) assert.equal(after[y][x], before[y][x], `nothing above the room moves (${x},${y})`);
    assert.equal(after[12][11], 'E', 'the front door stays');
  }
});

test('buying it takes the gold once and opens the room in the farmhouse', () => {
  G.S = newState(); G.S.gold = 25000;
  assert.ok(buyRenovation('corner')); assert.equal(G.S.gold, 5000);
  assert.equal(MAPS.house.grid[12][2], 'h');
  assert.ok(!buyRenovation('corner'), 'once');
});

// v171 (roadmap 75o): the south room, 30,000g, through the living room's south wall east of the front door.
test('the south room costs 30,000g and adds fifteen tiles below the living room, joined by a doorway', () => {
  assert.equal(RENOVATIONS.south.cost, 30000);
  for (const tier of [0, 1, 2, 3]) {
    const before = houseGrid(tier, []), after = houseGrid(tier, ['south']);
    assert.equal(floor(after) - floor(before), 17, `tier ${tier}: 15 tiles and a two-deep doorway`);
    assert.equal(after[11][15], 'h'); assert.equal(after[12][15], 'h'); assert.equal(after[13][15], 'h'); assert.equal(after[14][15], 'h');
    assert.equal(after[12][11], 'E', 'the front door stays');
    for (let y = 0; y <= 11; y++) for (let x = 0; x < 24; x++) assert.equal(after[y][x], before[y][x], `nothing above moves (${x},${y})`);
  }
});

// v172 (roadmap 75p): the attic, 60,000g: a ladder in the bed corner up to a 16 by 7 loft for furniture and chests.
import { emit } from '../src/core/events.js';
import { runInteractions } from '../src/core/registry.js';
import '../src/systems/attic.js';
import { ATTIC } from '../src/systems/attic.js';
test('the attic: 60,000g, a ladder only once bought, up and down again, and floor for 112 tiles', () => {
  assert.equal(RENOVATIONS.attic.cost, 60000);
  assert.equal(houseGrid(0, [])[2][9], 'I', 'no ladder before');
  assert.equal(houseGrid(0, ['attic'])[2][9], ATTIC.tile);
  assert.equal(MAPS.attic.grid.flat().filter((c) => c === 'h').length, 16 * 7);
  G.S = newState(); G.S.gold = 60000; G.S.map = 'house';
  assert.ok(buyRenovation('attic')); assert.equal(G.S.gold, 0);
  assert.ok(runInteractions({ tx: 9, ty: 2, tile: ATTIC.tile, mapId: 'house' })); assert.equal(G.S.map, 'attic');
  assert.ok(runInteractions({ tx: 11, ty: 10, tile: ATTIC.tile, mapId: 'attic' })); assert.equal(G.S.map, 'house');
  G.S.map = 'attic'; G.S.house.renos = []; emit('game:loaded'); assert.equal(G.S.map, 'house', 'no attic, back in the house');
});
