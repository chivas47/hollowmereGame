// Crafting: turn materials and gold into sprinklers and machines. Open the menu with C or the Craft button.
import { G } from '../core/game.js';
import { changed, notify, emit } from '../core/events.js';
import { RECIPES, PLACEABLES } from '../data/crafting.js';
import { affordable } from './upgrades.js';
import { CROPS } from '../data/crops.js';
import { skillLevel } from './skills.js';
import { ITEMS } from '../data/items.js';
import { keyName } from '../core/controls.js';

// Recipes that also use seed packets (fiber seeds take a packet of mixed seeds).
export const seedsOk = (rc) => Object.entries(rc.seeds || {}).every(([k, n]) => (G.S.seeds[k] || 0) >= n);

// v37: recipes learnt at a skill level (bombs at mining 1, 6 and 8).
export const learnt = (rc) => !rc.skill || skillLevel(rc.skill[0]) >= rc.skill[1];

// v101: how many of a recipe you could make now (gold, materials and seed packets), 0 if not learnt.
export function craftable(key) {
  const S = G.S, rc = RECIPES[key];
  if (!rc || !learnt(rc)) return 0;
  const most = (have, each) => (each > 0 ? Math.floor((have || 0) / each) : Infinity);
  const n = Math.min(most(S.gold, rc.cost), ...Object.entries(rc.needs).map(([k, m]) => most(S.bag[k], m)),
    ...Object.entries(rc.seeds || {}).map(([k, m]) => most(S.seeds[k], m)));
  return Number.isFinite(n) ? n : 0;
}

// times: how many batches (v101: the menu's x5 and All); makes as many as you can afford, up to that. Returns how many batches.
export function craft(key, times = 1) {
  const S = G.S, rc = RECIPES[key], t = Math.min(times, craftable(key));
  if (!rc || t < 1 || !affordable(rc.cost, rc.needs) || !seedsOk(rc)) return 0;
  S.gold -= rc.cost * t;
  Object.entries(rc.needs).forEach(([k, n]) => { S.bag[k] -= n * t; });
  Object.entries(rc.seeds || {}).forEach(([k, n]) => { S.seeds[k] -= n * t; });
  const n = (rc.makes || 1) * t;
  if (rc.item) {   // v41: bait and tackle go to the bag
    S.bag[key] = (S.bag[key] || 0) + n;
    emit('crafted', { key, n, kit: false });   // v74: the crafted pose (systems/animation.js)
    notify(`Crafted ${n > 1 ? `${n} ` : 'a '}${ITEMS[key].name.toLowerCase()}. Fix it to the rod from the bag (${keyName('bag')}).`);
    changed();
    return t;
  }
  if (rc.seed) {   // v33: fiber seeds go to the seed slot
    S.seeds[key] += n;
    notify(`Crafted ${n > 1 ? `${n} packets of ` : 'a packet of '}${CROPS[key].name.toLowerCase()}. They are in the seed slot (6).`);
    changed();
    return t;
  }
  S.kit[key] += n;
  emit('crafted', { key, n, kit: true });
  if (S.kit[S.kitSel] <= 0) S.kitSel = key;
  notify(`Crafted ${n > 1 ? `${n} x ` : 'a '}${PLACEABLES[key].name}. Select slot 7 to place it.`);
  changed();
  return t;
}
