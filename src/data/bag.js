// v113: the Bag screen. Every item's kind (the category tabs and its icon), the sorts, and where artisan goods
// take their colour from. Seeds (G.S.seeds) and the kit (G.S.kit) show in the same grid as "seed:" and "kit:" ids.
import { PRODUCE } from './crops.js';
import { FORAGE } from './forage.js';
import { FISH } from './fish.js';
import { PRODUCTS } from './products.js';
import { MINERALS } from './minerals.js';
import { ARTISAN } from './artisan.js';
import { FRUIT } from './trees.js';
import { WOODS } from './clearing.js';
import { PONDS_ITEMS, AGED_ROE } from './ponds.js';
import { DISHES, WISH_ITEMS } from './cooking.js';
import { ARTIFACTS } from './museum.js';
import { ITEMS } from './items.js';

// Category tabs in order, with the icon's fallback colour for items that have none of their own.
export const BAG_KINDS = {
  crop: { name: 'Crops and fruit', tint: '#c8853a' },
  forage: { name: 'Forage', tint: '#8fb35a' },
  fish: { name: 'Fish', tint: '#7fa7c2' },
  animal: { name: 'Animal goods', tint: '#efe4cf' },
  artisan: { name: 'Artisan goods', tint: '#d9a441' },
  food: { name: 'Food', tint: '#d97a4a' },
  mineral: { name: 'Minerals and artifacts', tint: '#a78bd0' },
  material: { name: 'Materials', tint: '#9aa3ab' },
  gear: { name: 'Rings, books and tackle', tint: '#e9b44c' },
  seed: { name: 'Seeds', tint: '#c9b68e' },
  kit: { name: 'Kit', tint: '#a5753f' },
  other: { name: 'Other', tint: '#c9b68e' },
};

const from = (table, kind) => Object.keys(table).map((k) => [k, kind]);
const FLAG_KIND = (it) => (it.ring || it.trinket || it.book || it.bait || it.tackle ? 'gear' : it.dish ? 'food' : null);
const TABLE_KIND = Object.fromEntries([
  ...from(PRODUCE, 'crop'), ...from(FRUIT, 'crop'), ...from(FORAGE, 'forage'), ...from(FISH, 'fish'), ...from(PRODUCTS, 'animal'),
  ...from(ARTISAN, 'artisan'), ...from(PONDS_ITEMS, 'artisan'), ...from(AGED_ROE, 'artisan'), ...from(DISHES, 'food'), ...from(WISH_ITEMS, 'food'),
  ...from(MINERALS, 'mineral'), ...from(ARTIFACTS, 'mineral'), ...from(WOODS, 'material'),
]);
export const ITEM_KIND = Object.fromEntries(Object.entries(ITEMS).map(([k, it]) =>
  [k, FLAG_KIND(it) || (it.material && !['animal', 'food'].includes(TABLE_KIND[k]) ? 'material' : TABLE_KIND[k] || 'other')]));

// Artisan goods and roe take the colour of what they were made from: wine_plum looks like a plum.
export const MADE_FROM = ['jar_', 'wine_', 'juice_', 'dried_', 'smoked_', 'roe_', 'aged_'];
export function madeFrom(k) {
  const p = MADE_FROM.find((x) => k.startsWith(x)), base = p && k.slice(p.length);
  return base && ITEMS[base] ? base : null;
}

// Icon colours for items whose data has none (ores, bars, gems, animal goods): what they look like.
export const ICON_COLOURS = {
  stone: '#8a8580', copper: '#c8743a', copperbar: '#d9843f', iron: '#a9b4bd', ironbar: '#c9d1d8', gold: '#e9c46a', goldbar: '#f2d478',
  umbrite: '#7a4fb0', umbritebar: '#9a6fd0', coal: '#3d3833', cinder: '#d9644a', wood: '#a5753f', hardwood: '#6e4626', fiber: '#86b86a', cloth: '#e8dcc0',
  gel: '#6fd08a', quartz: '#e8e8f0', violet: '#9b6bd0', ambergem: '#e9a23b', frosttear: '#9fd8f0', emberquartz: '#e2584a', tidestone: '#4fb0a8',
  heartstone: '#e2707a', starstone: '#f4ead2', geode: '#9a8f80', frostgeode: '#a9c4d6', magmageode: '#a5503a',
  egg: '#f4ead2', duckegg: '#d8e6c0', mossegg: '#86b86a', bigegg: '#efe0c0', cowmilk: '#f4f4f0', goatmilk: '#ece8dc', feather: '#e8e0d0', wool: '#efe6d6',
  luckypaw: '#c98c42', truffle: '#5c4030', stormcell: '#69aedb', bouquet: '#e2707a', pendant: '#7fc8c0', gildedgourd: '#e9b44c',
};

export const BAG_SORTS = { kind: 'Kind', name: 'Name', value: 'Value', count: 'Count' };
export const BAG_VIEWS = { grid: 'Grid', list: 'List' };
