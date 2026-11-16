// Roadmap 85g: a lodge goal for each new way of fighting (85d to 85f), with Stardew-sized counts and a ring or hat
// each; the shell ring (Stardew's crabshell ring) takes 3 off every hit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { GOALS } from '../src/data/guild.js';
import { MONSTERS, RINGS } from '../src/data/weapons.js';
import { CLOTHES } from '../src/data/clothing.js';
import { slain, goalDone, claimGoal } from '../src/systems/guild.js';
import { hurtPlayer } from '../src/systems/health.js';
import { freshFarm } from './setup.mjs';

const NEW = ['crab', 'mole', 'puff', 'lurker', 'dustdevil', 'ashswarm', 'spitter', 'sandspitter', 'cragspitter', 'mossslime', 'emberslime', 'wisp', 'shade', 'shellback', 'cragshell', 'stormwing'];
const goalOf = (k) => Object.keys(GOALS).filter((g) => g === k || GOALS[g].kinds?.includes(k));

test('every new kind counts toward exactly one goal, and every goal pays a real ring or hat', () => {
  for (const k of NEW) {
    assert.ok(MONSTERS[k], `${k} exists`);
    assert.equal(goalOf(k).length, 1, `${k} has one goal`);
  }
  for (const [g, d] of Object.entries(GOALS)) {
    assert.ok(RINGS[d.reward] || CLOTHES[d.reward] || d.reward === 'mitefang' || d.reward === 'magpie', `${g} pays ${d.reward}`);
    for (const k of d.kinds || [g]) assert.ok(MONSTERS[k], `${g} counts ${k}`);
  }
  assert.ok(CLOTHES.diggercap.found && CLOTHES.diggercap.slot === 'hat');
});

test('a goal sums its kinds, and the reward is claimed once', () => {
  freshFarm();
  G.S.slain = { mole: 20, lurker: 9 };
  assert.equal(slain('burrowers'), 29);
  assert.equal(goalDone('burrowers'), false);
  G.S.slain.lurker = 10;
  assert.ok(goalDone('burrowers'));
  assert.ok(claimGoal('burrowers'));
  assert.ok(G.S.wardrobe?.diggercap || G.S.finds?.includes('diggercap') || G.S.bag?.diggercap, 'the cap is yours');
  assert.equal(claimGoal('burrowers'), false, 'once');
});

test('the shell ring takes 3 off every hit', () => {
  const hit = (rings) => {
    freshFarm({ rings });
    G.hurtT = 0; G.paused = false; G.block = 0; G.dialog = { you: false, p2: false };
    G.S.hp = 100; hurtPlayer(20, G.S.x + 10, G.S.y);
    return 100 - G.S.hp;
  };
  assert.equal(hit([null, null]) - hit(['shellring', null]), 3);
});
