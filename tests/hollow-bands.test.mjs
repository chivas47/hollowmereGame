// Roadmap 120a: the Hollow by depth. Bands of 20 floors (data/hollow.js); the Rootways (1-20) are winding tunnels
// larger than the screen, with cracked walls: shortcuts between far-apart tunnels and sealed pockets of ore.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { W, H } from '../src/core/constants.js';
import { MAPS } from '../src/data/maps.js';
import { ROCKS } from '../src/data/minerals.js';
import { BANDS, BAND_SIZE, bandOf, CRACK } from '../src/data/hollow.js';
import { distances } from '../src/systems/hollowGen.js';
import { MINE, enterMine } from '../src/systems/mine.js';
import { slimes } from '../src/systems/monsters.js';
import { runInteractions } from '../src/core/registry.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { freshFarm } from './setup.mjs';

const grid = () => MAPS.mine.grid;
// v367: floors 10 and 20 are the camp and the guardian's lair (tests/hollow-landmarks.test.mjs)
const each = (fn) => { for (let day = 1; day <= 12; day++) for (let f = 1; f <= 19; f++) { if (f === 10) continue; G.S.day = day; enterMine(f); fn(f, day); } };

test('bands cover every floor, 20 at a time, in order', () => {
  for (let f = 1; f <= 400; f++) assert.ok(bandOf(f).from <= f && f <= bandOf(f).to, `floor ${f}`);
  BANDS.slice(0, 6).forEach((b, i) => { assert.equal(b.from, i * BAND_SIZE + 1); assert.equal(b.to, (i + 1) * BAND_SIZE); });
  assert.equal(bandOf(1).id, 'rootways'); assert.equal(bandOf(20).id, 'rootways'); assert.equal(bandOf(21).id, 'flooded'); assert.equal(bandOf(500).id, 'deep');
});

test('Rootways floors are tunnels larger than the screen, every rock and the ladder reachable on foot', () => {
  freshFarm();
  each((f) => {
    const g = grid(), d = distances(g, 2, 1);
    assert.equal(g.length, 24); assert.equal(g[0].length, 36);
    assert.equal(MAPS.mine.theme, 'root');
    assert.match(MAPS.mine.name, /^The Rootways, floor \d+$/);
    for (let y = 1; y <= 4; y++) for (let x = 1; x <= 4; x++) assert.notEqual(g[y][x], 'X', 'the landing is open');
    const open = g.flat().filter((t) => t !== 'X' && t !== CRACK).length;
    assert.ok(open > 0.3 * 34 * 22 && open < 0.7 * 34 * 22, `floor ${f}: tunnels, not one room (${open} open)`);
    if (MINE.ladder) { const [x, y] = MINE.ladder.split(',').map(Number); assert.ok(d[y][x] >= 0, `floor ${f}: the ladder rock is reachable`); }
    for (const k of Object.keys(MINE.rocks)) {
      const [x, y] = k.split(',').map(Number);
      assert.ok(ROCKS[g[y][x]], 'a rock stands on each rock tile');
    }
  });
});

test('cracked walls: shortcuts save a long walk, pockets hold ore behind one', () => {
  freshFarm();
  let shortcuts = 0, pockets = 0;
  each(() => {
    const g = grid(), d = distances(g, 2, 1);
    for (const k of Object.keys(MINE.cracks)) {
      const [x, y] = k.split(',').map(Number);
      assert.equal(g[y][x], CRACK);
      const sides = [[x - 1, y, x + 1, y], [x, y - 1, x, y + 1]].find(([ax, ay, bx, by]) => g[ay][ax] !== 'X' && g[by][bx] !== 'X' && g[ay][ax] !== CRACK && g[by][bx] !== CRACK);
      if (sides && d[sides[1]][sides[0]] >= 0 && d[sides[3]][sides[2]] >= 0) {
        shortcuts++;
        assert.ok(Math.abs(d[sides[1]][sides[0]] - d[sides[3]][sides[2]]) >= 0, 'both sides reachable');
        const walk = distances(g, sides[0], sides[1])[sides[3]][sides[2]];
        assert.ok(walk >= bandOf(1).cracks.far, `a shortcut saves at least ${bandOf(1).cracks.far} steps (${walk})`);
      } else {
        pockets++;
        const behind = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([px, py]) => g[py][px] !== 'X' && d[py][px] < 0);
        assert.ok(behind.length, 'a pocket lies behind its cracked wall, out of reach until it breaks');
        for (const [px, py] of behind) for (const [qx, qy] of [[px, py], [px + 1, py], [px, py + 1], [px - 1, py], [px, py - 1]]) {
          const t = g[qy]?.[qx];
          if (ROCKS[t] && d[qy][qx] < 0) assert.notEqual(t, 'r', 'pocket rocks are ore, not plain stone');
        }
      }
    }
  });
  assert.ok(shortcuts > 20, `shortcuts turn up (${shortcuts})`);
  assert.ok(pockets > 20, `pockets turn up (${pockets})`);
});

test('the pickaxe breaks a cracked wall in a few hits, for energy', () => {
  freshFarm({ slot: HOTBAR.indexOf('pick') });
  let found = null;
  for (let day = 1; day <= 20 && !found; day++) { G.S.day = day; enterMine(3); found = Object.keys(MINE.cracks)[0]; }
  assert.ok(found);
  const [x, y] = found.split(',').map(Number);
  const e = G.S.energy, hit = () => runInteractions({ tx: x, ty: y, tile: grid()[y][x], mapId: 'mine', item: 'pick' });
  hit();
  assert.equal(grid()[y][x], CRACK, 'one hit with the basic pickaxe is not enough');
  hit(); hit();
  assert.equal(grid()[y][x], 'f', 'three hits open it');
  assert.equal(e - G.S.energy, 6, '2 energy a hit, as a rock');
});

test('floors keep their seed, creatures spawn in the tunnels, and no Hollow floor is the old single room any more', () => {
  freshFarm(); G.S.day = 5;
  enterMine(7); const a = JSON.stringify(grid());
  enterMine(7); assert.equal(JSON.stringify(grid()), a, 'the same day and floor build the same floor');
  for (const m of slimes) { const t = grid()[Math.floor(m.y / 16)]?.[Math.floor(m.x / 16)]; assert.ok(t && t !== 'X' && t !== CRACK, 'creatures stand in the tunnels'); }
  for (const f of [21, 47, 63, 88, 104, 121, 150, 300]) {   // v373: every band is built, the Deep included
    enterMine(f);
    assert.notEqual(grid()[0].length, W, `floor ${f} is larger than one screen`);
  }
});
