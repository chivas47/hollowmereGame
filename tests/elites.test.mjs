// Roadmap 85i: the challenge brazier (Stardew's Shrine of Challenge by role, opt-in). Cold, nothing changes; lit,
// every dungeon monster is tougher and about one in ten is an elite with a sure mote.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { merge } from '../src/core/state.js';
import { MONSTERS, ELITE, statAt } from '../src/data/monsters.js';
import { enterMine, leaveMine } from '../src/systems/mine.js';
import { slimes, hitMonster } from '../src/systems/monsters.js';
import { setBrazier } from '../src/systems/guild.js';
import '../src/systems/bestiary.js';
import { freshFarm } from './setup.mjs';

const spawned = (floors) => { const out = []; for (let d = 1; d <= 8; d++) for (const f of floors) { G.S.day = d; enterMine(f); out.push(...slimes.map((m) => ({ ...m }))); } return out; };
const base = (m) => statAt(m.kind, 'hp', m.floor);

test('cold, the brazier changes nothing', () => {
  freshFarm();
  assert.equal(G.S.brazier, false);
  const ms = spawned([12, 30, 55]).filter((m) => !m.small);
  assert.ok(ms.length > 50);
  assert.ok(ms.every((m) => !m.elite && m.hp === base(m)));
  leaveMine();
});

test('lit, every creature is tougher and about one in ten is an elite', () => {
  freshFarm();
  setBrazier(true);
  const ms = spawned([12, 20, 30, 45, 55, 70]);
  const elites = ms.filter((m) => m.elite), rest = ms.filter((m) => !m.elite);
  for (const m of rest) assert.ok(Math.abs(m.hp - base(m) * ELITE.tougher) < 1e-9);
  for (const m of elites) assert.ok(Math.abs(m.hp - base(m) * ELITE.tougher * ELITE.hp) < 1e-9);
  const share = elites.length / ms.length;
  assert.ok(share > 0.05 && share < 0.16, `about one in ten (${share.toFixed(3)})`);
  setBrazier(false);
  leaveMine();
});

test('an elite always drops a mote and is marked in the Bestiary; the brazier is saved', () => {
  freshFarm();
  setBrazier(true);
  for (let i = 0; i < 40 && !slimes.some((m) => m.elite); i++) { G.S.day = i + 1; enterMine(30); }
  const m = slimes.find((o) => o.elite);
  assert.ok(m, 'found an elite');
  Object.assign(m, { hidden: false, shell: false, bs: undefined, ph: undefined });
  const motes = () => (G.S.bag.sunmote || 0) + (G.S.bag.gloommote || 0);
  const before = motes();
  hitMonster(m, 1e9);
  if (!slimes.includes(m)) assert.ok(motes() > before, 'a mote');
  assert.ok(G.S.bestiary.elites.includes(m.kind));
  assert.equal(merge(JSON.parse(JSON.stringify(G.S))).brazier, true);
  assert.equal(merge({ day: 3, gold: 0 }).brazier, false, 'old saves start cold');
  leaveMine();
});
