// v331 (roadmap 114): rooms that feel lived in. Every piece belongs to a room set, collector's pieces come round in a
// weekly stock (the same on every farm, no save data), the farm keeps a collection, and old saves are credited with
// the furniture they already have.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { FURNITURE, SETS, WEEKLY } from '../src/data/furniture.js';
import { FURN_SHEET } from '../src/data/sprites.js';
import { weeklyStock, stockDaysLeft, onSale, buyFurniture, furniturePrice, COLLECTORS, setPieces, setOwned, collected, buyCatalogue } from '../src/systems/house.js';

test('every piece belongs to a room set, every set has enough to furnish a room, every shape has its art', () => {
  for (const [k, f] of Object.entries(FURNITURE)) { assert.ok(SETS[f.set], `${k}: set ${f.set}`); assert.ok(FURN_SHEET.order.includes(f.shape), `${k}: ${f.shape}`); }
  for (const s of Object.keys(SETS)) assert.ok(setPieces(s).length >= 4, `${s}: ${setPieces(s).length} pieces`);
  assert.ok(Object.keys(FURNITURE).length >= 74);
  assert.ok(COLLECTORS.length >= 12);
});

test('the weekly stock holds all week, changes the next, and every collector\'s piece comes round once a round', () => {
  for (let d = 1; d <= WEEKLY.days; d++) assert.deepEqual(weeklyStock(d), weeklyStock(1));
  assert.notDeepEqual(weeklyStock(WEEKLY.days + 1), weeklyStock(1));
  assert.equal(stockDaysLeft(1), WEEKLY.days); assert.equal(stockDaysLeft(WEEKLY.days), 1);
  const round = Math.ceil(COLLECTORS.length / WEEKLY.pieces);
  for (const start of [0, round, 5 * round]) {
    const seen = [];
    for (let w = start; w < start + round; w++) { const st = weeklyStock(w * WEEKLY.days + 1); assert.ok(st.length > 0 && st.length <= WEEKLY.pieces); seen.push(...st); }
    assert.deepEqual([...seen].sort(), [...COLLECTORS].sort(), `round from week ${start}`);
  }
});

const farm = (over = {}) => { G.S = Object.assign(newState(), { gold: 100000, day: 1 }, over); return G.S; };

test('a collector\'s piece is on sale only in its week, then for good once collected', () => {
  const S = farm(), inStock = weeklyStock(1)[0], away = COLLECTORS.find((k) => !weeklyStock(1).includes(k));
  assert.equal(onSale(away, S), false);
  assert.equal(buyFurniture(away), false, 'not this week');
  assert.ok(buyFurniture(inStock));
  assert.ok(S.house.owned.includes(inStock));
  S.day = 1 + WEEKLY.days * 50;
  if (!weeklyStock(S.day).includes(inStock)) assert.ok(onSale(inStock, S), 'owned: on sale any week');
  assert.ok(buyFurniture(inStock), 'a second one');
  assert.equal(S.house.owned.filter((k) => k === inStock).length, 1, 'collected once');
});

test('the full catalogue makes the rest free but not the collector\'s pieces', () => {
  const S = farm({ gold: 200000 });
  assert.ok(buyCatalogue());
  const plain = Object.keys(FURNITURE).find((k) => !FURNITURE[k].stock), col = weeklyStock(1)[0];
  assert.equal(furniturePrice(plain, S), 0);
  assert.equal(furniturePrice(col, S), FURNITURE[col].cost);
});

test('buying the last piece of a set completes it, and the collection counts every piece once', () => {
  const S = farm({ gold: 1e7 });
  const set = 'kitchen', always = setPieces(set).filter((k) => !FURNITURE[k].stock), cols = setPieces(set).filter((k) => FURNITURE[k].stock);
  for (const k of always) assert.ok(buyFurniture(k), k);
  assert.equal(setOwned(set, S), always.length);
  S.house.owned.push(...cols);   // as if bought in earlier weeks
  assert.equal(setOwned(set, S), setPieces(set).length);
  const c = collected(S);
  assert.equal(c.total, Object.keys(FURNITURE).length);
  assert.equal(c.owned, setPieces(set).length);
});

test('save step 9: an old farm\'s collection starts with the furniture it has placed or in its kit', () => {
  const old = JSON.parse(JSON.stringify(newState()));
  old.v = 8; delete old.house.owned;
  old.placed = { 'house:5,5': { kind: 'oakchair' }, 'farm:3,9': { kind: 'sprinkler' }, 'attic:2,2': { kind: 'bookcase', rot: 1 } };
  old.kit.hearth = 1; old.kit.globe = 0;
  const s = merge(old);
  assert.deepEqual([...s.house.owned].sort(), ['bookcase', 'hearth', 'oakchair']);
  assert.deepEqual(merge(JSON.parse(JSON.stringify(s))).house.owned.sort(), ['bookcase', 'hearth', 'oakchair'], 'kept through a save and load');
  const young = JSON.parse(JSON.stringify(newState()));
  assert.deepEqual(merge(young).house.owned, [], 'a new farm owns nothing');
});
