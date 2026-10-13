// Item quality. G.S.bag keeps the total count of every item; G.S.qbag[item] = [fine, prime, heirloom]
// counts how many of those are above plain. Anything that takes items without asking (gifts, quests,
// machines) takes plain ones first: counts() trims the best tiers last when the total drops.
import { G } from '../core/game.js';
import { ITEMS } from '../data/items.js';
import { QUALITY } from '../data/quality.js';

// [plain, fine, prime, heirloom], reconciled with the bag total.
export function counts(k) {
  const total = G.S.bag[k] || 0, q = (G.S.qbag[k] ||= [0, 0, 0]);
  let over = q[0] + q[1] + q[2] - total;
  for (let i = 0; i < 3 && over > 0; i++) { const cut = Math.min(q[i], over); q[i] -= cut; over -= cut; }
  return [total - q[0] - q[1] - q[2], q[0], q[1], q[2]];
}

export function addItem(k, n = 1, tier = 0) {
  G.S.bag[k] = (G.S.bag[k] || 0) + n;
  if (tier > 0) { const q = (G.S.qbag[k] ||= [0, 0, 0]); q[tier - 1] += n; }
}

export const unitValue = (k, tier) => Math.floor(ITEMS[k].sell * QUALITY[tier].mult);
export const valueOf = (k) => counts(k).reduce((sum, n, t) => sum + n * unitValue(k, t), 0);

// Removes one of the best quality on hand and returns its tier, or -1 if there is none.
export function takeBest(k) {
  const c = counts(k);
  for (let t = 3; t >= 0; t--) {
    if (!c[t]) continue;
    G.S.bag[k]--;
    if (t > 0) G.S.qbag[k][t - 1]--;
    return t;
  }
  return -1;
}

export function clearQuality(k) { delete G.S.qbag[k]; }

// Harvest quality: Stardew's formula on our farming level and soil booster level (0 to 3).
export function rollCropQuality(level, fert = 0) {
  const prime = 0.2 * (level / 10) + 0.2 * fert * ((level + 2) / 12) + 0.01;
  const fine = Math.min(0.75, prime * 2), heirloom = fert >= 3 ? prime / 2 : 0, r = Math.random();
  return r < heirloom ? 3 : r < prime ? 2 : r < fine ? 1 : 0;
}

// Forage and animal products: better with the matching skill level.
export function rollSkillQuality(level) {
  const r = Math.random();
  return r < level / 30 ? 2 : r < level / 15 ? 1 : 0;
}
