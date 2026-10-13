// Things you craft and place on the farm. Crafting costs materials and gold (Bram supplies the fittings).
// kind: 'sprinkler' waters soil every morning, 'machine' turns an item into an artisan good, 'decor' just looks nice.
import { CROPS } from './crops.js';
import { FORAGE } from './forage.js';
import { JAR_PREFIX } from './artisan.js';

export const PLACEABLES = {
  sprinkler:  { name: 'Copper sprinkler', short: 'Sprinkler', kind: 'sprinkler', reach: 1, square: false },
  sprinkler2: { name: 'Iron sprinkler',   short: 'Iron spr.', kind: 'sprinkler', reach: 1, square: true },
  crock:      { name: 'Brine crock',      short: 'Crock',     kind: 'machine' },
  churn:      { name: 'Butter churn',     short: 'Churn',     kind: 'machine' },
  vat:        { name: 'Cheese vat',       short: 'Vat',       kind: 'machine' },
  lantern:    { name: 'Frost lantern',    short: 'Lantern',   kind: 'decor' },
};

// key -> what it makes (a PLACEABLES key). Lanterns are only sold at the Frostlight Market.
export const RECIPES = {
  sprinkler:  { cost: 75,  needs: { copper: 3, stone: 5 }, desc: 'Waters the 4 tiles next to it every morning.' },
  sprinkler2: { cost: 200, needs: { iron: 3, copper: 2 },  desc: 'Waters all 8 tiles around it every morning.' },
  crock:      { cost: 500, needs: { stone: 30, copper: 4 }, desc: 'Jars a crop or forage item over 3 nights. Worth twice the item plus 20g.' },
  churn:      { cost: 400, needs: { copper: 6 },            desc: 'Turns milk into butter overnight.' },
  vat:        { cost: 600, needs: { iron: 4 },              desc: 'Turns goat milk into soft cheese overnight.' },
};

// Machines: accepts(itemKey) -> bool, product(itemKey) -> item key, nights to finish.
export const MACHINES = {
  crock: { accepts: (k) => k in CROPS || k in FORAGE, product: (k) => JAR_PREFIX + k, nights: 3, hint: 'a crop or forage item' },
  churn: { accepts: (k) => k === 'cowmilk', product: () => 'butter', nights: 1, hint: 'milk' },
  vat:   { accepts: (k) => k === 'goatmilk', product: () => 'cheese', nights: 1, hint: 'goat milk' },
};

// Tiles a sprinkler at (x, y) waters.
export function sprinklerTiles(def, x, y) {
  const out = [];
  for (let dy = -def.reach; dy <= def.reach; dy++) for (let dx = -def.reach; dx <= def.reach; dx++) {
    if (!dx && !dy) continue;
    if (!def.square && dx && dy) continue;
    out.push([x + dx, y + dy]);
  }
  return out;
}
