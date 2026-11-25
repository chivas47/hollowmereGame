// Roadmap 85h: busy floors (Stardew's infested floors). Now and then a Hollow floor from BUSY.from (never a lift stop)
// is all one kind, more of them, with no ladder under a rock; the ladder opens when the last creature is down.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { BUSY, MONSTER_COUNT } from '../src/data/monsters.js';
import { MAPS } from '../src/data/maps.js';
import { MINE, enterMine, leaveMine } from '../src/systems/mine.js';
import { slimes, hitMonster } from '../src/systems/monsters.js';
import { freshFarm } from './setup.mjs';

function findBusy(from, to, days = 60) {
  for (let day = 1; day <= days; day++) for (let f = from; f <= to; f++) {
    G.S.day = day; enterMine(f);
    if (MINE.busy) return f;
  }
  return null;
}

test('busy floors turn up now and then, from floor 10, never on a lift stop or above', () => {
  freshFarm();
  let busy = 0, all = 0;
  for (let day = 1; day <= 40; day++) for (let f = 1; f <= 60; f++) {
    G.S.day = day; enterMine(f); all++;
    if (!MINE.busy) continue;
    busy++;
    assert.ok(f >= BUSY.from && f % 5 !== 0, `floor ${f} can be busy`);
  }
  const share = busy / all;
  assert.ok(share > 0.02 && share < 0.1, `about 1 in 15 of the floors that can be (${share.toFixed(3)} of all)`);
  leaveMine();
});

test('a busy floor is one kind, more of them, and its ladder opens when the last falls', () => {
  freshFarm();
  const f = findBusy(10, 40);
  assert.ok(f, 'found one');
  assert.equal(MINE.ladder, null, 'no rock hides the ladder');
  assert.ok(!MAPS.mine.grid.flat().includes('L'));
  const kinds = new Set(slimes.map((m) => m.kind));
  assert.equal(kinds.size, 1, 'all one kind');
  assert.ok(slimes.length > MONSTER_COUNT(f) && slimes.length <= BUSY.max * 2, `more than usual (${slimes.length})`);
  let guard = 0;
  while (slimes.length && guard++ < 200) { const m = slimes[0]; m.hidden = false; m.shell = false; m.bs = undefined; m.ph = undefined; hitMonster(m, 1e9); }
  assert.equal(slimes.length, 0);
  assert.ok(MAPS.mine.grid.flat().includes('L'), 'the ladder opened');
  assert.equal(MINE.busy, false);
  leaveMine();
});
