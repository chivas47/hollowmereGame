// v169 (roadmap 75m): the fortune statue holds a loved gift on a neighbour's birthday morning, once, until taken.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { NPCS } from '../src/data/npcs.js';
import { ITEMS } from '../src/data/items.js';
import { STATUE } from '../src/data/statue.js';
import { statueGift, collectStatue } from '../src/systems/statue.js';
import { SITES } from '../src/systems/sites.js';
import { dateParts } from '../src/core/time.js';

test('the statue costs a million and is a farm building you place', () => {
  assert.equal(STATUE.cost, 1000000);
  assert.ok(SITES.statue.placed);
  assert.equal(newState().built.statue, false);
  assert.equal(merge({ built: { coop: true } }).statue, null, 'old saves load with an empty statue');
});

test('every neighbour with a birthday has a gift the statue can hold, one they love', () => {
  for (const n of NPCS.filter((d) => d.birthday)) {
    const g = statueGift(n.birthday);
    assert.ok(g, `${n.id}`); assert.equal(g.who, n.id); assert.ok(n.loves.includes(g.item) && ITEMS[g.item]);
  }
  assert.equal(statueGift({ season: 'Spring', d: 1 }), null, 'nobody\'s birthday, nothing held');
});

test('built, it fills on a birthday morning and is taken once', () => {
  G.S = newState(); G.S.built.statue = true;
  const n = NPCS.find((d) => d.id === 'nell');
  for (let day = 1; day <= 112; day++) { const d = dateParts(day); if (d.season === n.birthday.season && d.d === n.birthday.d) { G.S.day = day; break; } }
  emit('day:start', {});
  assert.equal(G.S.statue.who, 'nell');
  const item = G.S.statue.item, had = G.S.bag[item] || 0;
  assert.ok(collectStatue()); assert.equal(G.S.bag[item], had + 1);
  assert.ok(!collectStatue(), 'taken already');
  G.S.built.statue = false; emit('day:start', {}); assert.equal(G.S.statue, null, 'nothing without the statue');
});
