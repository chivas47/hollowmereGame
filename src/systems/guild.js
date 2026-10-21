// The Wardens' Lodge (v37): a cabin in the Wilds by the Hollow. Warden Hale sells weapons and boots as you go
// deeper and keeps the slaying goals: G.S.slain counts monsters by kind, G.S.goalsClaimed lists goals rewarded.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { LODGE, LODGE_SHOP, GOALS } from '../data/guild.js';
import { WEAPONS } from '../data/weapons.js';
import { CLOTHES } from '../data/clothing.js';
import { MAPS } from '../data/maps.js';
import { giveFind } from './gear.js';
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

export const slain = (kind) => G.S.slain[kind] || 0;
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
  const g = GOALS[kind];
  if (g && S.slain[kind] === g.n) notify(`You have defeated ${g.n} ${g.label}! ${LODGE.keeper} has a reward for you at the lodge.`);
});

// v37: wild weeds and forage written before the lodge stood may sit under it; they go.
on('game:loaded', () => {
  const g = MAPS.wilds.grid, free = (o) => g[o.y]?.[o.x] !== '&';
  if (Array.isArray(G.S.wildWeeds)) G.S.wildWeeds = G.S.wildWeeds.filter(free);
  if (Array.isArray(G.S.forage)) G.S.forage = G.S.forage.filter(free);
});

// v49: Hale is a villager now (data/npcs.js). v98: the door takes you inside, where he keeps the counter (systems/venues.js).
