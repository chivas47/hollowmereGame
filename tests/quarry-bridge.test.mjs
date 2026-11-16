// v238 (roadmap 82): the quarry waits behind a broken bridge the workroom mends, and its rocks hold no gold.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { MAPS } from '../src/data/maps.js';
import { QUARRY_BRIDGE as B, BRIDGE_TILE, MENDED_TILE } from '../src/data/bridge.js';
import { RIVAL } from '../src/data/restoration.js';
import { QUARRY, bridgeOpen, mendBridge, refillQuarry } from '../src/systems/quarry.js';
import { buyRoom } from '../src/systems/restoration.js';
import { freshFarm } from './setup.mjs';

test('a new farm finds the bridge broken and no way into the quarry', () => {
  freshFarm();
  emit('game:loaded');
  assert.equal(bridgeOpen(), false);
  assert.equal(MAPS[B.map].grid[B.y][B.x], BRIDGE_TILE);
  assert.equal(MAPS[B.map].exits[B.exit.at], undefined);
});

test('the bridge is mended only once the workroom is restored, and stays mended', () => {
  freshFarm();
  G.S.restore.rooms.larder = true;
  assert.equal(mendBridge(), false, 'another room does not mend it');
  G.S.restore.rooms.crafts = true;
  emit('day:start');
  assert.equal(bridgeOpen(), true);
  assert.equal(MAPS[B.map].grid[B.y][B.x], MENDED_TILE);
  assert.equal(MAPS[B.map].exits[B.exit.at].to, 'quarry');
  assert.equal(mendBridge(), false, 'only once');
});

test('buying the workroom from Ashgrove mends it too', () => {
  freshFarm({ gold: 100000 });
  G.S.restore.rival = true;
  assert.equal(RIVAL.rooms.crafts, 25000, 'Stardew\'s Joja bridge price');
  assert.ok(buyRoom('crafts'));
  assert.ok(mendBridge());
});

test('every older save keeps its quarry; a new save stays as it was', () => {
  for (const name of ['v15', 'v50', 'v90', 'v117']) {
    const old = JSON.parse(readFileSync(new URL(`saves/${name}.json`, import.meta.url)));
    assert.equal(merge(old).quarryBridge, true, name);
  }
  const fresh = JSON.parse(JSON.stringify(newState()));
  assert.equal(merge(fresh).quarryBridge, false);
});

test('quarry rocks are stone, copper and iron only', () => {
  assert.ok(QUARRY.mix.every(([t]) => t !== '%'));
  assert.ok(Math.abs(QUARRY.mix.reduce((a, [, c]) => a + c, 0) - 1) < 1e-9);
  freshFarm();
  for (let i = 0; i < 20; i++) { refillQuarry(); assert.ok(Object.values(G.S.quarryRocks).every((r) => r.t !== '%')); }
});

test('a ravine runs down the mountain\'s east edge and the bridge is the only way over', async () => {
  const { SOLID } = await import('../src/data/maps.js');
  const { RAVINE_TILE } = await import('../src/data/bridge.js');
  freshFarm();
  emit('game:loaded');
  const g = MAPS[B.map].grid;
  for (let y = 1; y < g.length - 1; y++) {
    if (y === B.y) continue;
    assert.equal(g[y][B.x], RAVINE_TILE, `row ${y}`);
    assert.ok(SOLID.has(g[y][B.x]));
  }
  assert.ok(SOLID.has(BRIDGE_TILE) && !SOLID.has(MENDED_TILE));
});
