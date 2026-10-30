// v145: the festival crowd. Everyone who comes is somewhere for every festival minute, never two on one tile,
// always on ground they can stand on, and they move about instead of standing all day.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crowdPlan, stationsFor } from '../src/systems/crowd.js';
import { pairs } from '../src/systems/chatter.js';
import { FESTIVALS, hoursOf } from '../src/data/festivals.js';
import { NPCS } from '../src/data/npcs.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { dateParts } from '../src/core/time.js';

const ids = NPCS.filter((d) => !d.noFestival).map((d) => d.id);
const dayOf = (f) => { for (let d = 1; d <= 112; d++) { const p = dateParts(d); if (p.season === f.season && p.d === f.day) return d; } };
const where = (blocks, t) => blocks.find((b) => t >= b.from && t < b.to);

for (const f of FESTIVALS) {
  test(`${f.name}: everyone has a place all festival, one to a tile, on open ground`, () => {
    const h = hoursOf(f), plan = crowdPlan(f.kind, ids, dayOf(f), h), g = MAPS.village.grid;
    assert.deepEqual(Object.keys(plan).sort(), [...ids].sort());
    for (let t = h.from; t < h.to; t += 5) {
      const seen = new Set();
      for (const id of ids) {
        const b = where(plan[id], t);
        assert.ok(b, `${id} has nowhere at ${t}`);
        for (const [x, y] of b.path) assert.ok(!SOLID.has(g[y][x]) && g[y][x] !== 'E', `${id} on solid ${x},${y}`);
        if (!b.stay) continue;
        const k = b.path[0].join(',');
        assert.ok(!seen.has(k), `two on ${k} at ${t}`);
        seen.add(k);
      }
    }
  });
}

test('neighbours move about a full-day festival, and the plan is the same on a reload', () => {
  const f = FESTIVALS.find((x) => x.key === 'blossom'), d = dayOf(f), plan = crowdPlan(f.kind, ids, d, hoursOf(f));
  for (const id of ids.filter((x) => x !== 'lio')) assert.ok(plan[id].length >= 5, `${id} only ${plan[id].length} places`);
  assert.equal(plan.lio.length, 1, 'Lio keeps to his fiddle');
  assert.deepEqual(crowdPlan(f.kind, ids, d, hoursOf(f)), plan);
});

test('jobs: Hob at the soup, Kit hunting eggs, the pole ring only on dance day', () => {
  const pot = crowdPlan('pot', ids, 40, hoursOf({}));
  assert.deepEqual(pot.hob.map((b) => b.path[0]), [[12, 11]]);
  const hunt = crowdPlan('hunt', ids, 13, hoursOf({}));
  assert.equal(hunt.kit.length, 1); assert.equal(hunt.kit[0].stay, false);
  assert.ok(stationsFor('dance').some((s) => s.only?.includes('dance')));
  assert.ok(!stationsFor('contest').some((s) => s.only));
  assert.ok(!stationsFor('dance').some((s) => s.at[0] === 10 && (s.at[1] === 8 || s.at[1] === 9) && !s.only), 'the pole tiles are not fountain spots on dance day');
});

test('two idle neighbours side by side make a pair; walking or apart they do not', () => {
  const n = (id, tx, ty, extra = {}) => ({ id, map: 'village', x: tx * 16 + 8, y: ty * 16 + 12, visible: true, moving: false, wait: 0, ...extra });
  assert.equal(pairs([n('a', 5, 5), n('b', 6, 5)]).length, 1);
  assert.equal(pairs([n('a', 5, 5), n('b', 7, 5)]).length, 0);
  assert.equal(pairs([n('a', 5, 5), n('b', 6, 5, { moving: true })]).length, 0);
  assert.equal(pairs([n('a', 5, 5), n('b', 6, 5, { map: 'town' })]).length, 0);
  assert.equal(pairs([n('a', 5, 5), n('b', 6, 5), n('c', 7, 5)]).length, 1, 'each in one pair');
});
