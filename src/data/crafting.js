// Things you craft and place on the farm. Crafting costs materials and gold (Bram supplies the fittings).
// kind: 'tree' a fruit tree sapling (data/trees.js), 'sprinkler' waters soil every morning, 'machine' turns an item into an artisan good, 'decor' just looks nice.
import { PRODUCE } from './crops.js';
import { FORAGE } from './forage.js';
import { JAR_PREFIX } from './artisan.js';
import { TREES, FRUIT } from './trees.js';

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
};

// key -> what it makes (a PLACEABLES key). makes: how many one craft gives (default 1). Lanterns are only sold at the Frostlight Market.
export const RECIPES = {
  sprinkler:  { cost: 75,  needs: { copper: 3, stone: 5 }, desc: 'Waters the 4 tiles next to it every morning.' },
  sprinkler2: { cost: 200, needs: { iron: 3, copper: 2 },  desc: 'Waters all 8 tiles around it every morning.' },
  sprinkler3: { cost: 900, needs: { iron: 5, gel: 5 },     desc: 'Waters the 24 tiles in a 5 by 5 square around it every morning.' },
  crock:      { cost: 500, needs: { stone: 30, copper: 4 }, desc: 'Jars a crop, fruit or forage item over 3 nights. Worth twice the item plus 50g.' },
  churn:      { cost: 400, needs: { copper: 6 },            desc: 'Turns milk into butter overnight.' },
  vat:        { cost: 600, needs: { iron: 4 },              desc: 'Turns goat milk into soft cheese overnight.' },
  booster3:   { cost: 0,   needs: { iron: 5, gel: 10 },     desc: 'Highest soil booster: crops can come out heirloom quality.' },
  // Stardew: wood fence 2 wood, stone fence 2 stone, hardwood fence 1 hardwood, gate 10 wood, paths 1 each.
  fence:      { cost: 0, needs: { wood: 10 },    makes: 5, desc: 'Five fence posts. They join up and block the way.' },
  stonefence: { cost: 0, needs: { stone: 10 },   makes: 5, desc: 'Five stone fence posts.' },
  hardfence:  { cost: 0, needs: { hardwood: 5 }, makes: 5, desc: 'Five hardwood fence posts.' },
  gate:       { cost: 0, needs: { wood: 10 },    desc: 'Opens and closes when you face it. Fits in a fence line.' },
  woodpath:   { cost: 0, needs: { wood: 5 },     makes: 5, desc: 'Five tiles of wooden path. Weeds and stones never grow on paths.' },
  stonepath:  { cost: 0, needs: { stone: 5 },    makes: 5, desc: 'Five tiles of stone path. Weeds and stones never grow on paths.' },
  // Stardew: 1 iron bar, 1 refined quartz, 5 bat wings. Ours (stone and ore for what we lack): iron for the bar, stone for the quartz, copper for the wings.
  lightningrod: { cost: 0, needs: { iron: 5, copper: 5, stone: 10 }, desc: 'Catches a lightning strike in a storm and keeps it as a storm cell (500g).' },
};

// Machines: accepts(itemKey) -> bool, product(itemKey) -> item key, nights to finish.
export const MACHINES = {
  crock: { accepts: (k) => k in PRODUCE || k in FRUIT || k in FORAGE, product: (k) => JAR_PREFIX + k, nights: 3, hint: 'a crop, fruit or forage item' },
  churn: { accepts: (k) => k === 'cowmilk', product: () => 'butter', nights: 1, hint: 'milk' },
  vat:   { accepts: (k) => k === 'goatmilk', product: () => 'cheese', nights: 1, hint: 'goat milk' },
  // Nothing goes in: a storm's lightning fills it (systems/weather.js).
  lightningrod: { accepts: () => false, product: () => 'stormcell', nights: 0, hint: 'lightning, during a storm' },
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
