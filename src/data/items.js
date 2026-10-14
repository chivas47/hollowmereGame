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
import { RING_ITEMS } from './weapons.js';
import { TRINKET_ITEMS } from './forge.js';
import { BOOK_ITEMS } from './books.js';

const DISH_ITEMS = Object.fromEntries(Object.entries(DISHES).map(([k, d]) => [k, { name: d.name, sell: d.sell, dish: true }]));

export const ITEMS = { ...PRODUCE, ...FORAGE, ...FISH, ...PRODUCTS, ...MINERALS, ...ARTISAN, ...FRUIT, ...WOODS, ...WEATHER_ITEMS, ...CLOTH_ITEMS, ...PONDS_ITEMS, ...AGED_ROE, ...DISH_ITEMS, ...WISH_ITEMS, ...RING_ITEMS, ...TRINKET_ITEMS, ...BOOK_ITEMS };
