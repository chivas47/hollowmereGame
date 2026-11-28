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

test('each goal from day 2 points somewhere useful', async () => {
  let S = goalDay('water'); S.soil['5,6'] = { w: false, crop: { type: 'turnip', age: 1 } };
  assert.deepEqual(weekAim(S), { tx: 5, ty: 6 }, 'water: the dry seed');
  const { NPCRT } = await import('../src/systems/npcs.js'); const { forgetNeighbour } = await import('../src/systems/firstweek.js');
  for (const n of NPCRT) Object.assign(n, { map: 'farm', visible: false, inside: true });
  Object.assign(NPCRT[0], { map: 'village', x: 20 * T + 8, y: 12 * T + 12, visible: true, inside: false }); forgetNeighbour();
  S = goalDay('hello'); assert.deepEqual(weekAim(S), exitTo('farm', 'village'), 'hello: the way to the neighbour out in the village');
  S = goalDay('wild'); assert.deepEqual(weekAim(S), exitTo('farm', 'wilds'), 'wild: the way to the Wilds');
  S.map = 'wilds'; S.x = 2 * T + 8; S.forage = [{ x: 9, y: 9, type: 'leek' }, { x: 30, y: 12, type: 'leek' }];
  assert.deepEqual(weekAim(S), { tx: 9, ty: 9 }, 'in the Wilds: the nearest forage');
  S = goalDay('sell'); assert.equal(MAPS.farm.grid[weekAim(S).ty][weekAim(S).tx], 'B', 'sell: the shipping bin');
  S = goalDay('town', 'village'); assert.deepEqual(weekAim(S), exitTo('village', 'town'), 'town: north out of the village');
  S = goalDay('hollow', 'wilds'); assert.deepEqual(weekAim(S), { tx: 12, ty: 1 }, 'the Hollow: the cave mouth');
});

test('skipping the first-day guide also hides the first-week goal pointer', () => {
  const S = goalDay('plant');
  assert.ok(weekAim(S), 'the goal pointer is available before skipping');
  S.firstWeek.guide.skipped = true;
  assert.equal(weekAim(S), null);
});

test('Say hello keeps one neighbour: not swapped for someone nearer, followed off the map, chosen again once indoors', async () => {
  const { NPCRT } = await import('../src/systems/npcs.js');
  const { forgetNeighbour, chosenNeighbour } = await import('../src/systems/firstweek.js');
  const S = goalDay('hello', 'village'); S.x = 20 * T + 8; S.y = 12 * T + 12;
  for (const n of NPCRT) Object.assign(n, { map: 'farm', visible: false, inside: true });
  const [a, b] = NPCRT;
  const put = (n, map, x, y) => Object.assign(n, { map, x: x * T + 8, y: y * T + 12, visible: true, inside: false });
  forgetNeighbour();
  put(a, 'village', 24, 12); put(b, 'village', 30, 12);
  assert.deepEqual(weekAim(S), { tx: 24, ty: 12 }, 'the nearest is chosen');
  put(b, 'village', 21, 12);
  assert.deepEqual(weekAim(S), { tx: 24, ty: 12 }, 'someone walking closer does not take the arrow');
  put(a, 'town', 10, 10);
  assert.deepEqual(weekAim(S), exitTo('village', 'town'), 'the chosen one walks to town: the arrow shows the way after them');
  a.inside = true;
  assert.deepEqual(weekAim(S), { tx: 21, ty: 12 }, 'once they are indoors, the nearest other one');
  assert.equal(chosenNeighbour(S).id, b.id);
});

test('a neighbour out where you are is pointed at, even off the village (anyone can be greeted)', async () => {
  const { NPCRT } = await import('../src/systems/npcs.js');
  const { forgetNeighbour } = await import('../src/systems/firstweek.js');
  const S = goalDay('hello', 'town'); S.x = 20 * T + 8; S.y = 8 * T + 12;
  for (const n of NPCRT) Object.assign(n, { map: 'farm', visible: false, inside: true });
  Object.assign(NPCRT[0], { map: 'town', x: 15 * T + 8, y: 8 * T + 12, visible: true, inside: false });
  forgetNeighbour();
  assert.deepEqual(weekAim(S), { tx: 15, ty: 8 });
});
