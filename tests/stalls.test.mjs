// v165 (roadmap 75f): the Saturday stalls: funded at the quest board for good, open Saturday mornings, one
// neighbour's goods a week at twice their sell price.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { MAPS } from '../src/data/maps.js';
import { ITEMS } from '../src/data/items.js';
import { STALLS } from '../src/data/stalls.js';
import { PROJECTS } from '../src/data/projects.js';
import { fundProject } from '../src/systems/projects.js';
import { stallsOpen, sellerOf, buyStall, stallPrice, STALL } from '../src/systems/stalls.js';
import { freshFarm } from './setup.mjs';

const SATURDAY = 6, MONDAY = 1;   // (day - 1) % 7: 5 is Saturday

test('funding the project raises the stall on the green, at 25,000g and 100 wood', () => {
  freshFarm({ gold: 30000 }); G.S.bag.wood = 100;
  assert.equal(PROJECTS.stalls.cost, 25000);
  assert.ok(fundProject('stalls')); emit('state:changed');
  for (const [x, y] of STALLS.tiles) assert.equal(MAPS.town.grid[y][x], STALL);
  assert.equal(G.S.gold, 5000); assert.equal(G.S.bag.wood, 0);
});

test('open Saturdays 9 till 2 once built, shut otherwise', () => {
  freshFarm({ day: SATURDAY, time: 10 * 60 }); assert.ok(!stallsOpen(), 'not before it is built');
  G.S.projects.stalls = true; assert.ok(stallsOpen());
  Object.assign(G.S, { day: MONDAY }); assert.ok(!stallsOpen(), 'Saturdays only');
  Object.assign(G.S, { day: SATURDAY, time: 15 * 60 }); assert.ok(!stallsOpen(), 'mornings only');
});

test('a different neighbour each week, their goods at twice the sell price', () => {
  assert.notEqual(sellerOf(SATURDAY).npc, sellerOf(SATURDAY + 7).npc);
  freshFarm({ day: SATURDAY, time: 10 * 60, gold: 10000 }); G.S.projects.stalls = true;
  const s = sellerOf(SATURDAY), item = s.items[0], before = G.S.bag[item] || 0;
  assert.equal(stallPrice(item), ITEMS[item].sell * 2);
  assert.ok(buyStall(item)); assert.equal(G.S.bag[item], before + 1); assert.equal(G.S.gold, 10000 - ITEMS[item].sell * 2);
  const other = STALLS.sellers.find((x) => x !== s).items.find((k) => !s.items.includes(k));
  assert.ok(!buyStall(other), 'not this week\'s goods');
});
