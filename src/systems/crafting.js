// Crafting: turn materials and gold into sprinklers and machines. Open the menu with C or the Craft button.
import { G } from '../core/game.js';
import { changed, notify } from '../core/events.js';
import { RECIPES, PLACEABLES } from '../data/crafting.js';
import { affordable } from './upgrades.js';

export function craft(key) {
  const S = G.S, rc = RECIPES[key];
  if (!rc || !affordable(rc.cost, rc.needs)) return false;
  S.gold -= rc.cost;
  Object.entries(rc.needs).forEach(([k, n]) => { S.bag[k] -= n; });
  const n = rc.makes || 1;
  S.kit[key] += n;
  if (S.kit[S.kitSel] <= 0) S.kitSel = key;
  notify(`Crafted ${n > 1 ? `${n} x ` : 'a '}${PLACEABLES[key].name}. Select slot 7 to place it.`);
  changed();
  return true;
}
