// Tool and house upgrades sold at Bram's workbench. Tier 0 is what you start with.
// needs: materials consumed on purchase (keys from items.js).
export const UPGRADES = {
  can:   { name: 'Watering can', tiers: [
    { label: 'Basic can', cap: 40 },
    { label: 'Copper can', cap: 55, cost: 2000, needs: { copper: 25 }, desc: 'Holds 55 water.' },
    { label: 'Steel can', cap: 70, cost: 5000, needs: { iron: 25 }, desc: 'Holds 70 water.' },
  ] },
  hoe:   { name: 'Hoe', tiers: [
    { label: 'Hoe', reach: 1 },
    { label: 'Wide hoe', reach: 3, cost: 2000, needs: { copper: 25 }, desc: 'Tills 3 tiles in a row for 3 energy.' },
  ] },
  axe:   { name: 'Axe', tiers: [
    { label: 'Axe', power: 1 },
    { label: 'Copper axe', power: 2, cost: 2000, needs: { copper: 25 }, desc: 'Chops twice as fast and splits large stumps.' },
  ] },
  rod:   { name: 'Fishing rod', tiers: [
    { label: 'Bamboo rod', zone: 0 },
    { label: 'Ashwood rod', zone: 14, cost: 1800, desc: 'A wider green zone when reeling.' },
  ] },
  house: { name: 'Farmhouse', tiers: [
    { label: 'Cottage', energy: 270 },
    { label: 'Extended farmhouse', energy: 300, cost: 10000, needs: { stone: 150 }, desc: 'A proper bed. Max energy rises to 300.' },
    { label: 'Hillside manor', energy: 340, cost: 50000, needs: { stone: 200, iron: 50 }, desc: 'Stone walls, a real kitchen. Max energy rises to 340.' },
  ] },
};

export const tier = (S, key) => UPGRADES[key].tiers[S.upgrades[key]];

export const COOP = {
  cost: 4000,
  needs: { stone: 150 },
  desc: 'Bram builds it overnight by the field. Raise up to 4 chickens (they eat 50g of feed a night).',
  chickenCost: 800,
  feedCost: 50,                               // each chicken eats 1 feed a night
  maxChickens: 4,
  footprint: { x: 18, y: 11, w: 3, h: 2 },   // tiles the building covers
  yard: { x0: 14, y0: 13, x1: 21, y1: 14 },  // where chickens wander
  names: ['Clementine', 'Pip', 'Marlow', 'Fig'],
};

// Stardew counterpart: the bought greenhouse (35,000g, no materials).
export const GREENHOUSE = {
  cost: 35000,
  needs: {},
  desc: 'Glass and timber north of the path. Anything grows inside, in any season, and nothing withers.',
  footprint: { x: 9, y: 1, w: 4, h: 2 },
  inside: { x: 12, y: 14, dir: 'up' },
};

// Stardew counterpart: the stable (10,000g, 100 hardwood, 5 iron bars). Hardwood is rare until new areas
// arrive, so wood stands in for it; 5 bars become 25 iron ore as for the tools.
export const STABLE = {
  cost: 10000,
  needs: { wood: 100, iron: 25 },
  desc: 'Bram builds it overnight by the well, with a horse in it. Ride at 1.6 times walking speed; press H to whistle for it.',
  footprint: { x: 13, y: 1, w: 2, h: 2 },
  home: { x: 13, y: 3 },
  speed: 1.6,
  horseName: 'Clover',
};

export const BARN = {
  cost: 6000,
  needs: { stone: 250, copper: 10 },
  desc: 'Bram builds it overnight by the west fence. Holds 4 cows or goats.',
  maxAnimals: 4,
  hayCost: 50,                                 // each animal eats 1 hay a night
  footprint: { x: 2, y: 11, w: 4, h: 2 },
  yard: { x0: 2, y0: 13, x1: 8, y1: 14 },
  animals: {
    cow:  { name: 'Cow',  cost: 1500,  product: 'cowmilk',  names: ['Dumpling', 'Maple', 'Bess', 'Juniper'] },
    goat: { name: 'Goat', cost: 4000, product: 'goatmilk', names: ['Pepper', 'Nettle', 'Biscuit', 'Thistle'] },
  },
};
