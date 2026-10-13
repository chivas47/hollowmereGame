// Shipping, buying and the overnight payout.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { SUPPLIES, PLACEABLES } from '../data/crafting.js';
import { valueOf, clearQuality } from './quality.js';

export const inSeason = (crop) => CROPS[crop].seasons.includes(today().season);
export const canBuy = (crop, n) => inSeason(crop) && G.S.gold >= CROPS[crop].seed * n;

export function buy(crop, n) {
  if (!canBuy(crop, n)) return false;
  G.S.gold -= CROPS[crop].seed * n;
  G.S.seeds[crop] += n;
  emit('sfx', 'coin');
  changed();
  return true;
}

// Farm supplies from the stall go into the kit (slot 7).
export const canBuySupply = (k, n) => !!SUPPLIES[k] && G.S.gold >= SUPPLIES[k] * n;
export function buySupply(k, n) {
  if (!canBuySupply(k, n)) return false;
  G.S.gold -= SUPPLIES[k] * n;
  G.S.kit[k] = (G.S.kit[k] || 0) + n;
  if (!(G.S.kit[G.S.kitSel] > 0)) G.S.kitSel = k;
  emit('sfx', 'coin');
  changed();
  return true;
}

export function ship() {
  const S = G.S;
  let value = 0, count = 0, kept = 0;
  for (const k in S.bag) {
    if (ITEMS[k].material) { kept += S.bag[k]; continue; }   // ore and stone stay for upgrades
    value += valueOf(k); count += S.bag[k]; S.bag[k] = 0; clearQuality(k);
  }
  if (!count) {
    notify(kept ? 'Ore and stone stay in your bag for upgrades. Nothing else to ship.'
      : S.bin ? `The bin holds ${S.bin}g of goods. It pays out tonight.` : 'Your basket is empty. Harvest or forage something first.');
    return;
  }
  S.bin += value;
  emit('sfx', 'coin');
  notify(`Shipped ${count} item${count > 1 ? 's' : ''} for ${value}g. Paid while you sleep.`);
  changed();
}

on('day:end', (report) => {
  report.payout = G.S.bin;
  G.S.gold += G.S.bin;
  G.S.bin = 0;
});
