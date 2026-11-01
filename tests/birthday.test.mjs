// v174 (roadmap 75r): the farmer's birthday and the birthday dinner.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { dateParts } from '../src/core/time.js';
import { DINNER, dinnerGuests, dinnerSeat, validBirthday } from '../src/data/birthday.js';
import { setBirthday, holdDinner } from '../src/systems/birthday.js';
import { MAPS, houseGrid } from '../src/data/maps.js';

const birthdayDay = (season, d) => { for (let day = 1; day <= 112; day++) { const t = dateParts(day); if (t.season === season && t.d === d) return day; } };
const ready = () => {
  G.S = newState(); G.S.upgrades.house = 1; G.S.house.renos = ['dining'];
  Object.assign(G.S.npcs.nell, { pts: 900 }); Object.assign(G.S.npcs.rook, { pts: 600 }); Object.assign(G.S.npcs.kit, { pts: 600 });
  Object.assign(G.S.npcs.ines, { pts: 500 }); Object.assign(G.S.npcs.bram, { pts: 300 });
  setBirthday('Summer', 5); G.S.day = birthdayDay('Summer', 5);
};

test('a birthday is a real day that is not a festival; old saves have none', () => {
  assert.ok(validBirthday('Summer', 5)); assert.ok(!validBirthday('Spring', 9), 'the Blossom Show'); assert.ok(!validBirthday('Spring', 0)); assert.ok(!validBirthday('Moon', 3));
  assert.equal(merge({}).birthday, null); assert.equal(merge({}).dinnerYear, 0);
});

test('the three closest friends at 4+ hearts come, each to a seat at the table', () => {
  ready();
  const date = dateParts(G.S.day), guests = dinnerGuests(G.S, date);
  assert.deepEqual(guests, ['nell', 'kit', 'rook']);
  const grid = houseGrid(1, ['dining']);
  for (const id of guests) { const [x, y] = dinnerSeat(G.S, date, id); assert.equal(grid[y][x], 'h', `${id} sits on open floor`); }
  assert.equal(dinnerSeat(G.S, date, 'ines'), null, 'the fourth stays home');
  G.S.house.renos = []; assert.deepEqual(dinnerGuests(G.S, date), [], 'no dining room, no dinner');
  G.S.house.renos = ['dining']; G.S.day += 1; assert.deepEqual(dinnerGuests(G.S, dateParts(G.S.day)), [], 'only on the day');
});

test('the dinner gives each guest a heart and leaves a gift, once a year', () => {
  ready(); G.S.time = DINNER.from + 30; G.S.map = 'house';
  const bag = Object.values(G.S.bag).reduce((a, b) => a + b, 0);
  assert.ok(holdDinner());
  assert.equal(G.S.npcs.nell.pts, 1000); assert.equal(G.S.npcs.rook.pts, 700); assert.equal(G.S.npcs.ines.pts, 500);
  assert.equal(Object.values(G.S.bag).reduce((a, b) => a + b, 0), bag + 3);
  assert.ok(!holdDinner(), 'once');
});
