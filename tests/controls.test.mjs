// Key bindings: defaults, names on screen, rebinding with swaps, and keeping the choice per browser.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { keysOf, actionOf, keyName, nameOfKey, bind, unbindSecond, resetControls } from '../src/core/controls.js';
import { CONTROLS } from '../src/data/controls.js';

beforeEach(() => resetControls());

test('every action starts with a key, and no key does two things', () => {
  const all = CONTROLS.flatMap((c) => keysOf(c.id));
  for (const c of CONTROLS) assert.ok(keysOf(c.id)[0], c.id);
  assert.equal(new Set(all).size, all.length);
  assert.equal(actionOf('KeyW'), 'up');
  assert.equal(actionOf('Digit9'), 'slot9');
  assert.equal(actionOf('KeyZ'), null);
});

test('keys are named plainly', () => {
  assert.equal(keyName('use'), 'Space');
  assert.equal(keyName('bag'), 'I');
  assert.equal(keyName('slot3'), '3');
  assert.equal(nameOfKey('ArrowUp'), 'Up');
  assert.equal(nameOfKey('Numpad4'), 'Num 4');
});

test('a free key replaces the one in that slot', () => {
  assert.equal(bind('bag', 0, 'KeyB'), null);
  assert.deepEqual(keysOf('bag'), ['KeyB']);
  assert.equal(actionOf('KeyI'), null);
  assert.equal(keyName('bag'), 'B');
});

test('a key another action used swaps with the old one', () => {
  assert.equal(bind('bag', 0, 'KeyC'), 'C was the key for crafting, which now uses I.');
  assert.deepEqual(keysOf('bag'), ['KeyC']);
  assert.deepEqual(keysOf('craft'), ['KeyI']);
});

test('a key cannot leave another action with none', () => {
  assert.match(bind('bag', 1, 'KeyC'), /only key for crafting/);
  assert.deepEqual(keysOf('craft'), ['KeyC']);
  assert.deepEqual(keysOf('bag'), ['KeyI']);
});

test('a second key can be added, moved to first and removed', () => {
  assert.equal(bind('bag', 1, 'Tab'), null);
  assert.deepEqual(keysOf('bag'), ['KeyI', 'Tab']);
  assert.equal(bind('bag', 0, 'Tab'), null);
  assert.deepEqual(keysOf('bag'), ['Tab', 'KeyI']);
  unbindSecond('bag');
  assert.deepEqual(keysOf('bag'), ['Tab']);
});

test('Esc and the debug key cannot be bound', () => {
  assert.match(bind('use', 0, 'Escape'), /always opens/);
  assert.match(bind('use', 0, 'Backquote'), /always opens/);
  assert.deepEqual(keysOf('use'), ['Space', 'KeyE']);
});

test('changed keys are kept in the browser and read back on the next visit', async () => {
  const m = new Map();
  globalThis.localStorage = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  bind('bag', 0, 'KeyB');
  const next = await import('../src/core/controls.js?next-visit');   // a fresh copy, as on a page load
  assert.deepEqual(next.keysOf('bag'), ['KeyB']);
  assert.equal(next.actionOf('KeyI'), null);
  delete globalThis.localStorage;
});
