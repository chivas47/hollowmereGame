// v363: cheat mode for testing. The code word turns it on, the clock stands still, one rock hit goes a floor down,
// and every resource stays topped up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { TICK } from '../src/core/constants.js';
import { runUpdaters, runInteractions } from '../src/core/registry.js';
import { ROCKS } from '../src/data/minerals.js';
import { MAPS } from '../src/data/maps.js';
import { MINE, enterMine } from '../src/systems/mine.js';
import '../src/systems/clock.js';
import { CHEAT_CODE, PLENTY, typeCode, topUp, setCheat } from '../src/systems/cheats.js';
import { freshFarm } from './setup.mjs';

const tileAt = (x, y) => MAPS.mine.grid[y][x];
const typeAll = (text) => { let b = '', done = false; for (const ch of text) { const t = typeCode(b, ch); b = t.buffer; done = done || t.done; } return done; };

test('typing the code word completes it; its letters are eaten, others are not', () => {
  assert.equal(typeAll(CHEAT_CODE), true);
  assert.equal(typeAll('NunoMenezes'), true);
  assert.equal(typeAll('xxnunomenezes'), true);
  assert.equal(typeAll('nunnunomenezes'), true);   // a slip restarts from the n
  assert.equal(typeAll('nunomenezs'), false);
  assert.equal(typeCode('', 'n').eat, true);
  assert.equal(typeCode('', 'w').eat, false);
  assert.equal(typeCode('nu', 'Shift').buffer, '');
});

test('topping up fills every resource and never lowers one', () => {
  const S = freshFarm();
  S.energy = 3; S.hp = 1; S.water = 0; S.bag.stone = 5000;
  topUp(S);
  assert.equal(S.gold, PLENTY.gold);
  assert.equal(S.energy, S.maxEnergy); assert.equal(S.hp, S.maxHp); assert.equal(S.water, S.maxw);
  assert.equal(S.bag.stone, 5000);
  assert.ok(Object.entries(S.bag).every(([k, n]) => k === 'stone' || n === PLENTY.items));
  assert.ok(Object.values(S.seeds).every((n) => n === PLENTY.seeds));
  assert.ok(Object.values(S.kit).every((n) => n === PLENTY.kit));
});

test('in cheat mode the clock stands still and spending is refilled each frame', () => {
  freshFarm(); G.clockAcc = 0;
  setCheat(true);
  const t = G.S.time;
  G.S.gold = 10; G.S.energy = 0;
  runUpdaters(TICK * 3);
  assert.equal(G.S.time, t);
  assert.equal(G.S.gold, PLENTY.gold); assert.equal(G.S.energy, G.S.maxEnergy);
  setCheat(false);
  runUpdaters(TICK);
  assert.equal(G.S.time, t + 10);
});

test('in cheat mode one pickaxe hit on any rock takes you a floor down', () => {
  freshFarm(); G.S.slot = 3;   // the pickaxe
  setCheat(true);
  enterMine(1);
  for (let f = 1; f <= 3; f++) {
    const [x, y] = Object.keys(MINE.rocks)[0].split(',').map(Number);
    const tile = tileAt(x, y);
    assert.ok(ROCKS[tile]);
    assert.equal(runInteractions({ tx: x, ty: y, tile, mapId: 'mine', item: 'pick' }), true);
    assert.equal(MINE.floor, f + 1);
  }
  setCheat(false);
  const [x, y] = Object.keys(MINE.rocks)[0].split(',').map(Number);
  runInteractions({ tx: x, ty: y, tile: tileAt(x, y), mapId: 'mine', item: 'pick' });
  assert.equal(MINE.floor, 4);   // off again: rocks take their usual hits
});
