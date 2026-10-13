// Bram's workbench: tool and house upgrades, and ordering the coop.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { UPGRADES, COOP, COAL_COST, MATERIAL_COST, tier } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';

// Derived stats come from upgrade tiers plus bonuses. Call after anything that changes them.
export function recalcStats() {
  const S = G.S;
  S.maxw = tier(S, 'can').cap + S.waterBonus;
  S.water = Math.min(S.water, S.maxw);
  S.maxEnergy = tier(S, 'house').energy + (S.energyBonus || 0);
  S.energy = Math.min(S.energy, S.maxEnergy);
}

on('game:loaded', () => {
  // Older saves stored Bram's can reward directly in maxw. Keep the player's capacity.
  const S = G.S, base = tier(S, 'can').cap;
  if (S.maxw > base + S.waterBonus) S.waterBonus = S.maxw - base;
  recalcStats();
});

export const nextTier = (key) => UPGRADES[key].tiers[G.S.upgrades[key] + 1] || null;

export const hasNeeds = (needs = {}) => Object.entries(needs).every(([k, n]) => G.S.bag[k] >= n);
const takeNeeds = (needs = {}) => Object.entries(needs).forEach(([k, n]) => { G.S.bag[k] -= n; });
export const affordable = (cost, needs) => G.S.gold >= cost && hasNeeds(needs);

export function buyUpgrade(key) {
  const S = G.S, t = nextTier(key);
  if (!t || !affordable(t.cost, t.needs)) return false;
  S.gold -= t.cost;
  takeNeeds(t.needs);
  S.upgrades[key]++;
  recalcStats();
  if (key === 'can') S.water = S.maxw;
  if (key === 'house') S.energy = S.maxEnergy;
  notify(`The ${t.label} is yours.`);
  emit('upgraded', key);
  changed();
  return true;
}

export function buyCoal(n) {
  const S = G.S, cost = COAL_COST * n;
  if (S.gold < cost) return false;
  S.gold -= cost; S.bag.coal = (S.bag.coal || 0) + n;
  notify(`Bought ${n} coal.`);
  changed();
  return true;
}

// Wood and stone from Bram's workbench.
export function buyMaterial(k, n) {
  const S = G.S, cost = (MATERIAL_COST[k] || 0) * n;
  if (!cost || S.gold < cost) return false;
  S.gold -= cost; S.bag[k] = (S.bag[k] || 0) + n;
  notify(`Bought ${n} ${ITEMS[k].name.toLowerCase()}.`);
  changed();
  return true;
}

export function orderCoop() {
  const S = G.S;
  if (S.built.coop || !affordable(COOP.cost, COOP.needs)) return false;
  S.gold -= COOP.cost;
  takeNeeds(COOP.needs);
  S.built.coop = 'pending';
  notify('Bram will build the coop tonight.');
  changed();
  return true;
}

addInteraction(72, ({ tile }) => {
  if (tile !== 'K') return false;
  emit('ui:upgrades');
  return true;
});
