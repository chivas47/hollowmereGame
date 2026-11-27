// Roadmap 120f: the Magma Rifts (Hollow floors 81-100). Basalt cut by lava rivers with solid causeways and crumbling
// bridges that fall after you step on them. Floor 90: the Forge Ruin (a smelter, 5 bars a day). Floor 100: the Ember
// Wyrm.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { MAPS } from '../src/data/maps.js';
import { BANDS, LAVA } from '../src/data/hollow.js';
import { distances } from '../src/systems/hollowGen.js';
import { MINE, enterMine } from '../src/systems/mine.js';
import { slimes, hitMonster } from '../src/systems/monsters.js';
import { crumbleTurn, smelt } from '../src/systems/rifts.js';
import { placePlayer, playerTile } from '../src/systems/world.js';
import '../src/systems/treasure.js';
import { freshFarm } from './setup.mjs';

const B = BANDS.find((b) => b.id === 'magma');
const grid = () => MAPS.mine.grid;
const ready = () => { G.paused = false; G.dialog = { you: false, p2: false }; G.hurtT = 0; G.block = 0; };

test('Rift floors are basalt cut by lava; every patch of ground reachable without the crumbling bridges', () => {
  freshFarm();
  let crumbles = 0;
  for (let day = 1; day <= 8; day++) for (let f = 81; f <= 99; f++) {
    if (f === 90) continue;
    G.S.day = day; enterMine(f);
    const g = grid(), d = distances(g, 2, 1, new Set([LAVA.crumble]));
    assert.equal(g[0].length, 36); assert.equal(MAPS.mine.theme, 'magma');
    assert.match(MAPS.mine.name, /^The Magma Rifts, floor \d+$/);
    assert.ok(g.flat().filter((t) => t === LAVA.tile).length > 40, 'rivers of lava');
    crumbles += g.flat().filter((t) => t === LAVA.crumble).length;
    g.forEach((row, y) => row.forEach((t, x) => { if (t === 'f') assert.ok(d[y][x] >= 0, `floor ${f} day ${day}: ${x},${y} reachable on solid ground`); }));
    if (MINE.ladder) { const [x, y] = MINE.ladder.split(',').map(Number); assert.ok(d[y][x] >= 0); }
  }
  assert.ok(crumbles > 100, `crumbling bridges turn up (${crumbles})`);
});

const onBridge = () => {
  freshFarm(); ready();
  for (let day = 1; day < 40; day++) {
    G.S.day = day; enterMine(84);
    const y = grid().findIndex((r) => r.includes(LAVA.crumble));
    if (y > 0) { const x = grid()[y].indexOf(LAVA.crumble); return [x, y]; }
  }
  return null;
};

test('a crumbling bridge falls a few seconds after you step on it; still on it, you are burned and thrown back', () => {
  const [x, y] = onBridge();
  G.S.hp = G.S.maxHp = 100;
  placePlayer('mine', 2, 2, 'down'); crumbleTurn(0.1);   // solid ground first
  placePlayer('mine', x, y, 'down'); crumbleTurn(0.1);
  assert.equal(grid()[y][x], LAVA.crumble, 'it holds a moment');
  crumbleTurn(LAVA.delay);
  assert.equal(grid()[y][x], LAVA.tile, 'then falls into the lava');
  assert.ok(G.S.hp < 100, 'burned');
  assert.deepEqual([playerTile().tx, playerTile().ty], [2, 2], 'back on the last solid ground');
});

test('step off in time and the bridge falls behind you, unhurt', () => {
  const [x, y] = onBridge();
  G.S.hp = G.S.maxHp = 100;
  placePlayer('mine', x, y, 'down'); crumbleTurn(0.1);
  placePlayer('mine', 2, 2, 'down'); crumbleTurn(LAVA.delay);
  assert.equal(grid()[y][x], LAVA.tile);
  assert.equal(G.S.hp, 100);
});

test('floor 90, the Forge Ruin: safe; its smelter makes up to 5 bars a day on the furnace\'s recipe', () => {
  freshFarm(); G.S.day = 3;
  enterMine(90);
  assert.equal(MINE.special, 'landmark'); assert.match(MAPS.mine.name, /^The Forge Ruin, floor 90$/);
  assert.equal(slimes.length, 0);
  Object.assign(G.S.bag, { copper: 12, iron: 5, gold: 0, umbrite: 0, coal: 3, copperbar: 0, ironbar: 0 });
  assert.equal(smelt(), 3);
  assert.deepEqual([G.S.bag.ironbar, G.S.bag.copperbar, G.S.bag.iron, G.S.bag.copper, G.S.bag.coal], [1, 2, 0, 2, 0]);
  Object.assign(G.S.bag, { copper: 100, coal: 100 });
  assert.equal(smelt(), 2, 'five a day in all');
  assert.equal(smelt(), 0);
  G.S.day = 4;
  assert.equal(smelt(), 5, 'hot again tomorrow');
});

test('floor 100, the Ember Wyrm: alone; it falls, the ladder opens, its hoard once', () => {
  freshFarm(); G.S.day = 3;
  enterMine(100);
  assert.equal(MINE.special, 'guardian');
  assert.ok(!grid().flat().includes('L'));
  const boss = slimes.find((m) => m.boss);
  assert.ok(boss?.kind === 'emberwyrm' && slimes.length === 1);
  const bars = G.S.bag.goldbar;
  hitMonster(boss, 1e6);
  assert.equal(grid()[B.guardian.ladder.y][B.guardian.ladder.x], 'L');
  assert.ok(G.S.hollow.beaten.includes('magma'));
  assert.equal(G.S.bag.goldbar, bars + B.guardian.hoard.goldbar);
});
