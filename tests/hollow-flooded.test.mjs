// Roadmap 120c: the Flooded Galleries (Hollow floors 21-40). Islands joined by plank bridges over still water; the
// water holds cave fish found nowhere else; floor 30 is the Sunken Shrine (its pool alone holds the pearlgill) and
// floor 40 the Mossmother's pool.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { MAPS } from '../src/data/maps.js';
import { ROCKS } from '../src/data/minerals.js';
import { FISH } from '../src/data/fish.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { BANDS, WATER, BRIDGE_H, BRIDGE_V } from '../src/data/hollow.js';
import { distances } from '../src/systems/hollowGen.js';
import { runInteractions } from '../src/core/registry.js';
import { MINE, enterMine } from '../src/systems/mine.js';
import { slimes, hitMonster } from '../src/systems/monsters.js';
import '../src/systems/fishing.js';
import '../src/systems/treasure.js';
import { freshFarm } from './setup.mjs';

const F = BANDS.find((b) => b.id === 'flooded');
const grid = () => MAPS.mine.grid;
const tiles = () => grid().flat();

test('Flooded floors are islands over water, every island and bridge reachable, rocks only on land', () => {
  freshFarm();
  for (let day = 1; day <= 8; day++) for (let f = 21; f <= 39; f++) {
    if (f === 30) continue;
    G.S.day = day; enterMine(f);
    const g = grid(), d = distances(g, 2, 1);
    assert.equal(g[0].length, 36); assert.equal(g.length, 24);
    assert.equal(MAPS.mine.theme, 'flooded');
    assert.match(MAPS.mine.name, /^The Flooded Galleries, floor \d+$/);
    const water = tiles().filter((t) => t === WATER).length;
    assert.ok(water > 0.35 * 34 * 22, `floor ${f}: mostly water (${water})`);
    assert.ok(tiles().some((t) => t === BRIDGE_H || t === BRIDGE_V), 'bridges');
    g.forEach((row, y) => row.forEach((t, x) => {
      if (t === 'f' || t === BRIDGE_H || t === BRIDGE_V || ROCKS[t]) assert.ok(d[y][x] >= 0, `floor ${f} day ${day}: ${t} at ${x},${y} reachable`);
    }));
    for (const k of Object.keys(MINE.rocks)) { const [x, y] = k.split(',').map(Number); assert.ok(ROCKS[g[y][x]]); }
    for (const m of slimes) { const t = g[Math.floor(m.y / 16)][Math.floor(m.x / 16)]; assert.notEqual(t, WATER); }
  }
});

test('the rod fishes the cave water: cave fish in the galleries, the shrine\'s own in its pool', () => {
  freshFarm({ slot: HOTBAR.indexOf('rod') });
  const castAt = () => {
    const g = grid(), y = g.findIndex((row) => row.includes(WATER)), x = g[y].indexOf(WATER);
    G.fishing = null;
    assert.equal(runInteractions({ tx: x, ty: y, tile: WATER, mapId: 'mine', item: 'rod' }), true);
    return G.fishing?.water;
  };
  G.S.day = 2; enterMine(25);
  assert.equal(castAt(), 'cave');
  enterMine(30);
  assert.equal(castAt(), 'shrine');
  G.fishing = null; G.lock = false;
  const cave = Object.keys(FISH).filter((k) => FISH[k].water === 'cave'), shrine = Object.keys(FISH).filter((k) => FISH[k].water === 'shrine');
  assert.deepEqual(cave, ['blindfin', 'stonescale']); assert.deepEqual(shrine, ['pearlgill']);
  for (const k of [...cave, ...shrine]) assert.equal(FISH[k].seasons.length, 4, `${k} bites all year`);
});

test('floor 30, the Sunken Shrine: safe, the ladder in sight, a pool, floor 30\'s find', () => {
  freshFarm(); G.S.day = 4;
  enterMine(30);
  assert.equal(MINE.special, 'landmark');
  assert.match(MAPS.mine.name, /^The Sunken Shrine, floor 30$/);
  assert.equal(slimes.length, 0);
  assert.ok(tiles().includes('L') && tiles().includes(WATER));
  assert.equal(MINE.chest?.find, 'tunnelboots');
});

test('floor 40, the Mossmother: alone, no ladder; she falls, the ladder opens, her hoard once; floor 40\'s find waits', () => {
  freshFarm(); G.S.day = 4;
  enterMine(40);
  assert.equal(MINE.special, 'guardian');
  assert.ok(!tiles().includes('L'));
  assert.equal(MINE.chest?.find, 'cutlass', 'the floor find (and the sewer key) still wait by the landing');
  const boss = slimes.find((m) => m.boss);
  assert.ok(boss && boss.kind === 'mossmother' && slimes.length === 1);
  const bars = G.S.bag.ironbar;
  hitMonster(boss, 1e6);
  assert.equal(grid()[F.guardian.ladder.y][F.guardian.ladder.x], 'L');
  assert.ok(G.S.hollow.beaten.includes('flooded'));
  assert.equal(G.S.bag.ironbar, bars + F.guardian.hoard.ironbar);
  enterMine(40);
  assert.equal(MINE.special, null);
  assert.equal(grid()[0].length, 36);
});
