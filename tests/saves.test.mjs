// Saves from earlier versions, made by playing each version's own balance simulator (tests/saves/),
// and how the game writes and reads the browser's storage.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { on } from '../src/core/events.js';
import { SAVE_KEY } from '../src/core/constants.js';
import { newState, merge, save, load, restoreMorning, slotInfo, useSlot, currentSlot } from '../src/core/state.js';
import { SAVE_VERSION } from '../src/core/migrations.js';

const OLD = ['v15', 'v50', 'v90', 'v117'];
const saved = (name) => JSON.parse(readFileSync(new URL(`saves/${name}.json`, import.meta.url)));

for (const name of OLD) {
  test(`a ${name} save loads with every current field and keeps its farm`, () => {
    const old = saved(name), s = merge(old);
    for (const k of Object.keys(newState())) assert.ok(k in s, `missing ${k}`);
    assert.equal(s.v, SAVE_VERSION);
    assert.equal(s.day, old.day);
    assert.equal(s.gold, old.gold);
    assert.equal(s.chickens.length, old.chickens.length);
  });

  test(`a ${name} save loads the same when loaded again`, () => {
    const once = merge(saved(name));
    assert.deepEqual(merge(JSON.parse(JSON.stringify(once))), once);
  });
}

test('a v15 save gets the upgrades it predates', () => {
  const old = saved('v15'), s = merge(old);
  assert.equal(s.coopGoods.egg, old.eggs);   // v28: loose eggs into coop goods
  assert.equal(s.eggs, 0);
  assert.equal(s.ranch.pail, true);          // v28: its barn keeps milking
  assert.equal(s.earned, old.gold);          // v32: gold on hand stands in
  assert.ok(s.mailRead.includes('welcome')); // v48: no welcome letter
});

test('a save already at the current version skips the upgrades', () => {
  const s = merge({ v: SAVE_VERSION, day: 10, gold: 5, eggs: 3 });
  assert.equal(s.eggs, 3);
  assert.equal(s.earned, 0);
});

// A stand-in for the browser's localStorage; full: true makes every write fail like a full disk.
function fakeStorage({ full = false } = {}) {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (full) throw new Error('QuotaExceededError'); m.set(k, String(v)); },
  };
}
const toasts = [];
on('toast', (msg) => toasts.push(msg));
beforeEach(() => { toasts.length = 0; G.S = newState(); });

test('a save during the day keeps this morning\'s copy as it was', () => {
  globalThis.localStorage = fakeStorage();
  G.S.gold = 100; save({ night: true });
  G.S.gold = 40; save();
  assert.equal(load().gold, 40);
  assert.equal(restoreMorning().gold, 100);
  delete globalThis.localStorage;
});

test('a damaged live save falls back to this morning', () => {
  globalThis.localStorage = fakeStorage();
  G.S.gold = 100; save({ night: true });
  localStorage.setItem(SAVE_KEY, '{"day": 3, "gold"');
  assert.equal(load().gold, 100);
  delete globalThis.localStorage;
});

test('with no save at all a new farm starts', () => {
  globalThis.localStorage = fakeStorage();
  assert.deepEqual(load(), newState());
  assert.equal(restoreMorning(), null);
  delete globalThis.localStorage;
});

test('a save that fails tells the player', () => {
  globalThis.localStorage = fakeStorage({ full: true });
  save();
  assert.equal(toasts.length, 1);
  assert.match(toasts[0], /could not be saved/);
  assert.equal(localStorage.getItem(`${SAVE_KEY}-morning`), null);
  delete globalThis.localStorage;
});

test('slot 1 is where every older save already lives', () => {
  globalThis.localStorage = fakeStorage();
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...newState(), gold: 777 }));
  assert.equal(currentSlot(), 1);
  assert.equal(load().gold, 777);
  delete globalThis.localStorage;
});

test('each slot keeps its own farm and morning copy, and an empty one starts a new farm', () => {
  globalThis.localStorage = fakeStorage();
  G.S.gold = 100; save({ night: true });                                   // slot 1
  assert.equal(useSlot(2).profile, null);                                  // empty: a new farm
  assert.equal(slotInfo(2), null);
  G.S = newState(); G.S.gold = 5; G.S.profile = { name: 'B', farm: 'Ash' }; save({ night: true });
  assert.deepEqual(slotInfo(2), { farm: 'Ash', name: 'B', day: 1, gold: 5 });
  assert.equal(useSlot(1).gold, 100);
  assert.equal(restoreMorning().gold, 100);
  assert.equal(useSlot(2).gold, 5);
  assert.equal(localStorage.getItem('hollowmere-slot'), '2');              // remembered for the next visit
  useSlot(1);
  delete globalThis.localStorage;
});
