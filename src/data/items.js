// Everything that can sit in the basket, be shipped or be gifted.
import { PRODUCE } from './crops.js';
import { FORAGE } from './forage.js';
import { FISH } from './fish.js';
import { PRODUCTS } from './products.js';
import { MINERALS } from './minerals.js';
import { ARTISAN } from './artisan.js';
import { FRUIT } from './trees.js';
import { WOODS } from './clearing.js';
import { WEATHER_ITEMS } from './weather.js';
import { CLOTH_ITEMS } from './clothing.js';
import { PONDS_ITEMS, AGED_ROE } from './ponds.js';
import { DISHES, WISH_ITEMS } from './cooking.js';
import { ROMANCE_ITEMS, MARRIAGE_ITEMS } from './romance.js';
import { FAMILY_ITEMS } from './family.js';
import { FESTIVAL_ITEMS } from './festivals.js';
import { RING_ITEMS } from './weapons.js';
import { TRINKET_ITEMS } from './forge.js';
import { BOOK_ITEMS } from './books.js';
import { ANGLING_ITEMS, TRASH_ITEMS } from './angling.js';
import { ARTIFACTS } from './museum.js';
import { MARKET_ITEMS } from './market.js';
import { LOOT_ITEMS } from './loot.js';

const DISH_ITEMS = Object.fromEntries(Object.entries(DISHES).map(([k, d]) => [k, { name: d.name, sell: d.sell, dish: true }]));

export const ITEMS = { ...PRODUCE, ...FORAGE, ...FISH, ...PRODUCTS, ...MINERALS, ...ARTISAN, ...FRUIT, ...WOODS, ...WEATHER_ITEMS, ...CLOTH_ITEMS, ...PONDS_ITEMS, ...AGED_ROE, ...DISH_ITEMS, ...WISH_ITEMS, ...ROMANCE_ITEMS, ...MARRIAGE_ITEMS, ...FAMILY_ITEMS, ...FESTIVAL_ITEMS, ...RING_ITEMS, ...TRINKET_ITEMS, ...BOOK_ITEMS, ...ANGLING_ITEMS, ...TRASH_ITEMS , ...ARTIFACTS, ...MARKET_ITEMS, ...LOOT_ITEMS };

// v338 (roadmap 117d): an ingredient a recipe or a neighbour names may be filled by any item that stands for it
// (its data's as): flower honey for meadow honey. Plainest (cheapest) first, so recipes use that up before the rest.
export const FILLS = {};
for (const [k, it] of Object.entries(ITEMS)) if (it.as) (FILLS[it.as] ||= [it.as]).push(k);
for (const list of Object.values(FILLS)) list.sort((a, b) => ITEMS[a].sell - ITEMS[b].sell);
export const fillsFor = (k) => FILLS[k] || [k];
