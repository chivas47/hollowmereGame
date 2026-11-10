// v219 (roadmap 76m): no default animal name is a neighbour's first name (the journal listed "Pip the chicken" next
// to Pip the boy). Animals that already have a name keep it; only new ones take the new names.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { NPCS } from '../src/data/npcs.js';
import { COOP, BARN } from '../src/data/upgrades.js';
import { adopt } from '../src/systems/livestock.js';
import { freshFarm } from './setup.mjs';

const firstNames = new Set(NPCS.map((n) => n.name.split(' ')[0]));
const lists = [['coop', COOP.names], ...Object.entries({ ...COOP.animals, ...BARN.animals }).map(([k, a]) => [k, a.names])];

test('no default animal name is a neighbour\'s first name', () => {
  for (const [kind, names] of lists) for (const n of names) assert.ok(!firstNames.has(n), `${kind}: ${n} is a neighbour`);
  assert.ok(firstNames.has('Pip') && firstNames.has('Wren') && firstNames.has('Rook'), 'the check sees full names like Wren Fenn');
});

test('a chicken already called Pip keeps its name; the next one takes a new name', () => {
  freshFarm({ built: { ...freshFarm().built, coop: true } });
  G.S.chickens.push({ kind: 'chicken', name: 'Pip', pet: 0, love: 0, days: 10 });
  assert.equal(adopt('chicken'), 'Clementine');
  assert.equal(adopt('chicken'), 'Poppy');
  assert.deepEqual(G.S.chickens.map((a) => a.name), ['Pip', 'Clementine', 'Poppy']);
});
