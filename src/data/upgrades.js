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
  ] },
};

export const tier = (S, key) => UPGRADES[key].tiers[S.upgrades[key]];

export const COOP = {
  cost: 1200,
  needs: { stone: 30 },
  desc: 'Bram builds it overnight by the field. Raise up to 4 chickens.',
  chickenCost: 300,
  maxChickens: 4,
  footprint: { x: 18, y: 11, w: 3, h: 2 },   // tiles the building covers
  yard: { x0: 14, y0: 13, x1: 21, y1: 14 },  // where chickens wander
  names: ['Clementine', 'Pip', 'Marlow', 'Fig'],
};
