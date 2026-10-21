// v113: 16x16 item icons for the Bag and chests. One shape per kind (data/bag.js), coloured by the item's own
// colour, what it was made from, or a shade of its kind's tint. Drawn once per item into a data URL.
import { ITEMS } from '../data/items.js';
import { CROPS } from '../data/crops.js';
import { BAG_KINDS, ITEM_KIND, ICON_COLOURS, madeFrom } from '../data/bag.js';
import { r } from './pixel.js';

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('')}`;
}
function colourOf(k, kind) {
  const it = ITEMS[k] || CROPS[k];
  if (it?.color) return it.color;
  if (ICON_COLOURS[k]) return ICON_COLOURS[k];
  const base = ITEMS[k] && madeFrom(k);
  if (base) return colourOf(base, ITEM_KIND[base]);
  return shade(BAG_KINDS[kind].tint, ((hash(k) % 7) - 3) * 0.09);   // a nearby shade so neighbours in the grid differ
}

const OUT = '#1c1712';
const SHAPES = {
  crop: (g, c, it) => { r(g, 4, 5, 8, 9, c); r(g, 3, 7, 10, 5, c); r(g, 5, 6, 3, 2, shade(c, 0.4)); r(g, 7, 2, 2, 4, it?.top || it?.leaf || '#4f9440'); r(g, 9, 3, 3, 2, it?.top || it?.leaf || '#4f9440'); },
  forage: (g, c) => { r(g, 7, 7, 2, 7, '#6e4626'); r(g, 3, 3, 10, 5, c); r(g, 4, 2, 8, 1, c); r(g, 5, 4, 3, 2, shade(c, 0.35)); },
  fish: (g, c) => { r(g, 3, 6, 9, 5, c); r(g, 5, 5, 5, 7, c); r(g, 12, 5, 2, 2, c); r(g, 12, 10, 2, 2, c); r(g, 12, 7, 1, 3, c); r(g, 4, 7, 1, 1, OUT); r(g, 6, 9, 5, 1, shade(c, -0.3)); },
  animal: (g, c) => { r(g, 5, 3, 6, 11, c); r(g, 4, 5, 8, 8, c); r(g, 6, 5, 2, 3, shade(c, 0.5)); r(g, 5, 13, 6, 1, shade(c, -0.3)); },
  artisan: (g, c) => { r(g, 4, 4, 8, 10, '#d8e6ea'); r(g, 5, 7, 6, 6, c); r(g, 5, 2, 6, 2, '#8a5a32'); r(g, 6, 8, 1, 3, shade(c, 0.4)); },
  food: (g, c) => { r(g, 2, 10, 12, 3, '#e8e0d0'); r(g, 3, 13, 10, 1, '#b9ae98'); r(g, 4, 6, 8, 4, c); r(g, 5, 5, 6, 1, c); r(g, 6, 6, 2, 1, shade(c, 0.45)); },
  mineral: (g, c) => { r(g, 5, 3, 6, 2, shade(c, 0.35)); r(g, 3, 5, 10, 4, c); r(g, 5, 9, 6, 2, shade(c, -0.2)); r(g, 7, 11, 2, 2, shade(c, -0.35)); r(g, 5, 5, 2, 2, shade(c, 0.6)); },
  material: (g, c) => { r(g, 2, 7, 12, 6, c); r(g, 4, 5, 10, 2, shade(c, 0.3)); r(g, 2, 12, 12, 1, shade(c, -0.35)); r(g, 5, 8, 3, 1, shade(c, 0.45)); },
  gear: (g, c) => { r(g, 4, 4, 8, 2, c); r(g, 4, 10, 8, 2, c); r(g, 3, 5, 2, 6, c); r(g, 11, 5, 2, 6, c); r(g, 7, 2, 2, 2, shade(c, 0.5)); },
  seed: (g, c) => { r(g, 3, 2, 10, 12, '#e8dcc0'); r(g, 3, 2, 10, 2, '#b9ae98'); r(g, 5, 6, 6, 5, c); r(g, 7, 5, 2, 1, '#4f9440'); },
  kit: (g, c) => { r(g, 2, 4, 12, 10, c); r(g, 2, 4, 12, 2, shade(c, 0.3)); r(g, 2, 8, 12, 1, shade(c, -0.3)); r(g, 7, 7, 2, 3, '#e9b44c'); },
  other: (g, c) => { r(g, 4, 6, 8, 8, c); r(g, 5, 4, 6, 2, shade(c, -0.2)); r(g, 6, 3, 4, 1, '#8a5a32'); r(g, 6, 8, 2, 2, shade(c, 0.4)); },
};
const BOOK = (g, c) => { r(g, 3, 3, 10, 11, c); r(g, 4, 4, 1, 9, shade(c, -0.35)); r(g, 6, 5, 5, 1, '#f4ead2'); r(g, 12, 4, 1, 10, '#f4ead2'); };
const BOTTLE = (g, c) => { r(g, 6, 2, 4, 3, '#4b6b4a'); r(g, 4, 5, 8, 9, shade(c, -0.15)); r(g, 5, 8, 6, 4, c); r(g, 5, 6, 1, 6, shade(c, 0.5)); };

const cache = {};
// id: an item key, "seed:<crop>" or "kit:<placeable>". kind from bagEntries().
export function iconURL(id, kind) {
  if (cache[id]) return cache[id];
  const cv = document.createElement('canvas'); cv.width = cv.height = 16;
  const g = cv.getContext('2d'), key = id.replace(/^(seed|kit):/, ''), it = ITEMS[key] || CROPS[key];
  const draw = ITEMS[key]?.book ? BOOK : /^(wine|juice)_/.test(key) ? BOTTLE : SHAPES[kind] || SHAPES.other;
  draw(g, colourOf(key, kind), it);
  return (cache[id] = cv.toDataURL());
}
