// Things you craft and place on the farm. Crafting costs materials and gold (Bram supplies the fittings).
// kind: 'tree' a fruit tree sapling (data/trees.js), 'sprinkler' waters soil every morning, 'machine' turns an item into an artisan good, 'decor' just looks nice.
import { PRODUCE } from './crops.js';
import { FORAGE } from './forage.js';
import { JAR_PREFIX } from './artisan.js';
import { TREES, FRUIT } from './trees.js';
import { FURNITURE } from './furniture.js';
import { FISH } from './fish.js';
import { MINERALS } from './minerals.js';

export const PLACEABLES = {
  sprinkler:  { name: 'Copper sprinkler', short: 'Sprinkler', kind: 'sprinkler', reach: 1, square: false },
  sprinkler2: { name: 'Iron sprinkler',   short: 'Iron spr.', kind: 'sprinkler', reach: 1, square: true },
  sprinkler3: { name: 'Steel sprinkler',  short: 'Steel spr.', kind: 'sprinkler', reach: 2, square: true },
  crock:      { name: 'Brine crock',      short: 'Crock',     kind: 'machine' },
  churn:      { name: 'Butter churn',     short: 'Churn',     kind: 'machine' },
  vat:        { name: 'Cheese vat',       short: 'Vat',       kind: 'machine' },
  lantern:    { name: 'Frost lantern',    short: 'Lantern',   kind: 'decor' },
  // Fertilizers go on tilled soil (kind 'fertilizer'). quality: booster level, speed: share of growth
  // time saved, retain: chance the soil stays watered overnight. Boosters and tonics go on before planting.
  booster:    { name: 'Soil booster',        short: 'Booster',   kind: 'fertilizer', quality: 1 },
  booster2:   { name: 'Rich soil booster',   short: 'Rich bst.', kind: 'fertilizer', quality: 2 },
  booster3:   { name: 'Heirloom booster',    short: 'Heirloom',  kind: 'fertilizer', quality: 3 },
  tonic:      { name: 'Growth tonic',        short: 'Tonic',     kind: 'fertilizer', speed: 0.1 },
  tonic2:     { name: 'Strong growth tonic', short: 'Strong tn.', kind: 'fertilizer', speed: 0.25 },
  mulch:      { name: 'Mulch',               short: 'Mulch',     kind: 'fertilizer', retain: 0.33 },
  mulch2:     { name: 'Thick mulch',         short: 'Th. mulch', kind: 'fertilizer', retain: 0.66 },
  ...Object.fromEntries(Object.entries(TREES).map(([k, t]) => [k, { name: t.name, short: t.short, kind: 'tree' }])),
  // v19: fences block the way and join up with their neighbours; a gate opens when you face it;
  // paths are walkable floors. An alder cone plants a wild tree (systems/clearing.js).
  fence:      { name: 'Wood fence',     short: 'Fence',     kind: 'fence', color: '#a5753f' },
  stonefence: { name: 'Stone fence',    short: 'St. fence', kind: 'fence', color: '#9aa3ab' },
  hardfence:  { name: 'Hardwood fence', short: 'Hd. fence', kind: 'fence', color: '#6e4626' },
  gate:       { name: 'Gate',           short: 'Gate',      kind: 'gate',  color: '#a5753f' },
  woodpath:   { name: 'Wood path',      short: 'W. path',   kind: 'floor', color: '#b08a5a' },
  stonepath:  { name: 'Stone path',     short: 'S. path',   kind: 'floor', color: '#a9a49a' },
  alderseed:  { name: 'Alder cone',     short: 'Cone',      kind: 'sprout' },
  // v20: catches a storm's lightning as a storm cell (systems/weather.js).
  lightningrod: { name: 'Lightning rod', short: 'L. rod',  kind: 'machine' },
  // v26: smelting.
  furnace:    { name: 'Furnace',          short: 'Furnace',   kind: 'machine' },
  kiln:       { name: 'Charcoal kiln',    short: 'Kiln',      kind: 'machine' },
  // v27: artisan machines, part 2 (Stardew roles in the comments of RECIPES).
  brewbarrel: { name: 'Brew barrel',      short: 'Barrel',    kind: 'machine' },
  eggpress:   { name: 'Egg press',        short: 'Egg press', kind: 'machine' },
  loom:       { name: 'Loom',             short: 'Loom',      kind: 'machine' },
  oilpress:   { name: 'Oil press',        short: 'Oil press', kind: 'machine' },
  beebox:     { name: 'Bee box',          short: 'Bee box',   kind: 'machine' },
  gemcopier:  { name: 'Gem copier',       short: 'Copier',    kind: 'machine' },
  dryer:      { name: 'Drying rack',      short: 'Dryer',     kind: 'machine' },
  mushroomlog:{ name: 'Mushroom log',     short: 'Mush. log', kind: 'machine' },
  smoker:     { name: 'Fish smoker',      short: 'Smoker',    kind: 'machine' },
  treetap:    { name: 'Tree tap',         short: 'Tap',       kind: 'tap' },
  // v24: furniture, placed inside the farmhouse (bought from the catalogue there).
  ...Object.fromEntries(Object.entries(FURNITURE).map(([k, f]) => [k, { name: f.name, short: f.name.length > 10 ? f.name.split(' ').pop() : f.name, kind: 'furniture', walk: !!f.walk }])),
};

// key -> what it makes (a PLACEABLES key). makes: how many one craft gives (default 1). Lanterns are only sold at the Frostlight Market.
export const RECIPES = {
  // v26: ore became bars at Stardew's 5 ore to a bar (Stardew's sprinklers: a copper and an iron bar, and up).
  sprinkler:  { cost: 75,  needs: { copperbar: 1, stone: 5 }, desc: 'Waters the 4 tiles next to it every morning.' },
  sprinkler2: { cost: 200, needs: { ironbar: 1, copperbar: 1 }, desc: 'Waters all 8 tiles around it every morning.' },
  sprinkler3: { cost: 900, needs: { ironbar: 1, gel: 5 },   desc: 'Waters the 24 tiles in a 5 by 5 square around it every morning.' },
  crock:      { cost: 500, needs: { stone: 30, copperbar: 1 }, desc: 'Jars a crop, fruit or forage item over 3 nights. Worth twice the item plus 50g.' },
  churn:      { cost: 400, needs: { copperbar: 1 },         desc: 'Turns milk into butter overnight.' },
  vat:        { cost: 600, needs: { ironbar: 1 },           desc: 'Turns goat milk into soft cheese overnight.' },
  booster3:   { cost: 0,   needs: { ironbar: 1, gel: 10 },  desc: 'Highest soil booster: crops can come out heirloom quality.' },
  // Stardew: wood fence 2 wood, stone fence 2 stone, hardwood fence 1 hardwood, gate 10 wood, paths 1 each.
  fence:      { cost: 0, needs: { wood: 10 },    makes: 5, desc: 'Five fence posts. They join up and block the way.' },
  stonefence: { cost: 0, needs: { stone: 10 },   makes: 5, desc: 'Five stone fence posts.' },
  hardfence:  { cost: 0, needs: { hardwood: 5 }, makes: 5, desc: 'Five hardwood fence posts.' },
  gate:       { cost: 0, needs: { wood: 10 },    desc: 'Opens and closes when you face it. Fits in a fence line.' },
  woodpath:   { cost: 0, needs: { wood: 5 },     makes: 5, desc: 'Five tiles of wooden path. Weeds and stones never grow on paths.' },
  stonepath:  { cost: 0, needs: { stone: 5 },    makes: 5, desc: 'Five tiles of stone path. Weeds and stones never grow on paths.' },
  // Stardew: 1 iron bar, 1 refined quartz, 5 bat wings. Ours (stone and bars for what we lack): stone for the quartz, a copper bar for the wings.
  lightningrod: { cost: 0, needs: { ironbar: 1, copperbar: 1, stone: 10 }, desc: 'Catches a lightning strike in a storm and keeps it as a storm cell (500g).' },
  // Stardew: furnace 20 copper ore + 25 stone; charcoal kiln 20 wood + 2 copper bars.
  furnace:    { cost: 0, needs: { copper: 20, stone: 25 }, desc: 'Smelts 5 ore and 1 coal into a bar while you wait.' },
  kiln:       { cost: 0, needs: { wood: 20, copperbar: 2 }, desc: 'Burns 10 wood into 1 coal while you wait.' },
  // v27. Stardew: keg 30 wood, 1 copper bar, 1 iron bar, oak resin; mayonnaise machine 15 wood, 15 stone, copper bar, earth crystal;
  // loom 60 wood, 30 fiber, pine tar; oil maker 50 slime, 20 hardwood, gold bar; bee house 40 wood, 8 coal, iron bar, maple syrup;
  // tapper 40 wood, 2 copper bars; crystalarium 99 stone, gold and iridium bars, battery; dehydrator 30 wood, clay, fire quartz;
  // mushroom log 10 hardwood, 10 moss; fish smoker 10 hardwood, sea jellies. What we lack becomes wood, stone, bars, gel or a storm cell.
  brewbarrel: { cost: 0, needs: { wood: 30, copperbar: 1, ironbar: 1 }, desc: 'Fruit becomes wine (3 times the fruit) in 7 nights; a vegetable becomes juice (2.25 times) in 4.' },
  eggpress:   { cost: 0, needs: { wood: 15, stone: 15, copperbar: 1 }, desc: 'Turns an egg into egg spread (190g) overnight.' },
  loom:       { cost: 0, needs: { wood: 60, fiber: 30 }, desc: 'Weaves 5 fiber into a cloth overnight.' },
  oilpress:   { cost: 0, needs: { gel: 20, wood: 20, ironbar: 1 }, desc: 'Presses sweet corn into corn oil (100g) overnight.' },
  beebox:     { cost: 0, needs: { wood: 40, coal: 8, ironbar: 1 }, desc: 'Bees make meadow honey (100g) every 4 nights, outside winter.' },
  treetap:    { cost: 0, needs: { wood: 40, copperbar: 2 }, desc: 'Fix it to a grown alder: alder syrup (180g) every 8 nights. Chopping the tree gives the tap back.' },
  gemcopier:  { cost: 0, needs: { stone: 50, ironbar: 3, stormcell: 1 }, desc: 'Copies a gem again and again: quartz every night, violet stone every 2.' },
  dryer:      { cost: 0, needs: { wood: 30, copperbar: 1, stone: 20 }, desc: 'Dries 5 fruit or 5 Hollow caps overnight (worth 7.5 times one, plus 25).' },
  mushroomlog:{ cost: 0, needs: { wood: 15, fiber: 10 }, desc: 'Grows Hollow caps every 4 nights, outside winter.' },
  smoker:     { cost: 0, needs: { wood: 20, ironbar: 1 }, desc: 'Smokes a fish with 1 coal while you wait: worth twice the fish.' }
};

// Machines: accepts(itemKey) -> bool, product(itemKey) -> item key, nights to finish.
export const MACHINES = {
  crock: { accepts: (k) => k in PRODUCE || k in FRUIT || k in FORAGE, product: (k) => JAR_PREFIX + k, nights: 3, hint: 'a crop, fruit or forage item' },
  churn: { accepts: (k) => k === 'cowmilk', product: () => 'butter', nights: 1, hint: 'milk' },
  vat:   { accepts: (k) => k === 'goatmilk', product: () => 'cheese', nights: 1, hint: 'goat milk' },
  // Nothing goes in: a storm's lightning fills it (systems/weather.js).
  lightningrod: { accepts: () => false, product: () => 'stormcell', nights: 0, hint: 'lightning, during a storm' },
  // takes: what one load uses up (default: one of the item). nights 0: ready at once.
  furnace: { accepts: (k) => k === 'copper' || k === 'iron', takes: (k) => ({ [k]: 5, coal: 1 }), product: (k) => `${k}bar`, nights: 0, hint: '5 ore and 1 coal' },
  kiln:    { accepts: (k) => k === 'wood', takes: () => ({ wood: 10 }), product: () => 'coal', nights: 0, hint: '10 wood' },
  // v27. nights may depend on the item; auto: makes an item every so many nights with nothing put in; repeat: starts again after collecting.
  brewbarrel: { accepts: (k) => k in FRUIT || k in PRODUCE, product: (k) => (k in FRUIT ? `wine_${k}` : `juice_${k}`), nights: (k) => (k in FRUIT ? 7 : 4), hint: 'a fruit or a vegetable' },
  eggpress:   { accepts: (k) => k === 'egg', product: () => 'mayo', nights: 1, hint: 'an egg' },
  loom:       { accepts: (k) => k === 'fiber', takes: () => ({ fiber: 5 }), product: () => 'cloth', nights: 1, hint: '5 fiber' },
  oilpress:   { accepts: (k) => k === 'corn', product: () => 'oil', nights: 1, hint: 'sweet corn' },
  beebox:     { accepts: () => false, auto: { item: 'honey', every: 4, winter: false }, product: () => 'honey', nights: 0, hint: 'nothing: the bees do the work' },
  gemcopier:  { accepts: (k) => !!MINERALS[k]?.gem, product: (k) => k, nights: (k) => (k === 'violet' ? 2 : 1), repeat: true, hint: 'a gem' },
  dryer:      { accepts: (k) => k in FRUIT || k === 'mushroom', takes: (k) => ({ [k]: 5 }), product: (k) => `dried_${k}`, nights: 1, hint: '5 fruit or 5 Hollow caps' },
  mushroomlog:{ accepts: () => false, auto: { item: 'mushroom', every: 4, winter: false }, product: () => 'mushroom', nights: 0, hint: 'nothing: give it time' },
  smoker:     { accepts: (k) => k in FISH, takes: (k) => ({ [k]: 1, coal: 1 }), product: (k) => `smoked_${k}`, nights: 0, hint: 'a fish and 1 coal' },
};

// Tiles a sprinkler at (x, y) waters.
export function sprinklerTiles(def, x, y) {
  const out = [];
  for (let dy = -def.reach; dy <= def.reach; dy++) for (let dx = -def.reach; dx <= def.reach; dx++) {
    if (!dx && !dy) continue;
    if (!def.square && dx && dy) continue;
    out.push([x + dx, y + dy]);
  }
  return out;
}

// Sold at the seed stall all year (Stardew scale: basic 100g, quality 150g; saplings at their tree's price).
export const SUPPLIES = { booster: 100, booster2: 150, tonic: 100, tonic2: 150, mulch: 100, mulch2: 150,
  ...Object.fromEntries(Object.entries(TREES).map(([k, t]) => [k, t.cost])) };
