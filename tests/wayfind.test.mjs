// v312 (roadmap 104): arrows for the first week's goals. Off the goal's map the arrow is at the exit that starts the
// shortest way there; on it, at the thing to do (a dry seed, a neighbour, forage, the bin, the cave mouth).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState } from '../src/core/state.js';
import { T } from '../src/core/constants.js';
import { MAPS } from '../src/data/maps.js';
import { FIRST_WEEK } from '../src/data/firstweek.js';
import { exitToward, doorOf } from '../src/systems/wayfind.js';
import { weekAim } from '../src/systems/firstweek.js';

const at = (k) => { const [tx, ty] = k.split(',').map(Number); return { tx, ty }; };
const exitTo = (from, to) => at(Object.entries(MAPS[from].exits).find(([, e]) => e.to === to)[0]);

test('the way between maps starts at the right exit, over more than one map', () => {
  assert.deepEqual(exitToward('farm', 'village'), exitTo('farm', 'village'));
  assert.deepEqual(exitToward('farm', 'town'), exitTo('farm', 'village'), 'the town is through the village');
  assert.deepEqual(exitToward('village', 'wilds'), exitTo('village', 'farm'), 'the Wilds are through the farm');
  assert.deepEqual(exitToward('house', 'town'), exitTo('house', 'farm'), 'out of the front door first');
  assert.equal(exitToward('farm', 'farm'), null);
});

test('a building door is the middle of its bottom row', () => {
  assert.deepEqual(doorOf('wilds', 'M'), { tx: 12, ty: 1 });
  assert.equal(MAPS.farm.grid[doorOf('farm', 'B').ty][doorOf('farm', 'B').tx], 'B');
});

// The farm with the goals before `id` done, standing at the farmhouse door on `map`.
function goalDay(id, map = 'farm') {
  const S = newState(), i = FIRST_WEEK.findIndex((g) => g.id === id);
  S.firstWeek.arrived = true; S.firstWeek.guide.off = true; S.day = i + 1;
  FIRST_WEEK.slice(0, i).forEach((g) => { S.firstWeek.done[g.id] = 1; });
  Object.assign(S, { map, x: 3 * T + 8, y: 4 * T + 12, dir: 'down' });
  G.S = S; return S;
}

test('each goal from day 2 points somewhere useful', () => {
  let S = goalDay('water'); S.soil['5,6'] = { w: false, crop: { type: 'turnip', age: 1 } };
  assert.deepEqual(weekAim(S), { tx: 5, ty: 6 }, 'water: the dry seed');
  S = goalDay('hello'); assert.deepEqual(weekAim(S), exitTo('farm', 'village'), 'hello: the way to the village');
  S = goalDay('wild'); assert.deepEqual(weekAim(S), exitTo('farm', 'wilds'), 'wild: the way to the Wilds');
  S.map = 'wilds'; S.x = 2 * T + 8; S.forage = [{ x: 9, y: 9, type: 'leek' }, { x: 30, y: 12, type: 'leek' }];
  assert.deepEqual(weekAim(S), { tx: 9, ty: 9 }, 'in the Wilds: the nearest forage');
  S = goalDay('sell'); assert.equal(MAPS.farm.grid[weekAim(S).ty][weekAim(S).tx], 'B', 'sell: the shipping bin');
  S = goalDay('town', 'village'); assert.deepEqual(weekAim(S), exitTo('village', 'town'), 'town: north out of the village');
  S = goalDay('hollow', 'wilds'); assert.deepEqual(weekAim(S), { tx: 12, ty: 1 }, 'the Hollow: the cave mouth');
});
