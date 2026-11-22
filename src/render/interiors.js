// v97: the neighbours' cottages inside: room-by-room walls and floors, and every piece in a floor plan
// (data/interiors.js), drawn in code at its full size. X, Y: the top-left pixel of the piece's block of tiles;
// W, H: its size in pixels. Tall pieces stand against the wall above them and reach up into it.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { r, blink } from './pixel.js';
import { drawHouseTile, drawBed, tone } from './tiles.js';
import { drawFurniture } from './sprites.js';
import { PIECES, roomAt } from '../data/interiors.js';
import { WALLPAPERS, FLOORS } from '../data/furniture.js';

const INK = '#2b211a', CREAM = '#f4ead2', GLINT = 'rgba(255,255,255,.22)', SHADE = 'rgba(0,0,0,.18)';
// v299: a shade of a piece's colour (tone() for #rrggbb colours; anything else as it is)
const sh = (c, k) => (/^#[0-9a-f]{6}$/i.test(c) ? tone(c, k) : c);
const shadow = (c, X, Y, W, H) => r(c, X + 1, Y + H - 2, W - 2, 2, SHADE);

// ---- Walls and floors, each room in its own wallpaper and floor ----
const isRoom = (t) => t && t !== 'I' && t !== '.';
export function drawHomeTile(g, x, y, map) {
  const m = map.grid, t = m[y][x], below = m[y + 1]?.[x];
  const room = (rx, ry) => roomAt(map.plan, rx, ry);
  if (t === 'I') {
    // the lower face sits right above a room; a north wall has a second, upper face above that
    // (only on a wall that runs east to west: the end of a wall between two rooms has one face, not two)
    const across = (yy) => m[yy]?.[x - 1] === 'I' || m[yy]?.[x + 1] === 'I';
    const lower = isRoom(below), upper = !lower && below === 'I' && isRoom(m[y + 2]?.[x]) && m[y - 1]?.[x] === 'I' && across(y + 1);
    if (lower || upper) {
      const rm = room(x, y + (lower ? 1 : 2));
      drawHouseTile(g, x, y, t, 'h', WALLPAPERS, FLOORS, rm ? { wall: rm[4], floor: rm[5] } : map.decor);
      if (upper) { r(g, x * T, y * T, T, 2, '#3f3226'); r(g, x * T, y * T + 14, T, 2, 'rgba(0,0,0,.12)'); }   // cornice; no skirting
      return;
    }
    drawHouseTile(g, x, y, t, below, WALLPAPERS, FLOORS, map.decor);
    return;
  }
  const rm = room(x, y) || room(x - 1, y) || room(x + 1, y) || room(x, y - 1) || room(x, y + 1);   // doorways take a neighbour's floor
  drawHouseTile(g, x, y, t, below, WALLPAPERS, FLOORS, rm ? { wall: rm[4], floor: rm[5] } : map.decor);
  if (m[y - 1]?.[x] === 'I') r(g, x * T, y * T, T, 3, 'rgba(0,0,0,.14)');   // the wall's shadow on the floor
}

// ---- Small things on surfaces: drawn centred at (x, y), the bottom of the thing ----
const TOPS = {
  jar: (c, x, y) => { r(c, x - 2, y - 5, 4, 5, '#e9a43a'); r(c, x - 2, y - 6, 4, 1, '#f4ead2'); r(c, x - 1, y - 4, 1, 2, '#f6cf74'); },
  honeypot: (c, x, y) => { r(c, x - 3, y - 5, 6, 5, '#c98a3a'); r(c, x - 2, y - 6, 4, 1, '#8a5a32'); r(c, x + 1, y - 9, 1, 4, '#a5753f'); },
  pumpkin: (c, x, y) => { r(c, x - 4, y - 6, 8, 6, '#e8862a'); r(c, x - 1, y - 6, 1, 6, '#c96a1a'); r(c, x, y - 8, 1, 2, '#5d8a4a'); },
  bread: (c, x, y) => { r(c, x - 4, y - 3, 8, 3, '#c98a4a'); r(c, x - 3, y - 4, 6, 1, '#e0a862'); },
  cup: (c, x, y) => { r(c, x - 2, y - 3, 3, 3, CREAM); r(c, x + 1, y - 2, 1, 1, CREAM); },
  candle: (c, x, y) => { r(c, x - 1, y - 5, 2, 5, '#f4e3a4'); r(c, x - 1, y - 7, 1, 2, blink(300, 2) ? '#ffd46a' : '#ff9a3a'); },
  lamp: (c, x, y) => { r(c, x - 1, y - 4, 2, 4, '#6e4626'); r(c, x - 4, y - 9, 8, 5, '#e9c46a'); r(c, x - 3, y - 8, 6, 3, '#fff3c4'); },
  book: (c, x, y) => { r(c, x - 3, y - 2, 6, 2, '#5f8fb5'); r(c, x - 3, y - 3, 6, 1, '#b5452f'); },
  books: (c, x, y) => { ['#b5452f', '#5f8fb5', '#5d8a4a', '#e9c46a'].forEach((k, i) => r(c, x - 4 + i * 2, y - 6 + (i % 2), 2, 6 - (i % 2), k)); },
  smoker: (c, x, y) => { r(c, x - 2, y - 6, 4, 6, '#8d939a'); r(c, x - 1, y - 8, 2, 2, '#5c6268'); r(c, x + 2, y - 3, 3, 2, '#8a5a32'); },
  plate: (c, x, y) => { r(c, x - 3, y - 2, 6, 2, CREAM); r(c, x - 2, y - 3, 4, 1, '#c96a4a'); },
  vase: (c, x, y) => { r(c, x - 1, y - 5, 3, 5, '#5f8fb5'); r(c, x - 2, y - 8, 2, 2, '#e2707a'); r(c, x + 1, y - 9, 2, 2, '#e9c46a'); r(c, x, y - 7, 1, 2, '#5d8a4a'); },
  inkpot: (c, x, y) => { r(c, x - 2, y - 3, 3, 3, INK); r(c, x + 1, y - 7, 1, 5, CREAM); },
  paper: (c, x, y) => { r(c, x - 4, y - 2, 7, 2, CREAM); r(c, x - 3, y - 2, 5, 1, '#c9b68e'); },
  scroll: (c, x, y) => { r(c, x - 4, y - 2, 8, 2, '#e8dcc0'); r(c, x - 4, y - 3, 1, 3, '#a5753f'); r(c, x + 3, y - 3, 1, 3, '#a5753f'); },
  compass: (c, x, y) => { r(c, x - 2, y - 3, 4, 3, '#c9a35a'); r(c, x - 1, y - 2, 2, 1, '#b5452f'); },
  gears: (c, x, y) => { r(c, x - 4, y - 4, 4, 4, '#b87333'); r(c, x - 3, y - 3, 2, 2, '#6a4a2a'); r(c, x + 1, y - 3, 3, 3, '#8d939a'); },
  clockface: (c, x, y) => { r(c, x - 3, y - 6, 6, 6, '#c9a35a'); r(c, x - 2, y - 5, 4, 4, CREAM); r(c, x, y - 4, 1, 2, INK); },
  slates: (c, x, y) => { r(c, x - 4, y - 3, 8, 3, '#3f4850'); r(c, x - 4, y - 3, 8, 1, '#a5753f'); r(c, x - 3, y - 2, 4, 1, '#c9ccd6'); },
  apple: (c, x, y) => { r(c, x - 2, y - 3, 4, 3, '#c8352f'); r(c, x, y - 4, 1, 1, '#5d8a4a'); },
  fish: (c, x, y) => { r(c, x - 4, y - 3, 7, 3, '#8fb0c0'); r(c, x + 3, y - 4, 2, 5, '#6f909f'); r(c, x - 3, y - 2, 1, 1, INK); },
  bottle: (c, x, y) => { r(c, x - 1, y - 6, 3, 6, '#5d7a4a'); r(c, x, y - 8, 1, 2, '#3f5a32'); },
  letters: (c, x, y) => { r(c, x - 4, y - 3, 7, 3, CREAM); r(c, x - 3, y - 4, 7, 2, '#e8dcc0'); r(c, x - 1, y - 3, 2, 1, '#b5452f'); },
  plant: (c, x, y) => { r(c, x - 2, y - 3, 4, 3, '#b5452f'); r(c, x - 3, y - 7, 6, 4, '#5da34a'); },
  rope: (c, x, y) => { r(c, x - 3, y - 4, 6, 4, '#c9b68e'); r(c, x - 1, y - 3, 2, 2, '#a5935e'); },
  knife: (c, x, y) => { r(c, x - 3, y - 1, 5, 1, '#c9ccd6'); r(c, x + 2, y - 1, 2, 1, '#6e4626'); },
  pot: (c, x, y) => { r(c, x - 3, y - 4, 6, 4, '#3f3226'); r(c, x - 4, y - 4, 8, 1, '#5c4632'); },
  radish: (c, x, y) => { r(c, x - 2, y - 3, 4, 3, '#d9446a'); r(c, x - 1, y - 5, 1, 2, '#5d8a4a'); r(c, x + 1, y - 6, 1, 3, '#6fae52'); },
  mushroom: (c, x, y) => { r(c, x - 3, y - 5, 6, 3, '#a5753f'); r(c, x - 1, y - 2, 2, 2, '#e8dcc0'); },
  teapot: (c, x, y) => { r(c, x - 3, y - 5, 6, 5, '#5f8fb5'); r(c, x + 3, y - 4, 2, 1, '#5f8fb5'); r(c, x - 5, y - 4, 2, 2, '#5f8fb5'); r(c, x - 1, y - 6, 2, 1, '#3d6a8f'); },
  heartstone: (c, x, y) => { r(c, x - 2, y - 4, 4, 3, '#d9446a'); r(c, x - 1, y - 1, 2, 1, '#d9446a'); r(c, x - 1, y - 4, 1, 1, '#ffc0d0'); },
  photo: (c, x, y) => { r(c, x - 3, y - 7, 6, 7, '#8a5a32'); r(c, x - 2, y - 6, 4, 5, '#d9caa6'); r(c, x - 1, y - 5, 2, 2, '#8a6a4a'); },
  boat: (c, x, y) => { r(c, x - 5, y - 3, 10, 3, '#b5452f'); r(c, x - 4, y - 1, 8, 1, '#7a2f22'); r(c, x, y - 9, 1, 6, '#6e4626'); r(c, x + 1, y - 8, 3, 4, CREAM); },
  crystal: (c, x, y) => { r(c, x - 1, y - 6, 3, 6, '#bfe0f2'); r(c, x - 2, y - 4, 5, 2, '#9fc0d8'); r(c, x, y - 5, 1, 1, '#ffffff'); },
  pizza: (c, x, y) => { r(c, x - 4, y - 3, 8, 3, '#e9b44c'); r(c, x - 3, y - 2, 1, 1, '#c8352f'); r(c, x + 1, y - 3, 1, 1, '#c8352f'); r(c, x - 4, y - 3, 8, 1, '#c98a4a'); },
  carrot: (c, x, y) => { r(c, x - 3, y - 2, 6, 2, '#e8862a'); r(c, x + 3, y - 3, 2, 2, '#5d8a4a'); },
  beet: (c, x, y) => { r(c, x - 2, y - 3, 4, 3, '#8a2f4a'); r(c, x - 1, y - 6, 1, 3, '#5d8a4a'); },
  plum: (c, x, y) => { r(c, x - 2, y - 3, 4, 3, '#6a3a7a'); r(c, x - 1, y - 3, 1, 1, '#9a6aaa'); },
  cake: (c, x, y) => { r(c, x - 4, y - 4, 8, 4, '#e9c46a'); r(c, x - 4, y - 4, 8, 1, '#f4ead2'); r(c, x - 4, y - 2, 8, 1, '#c98a3a'); },
  packet: (c, x, y) => { r(c, x - 2, y - 5, 4, 5, '#f4ead2'); r(c, x - 1, y - 4, 2, 2, ['#5d8a4a', '#e8862a', '#c8352f', '#8a5aa8'][(x * 3) % 4]); },
  till: (c, x, y) => { r(c, x - 4, y - 6, 8, 6, '#c9a35a'); r(c, x - 3, y - 8, 6, 2, '#a5753f'); r(c, x - 3, y - 5, 6, 2, '#3f3226'); r(c, x - 2, y - 2, 1, 1, CREAM); r(c, x + 1, y - 2, 1, 1, CREAM); },
  bars: (c, x, y) => { r(c, x - 4, y - 2, 4, 2, '#e9c46a'); r(c, x, y - 2, 4, 2, '#c9ccd6'); r(c, x - 2, y - 4, 4, 2, '#d9844a'); },
  ore: (c, x, y) => { r(c, x - 3, y - 3, 6, 3, '#8d8a84'); r(c, x - 2, y - 3, 2, 1, '#d9844a'); r(c, x + 1, y - 2, 1, 1, '#c9ccd6'); },
  coal: (c, x, y) => { r(c, x - 3, y - 3, 6, 3, '#2b2a28'); r(c, x - 1, y - 3, 1, 1, '#5c5a58'); },
  tool: (c, x, y) => { r(c, x - 4, y - 1, 7, 1, '#6e4626'); r(c, x + 3, y - 3, 2, 3, '#c9ccd6'); },
  gem: (c, x, y) => { r(c, x - 1, y - 5, 3, 5, '#8a5aa8'); r(c, x - 2, y - 3, 5, 2, '#aa7ac8'); r(c, x, y - 4, 1, 1, '#ffffff'); },
  shard: (c, x, y) => { r(c, x - 3, y - 3, 5, 3, '#c98a5a'); r(c, x - 2, y - 4, 3, 1, '#a5703f'); r(c, x - 2, y - 2, 2, 1, '#6e4626'); },
  pail: (c, x, y) => { r(c, x - 2, y - 4, 5, 4, '#c9ccd6'); r(c, x - 2, y - 5, 5, 1, '#8d939a'); r(c, x - 1, y - 4, 3, 1, '#f4ead2'); },
  popcorn: (c, x, y) => { r(c, x - 2, y - 4, 4, 4, '#c8352f'); r(c, x - 1, y - 4, 1, 4, CREAM); r(c, x - 3, y - 6, 6, 2, '#f4e3a4'); },
  coins: (c, x, y) => { r(c, x - 3, y - 2, 3, 2, '#e9c46a'); r(c, x, y - 3, 3, 3, '#e9c46a'); r(c, x, y - 3, 3, 1, '#f6cf74'); },
  cards: (c, x, y) => { r(c, x - 3, y - 3, 3, 3, CREAM); r(c, x + 1, y - 3, 3, 3, CREAM); r(c, x - 2, y - 2, 1, 1, '#c8352f'); r(c, x + 2, y - 2, 1, 1, INK); },
  dice: (c, x, y) => { r(c, x - 3, y - 3, 3, 3, CREAM); r(c, x + 1, y - 3, 3, 3, CREAM); r(c, x - 2, y - 2, 1, 1, INK); r(c, x + 2, y - 2, 1, 1, INK); },
  yarn: (c, x, y) => { r(c, x - 2, y - 3, 4, 3, '#e2707a'); r(c, x - 1, y - 2, 2, 1, '#f4a0a8'); },
};
function tops(c, p, X, y, W) {
  const list = p.top || [];
  list.forEach((k, i) => TOPS[k]?.(c, X + Math.round(((i + 0.5) * W) / list.length), y));
}

// A wooden box with a lit top edge, the base of many pieces.
const box = (c, x, y, w, h, a, b) => { r(c, x, y, w, h, a); r(c, x, y, w, 1, GLINT); r(c, x, y + h - 1, w, 1, b); };

// ---- The pieces. Each: (c, X, Y, W, H, a, b, p) ----
const ART = {
  bed: (c, X, Y, W, H, a, b) => drawBed(c, X, Y, W, H, a, b),   // v299: render/tiles.js, shared with the farmhouse bed
  // v299: a bedside cabinet: an overhanging top, two drawers with brass knobs, a shaded side and short feet
  nightstand: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.25), ad = sh(a, 0.78), ak = sh(a, 0.55);
    shadow(c, X, Y, W, H);
    r(c, X + 3, Y + 6, 10, 8, ak); r(c, X + 4, Y + 6, 8, 7, a); r(c, X + 11, Y + 6, 1, 7, ad);
    r(c, X + 2, Y + 4, 12, 3, ak); r(c, X + 3, Y + 4, 10, 1, al); r(c, X + 3, Y + 5, 10, 1, a);
    for (const dy of [7, 10]) { r(c, X + 4, Y + dy + 2, 7, 1, ak); r(c, X + 7, Y + dy, 2, 1, '#e9c46a'); r(c, X + 7, Y + dy + 1, 2, 1, '#a57a2a'); }
    r(c, X + 4, Y + 14, 1, 1, ak); r(c, X + 11, Y + 14, 1, 1, ak);
    tops(c, p, X, Y + 5, W);
  },
  // v299: a tall wardrobe: a moulded crown, two panelled doors meeting in the middle, brass handles, a plinth with feet
  wardrobe: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.22), ad = sh(a, 0.78), ak = sh(a, 0.55);
    shadow(c, X, Y, W, H);
    const top = Y - 12, bot = Y + H - 2;
    r(c, X + 1, top, W - 2, bot - top, ak); r(c, X + 2, top + 1, W - 4, bot - top - 2, a); r(c, X + W - 3, top + 1, 1, bot - top - 2, ad);
    r(c, X, top - 2, W, 3, ak); r(c, X + 1, top - 2, W - 2, 1, al);   // the crown
    const dw = (W - 6) / 2;
    for (const dx of [X + 2, X + 4 + dw]) {
      r(c, dx + 1, top + 3, dw - 2, 7, ad); r(c, dx + 1, top + 3, dw - 2, 1, ak); r(c, dx + 1, top + 9, dw - 2, 1, al);
      r(c, dx + 1, top + 12, dw - 2, bot - top - 16, ad); r(c, dx + 1, top + 12, dw - 2, 1, ak); r(c, dx + 1, bot - 4, dw - 2, 1, al);
    }
    r(c, X + W / 2 - 1, top + 1, 2, bot - top - 4, ak);   // where the doors meet
    r(c, X + W / 2 - 3, Y - 2, 1, 4, '#e9c46a'); r(c, X + W / 2 + 2, Y - 2, 1, 4, '#e9c46a'); r(c, X + W / 2 - 3, Y + 1, 1, 1, '#a57a2a'); r(c, X + W / 2 + 2, Y + 1, 1, 1, '#a57a2a');
    r(c, X + 1, bot - 2, W - 2, 2, ak); r(c, X + 2, bot - 2, W - 4, 1, ad);   // the plinth
    r(c, X + 2, bot, 2, 1, ak); r(c, X + W - 4, bot, 2, 1, ak);
  },
  // v299: a washstand: a cabinet with a door, a china bowl of water on top, a jug standing beside it
  washstand: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.2), ad = sh(a, 0.78), ak = sh(a, 0.55);
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 6, 12, 9, ak); r(c, X + 3, Y + 6, 10, 8, a); r(c, X + 3, Y + 6, 10, 1, al);
    r(c, X + 4, Y + 8, 8, 5, ad); r(c, X + 4, Y + 8, 8, 1, ak); r(c, X + 10, Y + 10, 1, 1, '#e9c46a');   // the door
    r(c, X + 3, Y + 3, 8, 3, sh(b, 0.75)); r(c, X + 3, Y + 3, 8, 1, b); r(c, X + 4, Y + 3, 6, 1, '#9fc0d8'); r(c, X + 5, Y + 3, 2, 1, '#dcecf6');   // the bowl
    r(c, X + 11, Y - 1, 3, 5, b); r(c, X + 11, Y - 1, 1, 4, sh(b, 1.2)); r(c, X + 10, Y, 1, 1, b); r(c, X + 14, Y, 1, 2, sh(b, 0.75));   // the jug
  },
  // v299: a claw-footed bathtub: a rolled lip, water with a highlight, the taps at its head, feet at the corners
  tub: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.15), ad = sh(a, 0.8), ak = sh(a, 0.62);
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 3, W - 2, H - 5, ak); r(c, X + 2, Y + 3, W - 4, H - 6, a); r(c, X + 2, Y + 3, W - 4, 1, al); r(c, X + 2, Y + H - 4, W - 4, 1, ad);
    r(c, X + 4, Y + 5, W - 8, H - 10, '#7fa6c4'); r(c, X + 4, Y + 5, W - 8, 2, '#9fc0d8'); r(c, X + 5, Y + 7, 3, 1, '#dcecf6'); r(c, X + W - 8, Y + H - 7, 2, 1, '#bcd4e6');   // water
    r(c, X + 4, Y + 1, 4, 3, b); r(c, X + 4, Y + 1, 4, 1, sh(b, 1.3)); r(c, X + 5, Y + 4, 1, 1, sh(b, 0.6));   // taps
    for (const fx of [X + 2, X + W - 4]) { r(c, fx, Y + H - 3, 2, 2, b); r(c, fx, Y + H - 3, 1, 1, sh(b, 1.3)); }   // feet
  },
  // v299: a folding screen: three hinged panels, each framed, with a painted sprig and a lit edge
  screen: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 14, 15, 1, SHADE);
    [0, 5, 10].forEach((o, i) => { const y = Y - 8 + (i % 2); r(c, X + 1 + o, y, 5, 22, sh(b, 0.6)); r(c, X + 2 + o, y + 1, 3, 20, a); r(c, X + 2 + o, y + 1, 3, 1, sh(a, 1.2)); r(c, X + 3 + o, y + 6, 1, 6, sh(a, 0.7)); r(c, X + 2 + o, y + 8, 1, 1, '#5d8a4a'); r(c, X + 4 + o, y + 10, 1, 1, '#e2707a'); r(c, X + 1 + o, y, 1, 22, b); });
  },
  // v299: a kitchen run: a worktop with a lit edge and grain, a cupboard door with a sunk panel and knob per tile, a toe kick
  counter: (c, X, Y, W, H, a, b, p) => {
    const ad = sh(a, 0.78), ak = sh(a, 0.55), al = sh(a, 1.2), bl = sh(b, 1.15), bd = sh(b, 0.8);
    r(c, X, Y + 4, W, 11, ak); r(c, X, Y + 5, W, 9, a);
    r(c, X, Y + 1, W, 4, bd); r(c, X, Y + 1, W, 1, bl); r(c, X, Y + 2, W, 2, b); r(c, X, Y + 4, W, 1, ak);   // worktop
    for (let i = 0; i < W; i += 5) r(c, X + i + ((i * 7) % 3), Y + 2 + (i % 2), 2, 1, bd);
    for (let i = 0; i < W; i += T) {
      r(c, X + i + 2, Y + 6, 12, 7, ak); r(c, X + i + 3, Y + 7, 10, 5, ad); r(c, X + i + 3, Y + 7, 10, 1, ak); r(c, X + i + 3, Y + 11, 10, 1, al);
      r(c, X + i + 11, Y + 9, 1, 2, '#e9c46a'); r(c, X + i + 11, Y + 10, 1, 1, '#a57a2a'); r(c, X + i + 15, Y + 5, 1, 9, ak);
    }
    r(c, X, Y + 14, W, 2, '#3f2a1a');   // toe kick
    tops(c, p, X, Y + 3, W);
  },
  sink: (c, X, Y, W, H, a, b) => {
    ART.counter(c, X, Y, W, H, a, b, {});
    r(c, X + 2, Y + 2, W - 4, 4, '#8d939a'); r(c, X + 3, Y + 3, W - 6, 2, '#9fc0d8');
    r(c, X + W / 2 - 1, Y - 4, 2, 6, '#5c6268'); r(c, X + W / 2 - 1, Y - 4, 5, 2, '#5c6268');   // pump spout
  },
  // v299: a cast-iron wood stove: its pipe up the wall, a lit top with a pot steaming, a firebox door with a glowing grate, feet
  stove: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.4), ad = sh(a, 0.8);
    r(c, X + 10, Y - 14, 3, 17, '#2b2f33'); r(c, X + 10, Y - 14, 1, 17, '#4a5058'); r(c, X + 9, Y - 6, 5, 1, '#1f2428');   // pipe and collar
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 2, 14, 12, '#1f2428'); r(c, X + 2, Y + 3, 12, 10, a); r(c, X + 2, Y + 3, 12, 1, al); r(c, X + 12, Y + 3, 2, 10, ad);
    r(c, X + 1, Y + 1, 14, 2, '#2b2f33'); r(c, X + 1, Y + 1, 14, 1, '#4a5058');   // the top plate
    const f = blink(220, 2);
    r(c, X + 3, Y + 6, 9, 6, '#1f2428'); r(c, X + 4, Y + 7, 7, 4, '#2a1a10');
    for (let x = X + 4; x < X + 11; x += 2) r(c, x, Y + 9, 1, 2, f ? '#e8862a' : '#d9644a');   // the grate glowing between bars
    r(c, X + 5, Y + 8, 5, 1, f ? '#ffd46a' : '#e8862a'); r(c, X + 11, Y + 8, 1, 2, '#c9a35a');   // flame, latch
    r(c, X + 2, Y + 14, 2, 1, '#1f2428'); r(c, X + 12, Y + 14, 2, 1, '#1f2428');   // feet
    r(c, X + 3, Y - 2, 7, 4, b); r(c, X + 3, Y - 2, 7, 1, sh(b, 1.25)); r(c, X + 2, Y - 2, 9, 1, '#3f3226'); r(c, X + 2, Y, 1, 1, '#3f3226'); r(c, X + 10, Y, 1, 1, '#3f3226');   // a pot with handles
    if (blink(400, 2)) r(c, X + 5, Y - 5, 1, 2, 'rgba(255,255,255,.5)'); else r(c, X + 7, Y - 6, 1, 2, 'rgba(255,255,255,.5)');
  },
  // v299: a cast-iron range: hob plates with rings, oven doors with brass handles, the firebox glowing, its flue
  range: (c, X, Y, W, H, a, b) => {
    r(c, X + W - 6, Y - 14, 3, 18, '#2b2f33'); r(c, X + W - 6, Y - 14, 1, 18, '#4a5058');
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 2, W - 2, 13, '#1f2428'); r(c, X + 2, Y + 5, W - 4, 9, a); r(c, X + 2, Y + 5, W - 4, 1, sh(a, 1.4));
    r(c, X + 1, Y + 2, W - 2, 3, '#2b2f33'); r(c, X + 1, Y + 2, W - 2, 1, '#4a5058');   // hob
    for (let i = 4; i < W - 8; i += 7) { r(c, X + i, Y + 3, 4, 1, '#5c6268'); }   // rings
    for (let i = 3; i < W - 12; i += 10) { r(c, X + i, Y + 7, 7, 6, '#1f2428'); r(c, X + i + 1, Y + 8, 5, 4, sh(a, 0.8)); r(c, X + i + 1, Y + 8, 5, 1, b); r(c, X + i + 2, Y + 10, 3, 1, '#c9a35a'); }   // oven doors
    const f = blink(220, 2);
    r(c, X + W - 12, Y + 7, 9, 6, '#1f2428'); for (let x = X + W - 11; x < X + W - 4; x += 2) r(c, x, Y + 9, 1, 3, f ? '#e8862a' : '#d9644a'); r(c, X + W - 10, Y + 8, 5, 1, f ? '#ffd46a' : '#e8862a');   // firebox
  },
  shelf: (c, X, Y, W, H, a, b, p, P) => {
    shadow(c, X, Y, W, H);
    box(c, X + 1, Y - 12, W - 2, H + 11, a, b);
    const rows = 3, hh = (H + 9) / rows, list = p.top || [];
    for (let i = 0; i < rows; i++) {
      const y0 = Y - 11 + i * hh;
      r(c, X + 2, y0, W - 4, hh - 2, '#3f2a1a');
      if (P.books || !list.length) for (let x = X + 3; x < X + W - 4; x += 2) r(c, x, y0 + 1 + ((x * 7 + i) % 3), 2, hh - 4 - ((x * 7 + i) % 3), ['#b5452f', '#5f8fb5', '#e9c46a', '#5d8a4a', '#8a5aa8', '#c9b68e'][(x + i * 3) % 6]);
      else list.forEach((k, j) => TOPS[k]?.(c, X + Math.round(((j + 0.5) * W) / list.length), y0 + hh - 2));
      r(c, X + 2, y0 + hh - 2, W - 4, 1, b);
    }
  },
  // v299: a table: a grained top with a lit front edge, an apron, legs lit on one side; drawers on a desk; a cloth
  table: (c, X, Y, W, H, a, b, p, P) => {
    const al = sh(a, 1.2), ad = sh(a, 0.82), bl = sh(b, 1.25), bk = sh(b, 0.6);
    shadow(c, X, Y, W, H);
    const top = Y + (H > T ? 3 : 4), th = H - (H > T ? 8 : 9), lb = Y + H - 1;
    for (const lx of [X + 2, X + W - 4]) { r(c, lx, top + th, 2, lb - top - th, b); r(c, lx, top + th, 1, lb - top - th, bl); r(c, lx, lb - 1, 2, 1, bk); }
    if (P.desk) { r(c, X + W - 11, top + th, 8, lb - top - th, bk); r(c, X + W - 10, top + th + 1, 6, 3, b); r(c, X + W - 10, top + th + 5, 6, 3, b); r(c, X + W - 8, top + th + 2, 2, 1, '#e9c46a'); r(c, X + W - 8, top + th + 6, 2, 1, '#e9c46a'); }
    r(c, X + 1, top, W - 2, th + 2, bk); r(c, X + 2, top, W - 4, th, a); r(c, X + 2, top, W - 4, 1, al);
    for (let y = top + 2; y < top + th - 1; y += 3) for (let x = X + 3 + (y % 2) * 4; x < X + W - 5; x += 8) r(c, x, y, 4, 1, ad);   // grain
    r(c, X + 2, top + th, W - 4, 1, b); r(c, X + 2, top + th + 1, W - 4, 1, bk);   // the front edge and apron
    if (p.cloth) { r(c, X + W / 2 - 5, top, 10, th + 3, p.cloth); r(c, X + W / 2 - 5, top, 10, 1, sh(p.cloth, 1.15)); r(c, X + W / 2 - 5, top + th + 2, 10, 1, 'rgba(0,0,0,.14)'); r(c, X + W / 2 - 1, top, 1, th + 2, 'rgba(0,0,0,.06)'); }
    tops(c, p, X, top + Math.min(th, 9), W);
  },
  // v299: a chair with a spindled back, a cushioned seat and legs, facing down, up, left or right
  chair: (c, X, Y, W, H, a, b, p) => {
    const d = p.dir || 'down', bl = sh(b, 1.25), bk = sh(b, 0.6), al = sh(a, 1.2), ad = sh(a, 0.8);
    shadow(c, X + 2, Y, 12, H);
    const legs = () => { r(c, X + 4, Y + 11, 1, 4, b); r(c, X + 11, Y + 11, 1, 4, b); r(c, X + 4, Y + 14, 1, 1, bk); r(c, X + 11, Y + 14, 1, 1, bk); };
    const seat = (y) => { r(c, X + 3, y, 10, 4, bk); r(c, X + 4, y, 8, 3, a); r(c, X + 4, y, 8, 1, al); r(c, X + 4, y + 2, 8, 1, ad); };
    const back = (y, h) => { r(c, X + 4, y, 8, h, bk); r(c, X + 4, y, 8, 2, b); r(c, X + 4, y, 8, 1, bl); for (const sx of [6, 9]) r(c, X + sx, y + 2, 1, h - 2, b); r(c, X + 4, y + 2, 1, h - 2, b); r(c, X + 11, y + 2, 1, h - 2, b); };
    if (d === 'down') { back(Y + 1, 8); legs(); seat(Y + 8); }
    else if (d === 'up') { legs(); seat(Y + 6); back(Y + 7, 7); }
    else {
      const L = d === 'left', bx = L ? X + 11 : X + 3;
      legs(); seat(Y + 8);
      r(c, bx, Y + 1, 2, 14, bk); r(c, bx + (L ? 0 : 1), Y + 1, 1, 13, b); r(c, bx, Y + 1, 2, 1, bl);
      r(c, bx + (L ? -2 : 2), Y + 3, 2, 5, b); r(c, bx + (L ? -2 : 2), Y + 3, 2, 1, bl);
    }
  },
  // v299: a slatted bench: a back rail on posts, a seat of two lit planks, splayed legs with a stretcher
  bench: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.22), ad = sh(a, 0.78), bk = sh(b, 0.6), bl = sh(b, 1.2);
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 1, W - 2, 3, bk); r(c, X + 2, Y + 1, W - 4, 1, bl); r(c, X + 2, Y + 2, W - 4, 1, b);   // back rail
    for (let x = X + 3; x < X + W - 3; x += 6) r(c, x, Y + 4, 1, 2, b);
    r(c, X + 3, Y + 4, 1, 2, b); r(c, X + W - 4, Y + 4, 1, 2, b);
    r(c, X + 1, Y + 6, W - 2, 5, ad); r(c, X + 1, Y + 6, W - 2, 2, a); r(c, X + 1, Y + 6, W - 2, 1, al); r(c, X + 1, Y + 8, W - 2, 1, ad); r(c, X + 1, Y + 9, W - 2, 1, a); r(c, X + 1, Y + 10, W - 2, 1, sh(a, 0.6));
    for (const lx of [X + 2, X + W - 4]) { r(c, lx, Y + 11, 2, 4, bk); r(c, lx, Y + 11, 1, 4, b); }
    r(c, X + 4, Y + 13, W - 8, 1, bk);
  },
  // v299: a woodpile: split logs stacked end-on, each showing its rings and bark, lit from the left
  woodpile: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 6, 12, 9, '#5c3a1e');
    [[3, 7], [8, 7], [5, 10], [10, 10], [3, 12], [8, 12]].forEach(([u, v]) => {
      r(c, X + u, Y + v, 4, 3, sh(a, 0.65)); r(c, X + u, Y + v, 3, 3, a); r(c, X + u + 1, Y + v + 1, 2, 1, '#d9b98a'); r(c, X + u + 1, Y + v + 1, 1, 1, '#a5753f'); r(c, X + u, Y + v, 1, 1, sh(a, 1.2));
    });
  },
  // v299: a sofa: a padded back with piping, rolled arms lit on top, a seat cushion per tile, short feet
  sofa: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.2), ad = sh(a, 0.8), ak = sh(a, 0.6), bk = sh(b, 0.6);
    shadow(c, X, Y, W, H);
    if ((p.dir || 'down') === 'down') {
      r(c, X, Y + 2, W, 8, bk); r(c, X + 1, Y + 3, W - 2, 6, b); r(c, X + 1, Y + 3, W - 2, 1, sh(b, 1.2));   // back
      for (let i = 3; i < W - 3; i += 6) r(c, X + i, Y + 5, 1, 1, sh(b, 0.75));   // buttons
      r(c, X, Y + 8, W, 6, ak); for (let i = 3; i < W - 3; i += T) { const w = Math.min(T - 1, W - 3 - i); r(c, X + i, Y + 8, w, 5, a); r(c, X + i, Y + 8, w, 1, al); r(c, X + i, Y + 12, w, 1, ad); }   // cushions
      for (const ax of [X, X + W - 3]) { r(c, ax, Y + 5, 3, 9, bk); r(c, ax, Y + 5, 3, 2, sh(b, 1.2)); r(c, ax + 1, Y + 7, 1, 6, b); }   // arms
      r(c, X + 1, Y + 14, 2, 1, bk); r(c, X + W - 3, Y + 14, 2, 1, bk);
    } else {
      r(c, X, Y + 4, W, 6, ak); r(c, X + 3, Y + 4, W - 6, 5, a); r(c, X + 3, Y + 4, W - 6, 1, al);   // cushions, seen from behind
      r(c, X, Y + 9, W, 6, bk); r(c, X + 1, Y + 10, W - 2, 4, b); r(c, X + 1, Y + 10, W - 2, 1, sh(b, 1.2));   // the back
      for (const ax of [X, X + W - 3]) { r(c, ax, Y + 4, 3, 10, bk); r(c, ax, Y + 4, 3, 1, sh(b, 1.2)); }
    }
  },
  // v299: an upholstered armchair: a buttoned back, rolled arms lit on top, a plump seat cushion, turned feet
  armchair: (c, X, Y, W, H, a, b, p) => {
    const d = p.dir || 'down', al = sh(a, 1.2), ad = sh(a, 0.78), ak = sh(a, 0.58), bk = sh(b, 0.6);
    shadow(c, X, Y, W, H);
    const feet = () => { r(c, X + 2, Y + 14, 2, 1, bk); r(c, X + 12, Y + 14, 2, 1, bk); };
    const arms = (y) => { for (const ax of [X + 1, X + 12]) { r(c, ax, y, 3, 14 - (y - Y), ak); r(c, ax, y, 3, 2, al); r(c, ax + 1, y + 2, 1, 12 - (y - Y), a); } };
    if (d === 'down') {
      feet(); r(c, X + 2, Y + 1, 12, 9, ak); r(c, X + 3, Y + 2, 10, 7, a); r(c, X + 3, Y + 2, 10, 1, al);
      r(c, X + 5, Y + 4, 1, 1, ad); r(c, X + 10, Y + 4, 1, 1, ad); r(c, X + 8, Y + 6, 1, 1, ad);   // buttons
      arms(Y + 6); r(c, X + 4, Y + 9, 8, 5, ak); r(c, X + 4, Y + 9, 8, 4, a); r(c, X + 4, Y + 9, 8, 1, al); r(c, X + 4, Y + 12, 8, 1, ad);
    } else if (d === 'up') {
      feet(); r(c, X + 4, Y + 4, 8, 4, a); r(c, X + 4, Y + 4, 8, 1, al); arms(Y + 4);
      r(c, X + 2, Y + 7, 12, 7, ak); r(c, X + 3, Y + 8, 10, 5, ad); r(c, X + 3, Y + 8, 10, 1, a);
    } else {
      const L = d === 'left';
      feet(); r(c, X + 2, Y + 4, 12, 10, ak); r(c, X + 3, Y + 5, 10, 8, a); r(c, X + 3, Y + 5, 10, 1, al);
      r(c, L ? X + 11 : X + 1, Y + 1, 4, 13, ak); r(c, L ? X + 12 : X + 2, Y + 2, 2, 11, a); r(c, L ? X + 12 : X + 2, Y + 2, 2, 1, al);   // the back
      r(c, X + 3, Y + 4, 10, 2, ak); r(c, X + 3, Y + 4, 10, 1, al); r(c, X + 3, Y + 12, 10, 2, ak);   // the arms
      r(c, L ? X + 4 : X + 6, Y + 7, 6, 4, a); r(c, L ? X + 4 : X + 6, Y + 7, 6, 1, al);
    }
  },
  // v299: a low table: a grained top with a lit edge, an apron, short turned legs
  lowtable: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.2), ad = sh(a, 0.8), bk = sh(b, 0.6);
    shadow(c, X, Y, W, H);
    for (const lx of [X + 3, X + W - 5]) { r(c, lx, Y + 12, 2, 3, bk); r(c, lx, Y + 12, 1, 3, b); }
    r(c, X + 2, Y + 7, W - 4, 6, bk); r(c, X + 3, Y + 7, W - 6, 4, a); r(c, X + 3, Y + 7, W - 6, 1, al);
    for (let x = X + 5; x < X + W - 6; x += 7) r(c, x, Y + 9, 4, 1, ad);
    r(c, X + 3, Y + 11, W - 6, 1, b);
    tops(c, p, X, Y + 10, W);
  },
  // v299: a stone fireplace up the wall: coursed stones with lit tops, a wooden mantel, a sooty firebox, logs and a fire
  hearth: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.18), ad = sh(a, 0.78);
    r(c, X, Y - 14, W, H + 14, ad); r(c, X + 1, Y - 14, W - 2, H + 13, a); r(c, X, Y - 14, W, 1, al);
    for (let j = -12, k = 0; j < H; j += 5, k++) { r(c, X + 1, Y + j + 3, W - 2, 1, ad); for (let i = (k % 2) ? 1 : 5; i < W - 1; i += 8) { r(c, X + i, Y + j - 1, 1, 4, ad); r(c, X + i + 1, Y + j - 1, 5, 1, al); } }
    r(c, X - 1, Y - 3, W + 2, 3, sh(b, 0.6)); r(c, X - 1, Y - 3, W + 2, 1, sh(b, 1.25)); r(c, X - 1, Y - 2, W + 2, 1, b);   // mantel
    r(c, X + 3, Y + 2, W - 6, H - 3, ad); r(c, X + 4, Y + 3, W - 8, H - 4, '#1f1812'); r(c, X + 4, Y + 3, W - 8, 2, '#2e241c');   // the opening, soot
    r(c, X + 6, Y + H - 4, W - 12, 2, '#5c371e'); r(c, X + 7, Y + H - 5, W - 14, 1, '#8a5a32');   // logs
    const f = blink(180, 3);
    r(c, X + 8, Y + H - 8, W - 16, 4, '#e8862a'); r(c, X + 10 + (f ? 1 : 0), Y + H - 11, W - 20, 4, '#ffd46a'); r(c, X + W / 2 - 1, Y + H - 13 + (f ? 1 : 0), 2, 3, '#fff3c4');
    r(c, X - 1, Y + H - 2, W + 2, 2, '#6a6e72'); r(c, X - 1, Y + H - 2, W + 2, 1, '#8d9196');   // the hearthstone
    tops(c, p, X, Y - 3, W);
  },
  // v299: a slatted crate: planks with dark gaps, nail heads, corner posts and a lit rim
  crate: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.2), ad = sh(a, 0.78), ak = sh(a, 0.55);
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 5, W - 4, 10, ak); r(c, X + 3, Y + 6, W - 6, 8, a);
    for (const py of [Y + 8, Y + 11]) r(c, X + 3, py, W - 6, 1, ad);
    r(c, X + 3, Y + 6, W - 6, 1, al);
    for (const px of [X + 3, X + W - 5]) { r(c, px, Y + 6, 2, 8, ad); r(c, px, Y + 6, 1, 8, al); r(c, px + 1, Y + 7, 1, 1, '#2b211a'); r(c, px + 1, Y + 12, 1, 1, '#2b211a'); }
    tops(c, p, X, Y + 6, W);
  },
  // v299: a woven basket: over-and-under rows, a lit rim, a bent handle, a cloth tucked in
  basket: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.2), ad = sh(a, 0.75), ak = sh(a, 0.55), H1 = '#8a6a3a';
    shadow(c, X, Y, W, H);
    r(c, X + 4, Y + 3, 1, 5, H1); r(c, X + 11, Y + 3, 1, 5, H1); r(c, X + 5, Y + 2, 6, 1, H1); r(c, X + 5, Y + 2, 6, 1, sh(H1, 1.2));   // the handle
    r(c, X + 5, Y + 6, 6, 3, b === H1 ? '#e2707a' : b); r(c, X + 6, Y + 6, 2, 1, 'rgba(255,255,255,.3)');   // the cloth
    r(c, X + 3, Y + 8, 10, 7, ak); r(c, X + 4, Y + 9, 8, 5, a); r(c, X + 4, Y + 14, 8, 1, ak);
    for (let y = Y + 9; y < Y + 14; y++) for (let x = X + 4 + ((y - Y) % 2); x < X + 12; x += 2) r(c, x, y, 1, 1, ad);   // the weave
    r(c, X + 3, Y + 8, 10, 1, al); r(c, X + 3, Y + 9, 10, 1, a);   // the rim
  },
  // ---- on the walls ----
  window: (c, X, Y, W, H, a, b) => {
    const t = G.S?.time ?? 720, night = t < 360 || t >= 1170, dusk = t >= 1080 && t < 1170;
    const wet = G.indoorRain, sky = night ? '#1e2a44' : wet ? (dusk ? '#8a7a7e' : '#7f93a3') : dusk ? '#e89a6a' : '#a3cfe6';
    r(c, X + 2, Y + 2, W - 4, H - 5, b); r(c, X + 3, Y + 3, W - 6, H - 7, sky);
    if (!night) { if (!wet) r(c, X + 4, Y + 4, 3, 2, 'rgba(255,255,255,.55)'); r(c, X + 3, Y + H - 9, W - 6, 3, wet ? '#5f7a5a' : dusk ? '#c97a4a' : '#86b86a'); }
    else if (!wet && blink(900, 4)) r(c, X + W - 7, Y + 5, 1, 1, '#fffbe8');
    if (wet) rainOnGlass(c, X + 3, Y + 3, W - 6, H - 7, night);   // v100
    r(c, X + W / 2 - 1, Y + 3, 2, H - 7, b); r(c, X + 3, Y + Math.floor(H / 2) - 2, W - 6, 2, b);
    r(c, X + 1, Y + H - 4, W - 2, 3, b); r(c, X + 1, Y + H - 4, W - 2, 1, GLINT);   // sill
    r(c, X, Y + 1, 3, H - 6, a); r(c, X + W - 3, Y + 1, 3, H - 6, a); r(c, X, Y, W, 2, '#6e4626');   // curtains on a rail
  },
  painting: (c, X, Y, W, H, a, b) => {
    const y = Y + (H > T ? 3 : 2), h = H - (H > T ? 7 : 5);
    r(c, X + 2, y, W - 4, h, b); r(c, X + 3, y + 1, W - 6, h - 2, '#bcd4e6');
    r(c, X + 3, y + h - 6, W - 6, 5, a); r(c, X + 5, y + h - 9, 4, 4, a); r(c, X + W - 7, y + 3, 3, 3, '#f6cf74');
    r(c, X + 2, y + h, W - 4, 1, SHADE);
  },
  // v299: a wall shelf: a lit board on two carved brackets, its shadow on the wall
  wallshelf: (c, X, Y, W, H, a, b, p) => {
    r(c, X + 2, Y + 13, W - 4, 1, SHADE);
    r(c, X + 1, Y + 10, W - 2, 3, sh(a, 0.6)); r(c, X + 1, Y + 10, W - 2, 1, sh(a, 1.25)); r(c, X + 1, Y + 11, W - 2, 1, a);
    for (const bx of [X + 3, X + W - 5]) { r(c, bx, Y + 13, 2, 1, b); r(c, bx, Y + 14, 1, 1, b); }
    tops(c, p, X, Y + 10, W);
  },
  // v299: a wall cupboard: a cornice, a pair of panelled doors per tile with brass knobs, a shadow under it
  cupboard: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.2), ad = sh(a, 0.8), ak = sh(a, 0.58);
    r(c, X + 1, Y + 1, W - 2, H - 4, ak); r(c, X + 2, Y + 2, W - 4, H - 6, a); r(c, X + 1, Y + H - 3, W - 2, 1, SHADE);
    r(c, X, Y, W, 2, b); r(c, X, Y, W, 1, sh(b, 1.25));   // cornice
    for (let i = 0; i < W; i += T) for (const dx of [3, 9]) {
      r(c, X + i + dx, Y + 4, 4, H - 10, ad); r(c, X + i + dx, Y + 4, 4, 1, ak); r(c, X + i + dx, Y + H - 7, 4, 1, al);
    }
    for (let i = 0; i < W; i += T) { r(c, X + i + 7, Y + H / 2 - 1, 1, 2, '#e9c46a'); r(c, X + i + 9, Y + H / 2 - 1, 1, 2, '#e9c46a'); r(c, X + i + 8, Y + 3, 1, H - 8, ak); }
  },
  // v299: a peg rail: a moulded board with turned pegs, a coat hanging with its collar and buttons, a hat on the next peg
  pegs: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 3, W - 2, 2, sh(b, 0.6)); r(c, X + 1, Y + 3, W - 2, 1, sh(b, 1.25));
    for (let i = 0; i < W; i += 8) { r(c, X + i + 3, Y + 5, 1, 2, '#3f3226'); r(c, X + i + 3, Y + 5, 1, 1, '#8a6a3a'); }
    r(c, X + 2, Y + 7, 5, 8, sh(a, 0.7)); r(c, X + 2, Y + 7, 4, 7, a); r(c, X + 3, Y + 6, 2, 2, sh(a, 0.7)); r(c, X + 2, Y + 7, 1, 1, sh(a, 1.2)); r(c, X + 5, Y + 7, 1, 1, sh(a, 1.2));   // the coat, its collar
    r(c, X + 4, Y + 10, 1, 1, '#e9c46a'); r(c, X + 4, Y + 12, 1, 1, '#e9c46a');   // buttons
    if (W >= T) { const hc = a === CREAM ? '#e9c46a' : '#6e4626'; r(c, X + 9, Y + 5, 5, 3, hc); r(c, X + 9, Y + 5, 5, 1, sh(hc, 1.25)); r(c, X + 8, Y + 8, 7, 1, sh(hc, 0.7)); r(c, X + 9, Y + 7, 5, 1, '#b5452f'); }   // a hat with a band
  },
  // v299: herbs drying from a rail: bunches tied with twine, leaves in two greens, a lavender bunch among them
  herbs: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 2, W - 2, 1, b); r(c, X + 1, Y + 1, 1, 2, b); r(c, X + W - 2, Y + 1, 1, 2, b);
    for (let i = 2; i < W - 2; i += 4) {
      const col = i % 8 ? a : '#9a7ab5', h = 6 + (i % 3);
      r(c, X + i + 1, Y + 3, 1, 3, '#a5935e'); r(c, X + i, Y + 5, 3, 1, '#c9a35a');   // stems, twine
      r(c, X + i, Y + 6, 3, h, sh(col, 0.75)); r(c, X + i, Y + 6, 2, h - 1, col); r(c, X + i + 1, Y + 6 + h, 1, 1, sh(col, 0.75)); r(c, X + i, Y + 7, 1, 1, sh(col, 1.25));
    }
  },
  // v299: fishing nets hung to dry: a pole, knotted mesh sagging in folds, cork floats along it
  nets: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 1, W - 2, 2, sh(b, 0.6)); r(c, X + 1, Y + 1, W - 2, 1, sh(b, 1.25));
    for (let i = 2; i < W - 1; i += 3) r(c, X + i, Y + 3, 1, H - 6 - (i % 5), sh(a, 0.8));
    for (let j = 5; j < H - 4; j += 3) for (let i = 2; i < W - 2; i++) r(c, X + i, Y + j + ((i >> 2) % 2), 1, 1, a);   // the sagging rows
    for (let j = 5; j < H - 4; j += 3) for (let i = 2; i < W - 1; i += 3) r(c, X + i, Y + j, 1, 1, sh(a, 1.25));   // knots
    for (const [fx, fy] of [[4, H - 6], [W - 7, H - 8], [W / 2, H - 5]]) { r(c, X + fx, Y + fy, 2, 2, '#e8862a'); r(c, X + fx, Y + fy, 1, 1, '#ffb06a'); }
  },
  // v299: a tool board on the wall: a pegboard with holes, a hammer, saw, square and chisel hung in their outlines
  tools: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 2, W - 2, H - 4, '#a5853e'); r(c, X + 2, Y + 2, W - 4, H - 5, '#c9a35a'); r(c, X + 2, Y + 2, W - 4, 1, '#e3c47a');
    for (let y = Y + 4; y < Y + H - 3; y += 3) for (let x = X + 3 + ((y / 3) % 2); x < X + W - 3; x += 3) r(c, x, y, 1, 1, '#a5853e');   // holes
    const k = [(x) => { r(c, x, Y + 5, 2, 7, '#6e4626'); r(c, x, Y + 5, 1, 7, '#a5753f'); r(c, x - 2, Y + 4, 6, 2, b); r(c, x - 2, Y + 4, 6, 1, sh(b, 1.3)); },   // hammer
      (x) => { r(c, x, Y + 4, 4, 2, '#6e4626'); r(c, x + 1, Y + 6, 3, 7, b); r(c, x + 1, Y + 6, 1, 7, sh(b, 1.3)); for (let j = 7; j < 13; j += 2) r(c, x + 3, Y + j, 1, 1, sh(b, 0.6)); },   // saw
      (x) => { r(c, x, Y + 4, 1, 8, b); r(c, x, Y + 11, 5, 1, b); r(c, x, Y + 4, 1, 8, sh(b, 1.2)); },   // square
      (x) => { r(c, x, Y + 5, 2, 5, '#6e4626'); r(c, x, Y + 5, 1, 5, '#a5753f'); r(c, x, Y + 10, 2, 3, b); r(c, x, Y + 12, 2, 1, sh(b, 1.3)); }];   // chisel
    for (let i = 0, x = X + 4; x < X + W - 4; i++, x += 6) k[i % 4](x);
  },
  // v299: a sea or land chart pinned to the wall: curling paper, coast and contour lines, a compass rose, red pins
  chart: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 2, W - 2, H - 4, sh(a, 0.85)); r(c, X + 2, Y + 2, W - 4, H - 5, a); r(c, X + 1, Y + H - 2, W - 2, 1, SHADE);
    r(c, X + 1, Y + 2, 1, 1, sh(a, 1.1)); r(c, X + W - 2, Y + H - 3, 1, 1, sh(a, 0.7));   // curled corners
    for (let i = 3; i < W - 3; i += 5) r(c, X + i, Y + 4 + (i % 4), 4, 1, '#a5935e');   // contours
    r(c, X + 4, Y + H - 7, W - 8, 1, '#5f8fb5'); r(c, X + 4, Y + H - 6, W - 10, 1, '#9fc0d8'); r(c, X + 3, Y + 5, 1, H - 9, '#86a86a');   // coast, water, river
    r(c, X + W - 7, Y + 4, 3, 1, '#3f3226'); r(c, X + W - 6, Y + 3, 1, 3, '#3f3226'); r(c, X + W - 6, Y + 3, 1, 1, '#b5452f');   // compass rose
    for (let i = 5; i < W - 3; i += 9) r(c, X + i, Y + 3 + (i % 6), 1, 1, b);   // pins
  },
  // v299: a chalkboard: a wooden frame lit on top, smudged slate, lines of chalk writing, a chalk ledge with a stick
  board: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 2, W - 2, H - 4, sh(b, 0.6)); r(c, X + 1, Y + 2, W - 2, 1, sh(b, 1.25)); r(c, X + 2, Y + 3, W - 4, H - 6, a);
    r(c, X + 5, Y + 5, 6, 3, sh(a, 1.12)); r(c, X + W - 12, Y + H - 9, 7, 2, sh(a, 1.1));   // smudges
    for (let j = 5; j < H - 5; j += 3) r(c, X + 4, Y + j, (W - 10) * (((j * 3) % 5) + 3) / 7, 1, '#d9dccf');
    r(c, X + 1, Y + H - 3, W - 2, 2, b); r(c, X + 1, Y + H - 3, W - 2, 1, sh(b, 1.25)); r(c, X + 4, Y + H - 4, 4, 1, CREAM);   // ledge, chalk
  },
  // v299: a mirror: a carved frame lit on top, a cool glass reflecting the room, two streaks of light
  mirror: (c, X, Y, W, H, a, b) => {
    const bl = sh(b, 1.25), bk = sh(b, 0.58);
    r(c, X + 4, Y + 2, 8, H - 4, bk); r(c, X + 5, Y + 2, 6, H - 5, b); r(c, X + 5, Y + 2, 6, 1, bl); r(c, X + 7, Y + 1, 2, 1, bk);
    r(c, X + 6, Y + 3, 4, H - 7, a); r(c, X + 6, Y + H - 7, 4, 3, sh(a, 0.8));   // the glass, the room's floor in it
    r(c, X + 6, Y + 4, 1, 4, 'rgba(255,255,255,.6)'); r(c, X + 8, Y + 4, 1, 2, 'rgba(255,255,255,.4)');
  },
  // v299: a wall clock: a carved case with a pointed top, a cream face with ticks and hands, a brass pendulum swinging
  wallclock: (c, X, Y, W, H, a, b) => {
    const bl = sh(b, 1.25), bk = sh(b, 0.58);
    r(c, X + 4, Y + 3, 8, 11, bk); r(c, X + 5, Y + 3, 6, 10, b); r(c, X + 5, Y + 3, 6, 1, bl); r(c, X + 6, Y + 2, 4, 1, bk); r(c, X + 7, Y + 1, 2, 1, bk);   // case
    r(c, X + 5, Y + 4, 6, 6, a); r(c, X + 6, Y + 4, 4, 1, sh(a, 1.1));
    for (const [tx, ty] of [[8, 4], [10, 7], [8, 9], [5, 7]]) r(c, X + tx, Y + ty, 1, 1, sh(a, 0.6));   // ticks
    r(c, X + 8, Y + 5, 1, 3, INK); r(c, X + 8, Y + 7, 2, 1, INK);   // hands
    r(c, X + 6, Y + 10, 4, 3, '#1f1812'); const sw = blink(500, 2) ? 0 : 1;
    r(c, X + 7 + sw, Y + 10, 1, 2, '#c9a35a'); r(c, X + 7 + sw, Y + 12, 1, 1, '#e9c46a');   // the pendulum behind its window
  },
  // v299: a brass plaque on a wooden board: bevelled edge, engraved lines, screw heads at the corners
  plaque: (c, X, Y, W, H, a, b) => {
    r(c, X + 2, Y + 4, W - 4, 8, sh(b, 0.6)); r(c, X + 3, Y + 4, W - 6, 7, b); r(c, X + 3, Y + 4, W - 6, 1, sh(b, 1.25));
    r(c, X + 4, Y + 6, W - 8, 4, sh(a, 0.75)); r(c, X + 4, Y + 6, W - 9, 3, a); r(c, X + 4, Y + 6, W - 9, 1, sh(a, 1.3));
    r(c, X + 5, Y + 7, W - 12, 1, sh(a, 0.6)); r(c, X + 6, Y + 8, W - 14, 1, sh(a, 0.6));   // engraving
    for (const [sx, sy] of [[3, 5], [W - 4, 5], [3, 10], [W - 4, 10]]) r(c, X + sx, Y + sy, 1, 1, '#e9c46a');
  },
  // v299: a hanging lantern: a ring and cap, glass panes with a frame between them, a flame flickering inside
  lantern: (c, X, Y, W, H, a, b) => {
    const ak = sh(a, 0.6), f = blink(240, 2);
    r(c, X + 7, Y + 1, 2, 1, ak); r(c, X + 6, Y + 2, 4, 2, ak); r(c, X + 6, Y + 2, 4, 1, sh(a, 1.25));   // ring, cap
    r(c, X + 5, Y + 4, 6, 9, ak); r(c, X + 6, Y + 5, 4, 7, b); r(c, X + 6, Y + 5, 1, 6, 'rgba(255,255,255,.35)');   // the glass
    r(c, X + 7 + (f ? 1 : 0), Y + 7, 1, 2, '#ffd46a'); r(c, X + 7, Y + 9, 2, 2, '#e8862a'); r(c, X + 8 - (f ? 1 : 0), Y + 6, 1, 1, '#fff3c4');   // flame
    r(c, X + 5, Y + 13, 6, 1, ak); r(c, X + 6, Y + 13, 4, 1, a);
  },
  // ---- work and hobbies ----
  // v299: a carpenter's workbench: a thick grained top, a shelf of offcuts under it, sturdy legs, an iron vise at the end
  workbench: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.2), ad = sh(a, 0.8), ak = sh(a, 0.58), bl = sh(b, 1.2), bk = sh(b, 0.6);
    shadow(c, X, Y, W, H);
    for (const lx of [X + 2, X + W - 4]) { r(c, lx, Y + 8, 2, 7, bk); r(c, lx, Y + 8, 1, 7, b); }
    r(c, X + 2, Y + 12, W - 4, 2, bk); r(c, X + 3, Y + 12, W - 6, 1, b);   // the shelf
    for (let x = X + 5; x < X + W - 9; x += 5) { r(c, x, Y + 11, 4, 1, '#d9b98a'); r(c, x, Y + 11, 1, 1, '#a5753f'); }   // offcuts
    r(c, X + 1, Y + 3, W - 2, 6, ak); r(c, X + 2, Y + 3, W - 4, 4, a); r(c, X + 2, Y + 3, W - 4, 1, al); r(c, X + 2, Y + 7, W - 4, 1, ad);
    for (let x = X + 4; x < X + W - 8; x += 7) r(c, x, Y + 5, 4, 1, ad);   // grain
    r(c, X + W - 8, Y + 1, 6, 3, '#3f4850'); r(c, X + W - 8, Y + 1, 6, 1, '#8d939a'); r(c, X + W - 7, Y + 4, 4, 3, '#5c6268'); r(c, X + W - 3, Y + 2, 2, 1, '#c9a35a');   // vise and handle
    tops(c, p, X, Y + 5, W - 8);
  },
  // v299: a pair of sawhorses, legs splayed and lit on one side, with a chair upside down on them or a half-carved oar
  sawhorse: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.2), ak = sh(a, 0.6);
    shadow(c, X, Y, W, H);
    [X + 3, X + W - 7].forEach((x) => { r(c, x, Y + 7, 4, 2, ak); r(c, x, Y + 7, 4, 1, al); r(c, x, Y + 9, 1, 6, a); r(c, x + 3, Y + 9, 1, 6, ak); r(c, x + 1, Y + 12, 2, 1, ak); });
    if (p.oar) { r(c, X + 1, Y + 4, W - 2, 3, sh(b, 0.7)); r(c, X + 1, Y + 4, W - 2, 1, sh(b, 1.2)); r(c, X + W - 9, Y + 2, 8, 6, b); r(c, X + W - 8, Y + 3, 6, 4, '#d9b98a'); r(c, X + W - 7, Y + 4, 3, 1, '#c9a35a'); return; }   // an oar, half carved
    r(c, X + 4, Y - 1, W - 8, 4, ak); r(c, X + 4, Y - 1, W - 8, 1, al); r(c, X + 5, Y - 6, 2, 6, b); r(c, X + W - 7, Y - 6, 2, 6, b); r(c, X + 5, Y - 6, 1, 6, sh(b, 1.25)); r(c, X + W - 7, Y - 6, 1, 6, sh(b, 1.25)); r(c, X + 4, Y + 3, W - 8, 2, sh(b, 0.6));   // a chair, upside down
  },
  // v299: a stack of planks, ends showing their rings, each board lit along the top and shaded underneath
  lumber: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    for (let j = 0; j < 4; j++) {
      const col = j % 2 ? b : a, x = X + 1 + (j % 2) * 2, y = Y + 4 + j * 3;
      r(c, x, y, W - 4, 3, sh(col, 0.65)); r(c, x, y, W - 5, 2, col); r(c, x, y, W - 5, 1, sh(col, 1.2));
      r(c, x + W - 6, y, 2, 3, '#d9b98a'); r(c, x + W - 5, y + 1, 1, 1, '#a5753f');   // the end grain
    }
  },
  // v299: a honey extractor: a banded steel drum, its crank on top, a spout with honey dripping into a pot
  extractor: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 2, 12, 13, sh(a, 0.65)); r(c, X + 3, Y + 2, 10, 12, a); r(c, X + 3, Y + 3, 2, 10, sh(a, 1.3));
    r(c, X + 2, Y + 2, 12, 2, b); r(c, X + 2, Y + 2, 12, 1, sh(b, 1.3)); r(c, X + 2, Y + 7, 12, 1, b); r(c, X + 2, Y + 11, 12, 1, b);   // bands
    r(c, X + 7, Y - 2, 2, 4, b); r(c, X + 7, Y - 2, 6, 1, '#6e4626'); r(c, X + 12, Y - 3, 1, 2, '#6e4626');   // crank
    r(c, X + 11, Y + 12, 3, 1, b); r(c, X + 12, Y + 13, 1, 1, blink(600, 2) ? '#e9a43a' : '#c9852a');   // spout and a drip
    r(c, X + 5, Y + 13, 4, 2, '#c98a4a'); r(c, X + 5, Y + 13, 4, 1, '#e9a43a');   // the pot
  },
  // v299: beehives: stacked boxes with lit edges and a hand hold each, a sloped roof, an entrance with bees about it
  hives: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    for (let i = 0; i < W; i += T) {
      [0, 5, 10].forEach((o, j) => { const col = j % 2 ? b : a; r(c, X + i + 2, Y + o + 1, 12, 5, sh(col, 0.7)); r(c, X + i + 2, Y + o + 1, 12, 4, col); r(c, X + i + 2, Y + o + 1, 12, 1, sh(col, 1.2)); r(c, X + i + 6, Y + o + 3, 4, 1, sh(col, 0.6)); });
      r(c, X + i + 1, Y - 1, 14, 3, '#5c371e'); r(c, X + i + 1, Y - 1, 14, 1, '#a5753f');   // roof
      r(c, X + i + 5, Y + 14, 6, 1, '#1f1812');   // entrance
      const t = blink(300, 2); r(c, X + i + (t ? 3 : 12), Y + 12, 1, 1, '#e9c46a'); r(c, X + i + (t ? 13 : 4), Y + 8, 1, 1, '#e9c46a');   // bees
    }
  },
  // v299: canvases leaning on each other: stretched on frames, half-painted scenes, a smear of paint on the edge
  canvases: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    [[1, '#5d8a4a', '#86b86a'], [5, '#e9a43a', '#f4d27a'], [9, '#5f8fb5', '#9fc0d8']].forEach(([o, k, kl], i) => {
      r(c, X + o, Y + 1 + i * 2, 7, 14 - i * 2, '#6e4626'); r(c, X + o, Y + 1 + i * 2, 7, 1, '#a5753f');
      r(c, X + o + 1, Y + 2 + i * 2, 5, 12 - i * 2, a); r(c, X + o + 1, Y + 8, 5, 4, k); r(c, X + o + 1, Y + 8, 5, 1, kl); r(c, X + o + 2, Y + 4 + i * 2, 2, 2, kl);
    });
  },
  // v299: a drafting table: a tilted board with a plan pinned to it, a ruler and a red pencil, splayed legs
  drafting: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    for (const lx of [X + 4, X + W - 6]) { r(c, lx, Y + 9, 2, 6, '#6e4626'); r(c, lx, Y + 9, 1, 6, '#a5753f'); }
    r(c, X + 1, Y + 2, W - 2, 8, sh(a, 0.6)); r(c, X + 1, Y + 2, W - 2, 1, sh(a, 1.2)); r(c, X + 2, Y + 3, W - 4, 6, b);
    r(c, X + 4, Y + 5, W - 9, 1, '#5f8fb5'); r(c, X + 6, Y + 4, 1, 4, '#86a86a'); r(c, X + 8, Y + 6, 4, 2, sh(b, 0.85));   // the plan
    r(c, X + 3, Y + 3, 1, 1, '#b5452f'); r(c, X + W - 4, Y + 3, 1, 1, '#b5452f');   // pins
    r(c, X + 2, Y + 9, W - 4, 1, '#c9a35a'); r(c, X + W - 6, Y + 6, 3, 1, '#b5452f');   // ruler, pencil
  },
  // v299: a brass telescope on a tripod: a lit barrel with bands, an eyepiece, a dark lens, the legs splayed
  telescope: (c, X, Y, W, H, a, b) => {
    r(c, X + 3, Y + 14, 11, 1, SHADE);
    for (const [lx, d] of [[4, -1], [8, 0], [12, 1]]) { r(c, X + lx, Y + 8, 1, 7, b); r(c, X + lx + d, Y + 14, 1, 1, sh(b, 0.6)); }
    r(c, X + 7, Y + 7, 3, 2, sh(b, 0.6));
    r(c, X + 3, Y + 1, 10, 3, sh(a, 0.7)); r(c, X + 3, Y + 1, 10, 1, sh(a, 1.3)); r(c, X + 6, Y + 1, 1, 3, sh(a, 0.55)); r(c, X + 10, Y + 1, 1, 3, sh(a, 0.55));   // barrel, bands
    r(c, X + 2, Y, 3, 5, a); r(c, X + 2, Y, 3, 1, sh(a, 1.3));   // the wide end
    r(c, X + 12, Y + 2, 2, 1, '#2b211a'); r(c, X + 1, Y + 1, 1, 3, '#2b3a4a');   // eyepiece, lens
  },
  // v299: seed trays on a trestle: soil in each cell, seedlings with two leaves, a lit tray edge
  seedtrays: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    for (const lx of [X + 2, X + W - 4]) { r(c, lx, Y + 9, 2, 6, '#6e4626'); r(c, lx, Y + 9, 1, 6, '#a5753f'); }
    r(c, X + 1, Y + 6, W - 2, 3, '#6e4626'); r(c, X + 1, Y + 6, W - 2, 1, '#c9955a');
    for (let i = 2; i < W - 6; i += 7) {
      r(c, X + i, Y + 3, 6, 4, sh(a, 0.7)); r(c, X + i, Y + 3, 6, 1, sh(a, 1.2)); r(c, X + i + 1, Y + 4, 4, 2, '#4a3426');
      for (let k = 0; k < 5; k += 2) { r(c, X + i + k, Y + 1 + (k % 3), 1, 3, b); r(c, X + i + k + 1, Y + 1 + (k % 3), 1, 1, sh(b, 1.25)); }
    }
  },
  // v299: a handcart of greens: planked sides, a heap of leaves with produce, spoked wheels
  cart: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 3, 12, 4, '#3f6b3a'); r(c, X + 2, Y + 3, 12, 2, '#5d8a4a'); r(c, X + 4, Y + 2, 3, 1, '#86b86a');
    [[3, 2], [7, 1], [11, 3]].forEach(([u, v]) => { r(c, X + u, Y + v, 2, 2, b); r(c, X + u, Y + v, 1, 1, sh(b, 1.3)); });
    r(c, X + 1, Y + 6, 14, 7, sh(a, 0.6)); r(c, X + 2, Y + 6, 12, 6, a); r(c, X + 1, Y + 6, 14, 1, sh(a, 1.25)); r(c, X + 2, Y + 9, 12, 1, sh(a, 0.75));   // the box
    for (const wx of [3, 10]) { r(c, X + wx, Y + 12, 3, 3, INK); r(c, X + wx + 1, Y + 13, 1, 1, '#8a6a3a'); r(c, X + wx, Y + 12, 1, 1, '#5c4a3a'); }   // wheels
  },
  // v299: cubbyholes: a tall case of square pigeonholes, some holding rolled papers or parcels, a lit cornice
  cubbies: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y - 10, W - 2, H + 9, sh(a, 0.58)); r(c, X + 2, Y - 10, W - 4, H + 8, a); r(c, X, Y - 11, W, 2, sh(a, 0.58)); r(c, X + 1, Y - 11, W - 2, 1, sh(a, 1.25));
    for (let j = 0; j < 4; j++) for (let i = 0; i < W - 4; i += 5) {
      const x = X + 2 + i, y = Y - 9 + j * 6; r(c, x, y, 4, 5, '#3f2a1a'); r(c, x, y + 4, 4, 1, sh(a, 1.1));
      if ((i + j) % 3) { r(c, x, y + 2, 4, 2, b); r(c, x, y + 2, 4, 1, sh(b, 1.2)); if ((i + j) % 2) r(c, x + 1, y + 1, 1, 1, '#b5452f'); }
    }
  },
  // v299: a music stand: a turned pole on three feet, a tilted desk with sheet music and its staves
  musicstand: (c, X, Y, W, H, a, b) => {
    r(c, X + 7, Y + 6, 2, 9, sh(a, 0.65)); r(c, X + 7, Y + 6, 1, 9, a); r(c, X + 4, Y + 14, 8, 1, sh(a, 0.65)); r(c, X + 3, Y + 15, 2, 1, sh(a, 0.65)); r(c, X + 11, Y + 15, 2, 1, sh(a, 0.65));
    r(c, X + 3, Y + 1, 10, 6, sh(a, 0.65)); r(c, X + 3, Y + 1, 10, 1, sh(a, 1.2)); r(c, X + 4, Y + 1, 8, 5, b);
    [2, 4].forEach((o) => r(c, X + 5, Y + o, 6, 1, '#8a8a8a')); r(c, X + 6, Y + 2, 1, 1, INK); r(c, X + 9, Y + 4, 1, 1, INK); r(c, X + 3, Y + 6, 10, 1, sh(a, 0.65));
  },
  // v299: a fiddle in its open case: a lined case, the varnished body with f-holes, strings, bridge and the bow beside it
  fiddle: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 5, 14, 9, sh(b, 0.6)); r(c, X + 1, Y + 5, 14, 1, sh(b, 1.25)); r(c, X + 2, Y + 6, 12, 7, '#3a2a4a'); r(c, X + 2, Y + 6, 12, 1, '#4e3a62');
    r(c, X + 3, Y + 7, 6, 5, sh(a, 0.7)); r(c, X + 4, Y + 7, 4, 5, a); r(c, X + 3, Y + 8, 1, 3, a); r(c, X + 4, Y + 7, 1, 2, sh(a, 1.3));   // body
    r(c, X + 5, Y + 8, 1, 2, '#2b211a'); r(c, X + 7, Y + 8, 1, 2, '#2b211a'); r(c, X + 5, Y + 10, 3, 1, '#c9b68e');   // f-holes, bridge
    r(c, X + 9, Y + 9, 4, 1, '#3f2a1a'); r(c, X + 13, Y + 8, 1, 3, '#3f2a1a'); r(c, X + 6, Y + 7, 1, 5, '#e8eef2');   // neck, scroll, strings
    r(c, X + 3, Y + 12, 11, 1, '#c9b68e'); r(c, X + 3, Y + 12, 2, 1, '#6e4626');   // the bow
  },
  // v299: an inventor's contraption: a riveted cabinet, turning gears, blinking lamps, a dial and an aerial with a red tip
  contraption: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 4, W - 4, 11, '#3f4850'); r(c, X + 3, Y + 4, W - 6, 10, b); r(c, X + 3, Y + 4, W - 6, 1, sh(b, 1.3));
    for (const [rx, ry] of [[3, 5], [W - 4, 5], [3, 13], [W - 4, 13]]) r(c, X + rx, Y + ry, 1, 1, sh(b, 1.4));   // rivets
    const g = blink(250, 2);
    r(c, X + 4, Y + 1, 6, 6, sh(a, 0.7)); r(c, X + 5, Y + 1, 4, 6, a); r(c, X + 4, Y + 2, 6, 4, a); r(c, X + 6, Y + 3, 2, 2, '#6a4a2a'); r(c, X + (g ? 5 : 8), Y + 1, 1, 1, sh(a, 1.3));   // big gear
    r(c, X + W - 8, Y + 6, 4, 4, a); r(c, X + W - 7, Y + 7, 2, 2, '#6a4a2a'); r(c, X + W - (g ? 8 : 5), Y + 6, 1, 1, sh(a, 1.3));   // small gear
    r(c, X + 5, Y + 10, 2, 2, blink(300, 2) ? '#86d06a' : '#3f5a32'); r(c, X + 8, Y + 10, 2, 2, blink(450, 3) ? '#e8862a' : '#5a3a1a');
    r(c, X + W - 6, Y + 11, 3, 3, '#e8dcc0'); r(c, X + W - 5, Y + 12, 1, 1, '#b5452f');   // dial
    r(c, X + W - 4, Y - 3, 1, 7, '#5c6268'); r(c, X + W - 5, Y - 4, 3, 1, '#c8352f'); r(c, X + W - 4, Y - 5, 1, 1, blink(700, 2) ? '#ff6a5a' : '#c8352f');
  },
  // v299: a heap of scrap: sheet metal, a bent pipe, a cog, a copper coil, each catching the light on its edge
  scrap: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    [[2, 9, 6, 6, a], [6, 7, 7, 8, b], [9, 10, 5, 5, '#5c6268'], [4, 11, 3, 3, '#c9ccd6']].forEach(([u, v, w, h, k]) => { r(c, X + u, Y + v, w, h, sh(k, 0.7)); r(c, X + u, Y + v, w - 1, h - 1, k); r(c, X + u, Y + v, w - 1, 1, sh(k, 1.3)); });
    r(c, X + 3, Y + 5, 1, 5, a); r(c, X + 3, Y + 5, 3, 1, a);   // a bent pipe
    r(c, X + 11, Y + 6, 3, 3, b); r(c, X + 12, Y + 7, 1, 1, '#2b211a'); r(c, X + 10, Y + 7, 1, 1, b); r(c, X + 14, Y + 7, 1, 1, b);   // a cog
    r(c, X + 7, Y + 12, 3, 1, '#c87a3a'); r(c, X + 8, Y + 13, 3, 1, '#e89a5a');   // copper coil
  },
  // v299: fishing rods leaning on the wall: tapering rods, cork grips, reels with their line, a shadow at their feet
  rods: (c, X, Y, W, H, a, b) => {
    r(c, X + 2, Y + H - 3, 12, 2, SHADE);
    [3, 7, 11].forEach((o, i) => {
      r(c, X + o, Y - 12 + i * 2, 1, H + 10 - i * 2, a); r(c, X + o, Y - 12 + i * 2, 1, 6, sh(a, 1.3));
      r(c, X + o - 1, Y + H - 8, 3, 3, b); r(c, X + o - 1, Y + H - 8, 3, 1, sh(b, 1.25));   // grip
      r(c, X + o + 1, Y + H - 11, 2, 2, '#8d939a'); r(c, X + o + 1, Y + H - 11, 1, 1, '#c9ccd6');   // reel
      r(c, X + o + 1, Y - 10 + i * 2, 1, 6, '#e8eef2');
    });
  },
  // v299: a pair of oars on the wall: lit shafts, leather collars, painted blade tips
  oars: (c, X, Y, W, H, a, b) => {
    [3, 9].forEach((o) => {
      r(c, X + o, Y - 12, 2, H + 10, sh(a, 0.7)); r(c, X + o, Y - 12, 1, H + 10, a); r(c, X + o, Y - 12, 2, 2, sh(a, 0.55));   // shaft, handle
      r(c, X + o, Y - 2, 2, 2, '#5c371e');   // leather collar
      r(c, X + o - 1, Y + H - 9, 4, 7, sh(b, 0.7)); r(c, X + o - 1, Y + H - 9, 3, 6, b); r(c, X + o - 1, Y + H - 4, 4, 2, '#f4ead2');   // blade, tip
    });
  },
  // v299: a school desk: a slanted lid with a lit edge and an inkwell, a slate on it, iron legs with a footbar
  schooldesk: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.2), ak = sh(a, 0.6);
    shadow(c, X, Y, W, H);
    for (const lx of [X + 3, X + 11]) { r(c, lx, Y + 8, 2, 7, b); r(c, lx, Y + 8, 1, 7, sh(b, 1.3)); }
    r(c, X + 3, Y + 12, 10, 1, b);   // the footbar
    r(c, X + 2, Y + 4, 12, 5, ak); r(c, X + 2, Y + 4, 12, 3, a); r(c, X + 2, Y + 4, 12, 1, al); r(c, X + 2, Y + 7, 12, 1, sh(a, 0.8));   // the lid
    r(c, X + 4, Y + 2, 6, 3, '#3f4850'); r(c, X + 4, Y + 2, 6, 1, '#a5753f'); r(c, X + 5, Y + 3, 3, 1, '#c9ccd6');   // a slate with chalk
    r(c, X + 11, Y + 4, 2, 2, '#1f1812'); r(c, X + 11, Y + 4, 1, 1, '#5f8fb5');   // the inkwell
  },
  // ---- v98: shops, halls and farm buildings ----
  // v299: a hanging shop sign: a lit board with a carved border, painted letters, chains up to its bracket
  sign: (c, X, Y, W, H, a, b) => {
    r(c, X + 3, Y + 1, 1, 2, '#5c6268'); r(c, X + W - 4, Y + 1, 1, 2, '#5c6268');   // chains
    r(c, X + 1, Y + 3, W - 2, H - 6, sh(a, 0.6)); r(c, X + 2, Y + 4, W - 4, H - 8, a); r(c, X + 1, Y + 3, W - 2, 1, sh(a, 1.25)); r(c, X + 1, Y + H - 3, W - 2, 1, SHADE);
    r(c, X + 3, Y + 5, W - 6, 1, sh(a, 0.8)); r(c, X + 3, Y + H - 6, W - 6, 1, sh(a, 0.8));   // carved border
    for (let i = X + 5; i < X + W - 6; i += 4) { r(c, i, Y + 6, 3, H - 12, b); r(c, i, Y + 6, 1, 1, sh(b, 1.3)); }
  },
  // v299: the picture screen: velvet curtains in folds with gold tie-backs, a framed screen showing the film
  cinema: (c, X, Y, W, H, a, b) => {
    r(c, X, Y + 1, W, H - 2, sh(b, 0.6)); r(c, X, Y, W, 2, '#c9a35a'); r(c, X, Y, W, 1, '#f4d27a');   // pelmet
    r(c, X + 5, Y + 2, W - 10, H - 5, '#2b211a'); r(c, X + 6, Y + 3, W - 12, H - 7, a);
    const t = Math.floor(performance.now() / 1500) % 3;   // the picture changes now and then
    r(c, X + 10, Y + H - 12, W - 20, 6, ['#86b86a', '#5f8fb5', '#e8862a'][t]); r(c, X + W / 2 - 4 + t * 3, Y + 7, 6, 6, '#3f3226');
    for (let i = 0; i < 6; i++) { r(c, X + i, Y + 2, 1, H - 3, i % 2 ? sh(b, 0.75) : b); r(c, X + W - 1 - i, Y + 2, 1, H - 3, i % 2 ? sh(b, 0.75) : b); }   // curtain folds
    r(c, X, Y + H / 2, 6, 1, '#c9a35a'); r(c, X + W - 6, Y + H / 2, 6, 1, '#c9a35a');   // tie-backs
  },
  // v299: a wooden ladder: lit rails, rungs with a shadow under each, the opening dark above it
  ladder: (c, X, Y, W, H, a, b) => {
    r(c, X, Y, W, 2, '#3f2a1a');
    for (const lx of [X + 3, X + 11]) { r(c, lx, Y, 2, H, sh(a, 0.7)); r(c, lx, Y, 1, H, a); }
    for (let j = 3; j < H; j += 5) { r(c, X + 3, Y + j, 10, 2, b); r(c, X + 3, Y + j, 10, 1, sh(b, 1.2)); r(c, X + 5, Y + j + 2, 6, 1, 'rgba(0,0,0,.18)'); }
  },
  // v299: a weapon rack: two lit rails, blades with a shine along the edge, gold guards and wrapped grips
  weapons: (c, X, Y, W, H, a, b) => {
    for (const ry of [3, 12]) { r(c, X + 1, Y + ry, W - 2, 2, sh(a, 0.6)); r(c, X + 1, Y + ry, W - 2, 1, sh(a, 1.25)); }
    for (let x = X + 4; x < X + W - 3; x += 6) {
      r(c, x, Y + 1, 2, 11, sh(b, 0.75)); r(c, x, Y + 1, 1, 11, sh(b, 1.3)); r(c, x, Y, 1, 1, sh(b, 1.3));   // blade
      r(c, x - 1, Y + 11, 4, 1, '#c9a35a'); r(c, x - 1, Y + 11, 1, 1, '#f4d27a');   // guard
      r(c, x, Y + 12, 2, 3, '#6e4626'); r(c, x, Y + 13, 2, 1, '#3f2a1a');   // grip
    }
  },
  // v299: the forge: a riveted iron hood and chimney, a stone hearth course by course, coals glowing in a fire pit
  forge: (c, X, Y, W, H, a, b) => {
    const bl = sh(b, 1.25), bd = sh(b, 0.75), bk = sh(b, 0.55), al = sh(a, 1.2), ad = sh(a, 0.78), ak = sh(a, 0.58);
    r(c, X + W / 2 - 4, Y - 16, 8, 6, bk); r(c, X + W / 2 - 3, Y - 16, 6, 6, b); r(c, X + W / 2 - 3, Y - 16, 2, 6, bl);   // chimney
    r(c, X + 3, Y - 10, W - 6, 12, bk); r(c, X + 4, Y - 9, W - 8, 10, b); r(c, X + 4, Y - 9, W - 8, 1, bl); r(c, X + W - 6, Y - 9, 2, 10, bd);   // hood
    for (let x = X + 6; x < X + W - 6; x += 5) { r(c, x, Y - 7, 1, 1, bl); r(c, x, Y - 1, 1, 1, bl); }   // rivets
    r(c, X, Y + 1, W, 14, ak); r(c, X + 1, Y + 2, W - 2, 12, a); r(c, X + 1, Y + 2, W - 2, 1, al);
    for (let j = 0; j < 3; j++) { const yy = Y + 5 + j * 3; r(c, X + 1, yy, W - 2, 1, ad); for (let x = X + 3 + (j % 2) * 3; x < X + W - 2; x += 6) r(c, x, yy - 3, 1, 3, ad); }   // stone courses
    const f = blink(160, 3);
    r(c, X + 4, Y + 3, W - 8, 8, '#1f1812'); r(c, X + 5, Y + 7, W - 10, 4, '#3a1c10');
    for (let x = X + 5; x < X + W - 5; x += 2) r(c, x, Y + 8 + ((x + (f ? 1 : 0)) % 3 === 0 ? 0 : 1), 2, 2, (x + (f ? 1 : 0)) % 4 ? '#e8862a' : '#ffd46a');   // coals
    r(c, X + W / 2 - 2, Y + 5 + (f ? 1 : 0), 4, 2, '#ffd46a'); r(c, X + W / 2 - 1, Y + 4 + (f ? 1 : 0), 2, 1, '#fff3c4');   // the flame
    r(c, X + 1, Y + 13, W - 2, 2, ak);
  },
  // v299: bellows: two boards hinged at the nose, pleated leather between, handles, an iron nozzle
  bellows: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.2), ak = sh(a, 0.58), bl = sh(b, 1.15), bk = sh(b, 0.6);
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 6, 10, 2, ak); r(c, X + 3, Y + 6, 8, 1, al);   // top board
    r(c, X + 3, Y + 8, 9, 4, b); for (let x = X + 4; x < X + 12; x += 2) r(c, x, Y + 8, 1, 4, bk); r(c, X + 3, Y + 8, 9, 1, bl);   // pleats
    r(c, X + 2, Y + 12, 10, 2, ak); r(c, X + 3, Y + 12, 8, 1, a);   // bottom board
    r(c, X, Y + 5, 3, 2, ak); r(c, X, Y + 13, 3, 2, ak);   // handles
    r(c, X + 12, Y + 9, 3, 2, '#3f4850'); r(c, X + 12, Y + 9, 3, 1, '#6a737c');   // nozzle
  },
  // v299: a grindstone: the wheel on its axle in a wooden frame, a lit rim, a crank, a trough of water under it
  grindstone: (c, X, Y, W, H, a, b) => {
    const bl = sh(b, 1.2), bk = sh(b, 0.6), al = sh(a, 1.25), ad = sh(a, 0.75);
    shadow(c, X, Y, W, H);
    r(c, X + 3, Y + 11, 10, 4, bk); r(c, X + 4, Y + 11, 8, 2, '#5f8fb5'); r(c, X + 4, Y + 11, 8, 1, '#9fc0d8');   // trough
    r(c, X + 2, Y + 6, 2, 9, b); r(c, X + 12, Y + 6, 2, 9, b); r(c, X + 2, Y + 6, 1, 9, bl);   // frame
    r(c, X + 5, Y + 2, 6, 10, ad); r(c, X + 4, Y + 3, 8, 8, ad); r(c, X + 5, Y + 3, 6, 8, a); r(c, X + 5, Y + 2, 6, 1, al); r(c, X + 4, Y + 3, 1, 7, al);   // the wheel
    r(c, X + 6, Y + 5, 4, 4, sh(a, 0.88)); r(c, X + 7, Y + 6, 2, 2, bk);   // its hub
    r(c, X + 3, Y + 7, 10, 1, bk); r(c, X + 13, Y + 7, 2, 1, bk); r(c, X + 14, Y + 5, 1, 3, bk); r(c, X + 14, Y + 4, 1, 1, '#c9a35a');   // axle, crank
  },
  // v299: an anvil on a stump: horn, face lit along its edge, a hardy hole, the stump's rings; a hammer resting on it
  anvil: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.35), ad = sh(a, 0.72), ak = sh(a, 0.5), bl = sh(b, 1.2), bk = sh(b, 0.6);
    shadow(c, X, Y, W, H);
    r(c, X + 4, Y + 10, 8, 5, bk); r(c, X + 5, Y + 10, 6, 4, b); r(c, X + 5, Y + 10, 6, 1, bl); r(c, X + 7, Y + 11, 2, 1, bk);   // the stump
    r(c, X + 6, Y + 7, 4, 3, ak); r(c, X + 6, Y + 7, 3, 3, ad);   // the waist
    r(c, X + 1, Y + 4, 13, 4, ak); r(c, X + 3, Y + 4, 11, 3, a); r(c, X + 3, Y + 4, 11, 1, al);   // the face
    r(c, X, Y + 5, 3, 2, a); r(c, X, Y + 5, 3, 1, al); r(c, X, Y + 6, 1, 1, ak);   // the horn
    r(c, X + 11, Y + 5, 1, 1, ak);   // the hardy hole
    r(c, X + 6, Y + 2, 6, 2, '#5c6268'); r(c, X + 6, Y + 2, 6, 1, '#8d939a'); r(c, X + 11, Y + 1, 3, 1, '#a5753f'); r(c, X + 12, Y + 1, 3, 1, '#c9a35a');   // a hammer
  },
  // v299: a grain sack: a slumped, creased body, the neck tied with twine, a stencilled mark
  sack: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.15), ad = sh(a, 0.82), ak = sh(a, 0.62);
    shadow(c, X, Y, W, H);
    r(c, X + 3, Y + 6, 10, 9, ak); r(c, X + 2, Y + 9, 12, 5, ak);
    r(c, X + 4, Y + 6, 8, 8, a); r(c, X + 3, Y + 9, 10, 4, a); r(c, X + 4, Y + 6, 3, 7, al);
    r(c, X + 10, Y + 8, 1, 4, ad); r(c, X + 7, Y + 12, 4, 1, ad);   // creases
    r(c, X + 6, Y + 3, 4, 4, ak); r(c, X + 6, Y + 3, 4, 3, a); r(c, X + 5, Y + 2, 2, 1, a); r(c, X + 9, Y + 2, 2, 1, a);   // the neck, flared
    r(c, X + 5, Y + 6, 6, 1, '#8a6a3a');   // twine
    r(c, X + 6, Y + 9, 4, 2, b); r(c, X + 7, Y + 9, 2, 1, sh(b, 1.2));   // the mark
  },
  // v299: a hay bale: tied twice with twine, straw strands catching the light, loose wisps at its foot
  haybale: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.2), ad = sh(a, 0.78);
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 3, W - 2, H - 4, ad); r(c, X + 2, Y + 3, W - 4, H - 5, a); r(c, X + 2, Y + 3, W - 4, 2, al);
    for (let i = X + 3; i < X + W - 2; i += 3) { r(c, i, Y + 6, 1, H - 8, ad); r(c, i + 1, Y + 5 + (i % 4), 1, 2, al); }
    for (const tx of [X + 4, X + W - 6]) { r(c, tx, Y + 3, 1, H - 4, b); r(c, tx, Y + 3, 1, 1, sh(b, 1.2)); }   // twine
    r(c, X + 2, Y + H - 1, 2, 1, a); r(c, X + W - 5, Y + H - 1, 3, 1, a);   // wisps
  },
  // v299: a glass display case: a dark wood base with a panel, glass sides catching the light, the find inside on velvet
  case: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.2), ak = sh(a, 0.55);
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 9, W - 2, 6, ak); r(c, X + 2, Y + 9, W - 4, 5, a); r(c, X + 2, Y + 9, W - 4, 1, al);
    r(c, X + 4, Y + 11, W - 8, 2, sh(a, 0.75));   // the base's panel
    r(c, X + 2, Y + 1, W - 4, 9, '#6a7a86'); r(c, X + 3, Y + 2, W - 6, 7, b); r(c, X + 3, Y + 7, W - 6, 2, '#7a2f3a');   // glass and velvet
    r(c, X + 2, Y + 1, W - 4, 1, '#ffffff'); r(c, X + 4, Y + 2, 1, 5, 'rgba(255,255,255,.6)'); r(c, X + 6, Y + 2, 1, 2, 'rgba(255,255,255,.4)');   // glints
    tops(c, p, X, Y + 9, W);
  },
  // v299: a fluted stone pedestal: a moulded cap and base, shaded flutes up the column
  pedestal: (c, X, Y, W, H, a, b, p) => {
    const al = sh(a, 1.15), ad = sh(a, 0.8), bk = sh(b, 0.6), bl = sh(b, 1.15);
    shadow(c, X, Y, W, H);
    r(c, X + 4, Y + 7, 8, 7, ad); r(c, X + 5, Y + 7, 6, 7, a); r(c, X + 5, Y + 7, 1, 7, al); for (const fx of [7, 9]) r(c, X + fx, Y + 7, 1, 7, ad);   // the column
    r(c, X + 3, Y + 5, 10, 2, bk); r(c, X + 3, Y + 5, 10, 1, bl);   // cap
    r(c, X + 3, Y + 13, 10, 2, bk); r(c, X + 4, Y + 13, 8, 1, bl);   // base
    tops(c, p, X, Y + 5, W);
  },
  // v299: the fossil skeleton on its plinth: each bone lit along its top and shaded under, ribs, a skull with a socket
  fossil: (c, X, Y, W, H, a, b) => {
    r(c, X + 2, Y + H - 6, W - 4, 5, sh(b, 0.6)); r(c, X + 3, Y + H - 6, W - 6, 4, b); r(c, X + 2, Y + H - 6, W - 4, 1, sh(b, 1.25));   // the plinth
    r(c, X + 6, Y + H - 4, W - 12, 1, sh(b, 0.75));
    const al = sh(a, 1.15), ad = sh(a, 0.72);
    const bone = (x, y, w, h) => { r(c, X + x, Y + y, w, h, ad); r(c, X + x, Y + y, w, Math.max(1, h - 1), a); r(c, X + x, Y + y, w, 1, al); };
    bone(14, 17, 2, 9); bone(36, 17, 2, 9); bone(12, 25, 6, 2); bone(34, 25, 6, 2);   // legs
    for (let i = 12; i < 42; i += 4) bone(i, 10, 2, 7);   // ribs
    bone(10, 6, 34, 4); for (let i = 12; i < 44; i += 3) r(c, X + i, Y + 6, 1, 1, ad);   // spine, vertebrae
    bone(2, 8, 10, 2); bone(42, 2, 12, 6); bone(52, 6, 6, 3); r(c, X + 47, Y + 4, 2, 2, '#3f3226');   // tail, skull, jaw, socket
    for (let i = 53; i < 58; i += 2) r(c, X + i, Y + 8, 1, 1, CREAM);   // teeth
  },
  // v299: a row of theatre seats: upholstered backs with piping, folded seats, armrests between them
  seats: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.2), ak = sh(a, 0.6);
    for (let i = 0; i < W; i += 8) {
      r(c, X + i + 1, Y + 6, 6, 9, sh(b, 0.6)); r(c, X + i + 1, Y + 6, 6, 1, sh(b, 1.2));   // back frame
      r(c, X + i + 2, Y + 7, 4, 4, a); r(c, X + i + 2, Y + 7, 4, 1, al); r(c, X + i + 2, Y + 10, 4, 1, ak);   // back cushion
      r(c, X + i + 1, Y + 11, 6, 2, a); r(c, X + i + 1, Y + 11, 6, 1, al);   // seat
      r(c, X + i + 1, Y + 13, 6, 2, '#3f1a12'); r(c, X + i, Y + 9, 1, 5, b);   // the floor under it, an armrest
    }
  },
  // v299: nest boxes: a row of lit compartments, straw in each, a perch rail, an egg here and there
  nestbox: (c, X, Y, W, H, a, b) => {
    r(c, X, Y + 1, W, 14, sh(a, 0.6)); r(c, X, Y + 1, W, 1, sh(a, 1.25)); r(c, X + 1, Y + 2, W - 2, 12, a);
    for (let i = 0; i < W; i += 8) {
      r(c, X + i + 1, Y + 4, 6, 8, '#3f2a1a'); r(c, X + i + 1, Y + 9, 6, 3, b); for (let k = 1; k < 7; k += 2) r(c, X + i + k, Y + 8, 1, 1, sh(b, 1.2));   // straw
      if ((i / 8) % 3 === 0) { r(c, X + i + 3, Y + 8, 2, 2, '#f4ead2'); r(c, X + i + 3, Y + 8, 1, 1, '#ffffff'); }
    }
    r(c, X, Y + 13, W, 2, sh(a, 0.75)); r(c, X, Y + 13, W, 1, sh(a, 1.15));   // perch
  },
  // v299: a feed hopper: a planked bin on the wall with a lit lid, a chute, the feed tray below with seed in it
  hopper: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y - 8, 12, 12, sh(a, 0.6)); r(c, X + 3, Y - 8, 10, 11, a); r(c, X + 2, Y - 9, 12, 2, sh(a, 1.2));
    for (let j = -5; j < 3; j += 3) r(c, X + 3, Y + j, 10, 1, sh(a, 0.75));   // planks
    r(c, X + 4, Y + 4, 8, 6, sh(b, 0.65)); r(c, X + 5, Y + 4, 6, 6, b);   // the chute
    r(c, X + 3, Y + 10, 10, 5, sh(a, 0.6)); r(c, X + 3, Y + 10, 10, 1, sh(a, 1.2)); r(c, X + 5, Y + 11, 6, 2, '#e3c56a'); r(c, X + 6, Y + 11, 2, 1, '#f4dc8a');
  },
  // v299: a feed trough: planked sides lit on top, hay heaped or water in it, little feet
  trough: (c, X, Y, W, H, a, b, p) => {
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 7, W - 2, 7, sh(a, 0.6)); r(c, X + 2, Y + 7, W - 4, 6, a); r(c, X + 1, Y + 7, W - 2, 1, sh(a, 1.25)); r(c, X + 2, Y + 11, W - 4, 1, sh(a, 0.78));
    const fill = p.hay ? '#e3c56a' : b; r(c, X + 2, Y + 8, W - 4, 3, fill); r(c, X + 3, Y + 8, W - 6, 1, sh(fill, 1.2));
    if (p.hay) for (let i = X + 3; i < X + W - 3; i += 3) { r(c, i, Y + 5, 1, 4, '#c9a83a'); r(c, i + 1, Y + 6, 1, 2, '#f4dc8a'); }
    r(c, X + 2, Y + 14, 2, 1, '#3f2a1a'); r(c, X + W - 4, Y + 14, 2, 1, '#3f2a1a');
  },
  // v299: a stall divider: a post lit on one side, an iron ring with a rope, a footing block
  stall: (c, X, Y, W, H, a, b) => {
    r(c, X + 6, Y + 1, 4, H - 2, sh(a, 0.65)); r(c, X + 6, Y + 1, 3, H - 3, a); r(c, X + 6, Y + 1, 1, H - 3, sh(a, 1.25)); r(c, X + 6, Y + 1, 4, 1, sh(a, 1.25));
    r(c, X + 7, Y + 4, 2, H - 8, sh(b, 0.8)); r(c, X + 9, Y + 6, 2, 2, '#8d939a'); r(c, X + 10, Y + 8, 1, 4, '#c9b68e');   // ring, rope
    r(c, X + 5, Y + H - 3, 6, 2, sh(b, 0.6)); r(c, X + 5, Y + H - 3, 6, 1, b);
  },
  // v299: a wooden stage: boards with staggered joints and nail heads, a lit front edge, a dark skirt
  stage: (c, X, Y, W, H, a, b) => {
    r(c, X, Y, W, H, a); r(c, X, Y, W, 2, sh(a, 1.2));
    for (let j = 4, k = 0; j < H; j += 5, k++) { r(c, X, Y + j, W, 1, b); for (let i = (k % 2) * 12 + 6; i < W; i += 24) { r(c, X + i, Y + j - 4, 1, 4, b); r(c, X + i + 2, Y + j - 2, 1, 1, sh(a, 0.6)); } }
    r(c, X, Y + H - 3, W, 1, sh(a, 1.25)); r(c, X, Y + H - 2, W, 2, sh(b, 0.6));
  },
  // ---- on the floor, walked over ----
  // v299: a pair of boots by the door: shafts with a turned cuff, laces, soles and a scuff of light on each toe
  boots: (c, X, Y, W, H, a, b) => {
    const al = sh(a, 1.25), ak = sh(a, 0.6);
    r(c, X + 2, Y + 14, 13, 1, SHADE);
    for (const [bx, by] of [[3, 7], [9, 6]]) {
      r(c, X + bx, Y + by, 4, 7, ak); r(c, X + bx, Y + by, 3, 6, a); r(c, X + bx, Y + by, 4, 1, al);   // shaft, cuff
      r(c, X + bx + 1, Y + by + 2, 1, 1, ak); r(c, X + bx + 1, Y + by + 4, 1, 1, ak);   // laces
      r(c, X + bx, Y + by + 5, 6, 2, a); r(c, X + bx + 4, Y + by + 5, 1, 1, al); r(c, X + bx, Y + by + 7, 6, 1, b);   // foot, toe, sole
    }
  },
  // v299: wood shavings on the floor: curls in two tones, lit on top, a few loose flakes
  shavings: (c, X, Y, W, H, a, b) => {
    [[2, 4], [9, 3], [5, 9], [11, 10], [7, 13]].forEach(([u, v], i) => { r(c, X + u, Y + v, 3, 1, a); r(c, X + u, Y + v, 1, 1, sh(a, 1.25)); r(c, X + u + (i % 2 ? 0 : 2), Y + v + 1, 2, 1, b); r(c, X + u + 1, Y + v - 1, 1, 1, a); r(c, X + u + 3, Y + v + 1, 1, 1, sh(b, 0.7)); });
    for (const [u, v] of [[13, 5], [3, 12], [12, 14]]) r(c, X + u, Y + v, 1, 1, a);
  },
  // v299: papers on the floor: two sheets fanned out, lines of writing, a curled corner and a shadow
  papers: (c, X, Y, W, H, a, b) => {
    r(c, X + 3, Y + 11, 9, 1, SHADE); r(c, X + 7, Y + 13, 8, 1, SHADE);
    r(c, X + 2, Y + 4, 9, 7, sh(a, 0.85)); r(c, X + 2, Y + 4, 9, 6, a); [6, 8].forEach((o) => r(c, X + 3, Y + o, o === 8 ? 4 : 6, 1, b));
    r(c, X + 6, Y + 7, 8, 6, '#cfc2a4'); r(c, X + 6, Y + 7, 8, 5, '#e8dcc0'); [9, 11].forEach((o) => r(c, X + 7, Y + o, o === 11 ? 3 : 6, 1, b));
    r(c, X + 13, Y + 7, 1, 1, '#cfc2a4'); r(c, X + 12, Y + 7, 1, 1, '#f4ead2');   // the curled corner
  },
};

// v100: rain on a window pane: drops that run down the glass and beads that cling to it, from the pane's own seed.
function rainOnGlass(c, X, Y, W, H, night) {
  const t = performance.now() / 1000, run = night ? 'rgba(170,190,220,.55)' : 'rgba(225,238,248,.8)', bead = night ? 'rgba(170,190,220,.4)' : 'rgba(235,245,252,.7)';
  for (let i = 0; i < W; i += 3) {
    const seed = (X * 7 + i * 13) % 17, speed = 9 + (seed % 5) * 3, y = Math.max(0, (((t * speed + seed * 5) % (H + 6)) - 3) | 0);
    if (y < H) r(c, X + i + (seed % 2), Y + y, 1, Math.min(3, H - y), run);
    if (seed % 3 === 0) r(c, X + i + 1, Y + ((seed * 3) % Math.max(1, H - 1)), 1, 1, bead);
  }
}

// Rugs: lie under everything, walked over.
export function drawRug(c, [x, y, w, h, [a, b], pat]) {
  const X = x * T, Y = y * T, W = w * T, H = h * T;
  r(c, X + 2, Y + 2, W - 4, H - 4, a); r(c, X + 4, Y + 4, W - 8, H - 8, b);
  if (pat === 'stripe') for (let i = Y + 7; i < Y + H - 6; i += 5) r(c, X + 4, i, W - 8, 2, a);
  else if (pat === 'diamond') { const cx = X + W / 2, cy = Y + H / 2; for (let i = 0; i < Math.min(W, H) / 2 - 6; i++) { r(c, cx - i, cy - (Math.min(W, H) / 2 - 6 - i), 2 * i + 1, 1, a); r(c, cx - i, cy + (Math.min(W, H) / 2 - 6 - i), 2 * i + 1, 1, a); } }
  else if (pat === 'rag') for (let i = 6; i < Math.min(W, H) / 2; i += 4) { r(c, X + i, Y + i, W - 2 * i, 1, a); r(c, X + i, Y + H - i - 1, W - 2 * i, 1, a); r(c, X + i, Y + i, 1, H - 2 * i, a); r(c, X + W - i - 1, Y + i, 1, H - 2 * i, a); }
  for (let i = X + 3; i < X + W - 3; i += 3) { r(c, i, Y, 1, 2, a); r(c, i, Y + H - 2, 1, 2, a); }   // fringe
}

export function drawPiece(c, p) {
  const P = PIECES[p.k], [a, b] = p.c || P.c, X = p.x * T, Y = p.y * T;
  if (P.furn) {   // the farmhouse furniture art, one tile, centred along the block
    for (let i = 0; i < p.w; i++) drawFurniture(c, X + i * T, Y + (p.h - 1) * T, { shape: P.furn, colors: [a, b] });
    return;
  }
  ART[P.shape](c, X, Y, p.w * T, p.h * T, a, b, p, P);
}
