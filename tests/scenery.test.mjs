// v195: scenery (data/scenery.js). Props are solid, so each must sit on open ground that nothing else uses: not a
// sign, a small story, a stall, a stump that grows back, the cat's spots, a lamp, a festival station or any place a
// neighbour walks to or stands at; never beside an exit; never on the farm. Ground cover stays off the farm and the
// island's plot. tests/world.test.mjs and tests/week.test.mjs check the walks still work round them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as maps from '../src/data/maps.js';
import { PROPS, PROP_TILES, COVER, BIOMES } from '../src/data/scenery.js';
import { NPCS } from '../src/data/npcs.js';
import { scheduleFor } from '../src/data/schedules.js';
import { SIGNS } from '../src/data/signs.js';
import { VIGNETTES } from '../src/data/vignettes.js';
import { CAT, NIGHT_LIGHTS } from '../src/data/atmosphere.js';
import { STATIONS } from '../src/data/crowd.js';
import { GROVE } from '../src/data/hidden.js';
import { CART, BOOKSELLER, MACHINE } from '../src/data/market.js';
import * as wing from '../src/data/wing.js';
import * as traditions from '../src/data/traditions.js';
import { coverKind } from '../src/render/scenery.js';

const { MAPS, SOLID } = maps;
const key = (m, x, y) => `${m} ${x},${y}`;

// Every tile something else claims, by map.
function reserved() {
  const out = new Set(), add = (m, x, y) => out.add(key(m, x, y));
  for (const def of NPCS) for (let day = 1; day <= 112; day++) for (const b of scheduleFor(def, day)) for (const [x, y] of b.path) add(b.map, x, y);
  for (const [m, list] of Object.entries(SIGNS)) for (const s of list) add(m, s.x, s.y);
  for (const [m, list] of Object.entries(VIGNETTES)) for (const v of list) add(m, v.x, v.y);
  for (const [x, y] of CAT.spots) add(CAT.map, x, y);
  for (const [m, list] of Object.entries(NIGHT_LIGHTS.lamps)) for (const [x, y] of list) { add(m, x, y); add(m, x, y - 1); }
  for (const s of STATIONS) add('village', ...s.at);
  for (const [x, y] of GROVE.stumps) add('grove', x, y);
  add(CART.map, CART.at.x, CART.at.y); add(BOOKSELLER.map, BOOKSELLER.at.x, BOOKSELLER.at.y); add('town', MACHINE.at.x, MACHINE.at.y);
  // anything else in data that names a map and a tile ({ map, x, y }): the wing, the cart stops, the wishing stone
  const walk = (v, d = 0) => {
    if (!v || typeof v !== 'object' || d > 4) return;
    if (typeof v.map === 'string' && Number.isInteger(v.x) && Number.isInteger(v.y)) add(v.map, v.x, v.y);
    Object.values(v).forEach((c) => walk(c, d + 1));
  };
  walk(wing); walk(traditions);
  return out;
}

test('every scenery prop has art, is solid and sits on open ground nobody else uses', () => {
  const taken = reserved(), seen = new Set(), bad = [];
  for (const t of Object.values(PROP_TILES)) assert.ok(SOLID.has(t), `${t} is solid`);
  for (const [m, list] of Object.entries(PROPS)) {
    assert.notEqual(m, 'farm', 'no scenery on the farm');
    const grid = MAPS[m].grid;
    for (const [kind, x, y] of list) {
      const where = `${kind} at ${key(m, x, y)}`, k = key(m, x, y);
      if (!PROP_TILES[kind]) bad.push(`${where}: an unknown kind`);
      else if (grid[y][x] !== PROP_TILES[kind]) bad.push(`${where}: not written (the tile is '${grid[y][x]}')`);
      if (taken.has(k)) bad.push(`${where}: on a tile something else uses`);
      if (seen.has(k)) bad.push(`${where}: twice`);
      seen.add(k);
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => grid[y + dy]?.[x + dx] === 'E')) bad.push(`${where}: beside an exit`);
      if (!(x > 0 && y > 0 && x < grid[0].length - 1 && y < grid.length - 1)) bad.push(`${where}: on the border`);
    }
  }
  assert.deepEqual(bad, []);
});

test('ground cover grows on open ground, never on the farm or the island plot', () => {
  assert.ok(!COVER.farm, 'none on the farm');
  for (const [m, c] of Object.entries(COVER)) {
    assert.ok(BIOMES[c.biome], `${m}: a known biome`);
    const grid = MAPS[m].grid;
    let n = 0, open = 0;
    grid.forEach((row, y) => row.forEach((t, x) => {
      const k = coverKind(m, x, y, 'Summer');
      if (k) { n++; assert.ok(['g', 'z', 'q'].includes(t) || t === MAPS[m].ground, `${m} ${x},${y}: ${k} on '${t}'`); }
      if (['g', 'z', 'q'].includes(t)) open++;
      for (const [x0, y0, x1, y1] of c.keepOff || []) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) assert.equal(k, null, `${m} ${x},${y}: kept bare`);
    }));
    assert.ok(n > open * c.rate * 0.4 && n < open * c.rate * 2.5, `${m}: about ${Math.round(c.rate * 100)}% covered (${n} of ${open} open tiles)`);
  }
  assert.equal(coverKind('farm', 5, 8, 'Summer'), null);
});

test('no flowers or mushrooms on the snow', () => {
  for (const m of Object.keys(COVER)) MAPS[m].grid.forEach((row, y) => row.forEach((_, x) => {
    assert.ok(!['flowers', 'mushrooms', 'bloom', 'clover'].includes(coverKind(m, x, y, 'Winter')), `${m} ${x},${y}`);
  }));
});
