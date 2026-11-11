// Shipping, buying and the overnight payout.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { SUPPLIES, PLACEABLES } from '../data/crafting.js';
import { counts, addItem, unitValue, valueOf } from './quality.js';
import { priceMult } from './professions.js';
import { pinned } from './bag.js';
import { fmtGold } from '../core/format.js';

export const inSeason = (crop) => CROPS[crop].seasons.includes(today().season);
export const canBuy = (crop, n) => !CROPS[crop].crafted && inSeason(crop) && G.S.gold >= CROPS[crop].seed * n;

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

// v236: the bin opens a picker (ui/shipbin.js). Each stack is an item at one quality; what it fetches is the
// quality price and the selling professions, as before. Materials (ore, stone, gear) are never shipped.
export const shippable = (k) => !!ITEMS[k] && !ITEMS[k].material;
export const shipPrice = (k, t) => Math.floor(unitValue(k, t) * priceMult(k));

// Every stack you could ship: { k, t, n, unit, pinned }, quality from plain up.
export function shipStacks() {
  const out = [];
  for (const k of Object.keys(G.S.bag)) {
    if (!(G.S.bag[k] > 0) || !shippable(k)) continue;
    counts(k).forEach((n, t) => { if (n > 0) out.push({ k, t, n, unit: shipPrice(k, t), pinned: pinned(k) }); });
  }
  return out;
}

// Removes n of item k at quality t from the bag.
function take(k, t, n) {
  G.S.bag[k] -= n;
  if (t > 0) G.S.qbag[k][t - 1] -= n;
}

// Puts the picked stacks in the bin ([{ k, t, n }]). The last one is remembered, so it can come back out before
// night (Stardew's rule: only the last thing put in). Returns { count, value }.
export function shipItems(picks, { quiet = false } = {}) {
  let count = 0, value = 0;
  for (const p of picks) {
    if (!shippable(p.k)) continue;
    const n = Math.min(Math.floor(p.n) || 0, counts(p.k)[p.t] || 0);
    if (n <= 0) continue;
    const v = n * shipPrice(p.k, p.t);
    take(p.k, p.t, n);
    count += n; value += v;
    G.S.binLast = { k: p.k, t: p.t, n, value: v };
  }
  if (!count) return { count, value };
  G.S.bin += value;
  emit('sfx', 'coin');
  if (!quiet) notify(`Shipped ${count} item${count > 1 ? 's' : ''} for ${fmtGold(value)}. Paid while you sleep.`);
  changed();
  return { count, value };
}

// Ship all: every stack but the items pinned in the Bag (they can still be shipped one by one).
export const shipAll = (opts) => shipItems(shipStacks().filter((s) => !s.pinned), opts);
export const ship = shipAll;   // the simulator's name (tools/balance.mjs)

// The last stack put in comes back to the bag, and its gold leaves the bin.
export function takeBack() {
  const L = G.S.binLast;
  if (!L || !ITEMS[L.k]) return false;
  addItem(L.k, L.n, L.t);
  G.S.bin = Math.max(0, G.S.bin - L.value);
  G.S.binLast = null;
  changed();
  return true;
}

on('day:end', (report) => {
  report.payout = G.S.bin;
  G.S.earned = (G.S.earned || 0) + G.S.bin;   // v32: everything shipped, ever (the farm cave opens at 25,000g)
  G.S.gold += G.S.bin;
  G.S.bin = 0;
  G.S.binLast = null;   // v236: shipped is final once paid
});
