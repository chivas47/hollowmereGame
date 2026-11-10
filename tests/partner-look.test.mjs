// v229 (polish 77n): farmer two's chosen hair style, beard and glasses are kept in the save and drawn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newState, merge } from '../src/core/state.js';
import { lookOf } from '../src/data/people.js';

test('farmer two keeps a hair style, beard and glasses through a save, and an old save keeps short hair', () => {
  const S = newState();
  Object.assign(S.partner.look, { hairStyle: 'bun', long: false, beard: 'goatee', glasses: true });
  const back = merge(JSON.parse(JSON.stringify(S)));
  const L = lookOf(back.partner.look);
  assert.deepEqual([L.hair, L.beard, L.extras], ['bun', 'goatee', ['glasses']]);
  const old = newState(); delete old.partner.look.hairStyle;
  assert.equal(lookOf(merge(JSON.parse(JSON.stringify(old))).partner.look).hair, 'short');
});
