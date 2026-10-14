// Tool and house upgrades sold at Bram's workbench. Tier 0 is what you start with.
// needs: materials consumed on purchase (keys from items.js).
export const UPGRADES = {
  can:   { name: 'Watering can', tiers: [
    { label: 'Basic can', cap: 40 },
    { label: 'Copper can', cap: 55, cost: 2000, needs: { copperbar: 5 }, desc: 'Holds 55 water.' },
    { label: 'Steel can', cap: 70, cost: 5000, needs: { ironbar: 5 }, desc: 'Holds 70 water.' },
  ] },
  hoe:   { name: 'Hoe', tiers: [
    { label: 'Hoe', reach: 1 },
    { label: 'Wide hoe', reach: 3, cost: 2000, needs: { copperbar: 5 }, desc: 'Tills 3 tiles in a row for 3 energy.' },
  ] },
  axe:   { name: 'Axe', tiers: [
    { label: 'Axe', power: 1 },
    { label: 'Copper axe', power: 2, cost: 2000, needs: { copperbar: 5 }, desc: 'Chops twice as fast and splits large stumps.' },
  ] },
  rod:   { name: 'Fishing rod', tiers: [
    { label: 'Bamboo rod', zone: 0 },
    { label: 'Ashwood rod', zone: 14, cost: 1800, desc: 'A wider green zone when reeling.' },
  ] },
  house: { name: 'Farmhouse', tiers: [
    { label: 'Cottage', energy: 270 },
    { label: 'Extended farmhouse', energy: 300, cost: 10000, needs: { stone: 150 }, desc: 'A proper bed and a kitchen. Max energy rises to 300.' },
    { label: 'Hillside manor', energy: 340, cost: 50000, needs: { stone: 200, ironbar: 10 }, desc: 'Stone walls and a nursery. Max energy rises to 340.' },
    { label: 'Manor with cellar', energy: 340, cost: 100000, desc: 'A cellar under the kitchen, lined with casks (Stardew: 100,000g).' },
  ] },
};

// Coal from Bram (Stardew's blacksmith sells it for 150g).
export const COAL_COST = 150;
// Materials from Bram (Stardew's carpenter sells wood for 10g and stone for 20g).
export const MATERIAL_COST = { wood: 10, stone: 20 };

export const tier = (S, key) => UPGRADES[key].tiers[S.upgrades[key]];

// v28, more livestock. Stardew counterparts: coop 4,000g; big coop 10,000g, 400 wood, 150 stone; deluxe coop
// 20,000g, 500 wood, 200 stone. Chicken 800g (egg daily), duck 1,200g (egg every 2 days, big coop), rabbit 8,000g
// (wool every 4, deluxe coop), dinosaur (hatched only, egg every 7). level: the coop level an animal needs.
// deluxe: the rarer product a well loved animal sometimes gives instead.
export const COOP = {
  cost: 4000,
  needs: { stone: 150 },
  desc: 'Bram builds it overnight by the field. Raise up to 4 chickens (they eat 50g of feed a night).',
  chickenCost: 800,
  feedCost: 50,                               // each coop animal eats 1 feed a night
  maxChickens: 4,                             // the first coop's room; levels below add more
  footprint: { x: 18, y: 11, w: 3, h: 2 },   // tiles the building covers
  yard: { x0: 14, y0: 13, x1: 21, y1: 14 },  // where chickens wander
  names: ['Clementine', 'Pip', 'Marlow', 'Fig'],
  levels: [
    { label: 'Coop', room: 4 },
    { label: 'Big coop', room: 8, cost: 10000, needs: { wood: 400, stone: 150 }, desc: 'Room for 8 and ducks.' },
    { label: 'Deluxe coop', room: 12, cost: 20000, needs: { wood: 500, stone: 200 }, desc: 'Room for 12 and rabbits.' },
  ],
  animals: {
    chicken:  { name: 'Chicken',  cost: 800,  product: 'egg',     every: 1, level: 0, names: ['Clementine', 'Pip', 'Marlow', 'Fig'] },
    duck:     { name: 'Duck',     cost: 1200, product: 'duckegg', every: 2, level: 1, deluxe: 'feather', names: ['Puddle', 'Wren', 'Barley', 'Teal'] },
    rabbit:   { name: 'Rabbit',   cost: 8000, product: 'wool',    every: 4, level: 2, deluxe: 'luckypaw', names: ['Clover', 'Hazel', 'Tansy', 'Bramble'] },
    mossback: { name: 'Mossback', cost: 0,    product: 'mossegg', every: 7, level: 0, hatched: true, names: ['Lichen', 'Fernley', 'Pebble', 'Sedge'] },
  },
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
// arrive, so wood stands in for it.
export const STABLE = {
  cost: 10000,
  needs: { wood: 100, ironbar: 5 },
  desc: 'Bram builds it overnight by the well, with a horse in it. Ride at 1.6 times walking speed; press H to whistle for it.',
  footprint: { x: 13, y: 1, w: 2, h: 2 },
  home: { x: 13, y: 3 },
  speed: 1.6,
  horseName: 'Clover',
};

// v28. Stardew: big barn 12,000g, 450 wood, 200 stone; deluxe barn 25,000g, 550 wood, 300 stone. Sheep 8,000g
// (wool every 3 days, shears), pig 16,000g (truffles outdoors, not in winter or rain), ostrich (hatched only, egg
// every 7). Milk pail and shears 1,000g each. Goats keep the daily milk they always gave here.
// v30: buildings the player places on open farm grass (systems/sites.js). Stardew: shed 15,000g and 300 wood;
// mill 2,500g, 150 wood, 50 stone, 4 cloth; the gold clock 10,000,000g (no more debris creeping in).
// footprint has no x and y until placed. inside: where the shed's door lets you in on its own map.
export const SHED = {
  cost: 15000, needs: { wood: 300 }, footprint: { w: 3, h: 2 }, inside: { x: 11, y: 11, dir: 'up' },
  desc: 'A walk-in room for machines and furniture.',
};
export const MILL = {
  cost: 2500, needs: { wood: 150, stone: 50, cloth: 4 }, footprint: { w: 2, h: 2 },
  desc: 'Grinds wheat into flour and beets into sugar overnight.',
  grinds: { wheat: 'flour', beet: 'sugar' },
};
export const CLOCK = {
  cost: 10000000, needs: {}, footprint: { w: 2, h: 2 },
  desc: 'A golden clock tower. Weeds, stones and twigs stop creeping onto the farm.',
};

export const BARN = {
  cost: 6000,
  needs: { stone: 250, copperbar: 2 },
  desc: 'Bram builds it overnight by the west fence. Holds 4 cows or goats.',
  maxAnimals: 4,
  hayCost: 50,                                 // each animal eats 1 hay a night
  footprint: { x: 2, y: 11, w: 4, h: 2 },
  yard: { x0: 2, y0: 13, x1: 8, y1: 14 },
  levels: [
    { label: 'Barn', room: 4 },
    { label: 'Big barn', room: 8, cost: 12000, needs: { wood: 450, stone: 200 }, desc: 'Room for 8.' },
    { label: 'Deluxe barn', room: 12, cost: 25000, needs: { wood: 550, stone: 300 }, desc: 'Room for 12, sheep and pigs.' },
  ],
  animals: {
    cow:     { name: 'Cow',   cost: 1500,  product: 'cowmilk',  every: 1, level: 0, tool: 'pail',   names: ['Dumpling', 'Maple', 'Bess', 'Juniper'] },
    goat:    { name: 'Goat',  cost: 4000,  product: 'goatmilk', every: 1, level: 0, tool: 'pail',   names: ['Pepper', 'Nettle', 'Biscuit', 'Thistle'] },
    sheep:   { name: 'Sheep', cost: 8000,  product: 'wool',     every: 3, level: 2, tool: 'shears', names: ['Woolly', 'Dandelion', 'Cobble', 'Fleece'] },
    pig:     { name: 'Pig',   cost: 16000, product: 'truffle',  every: 1, level: 2, outdoors: true, names: ['Truffle', 'Acorn', 'Rosie', 'Mudlark'] },
    strider: { name: 'Strider', cost: 0,   product: 'bigegg',   every: 7, level: 0, hatched: true, names: ['Stilts', 'Longshank', 'Plume', 'Rook'] },
  },
  tools: { pail: { name: 'Milk pail', cost: 1000, desc: 'Cows and goats give milk only once you have one.' },
    shears: { name: 'Shears', cost: 1000, desc: 'Sheep give wool only once you have a pair.' } },
};
