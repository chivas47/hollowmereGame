// v230: the Wardens' Lodge's slaying goals for v228's chargers, one a zone, each counting every charger of its zone,
// and their rewards: the savage ring (faster after each defeat), the horned helm, and the brace ring (a longer block).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { GOALS, SAVAGE } from '../src/data/guild.js';
import { MONSTERS, RINGS, SPECIALS } from '../src/data/weapons.js';
import { CLOTHES } from '../src/data/clothing.js';
import { ITEMS } from '../src/data/items.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { slain, goalDone, claimGoal } from '../src/systems/guild.js';
import { speedMult } from '../src/systems/buffs.js';
import { special, resetSpecials } from '../src/systems/specials.js';
import { slimes, spawnSlimes, hitMonster } from '../src/systems/monsters.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const CHARGERS = Object.keys(MONSTERS).filter((k) => MONSTERS[k].move === 'charge');
const charged = Object.values(GOALS).filter((g) => g.kinds);
const kill = (kind, n = 1) => { for (let i = 0; i < n; i++) emit('monster:slain', { kind, x: 0, y: 0, map: 'mine' }); };

test('every charger counts toward exactly one goal, and each reward exists', () => {
  for (const k of CHARGERS) assert.equal(charged.filter((g) => g.kinds.includes(k)).length, 1, k);
  for (const g of charged) assert.ok(RINGS[g.reward] || CLOTHES[g.reward], g.reward);
  assert.equal(CLOTHES.hornhelm.slot, 'hat');
  assert.ok(ITEMS.savagering && ITEMS.bracering, 'the rings are items');
});

test('a goal counts every kind it lists, and pays once', () => {
  freshFarm();
  kill('beetle', 100); kill('gloomhound', 49);
  assert.equal(slain('hollowchargers'), 149);
  assert.ok(!goalDone('hollowchargers'));
  assert.ok(!claimGoal('hollowchargers'));
  kill('ram');
  assert.ok(goalDone('hollowchargers'));
  assert.ok(claimGoal('hollowchargers'));
  assert.ok(G.S.bag.savagering > 0);
  assert.ok(!claimGoal('hollowchargers'), 'only once');
  assert.equal(slain('slime'), 0, 'single-kind goals count as before');
});

test('the savage ring makes you faster for a few seconds after each defeat', () => {
  freshFarm({ rings: ['savagering'] });
  G.savageT = 0;
  const base = speedMult();
  placePlayer('farm', 8, 8, 'right'); spawnSlimes('farm', 1);
  hitMonster(slimes[0], 9999);
  assert.ok(speedMult() > base);
  for (let t = 0; t < SAVAGE.time + 0.1; t += 0.05) runUpdaters(0.05);
  assert.equal(speedMult(), base);
});

test('the brace ring holds the sword\'s block twice as long', () => {
  freshFarm({ weapon: 'oldblade', slot: HOTBAR.indexOf('sword'), rings: ['bracering'] });
  G.paused = false; resetSpecials();
  special();
  assert.equal(G.block, SPECIALS.sword.block * 2);
  freshFarm({ weapon: 'oldblade', slot: HOTBAR.indexOf('sword'), rings: [] });
  resetSpecials(); special();
  assert.equal(G.block, SPECIALS.sword.block);
});
