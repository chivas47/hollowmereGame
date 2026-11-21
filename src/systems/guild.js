// The Wardens' Lodge (v37): a cabin in the Wilds by the Hollow. Warden Hale sells weapons and boots as you go
// deeper and keeps the slaying goals: G.S.slain counts monsters by kind, G.S.goalsClaimed lists goals rewarded.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { LODGE, LODGE_SHOP, GOALS, WEAPON_TIERS } from '../data/guild.js';
import { WEAPONS } from '../data/weapons.js';
import { CLOTHES } from '../data/clothing.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { fmtGold } from '../core/format.js';
import { giveFind, tierOf, weaponLabel } from './gear.js';
import { keyName } from '../core/controls.js';

export const lodgeOpen = () => G.S.mineDeepest >= LODGE.opensAt;
export const owns = (key) => (WEAPONS[key] ? G.S.weapons.includes(key) : !!G.S.wardrobe[key]);
export const itemName = (key) => WEAPONS[key]?.name || CLOTHES[key]?.name || key;

// What Hale offers now: the shop rows you have gone deep enough for.
export const stock = () => LODGE_SHOP.filter((o) => G.S.mineDeepest >= o.floor);

export function buyGear(key) {
  const S = G.S, o = stock().find((x) => x.key === key);
  if (!o || owns(key) || S.gold < o.cost) return false;
  S.gold -= o.cost;
  if (WEAPONS[key]) S.weapons.push(key); else S.wardrobe[key] = true;
  emit('sfx', 'coin');
  notify(`You bought the ${itemName(key).toLowerCase()}. ${WEAPONS[key] ? 'Choose your weapon in' : 'Wear them from'} the bag (${keyName('bag')}).`);
  changed();
  return true;
}

// A goal's count: its kind's defeats, or (v230) the sum over the kinds it lists.
export const slain = (goal) => (GOALS[goal]?.kinds || [goal]).reduce((n, k) => n + (G.S.slain[k] || 0), 0);
export const goalDone = (kind) => slain(kind) >= GOALS[kind].n;

export function claimGoal(kind) {
  const S = G.S;
  if (!GOALS[kind] || !goalDone(kind) || S.goalsClaimed.includes(kind)) return false;
  S.goalsClaimed.push(kind);
  giveFind(GOALS[kind].reward, `${LODGE.keeper} hands you`);
  changed();
  return true;
}

on('monster:slain', ({ kind }) => {
  const S = G.S;
  S.slain[kind] = (S.slain[kind] || 0) + 1;
  S.weaponKills[S.weapon] = (S.weaponKills[S.weapon] || 0) + 1;   // v282: toward its next tier
  const t = WEAPON_TIERS[tierOf()];
  if (t && S.weaponKills[S.weapon] === t.kills) notify(`Your ${weaponLabel().toLowerCase()} has seen ${t.kills} defeats. ${LODGE.keeper} can temper it at the lodge.`);
  for (const [k, g] of Object.entries(GOALS)) {   // v230: a goal may count several kinds
    if ((g.kinds || [k]).includes(kind) && slain(k) === g.n) notify(`You have defeated ${g.n} ${g.label}! ${LODGE.keeper} has a reward for you at the lodge.`);
  }
});

// v37: wild weeds and forage written before the lodge stood may sit under it; they go.
on('game:loaded', () => {
  const g = MAPS.wilds.grid, free = (o) => g[o.y]?.[o.x] !== '&';
  if (Array.isArray(G.S.wildWeeds)) G.S.wildWeeds = G.S.wildWeeds.filter(free);
  if (Array.isArray(G.S.forage)) G.S.forage = G.S.forage.filter(free);
});

// v49: Hale is a villager now (data/npcs.js). v98: the door takes you inside, where he keeps the counter (systems/venues.js).

// v260 (roadmap 85i): the challenge brazier at the lodge. Lit, the dungeons' monsters are tougher and some are elites
// (systems/monsters.js challenge); doused, they are as before. It takes effect on the next floor you enter.
export function setBrazier(lit) {
  G.S.brazier = !!lit;
  notify(lit ? 'The challenge brazier flares. The dungeons will be harder from the next floor down, and some creatures there will glow gold.' : 'You douse the challenge brazier. The dungeons go back to how they were from the next floor.');
  changed();
}

// v282 (roadmap 93c): weapon tiers (data/guild.js WEAPON_TIERS). The next tier for a weapon, or null at the top; what
// still stands in the way of it (an empty list when it can be tempered); temper it.
export const nextWeaponTier = (key) => WEAPON_TIERS[tierOf(key)] || null;
export function temperBlocks(key) {
  const S = G.S, t = nextWeaponTier(key);
  if (!t || !S.weapons.includes(key)) return ['top'];
  const out = [];
  if ((S.weaponKills[key] || 0) < t.kills) out.push('kills');
  if (S.gold < t.gold) out.push('gold');
  for (const [k, n] of Object.entries(t.needs)) if ((S.bag[k] || 0) < n) out.push(k);
  return out;
}
export function temper(key) {
  const S = G.S, t = nextWeaponTier(key);
  if (temperBlocks(key).length) return false;
  S.gold -= t.gold;
  for (const [k, n] of Object.entries(t.needs)) S.bag[k] -= n;
  S.weaponTier[key] = tierOf(key) + 1;
  emit('sfx', 'levelup');
  emit('weapon:tempered', { key, tier: S.weaponTier[key] });
  notify(`${LODGE.keeper} hands back your ${weaponLabel(key).toLowerCase()}: ${Math.round(t.damage * 100)}% more damage than it had new.`);
  changed();
  return true;
}

// v285 (roadmap 94a): the Lodge's tempering row reads from these: an amount with a plural name, and each need of a
// weapon's next tier on its own, met or not.
export const amount = (k, n) => `${n.toLocaleString('en-US')} ${(n === 1 ? ITEMS[k]?.name : ITEMS[k]?.many || ITEMS[k]?.name || k).toLowerCase()}`;
export function tierNeeds(k) {
  const S = G.S, t = nextWeaponTier(k);
  if (!t) return [];
  const kills = S.weaponKills[k] || 0;
  return [
    { text: `${t.kills} defeats with it`, have: `(${Math.min(kills, t.kills)} so far)`, met: kills >= t.kills },
    ...Object.entries(t.needs).map(([m, n]) => ({ text: amount(m, n), have: `(you have ${(S.bag[m] || 0).toLocaleString('en-US')})`, met: (S.bag[m] || 0) >= n })),
    { text: fmtGold(t.gold), have: '', met: S.gold >= t.gold },
  ];
}
