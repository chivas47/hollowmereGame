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
