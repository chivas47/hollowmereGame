// Crafting: turn materials and gold into sprinklers and machines. Open the menu with C or the Craft button.
import { G } from '../core/game.js';
import { changed, notify, emit } from '../core/events.js';
import { RECIPES, PLACEABLES } from '../data/crafting.js';
import { affordable } from './upgrades.js';
import { CROPS } from '../data/crops.js';
import { skillLevel } from './skills.js';
import { ITEMS } from '../data/items.js';

// Recipes that also use seed packets (fiber seeds take a packet of mixed seeds).
export const seedsOk = (rc) => Object.entries(rc.seeds || {}).every(([k, n]) => (G.S.seeds[k] || 0) >= n);

// v37: recipes learnt at a skill level (bombs at mining 1, 6 and 8).
export const learnt = (rc) => !rc.skill || skillLevel(rc.skill[0]) >= rc.skill[1];

export function craft(key) {
  const S = G.S, rc = RECIPES[key];
  if (!rc || !learnt(rc) || !affordable(rc.cost, rc.needs) || !seedsOk(rc)) return false;
  S.gold -= rc.cost;
  Object.entries(rc.needs).forEach(([k, n]) => { S.bag[k] -= n; });
  Object.entries(rc.seeds || {}).forEach(([k, n]) => { S.seeds[k] -= n; });
  const n = rc.makes || 1;
  if (rc.item) {   // v41: bait and tackle go to the bag
    S.bag[key] = (S.bag[key] || 0) + n;
    emit('crafted', { key, n, kit: false });   // v74: the crafted pose (systems/animation.js)
    notify(`Crafted ${n > 1 ? `${n} ` : 'a '}${ITEMS[key].name.toLowerCase()}. Fix it to the rod from the bag (I).`);
    changed();
    return true;
  }
  if (rc.seed) {   // v33: fiber seeds go to the seed slot
    S.seeds[key] += n;
    notify(`Crafted ${n > 1 ? `${n} packets of ` : 'a packet of '}${CROPS[key].name.toLowerCase()}. They are in the seed slot (6).`);
    changed();
    return true;
  }
  S.kit[key] += n;
  emit('crafted', { key, n, kit: true });
  if (S.kit[S.kitSel] <= 0) S.kitSel = key;
  notify(`Crafted ${n > 1 ? `${n} x ` : 'a '}${PLACEABLES[key].name}. Select slot 7 to place it.`);
  changed();
  return true;
}
