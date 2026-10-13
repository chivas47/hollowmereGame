// Artisan goods made by machines (see data/crafting.js MACHINES).
// Every crop, fruit and forage item gets a jarred version from the brine crock.
import { PRODUCE } from './crops.js';
import { FORAGE } from './forage.js';
import { FRUIT } from './trees.js';
import { FISH } from './fish.js';

export const JAR_PREFIX = 'jar_';
export const jarValue = (sell) => sell * 2 + 50;

const jars = Object.fromEntries(Object.entries({ ...PRODUCE, ...FRUIT, ...FORAGE }).map(([k, it]) =>
  [JAR_PREFIX + k, { name: `Jarred ${it.name.toLowerCase()}`, sell: jarValue(it.sell), artisan: true }]));

// v27, Stardew's multipliers: wine 3x the fruit, juice 2.25x the vegetable, dried fruit 7.5x + 25 for five,
// smoked fish 2x. Prefixes are the item key's start: wine_plum, juice_carrot, dried_fig, smoked_carp.
export const ARTISAN_PREFIX = { wine: 'wine_', juice: 'juice_', dried: 'dried_', smoked: 'smoked_' };
const each = (src, prefix, name, sell) => Object.fromEntries(Object.entries(src).map(([k, it]) => [prefix + k, { name: name(it.name), sell: sell(it.sell), artisan: true }]));
const lower = (s) => s.toLowerCase();

export const ARTISAN = {
  butter: { name: 'Butter',      sell: 230, artisan: true },
  cheese: { name: 'Soft cheese', sell: 400, artisan: true },
  ...jars,
  ...each(FRUIT, 'wine_', (n) => `${n} wine`, (v) => v * 3),
  ...each(PRODUCE, 'juice_', (n) => `${n} juice`, (v) => Math.floor(v * 2.25)),
  ...each(FRUIT, 'dried_', (n) => `Dried ${lower(n)}`, (v) => Math.floor(v * 7.5 + 25)),
  dried_mushroom: { name: 'Dried Hollow caps', sell: Math.floor(FORAGE.mushroom.sell * 7.5 + 25), artisan: true },
  ...each(FISH, 'smoked_', (n) => `Smoked ${lower(n)}`, (v) => v * 2),
  mayo:   { name: 'Egg spread',   sell: 190, artisan: true },   // Stardew: mayonnaise
  oil:    { name: 'Corn oil',     sell: 100, artisan: true },
  honey:  { name: 'Meadow honey', sell: 100, artisan: true },   // Stardew: wild honey
  syrup:  { name: 'Alder syrup',  sell: 180, artisan: true },   // Stardew: maple syrup 200g, oak resin 150g
};
