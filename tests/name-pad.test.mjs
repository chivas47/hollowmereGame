// v334 (roadmap 116c): typing a name with a controller (data/profile.js typeName, finishName; ui/letterpad.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAME_PAD, NAME_MAX, typeName, finishName } from '../src/data/profile.js';

const type = (keys, from = '') => keys.reduce((s, k) => typeName(s, k), from);

test('each word starts in capitals and goes on in small letters, with no shift key', () => {
  assert.equal(type([...'ROWAN']), 'Rowan');
  assert.equal(type([...'MARY', '-', ...'ANN']), 'Mary-Ann');
  assert.equal(type([...'JO', ' ', ...'MARCH']), 'Jo March');
  assert.equal(type([...'O', "'", ...'HARA']), "O'hara");
});

test('marks never start a name or come twice; delete and clear work; the length is capped', () => {
  assert.equal(type([' ', '-', "'"]), '');
  assert.equal(type(['A', ' ', ' ', '-']), 'A ');
  assert.equal(type([...'ANNA', 'back']), 'Ann');
  assert.equal(type([...'ANNA', 'clear']), '');
  assert.equal(type(Array(40).fill('A')).length, NAME_MAX);
  assert.equal(typeName('Ann', '!'), 'Ann', 'only what the pad offers');
});

test('every key on the pad does something to an empty or a full name', () => {
  const keys = [...NAME_PAD.rows.join(''), ...NAME_PAD.marks, ...NAME_PAD.keys];
  assert.equal(new Set(keys).size, keys.length, 'no key twice');
  for (const k of NAME_PAD.rows.join('')) assert.equal(typeName('', k), k);
});

test('a name is kept trimmed, without a trailing mark, and never empty', () => {
  assert.equal(finishName('Rowan ', 'Farmer two'), 'Rowan');
  assert.equal(finishName("Mary-", 'Farmer two'), 'Mary');
  assert.equal(finishName('', 'Farmer two'), 'Farmer two');
  assert.equal(finishName(' - ', 'Kit'), 'Kit');
});
