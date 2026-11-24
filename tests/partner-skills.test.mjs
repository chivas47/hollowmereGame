// v332 (roadmap 116a): farmer two's own skills and professions (Stardew co-op). What they gather levels them, not
// you; their levels set their own energy and health tops; their professions apply to them; gold and the bag stay
// shared. Old farms where they have played start them with a copy of yours (save step 10).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { LEVEL_XP, MILESTONES, ENERGY_PER_MILESTONE } from '../src/data/skills.js';
import { join, asFarmer, asPartnerStats, OWN_STATS } from '../src/systems/partner.js';
import { skillLevel } from '../src/systems/skills.js';
import { has, pending, choose } from '../src/systems/professions.js';
import { freshFarm } from './setup.mjs';

beforeEach(() => { freshFarm(); G.P2 = null; G.keys = {}; G.fishing = null; G.lock = false; });
const xpFor = (lv) => LEVEL_XP[lv - 1];

test('what farmer two gathers levels their skill, not yours; the bonus items go to the shared bag', () => {
  join();
  const mine = G.S.skills.farming;
  asFarmer('p2', () => emit('gather', { skill: 'farming', xp: xpFor(3) }));
  assert.equal(G.S.skills.farming, mine, 'yours untouched');
  assert.equal(G.S.partner.skills.farming, xpFor(3));
  assert.equal(asPartnerStats(() => skillLevel('farming')), 3);
  assert.equal(skillLevel('farming'), 0);
});

test('their milestones raise their energy top and not yours, and every morning fills them to it', () => {
  const myMax = G.S.maxEnergy;
  asFarmer('p2', () => emit('gather', { skill: 'mining', xp: xpFor(MILESTONES[0]) }));
  assert.equal(G.S.maxEnergy, myMax, 'your top is as it was');
  assert.equal(G.S.partner.maxEnergy, myMax + ENERGY_PER_MILESTONE);
  G.S.partner.energy = 3;
  emit('day:start', {});
  assert.equal(G.S.partner.energy, G.S.partner.maxEnergy);
  assert.equal(G.S.maxEnergy, myMax);
});

test('their profession is theirs: chosen in their stats, read only for them', () => {
  asFarmer('p2', () => emit('gather', { skill: 'farming', xp: xpFor(5) }));
  assert.equal(pending(), null, 'nothing waits for you');
  const p = asPartnerStats(pending);
  assert.equal(p.skill, 'farming');
  assert.ok(asPartnerStats(() => choose('farming', p.options[0])));
  assert.equal(asPartnerStats(() => has(p.options[0])), true);
  assert.equal(has(p.options[0]), false);
  assert.deepEqual(G.S.professions.farming || [], []);
});

test('the swap always puts everything back, even when what runs inside fails, and never swaps twice', () => {
  const before = Object.fromEntries(OWN_STATS.map((k) => [k, JSON.stringify(G.S[k])]));
  assert.throws(() => asPartnerStats(() => { throw new Error('boom'); }));
  asPartnerStats(() => asPartnerStats(() => asFarmer('p2', () => { G.S.skills.foraging = 99; })));
  assert.equal(G.S.partner.skills.foraging, 99, 'nested calls write to them');
  for (const k of OWN_STATS) assert.equal(JSON.stringify(G.S[k]), before[k], `${k} is yours again`);
});

test('save step 10: a farmer two who has played starts with a copy of your skills; one who never has starts new', () => {
  const old = JSON.parse(JSON.stringify(newState()));
  old.v = 9; delete old.partner.skills; delete old.partner.professions;
  old.skills.fishing = 5000; old.professions = { fishing: ['angler'] };
  old.partner.picked = true;
  const s = merge(JSON.parse(JSON.stringify(old)));
  assert.equal(s.partner.skills.fishing, 5000);
  assert.deepEqual(s.partner.professions, { fishing: ['angler'] });
  s.partner.professions.fishing.push('x');
  assert.deepEqual(s.professions.fishing, ['angler'], 'a copy, not the same list');
  old.partner.picked = false;
  const n = merge(JSON.parse(JSON.stringify(old)));
  assert.equal(n.partner.skills.fishing, 0);
  assert.deepEqual(n.partner.professions, {});
  const again = merge(JSON.parse(JSON.stringify(s)));
  assert.equal(again.partner.skills.fishing, 5000, 'kept through a save and load');
});

test('nothing listening sees farmer two\'s stats in your place: changes made as them are sent once you are back', async () => {
  const { on } = await import('../src/core/events.js');
  const seen = [];
  on('state:changed', () => seen.push(G.S.maxEnergy));
  G.S.partner.maxEnergy = 123;
  const mine = G.S.maxEnergy, n = seen.length;
  asFarmer('p2', () => emit('gather', { skill: 'farming', xp: 1 }));
  assert.ok(seen.length > n, 'the change is sent');
  assert.ok(seen.slice(n).every((v) => v === mine), `only your top seen: ${seen.slice(n)}`);
});
