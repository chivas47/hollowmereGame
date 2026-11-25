// Roadmap 85j: seasonal night creatures. From 8 pm, once a night, the season's kind comes out in the Wilds and on the
// farm you are on (every farm); on the wild farm they join its slimes; they never turn up in the dungeons.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { MONSTERS, NIGHTFOLK, livesIn } from '../src/data/monsters.js';
import { SEASONS, SEASON_LENGTH } from '../src/data/seasons.js';
import { GOALS } from '../src/data/guild.js';
import { whereLives } from '../src/data/bestiary.js';
import { slimes } from '../src/systems/monsters.js';
import { nightKind } from '../src/systems/nightfolk.js';
import '../src/systems/farmPerks.js';
import { enterMine, leaveMine } from '../src/systems/mine.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const NIGHT = Object.keys(MONSTERS).filter((k) => livesIn(k, 'night'));

test('one kind a season, each in the night goal, each with a card line', () => {
  assert.deepEqual(SEASONS.map((s) => nightKind(s)).sort(), [...NIGHT].sort());
  assert.equal(NIGHT.length, 4);
  for (const k of NIGHT) {
    assert.ok(GOALS.nightfolk.kinds.includes(k));
    assert.match(whereLives(k), /after dark/);
  }
});

function night(map, day, layout) {
  freshFarm(layout ? { layout } : {});
  Object.assign(G.S, { day, time: NIGHTFOLK.from - 10 });
  G.paused = false; G.dialog = { you: false, p2: false }; G.P2 = null;
  placePlayer(map, map === 'farm' ? 6 : 3, map === 'farm' ? 9 : 4, 'down');
  slimes.length = 0;
  runUpdaters(0.01);
  const before = slimes.length;
  G.S.time = NIGHTFOLK.from + 1;
  runUpdaters(0.01);
  return { before, kinds: slimes.map((m) => m.kind) };
}

test("after dark the season's kind comes out on the farm and in the Wilds, once a night", () => {
  SEASONS.forEach((season, i) => {
    const day = i * SEASON_LENGTH + 5 + i;
    for (const map of ['farm', 'wilds']) {
      const { before, kinds } = night(map, day);
      assert.equal(before, 0, 'nothing before 8 pm');
      const [lo, hi] = NIGHTFOLK[map];
      assert.ok(kinds.length >= lo && kinds.length <= hi && kinds.every((k) => k === nightKind(season)), `${season} ${map}: ${kinds}`);
      const n = slimes.length;
      G.S.time += 30; runUpdaters(0.01);
      assert.equal(slimes.length <= n, true, 'only once a night');
    }
  });
});

test('on the wild farm they join its slimes', () => {
  const { kinds } = night('farm', 5, 'wild');
  assert.ok(kinds.includes('slime') && kinds.includes('bramble'), kinds.join());
});

test('a gourd lurker sleeps as a pumpkin; none of them turn up in the dungeons', () => {
  const { kinds } = night('farm', 2 * SEASON_LENGTH + 4);
  assert.ok(kinds.length && kinds.every((k) => k === 'gourd'));
  assert.ok(slimes.every((m) => m.hidden));
  assert.ok(MONSTERS.gourd.disguise);
  freshFarm();
  for (const f of [1, 10, 30, 60, 90]) for (const zone of ['hollow', 'cavern', 'vent']) { enterMine(f % 10 || 1, zone); assert.ok(!slimes.some((m) => NIGHT.includes(m.kind))); enterMine(f); assert.ok(!slimes.some((m) => NIGHT.includes(m.kind))); }
  leaveMine();
});
