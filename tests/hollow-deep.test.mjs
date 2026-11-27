// Roadmap 120h: the Deep (Hollow floor 121 and below). Each floor borrows a band above, its shape, look and mechanic,
// by floor and day; from floor 141 it adds darkness or ice on top. No landmarks or guardians.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { MAPS } from '../src/data/maps.js';
import { BANDS, ICE, LAVA, CRYSTAL, WATER, deepFloor } from '../src/data/hollow.js';
import { distances } from '../src/systems/hollowGen.js';
import { rng } from '../src/render/pixel.js';
import { MINE, enterMine } from '../src/systems/mine.js';
import { slimes } from '../src/systems/monsters.js';
import { freshFarm } from './setup.mjs';

const grid = () => MAPS.mine.grid;
const looks = Object.fromEntries(BANDS.filter((b) => b.look).map((b) => [b.id, b.look]));

test('Deep floors borrow every band above, in its look; the same floor and day build the same floor', () => {
  freshFarm();
  const seen = new Set();
  for (let day = 1; day <= 6; day++) for (let f = 121; f <= 140; f++) {
    G.S.day = day; enterMine(f);
    assert.match(MAPS.mine.name, new RegExp(`^The Deep, floor ${f}$`));
    assert.ok(MINE.borrowed && looks[MINE.borrowed], 'borrows a built band');
    assert.equal(MAPS.mine.theme, looks[MINE.borrowed], 'in its look');
    assert.equal(MINE.overlay, null, 'one mechanic above floor 141');
    assert.equal(MINE.special, null, 'no landmarks or guardians');
    seen.add(MINE.borrowed);
  }
  assert.deepEqual([...seen].sort(), Object.keys(looks).sort(), 'all six bands turn up');
  G.S.day = 3; enterMine(133); const a = JSON.stringify(grid());
  enterMine(133); assert.equal(JSON.stringify(grid()), a);
});

test('from floor 141 a floor adds darkness or ice, never the one it already has', () => {
  freshFarm();
  const overlays = new Set();
  for (let day = 1; day <= 6; day++) for (let f = 141; f <= 160; f++) {
    G.S.day = day; enterMine(f);
    assert.ok(['dark', 'ice'].includes(MINE.overlay));
    overlays.add(MINE.overlay);
    if (MINE.overlay === 'dark') { assert.ok(MINE.dark); assert.notEqual(MINE.borrowed, 'crypts'); }
    if (MINE.overlay === 'ice') { assert.ok(grid().flat().includes(ICE.tile), 'iced over'); assert.notEqual(MINE.borrowed, 'frost'); }
    const blocked = new Set([LAVA.crumble]), d = distances(grid(), 2, 1, blocked);
    grid().forEach((row, y) => row.forEach((t, x) => {
      if ((t === 'f' || t === ICE.tile) && d[y][x] < 0) {   // only a sealed vault or ore pocket may be out of reach
        assert.ok(['crystal', 'rootways'].includes(MINE.borrowed), `floor ${f} day ${day}: ${x},${y} cut off (${MINE.borrowed})`);
      }
    }));
    for (const m of slimes) assert.ok(![WATER, LAVA.tile, 'X', CRYSTAL.pillar].includes(grid()[Math.floor(m.y / 16)][Math.floor(m.x / 16)]));
  }
  assert.deepEqual([...overlays].sort(), ['dark', 'ice']);
});

test('the pick is fair: each band about as often as the others', () => {
  const n = {};
  for (let i = 0; i < 6000; i++) { const { band } = deepFloor(130, rng(i * 31 + 7)); n[band.id] = (n[band.id] || 0) + 1; }
  for (const k of Object.keys(looks)) assert.ok(n[k] > 800 && n[k] < 1200, `${k}: ${n[k]}`);
});
