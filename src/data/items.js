// Everything that can sit in the basket, be shipped or be gifted.
import { CROPS } from './crops.js';
import { FORAGE } from './forage.js';
import { FISH } from './fish.js';
import { PRODUCTS } from './products.js';
import { MINERALS } from './minerals.js';

export const ITEMS = { ...CROPS, ...FORAGE, ...FISH, ...PRODUCTS, ...MINERALS };
