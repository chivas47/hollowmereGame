// v339 (roadmap 118a): a new farm starts on the big layout; a save that never chose one stays on the open field.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newState, merge } from '../src/core/state.js';
import { LAYOUTS, NEW_FARM_LAYOUT, farmSize } from '../src/data/layouts.js';

test('the new game screen starts on a layout larger than one screen', () => {
  assert.ok(LAYOUTS[NEW_FARM_LAYOUT], NEW_FARM_LAYOUT);
  const { w, h } = farmSize(NEW_FARM_LAYOUT);
  assert.ok(w * h >= 8 * 24 * 16, `${w} x ${h}`);
});

test('an old save with no layout keeps the open field, not the new default', () => {
  const old = newState(); delete old.layout;
  assert.equal(merge(old).layout, 'open');
});
