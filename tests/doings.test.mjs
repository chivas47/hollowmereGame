// v147: what neighbours do where they stop. The right thing in the right place, nothing at home, Juno's satchel
// all day, and every kind has its art.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOINGS, doingFor } from '../src/data/doings.js';
import { DOING_KINDS } from '../src/render/doings.js';
import { scheduleFor } from '../src/data/schedules.js';
import { NPCS } from '../src/data/npcs.js';
import { venueMap } from '../src/data/venues.js';

const does = (id, block) => doingFor(id, block)?.does || null;

test('the right thing in the right place', () => {
  assert.equal(does('odile', { map: 'wilds', stay: true }), 'rod');
  assert.equal(does('odile', { map: 'beach', stay: true }), 'nets');
  assert.equal(does('odile', { map: 'village', stay: false }), null);
  assert.equal(does('corvin', { map: venueMap('smithy'), stay: true }), 'hammer');
  assert.equal(does('esme', { map: 'forest', stay: false }), 'easel');
  assert.equal(does('nell', { map: 'village', stay: false }), 'trowel');
  assert.equal(does('nell', { map: 'village', stay: true }), null, 'not while she sits by the square');
  assert.equal(does('lio', { map: 'village', stay: true }), 'fiddle');
  assert.equal(does('lio', { map: 'town', stay: false }), null, 'not while he wanders');
});

test('nothing at home; Juno carries the satchel all day', () => {
  assert.equal(does('corvin', null), null);
  assert.equal(does('juno', null), 'satchel');
  assert.equal(doingFor('juno', { map: 'town' }).carry, true);
});

test('every kind has its art, and most neighbours do something on a working day', () => {
  for (const list of Object.values(DOINGS)) for (const d of list) assert.ok(DOING_KINDS.includes(d.does), d.does);
  const busy = NPCS.filter((def) => scheduleFor(def, 1).some((b) => doingFor(def.id, b))).length;
  assert.ok(busy >= 14, `only ${busy} of ${NPCS.length} do anything on a Monday`);
});
