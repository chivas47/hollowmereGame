// v187 (polish 76c, docs/sketches/76c-homes.md): every home is its own. v178 copied Hester's plan and colours to
// Thorne and Sabine, and seven homes shared one colour scheme.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INTERIORS } from '../src/data/interiors.js';

const dupes = (keyOf) => {
  const seen = {};
  for (const [id, I] of Object.entries(INTERIORS)) (seen[keyOf(I)] ||= []).push(id);
  return Object.values(seen).filter((ids) => ids.length > 1);
};

test('no two homes share a floor plan', () => {
  assert.deepEqual(dupes((I) => I.plan.join('\n')), []);
});

test('no two homes share the same wallpaper and floor in every room', () => {
  assert.deepEqual(dupes((I) => JSON.stringify(I.rooms.map((r) => r.slice(4)))), []);
});

test("Thorne's hut is one room, like the hut outside", () => {
  assert.equal(INTERIORS.thorne.rooms.length, 1);
});
