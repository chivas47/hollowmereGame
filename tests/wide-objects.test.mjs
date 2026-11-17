// Roadmap 91a (Nuno, November 2026): a board or boat drawn two tiles wide blocked and answered Use only on one tile.
// Every two-tile object now fills both tiles with the same tile, so both halves are solid and both open it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, SOLID, WIDE_OBJECTS } from '../src/data/maps.js';
import { G } from '../src/core/game.js';
import { on } from '../src/core/events.js';
import { runInteractions } from '../src/core/registry.js';
import '../src/systems/island.js';
import '../src/systems/desert.js';
import '../src/systems/nuts.js';
import { freshFarm } from './setup.mjs';

const wide = Object.entries(MAPS).flatMap(([id, m]) => (m.objects || []).filter((o) => WIDE_OBJECTS[o.art]).map((o) => [id, o]));

test('every two-tile object is solid on both of its tiles, with one tile for both halves', () => {
  assert.ok(wide.length >= 7, `${wide.length} wide objects`);
  for (const [id, o] of wide) {
    const row = MAPS[id].grid[o.y];
    for (let i = 0; i < WIDE_OBJECTS[o.art]; i++) assert.ok(SOLID.has(row[o.x + i]), `${id} ${o.art} at ${o.x + i},${o.y} blocks`);
    assert.equal(row[o.x + 1], row[o.x], `${id} ${o.art}: both halves are the same object`);
  }
});

test('the right half of the beach boat, the island trader and the coach stop answer Use like the left half', () => {
  freshFarm();
  const opened = [];
  for (const ev of ['ui:boat', 'ui:islandshop', 'ui:dtrader', 'ui:coach']) on(ev, () => opened.push(ev));
  for (const [id, art] of [['beach', 'boat'], ['island', 'table'], ['desert', 'table']]) {
    const o = MAPS[id].objects.find((x) => x.art === art);
    G.S.map = id;
    opened.length = 0;
    const left = runInteractions({ tx: o.x, ty: o.y, tile: MAPS[id].grid[o.y][o.x], mapId: id, item: 'hoe' });
    const right = runInteractions({ tx: o.x + 1, ty: o.y, tile: MAPS[id].grid[o.y][o.x + 1], mapId: id, item: 'hoe' });
    assert.equal(right, left, `${id} ${art}: the right half does what the left does`);
  }
});
