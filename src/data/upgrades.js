// Tool and house upgrades sold at Bram's workbench. Tier 0 is what you start with.
// needs: materials consumed on purchase (keys from items.js).
export const UPGRADES = {
  can:   { name: 'Watering can', tiers: [
    { label: 'Basic can', cap: 20 },
    { label: 'Copper can', cap: 45, cost: 600, needs: { copper: 5 }, desc: 'Holds 45 water.' },
    { label: 'Steel can', cap: 80, cost: 1500, needs: { iron: 5 }, desc: 'Holds 80 water.' },
  ] },
  hoe:   { name: 'Hoe', tiers: [
    { label: 'Hoe', reach: 1 },
    { label: 'Wide hoe', reach: 3, cost: 800, needs: { copper: 8 }, desc: 'Tills 3 tiles in a row for 3 energy.' },
  ] },
  rod:   { name: 'Fishing rod', tiers: [
    { label: 'Bamboo rod', zone: 0 },
    { label: 'Ashwood rod', zone: 14, cost: 700, desc: 'A wider green zone when reeling.' },
  ] },
  house: { name: 'Farmhouse', tiers: [
    { label: 'Cottage', energy: 100 },
    { label: 'Extended farmhouse', energy: 140, cost: 2500, needs: { stone: 60 }, desc: 'A proper bed. Max energy rises to 140.' },
    { label: 'Hillside manor', energy: 170, cost: 12000, needs: { stone: 120, iron: 25 }, desc: 'Stone walls, a real kitchen. Max energy rises to 170.' },
  ] },
};

export const tier = (S, key) => UPGRADES[key].tiers[S.upgrades[key]];

export const COOP = {
  cost: 1200,
  needs: { stone: 30 },
  desc: 'Bram builds it overnight by the field. Raise up to 4 chickens (they eat 5g of feed a night).',
  chickenCost: 300,
  feedCost: 5,                               // each chicken eats 1 feed a night
  maxChickens: 4,
  footprint: { x: 18, y: 11, w: 3, h: 2 },   // tiles the building covers
  yard: { x0: 14, y0: 13, x1: 21, y1: 14 },  // where chickens wander
  names: ['Clementine', 'Pip', 'Marlow', 'Fig'],
};

export const BARN = {
  cost: 3000,
  needs: { stone: 50, copper: 10 },
  desc: 'Bram builds it overnight by the west fence. Holds 4 cows or goats.',
  maxAnimals: 4,
  hayCost: 10,                                 // each animal eats 1 hay a night
  footprint: { x: 2, y: 11, w: 4, h: 2 },
  yard: { x0: 2, y0: 13, x1: 8, y1: 14 },
  animals: {
    cow:  { name: 'Cow',  cost: 900,  product: 'cowmilk',  names: ['Dumpling', 'Maple', 'Bess', 'Juniper'] },
    goat: { name: 'Goat', cost: 1100, product: 'goatmilk', names: ['Pepper', 'Nettle', 'Biscuit', 'Thistle'] },
  },
};
