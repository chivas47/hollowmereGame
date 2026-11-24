// v338 (roadmap 117d): ingredients a recipe names, filled by the item itself or any that stands for it (data/items.js
// FILLS: flower honey for meadow honey). stores: where to look, in order (the bag, then the kitchen's fridge).
// Taken plainest first; quality counts reconcile on their own (systems/quality.js counts).
import { G } from '../core/game.js';
import { fillsFor } from '../data/items.js';

export const haveIngredient = (k, stores = [G.S.bag]) =>
  fillsFor(k).reduce((n, i) => n + stores.reduce((m, st) => m + (st[i] || 0), 0), 0);

export function takeIngredient(k, n, stores = [G.S.bag]) {
  for (const i of fillsFor(k)) for (const st of stores) {
    if (n <= 0) return;
    const t = Math.min(st[i] || 0, n);
    if (t > 0) { st[i] -= t; n -= t; }
  }
}
