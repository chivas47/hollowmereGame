// Roadmap 120d: the Frost Halls (Hollow floors 41-60). Long halls with ice across them: on ice you slide until
// something stops you or the ice ends; the ice cleats (on a peg by the Frozen Lake, floor 50) stop the sliding;
// creatures drift on ice and chargers skid. Floor 60: the Rimehorn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T } from '../src/core/constants.js';
import { MAPS } from '../src/data/maps.js';
import { ROCKS } from '../src/data/minerals.js';
import { BANDS, ICE, bandOf } from '../src/data/hollow.js';
import { distances, halls } from '../src/systems/hollowGen.js';
import { rng } from '../src/render/pixel.js';
import { runInteractions, runUpdaters } from '../src/core/registry.js';
import { MINE, enterMine } from '../src/systems/mine.js';
import { slimes, hitMonster, spawnAt } from '../src/systems/monsters.js';
import { slideTurn } from '../src/systems/ice.js';
import { placePlayer, playerTile } from '../src/systems/world.js';
import '../src/systems/treasure.js';
import { freshFarm } from './setup.mjs';

const F = BANDS.find((b) => b.id === 'frost');
const grid = () => MAPS.mine.grid;
const slideFrom = (x, y, dx, dy) => {
  placePlayer('mine', x, y, 'right'); G.slide = null;
  slideTurn(dx, dy, 0.02, 62);
  for (let i = 0; i < 400 && G.slide; i++) slideTurn(0, 0, 0.02, 62);   // keys let go: it keeps sliding
  return playerTile();
};

test('Frost floors are long halls with ice across them, everything reachable', () => {
  freshFarm();
  for (let day = 1; day <= 8; day++) for (let f = 41; f <= 59; f++) {
    if (f === 50) continue;
    G.S.day = day; enterMine(f);
    const g = grid(), d = distances(g, 2, 1), open = g.flat().filter((t) => t !== 'X');
    assert.equal(g[0].length, 36); assert.equal(MAPS.mine.theme, 'frost');
    assert.match(MAPS.mine.name, /^The Frost Halls, floor \d+$/);
    const ice = open.filter((t) => t === ICE.tile).length;
    assert.ok(ice > 0.12 * open.length && ice < 0.55 * open.length, `floor ${f}: ice ${ice} of ${open.length}`);
    g.forEach((row, y) => row.forEach((t, x) => { if (t !== 'X' && t !== 'U') assert.ok(d[y][x] >= 0, `floor ${f} day ${day}: ${x},${y} reachable`); }));
    for (const m of slimes) assert.notEqual(g[Math.floor(m.y / T)][Math.floor(m.x / T)], ICE.tile, 'creatures start on dry floor');
  }
});

test('rocks standing on the ice stop slides and never hide the ladder', () => {
  let stoppers = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const made = halls(rng(seed * 17), bandOf(45), () => 'r');
    stoppers += made.noLadder.length;
    for (const k of made.noLadder) { const [x, y] = k.split(',').map(Number); assert.equal(made.grid[y][x], 'r'); }
  }
  assert.ok(stoppers > 20, `stoppers turn up (${stoppers})`);
  freshFarm();
  for (let day = 1; day <= 10; day++) { G.S.day = day; enterMine(44); if (MINE.ladder) assert.ok(ROCKS[grid()[MINE.ladder.split(',')[1]][MINE.ladder.split(',')[0]]]); }
});

test('on ice you slide on with the keys let go, until the ice ends or something stops you; the cleats grip', () => {
  freshFarm(); G.S.day = 2; enterMine(50);   // the Frozen Lake: ice x 4-18, y 4-11, pillars at (8,6), (14,9), (11,4), (11,11)
  let at = slideFrom(4, 7, 1, 0);
  assert.equal(at.ty, 7); assert.equal(at.tx, 19, 'slid across the lake and off its far side');
  at = slideFrom(4, 6, 1, 0);
  assert.equal(at.tx, 7, 'stopped by the pillar at (8, 6)');
  assert.equal(grid()[at.ty][at.tx], ICE.tile, 'and stays on the ice beside it');
  at = slideFrom(7, 6, 0, 1);
  assert.equal(at.tx, 7); assert.equal(at.ty, 12, 'a new slide from there runs down off the ice');
  placePlayer('mine', 4, 7, 'right'); G.slide = null; slideTurn(1, 0, 0.02, 62);
  assert.ok(G.slide);
  enterMine(51);
  assert.equal(G.slide, null, 'a slide ends on the next floor');
  enterMine(50);
  G.S.wardrobe.icecleats = true; G.S.outfit.shoes = 'icecleats';
  placePlayer('mine', 5, 7, 'right'); G.slide = null;
  assert.equal(slideTurn(1, 0, 0.02, 62), false, 'in cleats you walk on ice');
});

test('the cleats hang on a peg by the Frozen Lake, once', () => {
  freshFarm(); G.S.day = 2; enterMine(50);
  assert.equal(MINE.special, 'landmark'); assert.match(MAPS.mine.name, /^The Frozen Lake, floor 50$/);
  assert.equal(slimes.length, 0);
  const y = grid().findIndex((r) => r.includes(ICE.peg)), x = grid()[y].indexOf(ICE.peg);
  assert.ok(y > 0);
  runInteractions({ tx: x, ty: y, tile: ICE.peg, mapId: 'mine', item: 'hoe' });
  assert.equal(G.S.wardrobe.icecleats, true);
  assert.equal(grid()[y][x], ICE.pegEmpty);
  enterMine(50);
  assert.equal(grid()[y][x], ICE.pegEmpty, 'still empty on the next visit');
});

test('creatures drift on ice; a charger\'s rush skids on', () => {
  freshFarm(); G.S.day = 2; enterMine(50); G.paused = false; G.dialog = { you: false, p2: false };
  placePlayer('mine', 2, 7, 'right'); G.S.hp = G.S.maxHp = 1e6;
  const [m] = spawnAt('mine', [{ kind: 'skeleton', x: 12, y: 7 }]);
  Object.assign(m, { ix: 1, iy: 0, speed: 20, dmg: 0 });   // gliding right, away from you
  runUpdaters(0.02);
  assert.ok(m.ix > 0.8, `it keeps drifting the old way (${m.ix.toFixed(2)})`);
  const [c] = spawnAt('mine', [{ kind: 'ram', x: 12, y: 8 }]);
  Object.assign(c, { cs: 'charge', ct: 0.001, cn: 1, cdx: 1, cdy: 0, dmg: 0 });
  runUpdaters(0.02);
  assert.equal(c.skid, true); assert.equal(c.cs, 'charge', 'still rushing: it skids');
});

test('floor 60, the Rimehorn: alone on its rink; it falls, the ladder opens, its hoard once', () => {
  freshFarm(); G.S.day = 2;
  enterMine(60);
  assert.equal(MINE.special, 'guardian');
  assert.ok(!grid().flat().includes('L'));
  assert.equal(MINE.chest?.find, 'emberboots', 'floor 60\'s find still waits');
  const boss = slimes.find((m) => m.boss);
  assert.ok(boss?.kind === 'rimehorn' && slimes.length === 1);
  assert.equal(grid()[Math.floor(boss.y / T)][Math.floor(boss.x / T)], ICE.tile, 'it stands on the ice');
  const bars = G.S.bag.ironbar;
  hitMonster(boss, 1e6);
  assert.equal(grid()[F.guardian.ladder.y][F.guardian.ladder.x], 'L');
  assert.ok(G.S.hollow.beaten.includes('frost'));
  assert.equal(G.S.bag.ironbar, bars + F.guardian.hoard.ironbar);
});
