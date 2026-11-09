// v113: 16x16 item icons for the Bag and chests. One shape per kind (data/bag.js), coloured by the item's own
// colour, what it was made from, or a shade of its kind's tint. Drawn once per item into a data URL.
// v210: crops, forage, seeds and kit show their own art from the sprite sheets (the ripe crop, the forage find, the
// seed packet, the object itself); every other kind is a shaded shape (a fish, an egg, a jar, a plate, a gem, an
// ingot, a ring, a fruit, a sack, a book, a bottle) in the item's colour, and every icon gets the same darker outline
// as the rest of the art. An icon drawn before its sheet has loaded is not kept, so it is drawn again once it has.
import { ITEMS } from '../data/items.js';
import { CROPS } from '../data/crops.js';
import { BAG_KINDS, ITEM_KIND, ICON_COLOURS, madeFrom } from '../data/bag.js';
import { CROPS_SHEET, FORAGE_SHEET } from '../data/sprites.js';
import { ready, sheet, tinted, frame } from './sheets.js';
import { drawIcon } from './icons.js';
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

// A shape as letter rows, centred: M the colour, L its light, D its dark, W a glint, plus fixed letters.
const FIXED = { E: '#f4ead2', e: '#c9bca0', Z: '#1c1712', G: '#dbe8ee', g: '#a9c4d4', v: '#8a5a32', V: '#5c371e', t: '#6e4626', f: '#5da34a', F: '#86c86a' };
function grid(g, rows, c, extra = {}) {
  const pal = { M: c, L: shade(c, 0.35), D: shade(c, -0.3), W: shade(c, 0.75), ...FIXED, ...extra };
  const y0 = Math.floor((16 - rows.length) / 2), x0 = Math.floor((16 - rows[0].length) / 2);
  rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') r(g, x0 + i, y0 + j, 1, 1, pal[ch]); }));
}
const SHAPES = {
  fish: (g, c) => grid(g, [
    '.......DD.......',
    '.....DDMMD....DM',
    '...DMMLMMMD..DMM',
    '..DMEZMMMMMDDMMD',
    '..MMZZMMMMMMMMD.',
    '..MMMMMLLLLMMMD.',
    '..DLLLLLLLLLDDMM',
    '...DLLLLLLLD.DMM',
    '.....DDLDD....DM',
  ], c),
  animal: (g, c) => grid(g, [
    '.....LLLL.....',
    '....LWWMMM....',
    '...LWLMMMMM...',
    '...LLMMMMMMD..',
    '..LMMMMMMMMMD.',
    '..MMMMMMMMMMD.',
    '..MMMMMMMMMDD.',
    '..DMMMMMMMMDD.',
    '...DMMMMMMDD..',
    '....DDDDDDD...',
  ], c),
  artisan: (g, c) => grid(g, [
    '...vvvvvvvv...',
    '...VVVVVVVV...',
    '....gGGGGg....',
    '...GMMMMMMG...',
    '..GWMMMMMMMg..',
    '..GWMEEEEMMg..',
    '..GMMEeeEMDg..',
    '..GMMMMMMMDg..',
    '..GMMMMMMDDg..',
    '...gggggggg...',
  ], c),
  food: (g, c) => grid(g, [
    '.....LLMMM.....',
    '....LWMMMMMM...',
    '...LMMMMMMMMD..',
    '..LMMMMLMMMMMD.',
    '.EEEEEEEEEEEEEE',
    '.eEEEEEEEEEEEEe',
    '..eeeeeeeeeeee.',
    '....eeeeeeee...',
  ], c),
  mineral: (g, c) => grid(g, [
    '....LLLLLL....',
    '...LWLLLMMM...',
    '..LLWLMMMMMD..',
    '.MMMMMMMMMMMD.',
    '..MMMMLMMMMD..',
    '...DMMMMMMD...',
    '....DMMMMD....',
    '.....DMMD.....',
    '......DD......',
  ], c),
  material: (g, c) => grid(g, [
    '....LLLLLLLL..',
    '...LWWLLLLLLM.',
    '..LLLLLLLLLLMD',
    '.MMMMMMMMMMMDD',
    '.MMMLMMMMMMMDD',
    '.MMMMMMMMMMMD.',
    '.DDDDDDDDDDDD.',
  ], c),
  gear: (g, c) => grid(g, [
    '.....ZPPZ.....',
    '.....PWPP.....',
    '....LMZZMD....',
    '...LM....MD...',
    '..LM......MD..',
    '..M........D..',
    '..M........D..',
    '..MD......DD..',
    '...MD....DD...',
    '....DDDDDD....',
  ], c, { P: '#b98ae0' }),
  fruit: (g, c) => grid(g, [
    '.......t......',
    '......tfFF....',
    '......tffF....',
    '....LLMMMMM...',
    '...LWLMMMMMD..',
    '...LLMMMMMMD..',
    '...MMMMMMMMD..',
    '...MMMMMMMDD..',
    '....DMMMMDD...',
    '.....DDDD.....',
  ], c),
  other: (g, c) => grid(g, [
    '......vv......',
    '.....VvvV.....',
    '....LMVVMD....',
    '...LMMMMMMD...',
    '..LWMMMMMMMD..',
    '..LMMMMMMMMD..',
    '..MMMMMMMMMD..',
    '..MMMMMMMMDD..',
    '...DDDDDDDD...',
  ], c),
};
SHAPES.crop = SHAPES.fruit;
SHAPES.forage = SHAPES.fruit;
SHAPES.seed = SHAPES.other;
SHAPES.kit = SHAPES.other;
const BOOK = (g, c) => grid(g, [
  '..MMMMMMMMMM..',
  '..DLLLLLLLLME.',
  '..DMMMMMMMMME.',
  '..DMWEEEEMMME.',
  '..DMMMMMMMMME.',
  '..DMMEEEMMMME.',
  '..DMMMMMMMMME.',
  '..DMMMMMMMMME.',
  '..DMMMMMMMMMe.',
  '..DDDDDDDDDDD.',
], c);
// v210: bait in a tin with a worm over the rim; tackle a float, red over white, on its line.
const BAIT = (g, c) => grid(g, [
  '....kkk.....',
  '...k...k....',
  '...k.MMMMM..',
  '..MLLLLLLLM.',
  '..MWMMMMMMD.',
  '..MMMMMMMMD.',
  '..MMMMMMMDD.',
  '..DDDDDDDDD.',
], c, { k: '#d98a8a' });
const TACKLE = (g, c) => grid(g, [
  '......Z.....',
  '......Z.....',
  '.....MMM....',
  '....MWMMM...',
  '....MMMMD...',
  '....EEEEe...',
  '....EEEEe...',
  '.....eee....',
  '......Z.....',
  '......Z.....',
], c);
const BOTTLE = (g, c) => grid(g, [
  '......vv......',
  '......Gg......',
  '......Gg......',
  '.....GMMg.....',
  '....GMMMMg....',
  '....GWMMMg....',
  '....GWEEMg....',
  '....GMEEDg....',
  '....GMMMDg....',
  '....gggggg....',
], c);

// v210: a one-pixel outline in a darker version of whatever it borders, as on every sprite sheet.
function outline(g) {
  const d = g.getImageData(0, 0, 16, 16), p = d.data, out = new Uint8ClampedArray(p);
  const at = (x, y) => (y * 16 + x) * 4;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (p[at(x, y) + 3]) continue;
    const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([i, j]) => [x + i, y + j]).find(([a, b]) => a >= 0 && b >= 0 && a < 16 && b < 16 && p[at(a, b) + 3] > 200);
    if (!n) continue;
    const s = at(...n), o = at(x, y);
    out[o] = p[s] * 0.42 + 7; out[o + 1] = p[s + 1] * 0.42 + 4; out[o + 2] = p[s + 2] * 0.42 + 3; out[o + 3] = 255;
  }
  d.data.set(out); g.putImageData(d, 0, 0);
}

// The item's own art, when its sheet has loaded: the ripe crop, the forage find, the seed packet or the kit object.
// Returns true when drawn, false to fall back to a shape, or null when the sheet has not loaded yet.
function ownArt(g, id, key, kind) {
  const crop = CROPS[key];
  if (id.startsWith('seed:') || kind === 'seed') { if (!crop && !CROPS[key.replace(/seeds?$/, '')]) return false; drawIcon(g, 'seeds', crop ? key : key.replace(/seeds?$/, '')); return ready('packet') || null; }
  if (id.startsWith('kit:') || kind === 'kit') { drawIcon(g, 'kit', key); return true; }
  if (crop && !crop.packet) {
    if (!ready(CROPS_SHEET.sheet)) return null;
    const C = CROPS_SHEET, layers = [['plant', null], ['fruit', crop.color]];
    if (crop.top) layers.push(['top', crop.top]);
    layers.push(['line', crop.line || crop.color], ['shine', null]);
    frame(g, tinted(C.sheet, C.layers, layers, C.size), C.cols[crop.shape] ?? C.cols.root, C.size, 0, 0);
    return true;
  }
  const fi = FORAGE_SHEET.order.indexOf(key);
  if (fi >= 0) {
    if (!ready(FORAGE_SHEET.sheet)) return null;
    frame(g, sheet(FORAGE_SHEET.sheet).img, fi % FORAGE_SHEET.per, FORAGE_SHEET.size, 0, 0, Math.floor(fi / FORAGE_SHEET.per));
    return true;
  }
  return false;
}

const cache = {};
// id: an item key, "seed:<crop>" or "kit:<placeable>". kind from bagEntries().
export function iconURL(id, kind) {
  if (cache[id]) return cache[id];
  const cv = document.createElement('canvas'); cv.width = cv.height = 16;
  const g = cv.getContext('2d'), key = id.replace(/^(seed|kit):/, ''), it = ITEMS[key] || CROPS[key];
  const own = ownArt(g, id, key, kind);
  if (!own) {
    g.clearRect(0, 0, 16, 16);
    const draw = ITEMS[key]?.book ? BOOK : ITEMS[key]?.bait ? BAIT : ITEMS[key]?.tackle ? TACKLE : /^(wine|juice)_/.test(key) ? BOTTLE : SHAPES[kind] || SHAPES.other;
    draw(g, colourOf(key, kind), it);
    outline(g);
  }
  const url = cv.toDataURL();
  if (own !== null) cache[id] = url;   // drawn before its sheet loaded: draw it again next time
  return url;
}
