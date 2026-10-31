// v148: meals and errands. Whoever is out at noon stops for lunch (home or the Lantern); keepers eat at work;
// shoppers stop at Fenn's twice a week in the afternoon, never on a Wednesday; nobody's day overlaps itself and
// no two stand on one tile indoors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleFor, errandOf, SHOPPERS } from '../src/data/schedules.js';
import { doingFor } from '../src/data/doings.js';
import { NPCS } from '../src/data/npcs.js';
import { venueMap } from '../src/data/venues.js';

const def = (id) => NPCS.find((d) => d.id === id);
const at = (id, day, t) => scheduleFor(def(id), day).find((b) => t >= b.from && t < b.to) || null;
const OUT = new Set(['farm', 'village', 'town', 'beach', 'forest', 'wilds', 'mere']);   // v161: the mere too

test('lunch: home for Ines, a Lantern table for Lio, a packed lunch on the farm for Odile, the counter for Corvin', () => {
  assert.equal(at('ines', 1, 12.5 * 60), null, 'Ines goes home for lunch');
  assert.ok(at('ines', 1, 13.5 * 60), 'and back out after');
  const l = at('lio', 1, 12.5 * 60);
  assert.equal(l.map, venueMap('tavern')); assert.equal(doingFor('lio', l).does, 'meal');
  const o = at('odile', 1, 12.5 * 60);   // v154: the farm is too far from the Lantern for an hour's lunch
  assert.equal(o.map, 'farm'); assert.equal(doingFor('odile', o).does, 'meal');
  assert.equal(at('corvin', 1, 12.5 * 60).map, venueMap('smithy'));
});

test("shopping: twice a week at most, never on a Wednesday, at Fenn's while it is open", () => {
  for (const id of SHOPPERS) {
    let n = 0;
    for (let wd = 0; wd < 7; wd++) {
      const e = errandOf(id, wd);
      if (!e) continue;
      n++;
      assert.notEqual(wd, 2, `${id} shops on Wednesday`);
      assert.ok(e.from >= 15 * 60 && e.to <= 17 * 60, `${id} shops at ${e.from}`);
    }
    assert.ok(n >= 1 && n <= 2, `${id} shops ${n} times`);
  }
  const shops = SHOPPERS.flatMap((id) => [0, 1, 3, 4, 5, 6].map((wd) => (scheduleFor(def(id), wd + 1).some((b) => b.map === venueMap('store')) ? 1 : 0))).reduce((a, b) => a + b, 0);
  assert.ok(shops >= 10, `only ${shops} store visits a week`);
});

test('every day is in order with no overlaps, and no two share an indoor tile', () => {
  for (let day = 1; day <= 7; day++) {
    for (const d of NPCS) {
      const list = scheduleFor(d, day);
      for (let i = 1; i < list.length; i++) assert.ok(list[i].from >= list[i - 1].to, `${d.id} overlaps on day ${day}`);
    }
    for (let t = 6 * 60; t < 26 * 60; t += 10) {
      const seen = new Map();
      for (const d of NPCS) {
        const b = at(d.id, day, t);
        if (!b || !b.stay || OUT.has(b.map)) continue;
        const k = `${b.map}:${b.path[b.path.length - 1]}`;
        assert.ok(!seen.has(k), `${d.id} and ${seen.get(k)} on ${k} at ${t}, day ${day}`);
        seen.set(k, d.id);
      }
    }
  }
});
