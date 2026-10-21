// The controller's pure parts: the stick's dead zone and moving between menu buttons.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stickDirs, nextInDirection } from '../src/core/pad.js';
import { PAD_BUTTONS } from '../src/data/gamepad.js';
import { CONTROLS } from '../src/data/controls.js';

test('a stick inside the dead zone points nowhere; past it, the way it leans', () => {
  assert.deepEqual(stickDirs(0.2, -0.3, 0.4), { left: false, right: false, up: false, down: false });
  assert.deepEqual(stickDirs(0.9, -0.5, 0.4), { left: false, right: true, up: true, down: false });
});

// Three buttons in a row and one below the middle one.
const grid = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 100, y: 60 }];

test('menu focus moves to the nearest button that way', () => {
  const from = grid[1], others = [grid[0], grid[2], grid[3]];
  assert.equal(nextInDirection(from, others, 'left'), 0);
  assert.equal(nextInDirection(from, others, 'right'), 1);
  assert.equal(nextInDirection(from, others, 'down'), 2);
  assert.equal(nextInDirection(from, others, 'up'), -1);   // nothing above
});

test('straight ahead wins over a nearer button off to the side', () => {
  assert.equal(nextInDirection(grid[3], [grid[0], grid[1]], 'up'), 1);
});

test('every pad button is a game action or one of the pad\'s own', () => {
  const ids = new Set([...CONTROLS.map((c) => c.id), 'back', 'menu', 'prev', 'next']);
  for (const a of Object.values(PAD_BUTTONS)) assert.ok(ids.has(a), a);
});
