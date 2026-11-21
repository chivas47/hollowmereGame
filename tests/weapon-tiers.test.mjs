// Roadmap 93c: weapons rise three tiers at the Wardens' Lodge, each needing defeats while it was your weapon,
// monster materials and gold; the tier raises its damage and old saves start every weapon at tier 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { WEAPON_TIERS } from '../src/data/guild.js';
import { WEAPONS } from '../src/data/weapons.js';
import { newState, merge } from '../src/core/state.js';
import { temper, temperBlocks, nextWeaponTier } from '../src/systems/guild.js';
import { tierOf, tierMult, weaponLabel, tierDamage } from '../src/systems/gear.js';
import { damageOf } from '../src/systems/monsters.js';
import { freshFarm } from './setup.mjs';

const stock = (t) => { G.S.gold += t.gold; for (const [k, n] of Object.entries(t.needs)) G.S.bag[k] = (G.S.bag[k] || 0) + n; };

test('tiers rise in cost and add up to the galaxy-to-infinity step', () => {
  assert.equal(WEAPON_TIERS.length, 3);
  for (let i = 1; i < 3; i++) {
    assert.ok(WEAPON_TIERS[i].kills > WEAPON_TIERS[i - 1].kills);
    assert.ok(WEAPON_TIERS[i].gold > WEAPON_TIERS[i - 1].gold);
    assert.ok(WEAPON_TIERS[i].damage > WEAPON_TIERS[i - 1].damage);
  }
  assert.ok(Math.abs(WEAPON_TIERS[2].damage - 0.3) < 1e-9, 'about Stardew\'s +29%');
});

test('defeats count for the weapon in use', () => {
  freshFarm({ weapons: ['oldblade', 'club'], weapon: 'club' });
  emit('monster:slain', { kind: 'slime', x: 0, y: 0, map: 'mine', drops: {} });
  emit('monster:slain', { kind: 'mite', x: 0, y: 0, map: 'mine', drops: {} });
  assert.equal(G.S.weaponKills.club, 2);
  assert.ok(!G.S.weaponKills.oldblade);
});

test('tempering needs defeats, materials and gold, and takes them', () => {
  freshFarm({ weapons: ['oldblade', 'club'], weapon: 'club', gold: 0 });
  const t = WEAPON_TIERS[0];
  assert.ok(temperBlocks('club').includes('kills'));
  assert.equal(temper('club'), false);
  G.S.weaponKills.club = t.kills;
  assert.deepEqual(temperBlocks('club').sort(), ['gold', ...Object.keys(t.needs)].sort());
  stock(t);
  const before = damageOf();
  assert.equal(temper('club'), true);
  assert.equal(tierOf('club'), 1);
  assert.equal(G.S.gold, 0);
  for (const k of Object.keys(t.needs)) assert.equal(G.S.bag[k], 0);
  assert.ok(Math.abs(damageOf() / before - (1 + t.damage)) < 1e-9, 'damage rises by the tier');
  assert.equal(weaponLabel('club'), `${t.name} ${WEAPONS.club.name.toLowerCase()}`);
  assert.equal(tierDamage('club'), Math.round(WEAPONS.club.damage * 1.1 * 10) / 10);
});

test('a weapon stops at the top tier, and only weapons you own temper', () => {
  freshFarm({ weapons: ['oldblade'], weapon: 'oldblade', weaponKills: { oldblade: 9999 } });
  for (const t of WEAPON_TIERS) { stock(t); assert.equal(temper('oldblade'), true); }
  assert.equal(tierOf('oldblade'), 3);
  assert.equal(nextWeaponTier('oldblade'), null);
  assert.ok(Math.abs(tierMult('oldblade') - 1.3) < 1e-9);
  stock(WEAPON_TIERS[2]);
  assert.equal(temper('oldblade'), false);
  assert.equal(temper('club'), false);
});

test('old saves start every weapon at tier 0 with no defeats', () => {
  const old = newState(); delete old.weaponTier; delete old.weaponKills;
  const s = merge(JSON.parse(JSON.stringify(old)));
  assert.deepEqual(s.weaponTier, {});
  assert.deepEqual(s.weaponKills, {});
  G.S = s;
  assert.equal(tierOf('oldblade'), 0);
  assert.equal(tierMult('oldblade'), 1);
});

test('the bag lists the weapon tiers under Used in for their materials', async () => {
  const { usedIn } = await import('../src/systems/bag.js');
  for (const t of WEAPON_TIERS) for (const [k, n] of Object.entries(t.needs)) {
    assert.ok(usedIn(k).some((u) => u.where === 'Lodge' && u.name === `${t.name} weapon` && u.n === n), `${k} lists ${t.name}`);
  }
});

test('the Lodge reads a tier as needs, one a line, with plural names and met marks (94a)', async () => {
  const { amount, tierNeeds } = await import('../src/systems/guild.js');
  assert.equal(amount('boneshard', 5), '5 bone shards');
  assert.equal(amount('boneshard', 1), '1 bone shard');
  assert.equal(amount('chitin', 10), '10 chitin');
  assert.equal(amount('umbrite', 1), '1 umbrite ore');
  freshFarm({ weapons: ['club'], weapon: 'club', gold: 600, weaponKills: { club: 12 } });
  G.S.bag.chitin = 10;
  const t = WEAPON_TIERS[0], n = tierNeeds('club');
  assert.deepEqual(n.map((x) => x.text), [`${t.kills} defeats with it`, '10 chitin', '5 bone shards', '500g']);
  assert.deepEqual(n.map((x) => x.met), [false, true, false, true]);
  assert.equal(n[0].have, '(12 so far)');
  G.S.weaponTier.club = 3;
  assert.deepEqual(tierNeeds('club'), []);
});
