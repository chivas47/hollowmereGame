// Roadmap 89b: the title screen lists farms by what their slots hold. A save from before names (no profile) loads
// with the default names, so the list shows those; a new farm that has not finished the new game screen (profile
// null) shows as not yet named; an empty slot is empty.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAVE_KEY } from '../src/core/constants.js';
import { DEFAULT_PROFILE } from '../src/data/profile.js';

const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), clear: () => store.clear() };
const { slotInfo, newState } = await import('../src/core/state.js');

test('the farm list names old saves as they load, and new farms as not yet named', () => {
  store.clear();
  store.set(SAVE_KEY, JSON.stringify({ day: 57, gold: 100 }));   // pre-v21: no profile
  store.set(`${SAVE_KEY}-2`, JSON.stringify({ ...newState(), day: 1, gold: 500 }));   // the new game screen not finished
  assert.deepEqual(slotInfo(1), { farm: DEFAULT_PROFILE.farm, name: DEFAULT_PROFILE.name, day: 57, gold: 100 });
  assert.deepEqual(slotInfo(2), { farm: null, name: null, day: 1, gold: 500 });
  assert.equal(slotInfo(3), null, 'an empty slot');
  assert.equal(newState().profile, null, 'a new farm opens the new game screen');
});
