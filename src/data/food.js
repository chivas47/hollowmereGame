// v300: raw food. What a crop, fruit, forage find, fish or animal product gives when eaten straight from the bag or
// an item slot on the hotbar (systems/cooking.js eat), on the Stardew scale: each item takes the energy of its
// Stardew counterpart by role (named beside it); health is HEALTH_PER_ENERGY of it, as for dishes. Cooking keeps
// its edge: a dish gives 50 to 200, most raw food 25 to 75. Left out, as in Stardew: pumpkin, wheat and rhubarb
// roles, shells and coral, moss, holly and the flowers Stardew will not let you eat (daffodil, crocus, sweet pea),
// wool, feathers and other goods, and the legendary fish.
import { FISH } from './fish.js';

export const RAW_FOOD = {
  // crops
  turnip: 25,      // parsnip
  radish: 45,      // radish
  melon: 113,      // melon
  lettuce: 25,     // bok choy
  fava: 75,        // cauliflower
  cucumber: 25,    // green bean
  pepper: 13,      // hot pepper
  celeriac: 45,    // yam
  onion: 25,       // bok choy
  snappea: 25,     // green bean
  tomato: 20,      // tomato
  corn: 25,        // corn
  lingon: 38,      // cranberries
  carrot: 75,      // carrot
  squash: 63,      // summer squash
  broccoli: 63,    // broccoli
  gleamfruit: 125, // starfruit
  beet: 30,        // beet
  frostkale: 50,   // kale
  potato: 25,      // potato (v335, roadmap 117a)
  kale: 50,        // kale
  garlic: 20,      // garlic
  strawberry: 50,  // strawberry
  bluebell: 45,    // blue jazz
  primrose: 45,    // tulip
  blackcurrant: 25, // blueberry (v336, roadmap 117b)
  redcabbage: 75,  // red cabbage
  cornflower: 45,  // poppy
  marigold: 45,    // summer spangle
  aubergine: 20,   // eggplant (v337, roadmap 117c)
  blackgrape: 38,  // grape
  sweetpotato: 45, // yam
  pakchoi: 25,     // bok choy
  buckwheat: 50,   // amaranth
  cardoon: 30,     // artichoke
  dahlia: 45,      // fairy rose
  // forage
  leek: 40,        // leek
  sorrel: 25,      // dandelion
  berry: 63,       // spice berry
  thyme: 25,       // fiddlehead fern
  mushroom: 38,    // common mushroom
  rosehip: 25,     // blackberry
  frostroot: 25,   // winter root
  morel: 20,       // morel
  fiddlehead: 25,  // fiddlehead fern
  chanterelle: 75, // chanterelle
  hazelnut: 30,    // hazelnut
  frostberry: 63,  // crystal fruit
  dandelion: 25,   // dandelion
  fireberry: 63,   // spice berry
  wildplum: 25,    // wild plum
  snowyam: 30,     // snow yam
  cragleek: 40,    // leek
  hillgrape: 38,   // grape
  bramble: 25,     // blackberry
  woodear: 38,     // common mushroom
  glademint: 25,   // fiddlehead fern
  trackpoppy: 45,  // poppy
  cinderberry: 38, // grape
  mistlily: 45,    // fairy rose
  // animal products
  egg: 25,         // egg
  duckegg: 38,     // duck egg
  cowmilk: 38,     // milk
  goatmilk: 63,    // goat milk
  mossegg: 63,     // dinosaur egg
  bigegg: 75,      // ostrich egg
  truffle: 13,     // truffle
  // fruit trees: every Stardew tree fruit is 38
  plum: 38, loquat: 38, fig: 38, nectarine: 38, pear: 38, persimmon: 38,
  // fish: by size and price, as Stardew's run from the sardine (13) to the catfish (50)
  ...Object.fromEntries(Object.entries(FISH).filter(([, f]) => !f.legendary).map(([k, f]) => [k, fishEnergy(f.sell)])),
};

// Stardew's fish edibility by price: cheap bait fish 13, everyday fish 25 to 38, the big ones 50.
export function fishEnergy(sell) {
  return sell <= 40 ? 13 : sell <= 60 ? 25 : sell <= 100 ? 38 : 50;
}
