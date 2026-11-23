// v322 (roadmap 115): the HUD over the field or beside it (data/hud.js). New players start over the field; a browser
// that already has a farm keeps the side column until its player switches; a choice made is kept.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstLayout, HUD_LAYOUTS } from '../src/data/hud.js';

test('a new player starts with the HUD over the field', () => {
  assert.equal(firstLayout({}, false), 'over');
  assert.equal(firstLayout(null, false), 'over');
});

test('a browser with a farm and no choice yet keeps the side column it knows', () => {
  assert.equal(firstLayout({ scale: 1.2, mode: 'full' }, true), 'side');
  assert.equal(firstLayout({}, true), 'side');
});

test('a choice made is kept, farm or not; anything else falls back', () => {
  for (const l of HUD_LAYOUTS) { assert.equal(firstLayout({ layout: l }, true), l); assert.equal(firstLayout({ layout: l }, false), l); }
  assert.equal(firstLayout({ layout: 'sideways' }, false), 'over');
});
