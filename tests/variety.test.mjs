// v150: a week that is not the same twice. The same date always plans the same day; the same weekday a week later
// usually does not; work, the Lantern and visits never move; detours go to open ground; no day overlaps itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleFor, vary } from '../src/data/schedules.js';
import { NPCS } from '../src/data/npcs.js';
import { MAPS, SOLID } from '../src/data/maps.js';

const OUT = new Set(['farm', 'village', 'town', 'beach', 'forest', 'wilds', 'mere']);   // v161: the mere too
const show = (list) => JSON.stringify(list);

test('the same date plans the same day; Mondays a week apart mostly differ', () => {
  let varied = 0;
  for (const def of NPCS) {
    assert.equal(show(scheduleFor(def, 15)), show(scheduleFor(def, 15)));
    const mondays = new Set([1, 8, 15, 22].map((d) => show(scheduleFor(def, d))));
    if (mondays.size > 1) varied++;
  }
  assert.ok(varied >= 12, `only ${varied} neighbours vary their Mondays`);
});

test('work, the Lantern and visits never move', () => {
  for (const def of NPCS) for (let day = 1; day <= 28; day++) {
    const indoor = (list) => show(list.filter((b) => !OUT.has(b.map)));
    const base = scheduleFor(def, ((day - 1) % 7) + 1);   // compare a varied day with its weekday's indoor blocks
    assert.equal(indoor(vary(def.id, day, base)), indoor(base), `${def.id} day ${day}`);
  }
});

test('over four weeks: detours happen, land on open ground, and no day overlaps itself', () => {
  let detours = 0;
  for (const def of NPCS) for (let day = 1; day <= 28; day++) {
    const list = scheduleFor(def, day);
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      assert.ok(b.to - b.from >= 30, `${def.id} has a ${b.to - b.from} minute block on day ${day}`);
      if (i) assert.ok(b.from >= list[i - 1].to, `${def.id} overlaps on day ${day}`);
      if (!b.detour) continue;
      detours++;
      const [x, y] = b.path[0];
      assert.ok(!SOLID.has(MAPS[b.map].grid[y][x]), `${def.id}'s detour on a solid tile`);
    }
  }
  assert.ok(detours >= 40 && detours <= 150, `${detours} detours in four weeks`);
});
