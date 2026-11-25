// v347: a boss is a creature entry (data/monsters.js `boss`), and what makes it a boss (its size, health bar, calls,
// rage, boss music, its own Bestiary card) works for any boss anywhere, not only the Gravewarden in its catacombs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { MONSTERS, kindsFor } from '../src/data/monsters.js';
import { BESTIARY_ORDER, whereLives } from '../src/data/bestiary.js';
import { LOOT, lootPerDefeat } from '../src/data/loot.js';
import { slimes, spawnBoss, hitMonster } from '../src/systems/monsters.js';
import { musicContext } from '../src/systems/musicDirector.js';
import '../src/systems/guild.js';   // counts defeats by kind
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const W = MONSTERS.gravewarden;
const onFarm = () => {
  freshFarm(); G.paused = false; G.P2 = null; G.S.hp = G.S.maxHp = 1e6;
  placePlayer('farm', 10, 12, 'right');
  slimes.length = 0;
  return spawnBoss('farm', 'gravewarden', 14, 12);
};

test('the Gravewarden is its own creature: its stats, size, Bestiary card and drops', () => {
  const m = onFarm();
  assert.equal(m.kind, 'gravewarden'); assert.ok(m.boss);
  assert.equal(m.hp, W.hp); assert.equal(m.maxHp, W.hp); assert.equal(m.dmg, W.dmg); assert.equal(m.scale, W.boss.scale);
  assert.equal(BESTIARY_ORDER[BESTIARY_ORDER.length - 1], 'gravewarden', 'the bosses come last in the Bestiary');
  assert.match(whereLives('gravewarden'), /catacombs/);
  assert.ok(LOOT.gravewarden.length >= 2);
  assert.ok(lootPerDefeat('gravewarden').boneshard >= 8 * lootPerDefeat('rattler').boneshard, 'about ten rattlers in one');
  assert.equal(W.xp, 10 * MONSTERS.rattler.xp);
  for (const z of ['hollow', 'cavern', 'vent']) for (const f of [1, 60, 160]) assert.ok(!kindsFor(z, f).includes('gravewarden'), 'never drawn by a floor');
});

test('anywhere, a boss calls its creatures past each mark and rages low on health', () => {
  const m = onFarm();
  m.hp = m.maxHp * 0.6; runUpdaters(0.02);
  assert.equal(slimes.filter((x) => x.kind === W.boss.calls[0]).length, W.boss.calls[1], 'first mark: its call, round it');
  runUpdaters(0.02);
  assert.equal(slimes.length, 1 + W.boss.calls[1], 'each mark calls once');
  m.hp = m.maxHp * 0.3; runUpdaters(0.02);
  assert.equal(slimes.length, 1 + 2 * W.boss.calls[1]);
  assert.equal(m.speed, W.boss.rageSpeed);
});

test('a boss near you plays the boss music, and its fall is a defeat like any other', () => {
  const m = onFarm();
  assert.equal(musicContext(G.S, 1e6).boss, true);
  hitMonster(m, 1e9);
  assert.ok(!slimes.includes(m));
  assert.equal(G.S.slain.gravewarden, 1, 'counted as itself, not as a rattler');
});
