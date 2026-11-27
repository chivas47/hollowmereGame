// Roadmap 120b: each Hollow band's landmark (its 10th floor) and guardian (its last floor). The Rootways: the Root
// Camp on floor 10 (safe, the ladder in sight, a campfire that heals once a day) and the Rootgnawer on floor 20 (the
// ladder opens when it falls; the first time, its hoard).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { W, H } from '../src/core/constants.js';
import { MAPS } from '../src/data/maps.js';
import { MONSTERS } from '../src/data/monsters.js';
import { BANDS, CAMPFIRE, specialOf } from '../src/data/hollow.js';
import { merge, newState } from '../src/core/state.js';
import { MINE, enterMine, restAtFire } from '../src/systems/mine.js';
import { slimes, hitMonster } from '../src/systems/monsters.js';
import '../src/systems/treasure.js';
import { freshFarm } from './setup.mjs';

const grid = () => MAPS.mine.grid;
const has = (t) => grid().some((row) => row.includes(t));
const R = BANDS[0];

test('every plan is one screen, with the ladder up, an open landing and room for the floor find', () => {
  for (const b of BANDS) for (const kind of ['landmark', 'guardian']) {
    const p = b[kind]?.plan;
    if (!p) continue;
    assert.equal(p.length, H, `${b.id} ${kind}`); p.forEach((row) => assert.equal([...row].length, W, `${b.id} ${kind} row`));
    assert.equal(p[0][2], 'U');
    for (let y = 1; y <= 4; y++) for (let x = 1; x <= 3; x++) assert.equal(p[y][x], 'f', `${b.id} ${kind} landing ${x},${y}`);
    assert.equal(p[3][4], 'f', 'the floor find chest stands at (4, 3)');
  }
  const g = R.guardian;
  assert.equal(g.plan[g.at.y][g.at.x], 'f'); assert.equal(g.plan[g.ladder.y][g.ladder.x], 'f');
  assert.ok(MONSTERS[g.kind].boss && MONSTERS[g.kind].zones.includes('lair'));
});

test('floor 10 is the Root Camp: no creatures, the ladder in sight, a fire', () => {
  freshFarm(); G.S.day = 3;
  enterMine(10);
  assert.equal(MINE.special, 'landmark');
  assert.match(MAPS.mine.name, /^The Root Camp, floor 10$/);
  assert.equal(slimes.length, 0);
  assert.ok(has('L') && has(CAMPFIRE.tile));
  assert.equal(MAPS.mine.theme, 'root');
  assert.ok(Object.keys(MINE.rocks).length >= 3, 'the miners\' seam');
  assert.equal(MINE.chest?.find, 'shortsword', 'floor 10\'s find still waits by the landing');
});

test('the campfire heals to full once a day, for half an hour', () => {
  freshFarm(); G.S.day = 3; enterMine(10);
  G.S.hp = 10; const t = G.S.time;
  assert.equal(restAtFire(), true);
  assert.equal(G.S.hp, G.S.maxHp); assert.equal(G.S.time, t + CAMPFIRE.minutes);
  G.S.hp = 10;
  assert.equal(restAtFire(), false, 'burned low until tomorrow');
  assert.equal(G.S.hp, 10);
  G.S.day = 4;
  assert.equal(restAtFire(), true);
});

test('floor 20 holds the Rootgnawer and no ladder; it falls, the ladder opens and its hoard is yours once', () => {
  freshFarm(); G.S.day = 3;
  enterMine(20);
  assert.equal(MINE.special, 'guardian');
  assert.ok(!has('L'), 'no ladder while it lives');
  assert.equal(MINE.ladder, null);
  const boss = slimes.find((m) => m.boss);
  assert.ok(boss && boss.kind === 'rootgnawer' && slimes.length === 1);
  const bars = G.S.bag.copperbar, bombs = G.S.kit.emberbomb;
  hitMonster(boss, 1e6);
  assert.ok(!slimes.includes(boss));
  assert.equal(grid()[R.guardian.ladder.y][R.guardian.ladder.x], 'L');
  assert.deepEqual(G.S.hollow.beaten, ['rootways']);
  assert.equal(G.S.bag.copperbar, bars + R.guardian.hoard.copperbar);
  assert.equal(G.S.kit.emberbomb, bombs + R.guardian.hoard.emberbomb);
  enterMine(20);
  assert.equal(MINE.special, null, 'beaten: floor 20 is a plain Rootways floor');
  assert.equal(grid()[0].length, R.size.w);
  assert.ok(!slimes.some((m) => m.boss));
  assert.equal(specialOf(20, G.S.hollow.beaten), null);
});

test('old saves load with no guardian beaten; bad data is dropped', () => {
  const s = newState(); delete s.hollow;
  assert.deepEqual(merge(JSON.parse(JSON.stringify(s))).hollow, { beaten: [], rested: 0, prayed: 0, ward: null });
  assert.deepEqual(merge({ ...newState(), hollow: { beaten: ['rootways', 5, null], rested: 'x', ward: { until: 'x' } } }).hollow, { beaten: ['rootways'], rested: 0, prayed: 0, ward: null });
});

test('the Hollow\'s own tiles are not used by any other tile art', async () => {
  const { PROP_TILES } = await import('../src/data/scenery.js');
  const { CRACK, WATER, BRIDGE_H, BRIDGE_V } = await import('../src/data/hollow.js');
  for (const t of [CRACK, CAMPFIRE.tile, WATER, BRIDGE_H, BRIDGE_V]) assert.ok(!Object.values(PROP_TILES).includes(t), `${t} is not a scenery tile`);
  assert.equal(new Set([CRACK, CAMPFIRE.tile, WATER, BRIDGE_H, BRIDGE_V]).size, 5);
});
