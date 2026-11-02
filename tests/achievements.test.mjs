// v185 (polish 76f): achievements a save already met are awarded when it loads, with one notice for several.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit, on } from '../src/core/events.js';
import '../src/systems/museum.js';
import { freshFarm } from './setup.mjs';

test('a loaded save that already earned 50,000g gets both gold achievements at once, in one notice', () => {
  freshFarm();
  G.S.earned = 60000; G.S.museum.ach = [];
  const notices = []; on('toast', (t) => notices.push(t));
  emit('game:loaded');
  assert.ok(G.S.museum.ach.includes('earn1') && G.S.museum.ach.includes('earn2'));
  assert.ok(!G.S.museum.ach.includes('earn3'), 'not one it has not met');
  const ach = notices.filter((t) => String(t?.text ?? t).startsWith('Achievement'));
  assert.equal(ach.length, 1, 'one notice, not one each');
});

test('loading again awards nothing twice', () => {
  const before = [...G.S.museum.ach];
  emit('game:loaded');
  assert.deepEqual(G.S.museum.ach, before);
});
