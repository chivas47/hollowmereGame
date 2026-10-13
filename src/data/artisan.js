// Artisan goods made by machines (see data/crafting.js MACHINES).
// Every crop, fruit and forage item gets a jarred version from the brine crock.
import { PRODUCE } from './crops.js';
import { FORAGE } from './forage.js';
import { FRUIT } from './trees.js';

export const JAR_PREFIX = 'jar_';
export const jarValue = (sell) => sell * 2 + 50;

const jars = Object.fromEntries(Object.entries({ ...PRODUCE, ...FRUIT, ...FORAGE }).map(([k, it]) =>
  [JAR_PREFIX + k, { name: `Jarred ${it.name.toLowerCase()}`, sell: jarValue(it.sell), artisan: true }]));

export const ARTISAN = {
  butter: { name: 'Butter',      sell: 230, artisan: true },
  cheese: { name: 'Soft cheese', sell: 400, artisan: true },
  ...jars,
};
