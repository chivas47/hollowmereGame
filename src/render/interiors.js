// v97: the neighbours' cottages inside: room-by-room walls and floors, and every piece in a floor plan
// (data/interiors.js), drawn in code at its full size. X, Y: the top-left pixel of the piece's block of tiles;
// W, H: its size in pixels. Tall pieces stand against the wall above them and reach up into it.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { r, blink } from './pixel.js';
import { drawHouseTile } from './tiles.js';
import { drawFurniture } from './sprites.js';
import { PIECES, roomAt } from '../data/interiors.js';
import { WALLPAPERS, FLOORS } from '../data/furniture.js';

const INK = '#2b211a', CREAM = '#f4ead2', GLINT = 'rgba(255,255,255,.22)', SHADE = 'rgba(0,0,0,.18)';
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
  bed: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y - 5, W - 2, 8, b); r(c, X + 2, Y - 4, W - 4, 1, GLINT);   // headboard against the wall
    r(c, X + 2, Y + 2, W - 4, H - 6, CREAM);                                // sheet
    if (W > T) { r(c, X + 3, Y + 3, W / 2 - 4, 5, '#ffffff'); r(c, X + W / 2 + 1, Y + 3, W / 2 - 4, 5, '#ffffff'); }   // two pillows on a double
    else r(c, X + 3, Y + 3, W - 6, 5, '#ffffff');
    r(c, X + 2, Y + 10, W - 4, H - 14, a); r(c, X + 2, Y + 10, W - 4, 2, CREAM);   // quilt, the sheet turned down over it
    for (let i = 6; i < W - 4; i += 6) r(c, X + i, Y + 13, 1, H - 17, 'rgba(0,0,0,.12)');
    r(c, X + 1, Y + H - 5, W - 2, 4, b); r(c, X + 1, Y + H - 5, W - 2, 1, GLINT);  // footboard
  },
  nightstand: (c, X, Y, W, H, a, b, p) => { shadow(c, X, Y, W, H); box(c, X + 3, Y + 6, 10, 9, a, b); r(c, X + 4, Y + 9, 8, 1, b); r(c, X + 7, Y + 11, 2, 1, '#e9c46a'); tops(c, p, X, Y + 6, W); },
  wardrobe: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    box(c, X + 1, Y - 12, W - 2, H + 11, a, b); r(c, X, Y - 13, W, 2, b);
    r(c, X + W / 2, Y - 10, 1, H + 8, b); r(c, X + W / 2 - 3, Y - 2, 2, 3, '#e9c46a'); r(c, X + W / 2 + 2, Y - 2, 2, 3, '#e9c46a');
  },
  washstand: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); box(c, X + 2, Y + 6, 12, 9, a, '#6e4626'); r(c, X + 3, Y + 4, 10, 3, b); r(c, X + 4, Y + 4, 8, 1, '#9fc0d8'); r(c, X + 10, Y - 1, 3, 5, b); },
  tub: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H);
    r(c, X + 1, Y + 3, W - 2, H - 5, a); r(c, X + 3, Y + 5, W - 6, H - 10, '#9fc0d8'); r(c, X + 3, Y + 5, W - 6, 2, '#bcd4e6');
    r(c, X + 2, Y + H - 3, 2, 2, b); r(c, X + W - 4, Y + H - 3, 2, 2, b); r(c, X + 4, Y + 1, 3, 4, b);
  },
  screen: (c, X, Y, W, H, a, b) => { [0, 5, 10].forEach((o, i) => { r(c, X + 1 + o, Y - 8 + (i % 2), 5, 22, b); r(c, X + 2 + o, Y - 7 + (i % 2), 3, 20, a); }); },
  counter: (c, X, Y, W, H, a, b, p) => {
    box(c, X, Y + 4, W, 12, a, '#5c371e'); r(c, X, Y + 2, W, 3, b); r(c, X, Y + 2, W, 1, GLINT);
    for (let i = 0; i < W; i += T) { r(c, X + i + 2, Y + 7, 12, 7, 'rgba(0,0,0,.1)'); r(c, X + i + 8, Y + 7, 1, 7, 'rgba(0,0,0,.2)'); r(c, X + i + 6, Y + 10, 1, 1, '#e9c46a'); r(c, X + i + 10, Y + 10, 1, 1, '#e9c46a'); }
    tops(c, p, X, Y + 3, W);
  },
  sink: (c, X, Y, W, H, a, b) => {
    ART.counter(c, X, Y, W, H, a, b, {});
    r(c, X + 2, Y + 2, W - 4, 4, '#8d939a'); r(c, X + 3, Y + 3, W - 6, 2, '#9fc0d8');
    r(c, X + W / 2 - 1, Y - 4, 2, 6, '#5c6268'); r(c, X + W / 2 - 1, Y - 4, 5, 2, '#5c6268');   // pump spout
  },
  stove: (c, X, Y, W, H, a, b) => {
    r(c, X + 10, Y - 14, 3, 18, '#2b2f33');   // the pipe up through the wall
    shadow(c, X, Y, W, H); box(c, X + 1, Y + 3, 14, 12, a, '#2b2f33'); r(c, X + 1, Y + 2, 14, 2, '#2b2f33');
    r(c, X + 3, Y + 7, 10, 6, '#2b2f33'); r(c, X + 4, Y + 9, 8, 3, blink(220, 2) ? '#e8862a' : '#d9644a'); r(c, X + 5, Y + 10, 6, 1, '#ffd46a');
    r(c, X + 3, Y - 2, 7, 4, b); r(c, X + 2, Y - 2, 9, 1, '#3f3226');   // a pot on top
    if (blink(400, 2)) r(c, X + 5, Y - 5, 1, 2, 'rgba(255,255,255,.5)'); else r(c, X + 7, Y - 6, 1, 2, 'rgba(255,255,255,.5)');
  },
  range: (c, X, Y, W, H, a, b) => {
    r(c, X + W - 6, Y - 14, 3, 18, '#2b2f33');
    shadow(c, X, Y, W, H); box(c, X + 1, Y + 2, W - 2, 13, a, '#1f2428'); r(c, X + 1, Y + 2, W - 2, 3, '#1f2428');
    for (let i = 3; i < W - 6; i += 10) { r(c, X + i, Y + 7, 7, 6, '#1f2428'); r(c, X + i + 1, Y + 8, 5, 1, b); }
    r(c, X + W - 12, Y + 8, 8, 4, blink(220, 2) ? '#e8862a' : '#d9644a');
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
  table: (c, X, Y, W, H, a, b, p, P) => {
    shadow(c, X, Y, W, H);
    const top = Y + (H > T ? 3 : 4), th = H - (H > T ? 8 : 9);
    r(c, X + 2, top + th, 2, Y + H - top - th - 1, b); r(c, X + W - 4, top + th, 2, Y + H - top - th - 1, b);   // legs
    if (P.desk) r(c, X + W - 10, top + th, 7, Y + H - top - th - 1, b);   // drawers
    box(c, X + 1, top, W - 2, th, a, b); r(c, X + 1, top + th, W - 2, 2, b);
    if (p.cloth) { r(c, X + W / 2 - 5, top, 10, th + 3, p.cloth); r(c, X + W / 2 - 5, top + th + 2, 10, 1, 'rgba(0,0,0,.1)'); }
    tops(c, p, X, top + Math.min(th, 9), W);
  },
  chair: (c, X, Y, W, H, a, b, p) => {
    const d = p.dir || 'down';
    shadow(c, X + 2, Y, 12, H);
    if (d === 'down') { r(c, X + 4, Y + 1, 8, 8, b); r(c, X + 5, Y + 2, 6, 6, a); r(c, X + 3, Y + 8, 10, 3, a); r(c, X + 4, Y + 11, 1, 4, b); r(c, X + 11, Y + 11, 1, 4, b); }
    else if (d === 'up') { r(c, X + 4, Y + 11, 1, 4, b); r(c, X + 11, Y + 11, 1, 4, b); r(c, X + 3, Y + 6, 10, 3, a); r(c, X + 4, Y + 7, 8, 7, b); r(c, X + 5, Y + 8, 6, 5, a); }
    else {
      const L = d === 'left', bx = L ? X + 11 : X + 3;
      r(c, X + 3, Y + 8, 10, 3, a); r(c, X + 4, Y + 11, 1, 4, b); r(c, X + 11, Y + 11, 1, 4, b);
      r(c, bx, Y + 1, 2, 14, b); r(c, bx + (L ? -1 : 1), Y + 2, 1, 7, a);
    }
  },
  bench: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 1, Y + 6, W - 2, 4, a); r(c, X + 1, Y + 6, W - 2, 1, GLINT); r(c, X + 2, Y + 10, 2, 5, b); r(c, X + W - 4, Y + 10, 2, 5, b); r(c, X + 1, Y + 1, W - 2, 3, b); r(c, X + 3, Y + 4, 1, 2, b); r(c, X + W - 4, Y + 4, 1, 2, b); },
  woodpile: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 2, Y + 6, 12, 9, '#c9a35a'); [[3, 7], [8, 7], [5, 10], [10, 10], [3, 12], [8, 12]].forEach(([u, v]) => { r(c, X + u, Y + v, 4, 3, a); r(c, X + u + 1, Y + v + 1, 2, 1, '#d9b98a'); }); },
  sofa: (c, X, Y, W, H, a, b, p) => {
    shadow(c, X, Y, W, H);
    if ((p.dir || 'down') === 'down') {
      r(c, X, Y + 2, W, 7, b); r(c, X, Y + 8, W, 6, a); r(c, X + 1, Y + 3, W - 2, 5, a); for (let i = T; i < W; i += T) r(c, X + i, Y + 9, 1, 4, b);
      r(c, X, Y + 5, 3, 9, b); r(c, X + W - 3, Y + 5, 3, 9, b);
    } else {
      r(c, X, Y + 4, W, 6, a); r(c, X, Y + 9, W, 6, b); r(c, X + 1, Y + 10, W - 2, 3, a); r(c, X, Y + 4, 3, 10, b); r(c, X + W - 3, Y + 4, 3, 10, b);
    }
  },
  armchair: (c, X, Y, W, H, a, b, p) => {
    const d = p.dir || 'down';
    shadow(c, X, Y, W, H);
    if (d === 'down') { r(c, X + 2, Y + 1, 12, 8, b); r(c, X + 3, Y + 2, 10, 6, a); r(c, X + 1, Y + 6, 3, 8, b); r(c, X + 12, Y + 6, 3, 8, b); r(c, X + 4, Y + 8, 8, 5, a); }
    else if (d === 'up') { r(c, X + 2, Y + 4, 12, 5, a); r(c, X + 1, Y + 4, 3, 10, b); r(c, X + 12, Y + 4, 3, 10, b); r(c, X + 2, Y + 8, 12, 6, b); r(c, X + 4, Y + 9, 8, 3, a); }
    else {
      const L = d === 'left';
      r(c, X + 2, Y + 3, 12, 11, a); r(c, L ? X + 11 : X + 1, Y + 1, 4, 13, b); r(c, X + 2, Y + 3, 12, 2, b); r(c, X + 2, Y + 12, 12, 2, b); r(c, L ? X + 3 : X + 6, Y + 6, 7, 5, a);
    }
  },
  lowtable: (c, X, Y, W, H, a, b, p) => { shadow(c, X, Y, W, H); box(c, X + 2, Y + 7, W - 4, 5, a, b); r(c, X + 3, Y + 12, 2, 3, b); r(c, X + W - 5, Y + 12, 2, 3, b); tops(c, p, X, Y + 10, W); },
  hearth: (c, X, Y, W, H, a, b, p) => {
    r(c, X, Y - 14, W, H + 14, a); r(c, X, Y - 14, W, 1, GLINT);
    for (let j = -12; j < H; j += 5) for (let i = (j / 5) % 2 ? 0 : 4; i < W; i += 8) r(c, X + i, Y + j, 1, 4, 'rgba(0,0,0,.12)');
    r(c, X - 1, Y - 3, W + 2, 3, b); r(c, X - 1, Y - 3, W + 2, 1, GLINT);   // mantel
    r(c, X + 4, Y + 3, W - 8, H - 4, '#1f1812'); r(c, X + 6, Y + H - 4, W - 12, 2, '#5c371e');
    const f = blink(180, 3);
    r(c, X + 8, Y + H - 8, W - 16, 4, '#e8862a'); r(c, X + 10 + (f ? 1 : 0), Y + H - 11, W - 20, 4, '#ffd46a'); r(c, X + W / 2 - 1, Y + H - 13 + (f ? 1 : 0), 2, 3, '#fff3c4');
    r(c, X - 1, Y + H - 2, W + 2, 2, '#6a6e72');   // the hearthstone
    tops(c, p, X, Y - 3, W);
  },
  crate: (c, X, Y, W, H, a, b, p) => { shadow(c, X, Y, W, H); box(c, X + 2, Y + 5, W - 4, 10, a, b); r(c, X + 2, Y + 9, W - 4, 1, b); r(c, X + 2, Y + 5, 1, 10, b); r(c, X + W - 3, Y + 5, 1, 10, b); tops(c, p, X, Y + 6, W); },
  basket: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 3, Y + 8, 10, 7, a); r(c, X + 3, Y + 8, 10, 1, b); for (let i = 4; i < 13; i += 3) r(c, X + i, Y + 9, 1, 6, b); r(c, X + 5, Y + 6, 6, 3, b === '#8a6a3a' ? '#e2707a' : b); r(c, X + 4, Y + 3, 1, 5, '#8a6a3a'); r(c, X + 11, Y + 3, 1, 5, '#8a6a3a'); r(c, X + 4, Y + 3, 8, 1, '#8a6a3a'); },
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
  wallshelf: (c, X, Y, W, H, a, b, p) => { r(c, X + 1, Y + 10, W - 2, 2, a); r(c, X + 1, Y + 12, W - 2, 1, b); r(c, X + 3, Y + 12, 1, 2, b); r(c, X + W - 4, Y + 12, 1, 2, b); tops(c, p, X, Y + 10, W); },
  cupboard: (c, X, Y, W, H, a, b) => {
    box(c, X + 1, Y + 1, W - 2, H - 4, a, b); r(c, X + 1, Y + H - 3, W - 2, 1, SHADE);
    for (let i = 0; i < W; i += T) { r(c, X + i + 3, Y + 3, 10, H - 9, 'rgba(0,0,0,.1)'); r(c, X + i + 8, Y + 3, 1, H - 9, b); r(c, X + i + 6, Y + H / 2, 1, 2, '#e9c46a'); r(c, X + i + 10, Y + H / 2, 1, 2, '#e9c46a'); }
  },
  pegs: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 3, W - 2, 2, b);
    for (let i = 0; i < W; i += 8) { r(c, X + i + 3, Y + 5, 1, 2, '#3f3226'); }
    r(c, X + 2, Y + 6, 5, 9, a); r(c, X + 3, Y + 6, 3, 2, 'rgba(0,0,0,.15)');   // a coat
    if (W >= T) { r(c, X + 9, Y + 5, 5, 3, a === CREAM ? '#e9c46a' : '#6e4626'); r(c, X + 8, Y + 8, 7, 1, a === CREAM ? '#e9c46a' : '#6e4626'); }   // a hat
  },
  herbs: (c, X, Y, W, H, a, b) => { r(c, X + 1, Y + 2, W - 2, 1, b); for (let i = 2; i < W - 2; i += 4) { r(c, X + i + 1, Y + 3, 1, 3, '#a5935e'); r(c, X + i, Y + 6, 3, 6 + (i % 3), i % 8 ? a : '#9a7ab5'); } },
  nets: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 1, W - 2, 2, b);
    for (let i = 2; i < W - 1; i += 3) r(c, X + i, Y + 3, 1, H - 6 - (i % 5), a);
    for (let j = 5; j < H - 4; j += 3) r(c, X + 2, Y + j, W - 4, 1, a);
    r(c, X + 4, Y + H - 6, 2, 2, '#e8862a'); r(c, X + W - 7, Y + H - 8, 2, 2, '#e8862a');   // floats
  },
  tools: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 2, W - 2, H - 4, '#c9a35a'); r(c, X + 1, Y + 2, W - 2, 1, GLINT);
    const k = [(x) => { r(c, x, Y + 4, 2, 7, '#6e4626'); r(c, x - 2, Y + 4, 6, 2, b); },   // hammer
      (x) => { r(c, x, Y + 4, 4, 2, '#6e4626'); r(c, x + 1, Y + 6, 3, 7, b); },             // saw
      (x) => { r(c, x, Y + 4, 1, 8, b); r(c, x, Y + 11, 5, 1, b); },                       // square
      (x) => { r(c, x, Y + 5, 2, 5, '#6e4626'); r(c, x, Y + 10, 2, 3, b); }];             // chisel
    for (let i = 0, x = X + 4; x < X + W - 4; i++, x += 6) k[i % 4](x);
  },
  chart: (c, X, Y, W, H, a, b) => {
    r(c, X + 1, Y + 2, W - 2, H - 4, a); r(c, X + 1, Y + H - 2, W - 2, 1, SHADE);
    for (let i = 3; i < W - 3; i += 5) r(c, X + i, Y + 4 + (i % 4), 4, 1, '#a5935e');
    r(c, X + 4, Y + H - 7, W - 8, 1, '#5f8fb5'); r(c, X + 3, Y + 5, 1, H - 9, '#86a86a');
    for (let i = 5; i < W - 3; i += 9) r(c, X + i, Y + 3 + (i % 6), 1, 1, b);   // pins
  },
  board: (c, X, Y, W, H, a, b) => { r(c, X + 1, Y + 2, W - 2, H - 4, b); r(c, X + 2, Y + 3, W - 4, H - 6, a); for (let j = 5; j < H - 5; j += 3) r(c, X + 4, Y + j, (W - 10) * (((j * 3) % 5) + 3) / 7, 1, '#d9dccf'); r(c, X + 3, Y + H - 3, 5, 1, CREAM); },
  mirror: (c, X, Y, W, H, a, b) => { r(c, X + 4, Y + 2, 8, H - 4, b); r(c, X + 5, Y + 3, 6, H - 6, a); r(c, X + 6, Y + 4, 2, 4, 'rgba(255,255,255,.55)'); },
  wallclock: (c, X, Y, W, H, a, b) => { r(c, X + 4, Y + 3, 8, 9, b); r(c, X + 5, Y + 4, 6, 6, a); r(c, X + 8, Y + 5, 1, 3, INK); r(c, X + 8, Y + 7, 2, 1, INK); r(c, X + 7, Y + 12, 2, 3 + (blink(500, 2) ? 1 : 0), '#c9a35a'); },
  plaque: (c, X, Y, W, H, a, b) => { r(c, X + 2, Y + 4, W - 4, 8, b); r(c, X + 2, Y + 4, W - 4, 1, GLINT); r(c, X + 4, Y + 6, W - 10, 4, a); r(c, X + W - 6, Y + 5, 3, 6, a); r(c, X + 5, Y + 7, 1, 1, INK); },
  lantern: (c, X, Y, W, H, a, b) => { r(c, X + 7, Y + 2, 2, 3, a); r(c, X + 5, Y + 5, 6, 8, a); r(c, X + 6, Y + 6, 4, 5, b); r(c, X + 5, Y + 13, 6, 1, a); },
  // ---- work and hobbies ----
  workbench: (c, X, Y, W, H, a, b, p) => {
    shadow(c, X, Y, W, H);
    r(c, X + 2, Y + 8, 2, 7, b); r(c, X + W - 4, Y + 8, 2, 7, b); r(c, X + 2, Y + 12, W - 4, 2, b);
    box(c, X + 1, Y + 3, W - 2, 5, a, b); r(c, X + W - 8, Y + 1, 5, 3, '#5c6268'); r(c, X + W - 7, Y + 4, 3, 3, '#5c6268');   // vise
    tops(c, p, X, Y + 5, W - 8);
  },
  sawhorse: (c, X, Y, W, H, a, b, p) => {
    shadow(c, X, Y, W, H);
    [X + 3, X + W - 7].forEach((x) => { r(c, x, Y + 7, 4, 2, a); r(c, x, Y + 9, 1, 6, a); r(c, x + 3, Y + 9, 1, 6, a); });
    if (p.oar) { r(c, X + 1, Y + 4, W - 2, 3, b); r(c, X + W - 9, Y + 2, 8, 6, b); r(c, X + W - 8, Y + 3, 6, 4, '#d9b98a'); return; }   // an oar, half carved
    r(c, X + 4, Y - 1, W - 8, 4, a); r(c, X + 5, Y - 6, 2, 6, b); r(c, X + W - 7, Y - 6, 2, 6, b); r(c, X + 4, Y + 3, W - 8, 2, b);   // a chair, upside down
  },
  lumber: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); for (let j = 0; j < 4; j++) { r(c, X + 1 + (j % 2) * 2, Y + 4 + j * 3, W - 4, 3, j % 2 ? b : a); r(c, X + 1 + (j % 2) * 2, Y + 4 + j * 3, W - 4, 1, GLINT); } },
  extractor: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 2, Y + 2, 12, 13, a); r(c, X + 2, Y + 2, 12, 2, b); r(c, X + 4, Y + 6, 8, 1, b); r(c, X + 4, Y + 11, 8, 1, b); r(c, X + 7, Y - 2, 2, 4, b); r(c, X + 7, Y - 2, 6, 1, '#6e4626'); r(c, X + 6, Y + 13, 3, 2, '#e9a43a'); },
  hives: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); for (let i = 0; i < W; i += T) { [0, 5, 10].forEach((o, j) => { r(c, X + i + 2, Y + o + 1, 12, 5, j % 2 ? b : a); r(c, X + i + 2, Y + o + 5, 12, 1, SHADE); }); r(c, X + i + 1, Y, 14, 2, '#8a5a32'); } },
  canvases: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); [[1, '#5d8a4a'], [5, '#e9a43a'], [9, '#5f8fb5']].forEach(([o, k], i) => { r(c, X + o, Y + 1 + i * 2, 7, 14 - i * 2, '#a5753f'); r(c, X + o + 1, Y + 2 + i * 2, 5, 12 - i * 2, a); r(c, X + o + 1, Y + 8, 5, 4, k); }); },
  drafting: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 4, Y + 9, 2, 6, '#6e4626'); r(c, X + W - 6, Y + 9, 2, 6, '#6e4626'); r(c, X + 1, Y + 2, W - 2, 8, a); r(c, X + 2, Y + 3, W - 4, 6, b); r(c, X + 4, Y + 5, W - 9, 1, '#5f8fb5'); r(c, X + 6, Y + 4, 1, 4, '#86a86a'); r(c, X + W - 6, Y + 6, 3, 1, '#b5452f'); },
  telescope: (c, X, Y, W, H, a, b) => { r(c, X + 4, Y + 8, 1, 7, b); r(c, X + 8, Y + 8, 1, 7, b); r(c, X + 12, Y + 8, 1, 7, b); r(c, X + 7, Y + 7, 3, 2, b); r(c, X + 3, Y + 1, 10, 3, a); r(c, X + 2, Y, 3, 5, a); r(c, X + 12, Y + 2, 2, 1, '#2b211a'); },
  seedtrays: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H); r(c, X + 2, Y + 9, 2, 6, '#6e4626'); r(c, X + W - 4, Y + 9, 2, 6, '#6e4626'); box(c, X + 1, Y + 6, W - 2, 3, '#a5753f', '#6e4626');
    for (let i = 2; i < W - 6; i += 7) { r(c, X + i, Y + 3, 6, 4, a); for (let k = 0; k < 5; k += 2) r(c, X + i + k, Y + 1 + (k % 3), 1, 3, b); }
  },
  cart: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 1, Y + 6, 14, 7, a); r(c, X + 1, Y + 6, 14, 1, GLINT); r(c, X + 3, Y + 13, 3, 3, INK); r(c, X + 10, Y + 13, 3, 3, INK); r(c, X + 2, Y + 3, 12, 4, '#5d8a4a'); [[3, 2], [7, 1], [11, 3]].forEach(([u, v]) => r(c, X + u, Y + v, 2, 2, b)); },
  cubbies: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H); box(c, X + 1, Y - 10, W - 2, H + 9, a, '#6e4626');
    for (let j = 0; j < 4; j++) for (let i = 0; i < W - 4; i += 5) { r(c, X + 2 + i, Y - 9 + j * 6, 4, 5, '#3f2a1a'); if ((i + j) % 3) r(c, X + 2 + i, Y - 7 + j * 6, 4, 3, b); }
  },
  musicstand: (c, X, Y, W, H, a, b) => { r(c, X + 7, Y + 6, 2, 9, a); r(c, X + 4, Y + 14, 8, 1, a); r(c, X + 3, Y + 1, 10, 6, a); r(c, X + 4, Y + 1, 8, 5, b); [2, 4].forEach((o) => r(c, X + 5, Y + o, 6, 1, '#8a8a8a')); },
  fiddle: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 1, Y + 5, 14, 9, b); r(c, X + 2, Y + 6, 12, 7, '#3a2a4a'); r(c, X + 4, Y + 7, 5, 5, a); r(c, X + 5, Y + 8, 3, 1, '#c96a4a'); r(c, X + 9, Y + 9, 5, 1, '#3f2a1a'); r(c, X + 3, Y + 12, 11, 1, '#c9b68e'); },
  contraption: (c, X, Y, W, H, a, b) => {
    shadow(c, X, Y, W, H); box(c, X + 2, Y + 4, W - 4, 11, b, '#5c6268');
    r(c, X + 4, Y + 1, 6, 6, a); r(c, X + 6, Y + 3, 2, 2, '#6a4a2a'); r(c, X + W - 8, Y + 6, 4, 4, a);
    r(c, X + 5, Y + 10, 2, 2, blink(300, 2) ? '#86d06a' : '#3f5a32'); r(c, X + 8, Y + 10, 2, 2, blink(450, 3) ? '#e8862a' : '#5a3a1a');
    r(c, X + W - 4, Y - 3, 1, 7, '#5c6268'); r(c, X + W - 5, Y - 4, 3, 1, '#c8352f');
  },
  scrap: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); [[2, 9, 6, 6, a], [6, 7, 7, 8, b], [9, 10, 5, 5, '#5c6268'], [4, 11, 3, 3, '#c9ccd6']].forEach(([u, v, w, h, k]) => r(c, X + u, Y + v, w, h, k)); r(c, X + 3, Y + 5, 1, 5, a); r(c, X + 11, Y + 6, 3, 3, b); },
  rods: (c, X, Y, W, H, a, b) => { [3, 7, 11].forEach((o, i) => { r(c, X + o, Y - 12 + i * 2, 1, H + 10 - i * 2, a); r(c, X + o - 1, Y + H - 8, 3, 2, b); r(c, X + o + 1, Y - 10 + i * 2, 1, 6, '#e8eef2'); }); r(c, X + 2, Y + H - 3, 12, 2, SHADE); },
  oars: (c, X, Y, W, H, a, b) => { [3, 9].forEach((o) => { r(c, X + o, Y - 12, 2, H + 10, a); r(c, X + o - 1, Y + H - 9, 4, 7, b); }); },
  schooldesk: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 2, Y + 4, 12, 4, a); r(c, X + 2, Y + 4, 12, 1, GLINT); r(c, X + 3, Y + 8, 2, 7, b); r(c, X + 11, Y + 8, 2, 7, b); r(c, X + 4, Y + 2, 6, 3, '#3f4850'); r(c, X + 4, Y + 2, 6, 1, '#a5753f'); },
  // ---- v98: shops, halls and farm buildings ----
  sign: (c, X, Y, W, H, a, b) => { r(c, X + 1, Y + 3, W - 2, H - 6, a); r(c, X + 1, Y + 3, W - 2, 1, GLINT); r(c, X + 1, Y + H - 3, W - 2, 1, SHADE); for (let i = X + 5; i < X + W - 6; i += 4) r(c, i, Y + 6, 3, H - 12, b); },
  cinema: (c, X, Y, W, H, a, b) => {
    r(c, X, Y + 1, W, H - 2, b); r(c, X + 6, Y + 3, W - 12, H - 7, a);
    const t = Math.floor(performance.now() / 1500) % 3;   // the picture changes now and then
    r(c, X + 10, Y + H - 12, W - 20, 6, ['#86b86a', '#5f8fb5', '#e8862a'][t]); r(c, X + W / 2 - 4 + t * 3, Y + 7, 6, 6, '#3f3226');
    for (let i = 1; i < 6; i += 2) { r(c, X + i, Y + 1, 1, H - 2, '#5c1a12'); r(c, X + W - 1 - i, Y + 1, 1, H - 2, '#5c1a12'); }
  },
  ladder: (c, X, Y, W, H, a, b) => { r(c, X + 3, Y, 2, H, a); r(c, X + 11, Y, 2, H, a); for (let j = 3; j < H; j += 5) r(c, X + 3, Y + j, 10, 2, b); r(c, X, Y, W, 2, '#3f2a1a'); },
  weapons: (c, X, Y, W, H, a, b) => { r(c, X + 1, Y + 3, W - 2, 2, a); r(c, X + 1, Y + 12, W - 2, 2, a); for (let x = X + 4; x < X + W - 3; x += 6) { r(c, x, Y + 1, 2, 12, b); r(c, x - 1, Y + 11, 4, 1, '#c9a35a'); r(c, x, Y + 12, 2, 3, '#6e4626'); } },
  forge: (c, X, Y, W, H, a, b) => {
    r(c, X + 4, Y - 14, W - 8, 16, b); r(c, X + 4, Y - 14, W - 8, 1, GLINT);   // the hood and chimney
    r(c, X, Y + 2, W, 13, a); r(c, X, Y + 2, W, 2, '#8d8a84');
    r(c, X + 4, Y + 5, W - 8, 7, '#1f1812'); const f = blink(160, 3);
    r(c, X + 6, Y + 8, W - 12, 4, '#e8862a'); r(c, X + 8 + (f ? 1 : 0), Y + 6, W - 16, 3, '#ffd46a'); r(c, X + W / 2 - 1, Y + 5, 2, 2, f ? '#fff3c4' : '#ffd46a');
  },
  bellows: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 2, Y + 7, 10, 6, a); r(c, X + 3, Y + 8, 8, 4, b); r(c, X + 12, Y + 9, 3, 2, '#3f4850'); r(c, X + 1, Y + 6, 4, 1, '#6e4626'); },
  grindstone: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 3, Y + 10, 10, 5, b); r(c, X + 4, Y + 2, 8, 9, a); r(c, X + 5, Y + 3, 6, 7, '#c9c4ba'); r(c, X + 7, Y + 6, 2, 2, b); r(c, X + 12, Y + 6, 3, 1, b); },
  anvil: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 5, Y + 11, 6, 4, b); r(c, X + 6, Y + 8, 4, 3, a); r(c, X + 2, Y + 4, 12, 4, a); r(c, X, Y + 5, 3, 2, a); r(c, X + 2, Y + 4, 12, 1, '#8d939a'); r(c, X + 12, Y + 2, 3, 5, '#c9a35a'); },
  sack: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 3, Y + 5, 10, 10, a); r(c, X + 2, Y + 8, 12, 6, a); r(c, X + 5, Y + 3, 6, 3, b); r(c, X + 6, Y + 9, 4, 3, b); r(c, X + 3, Y + 5, 2, 9, 'rgba(255,255,255,.15)'); },
  haybale: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 1, Y + 3, W - 2, H - 4, a); r(c, X + 1, Y + 3, W - 2, 2, '#f0d98a'); for (let i = X + 3; i < X + W - 2; i += 3) r(c, i, Y + 6, 1, H - 8, b); r(c, X + 1, Y + 7, W - 2, 1, '#8a6a3a'); r(c, X + 1, Y + H - 5, W - 2, 1, '#8a6a3a'); },
  case: (c, X, Y, W, H, a, b, p) => {
    shadow(c, X, Y, W, H); box(c, X + 1, Y + 9, W - 2, 6, a, '#3f2a1a');
    r(c, X + 2, Y + 1, W - 4, 9, b); r(c, X + 2, Y + 1, W - 4, 1, '#ffffff'); r(c, X + 3, Y + 2, 2, 6, 'rgba(255,255,255,.5)');
    tops(c, p, X, Y + 9, W);
  },
  pedestal: (c, X, Y, W, H, a, b, p) => { shadow(c, X, Y, W, H); r(c, X + 4, Y + 6, 8, 9, a); r(c, X + 3, Y + 5, 10, 2, b); r(c, X + 3, Y + 13, 10, 2, b); tops(c, p, X, Y + 5, W); },
  fossil: (c, X, Y, W, H, a, b) => {
    r(c, X + 2, Y + H - 6, W - 4, 5, b); r(c, X + 2, Y + H - 6, W - 4, 1, GLINT);   // the plinth
    const bone = (x, y, w, h) => r(c, X + x, Y + y, w, h, a);
    bone(10, 6, 34, 4); for (let i = 12; i < 42; i += 4) bone(i, 10, 2, 7);   // spine and ribs
    bone(42, 2, 12, 6); bone(52, 6, 6, 3); r(c, X + 47, Y + 4, 2, 2, '#3f3226');   // the skull
    bone(2, 8, 10, 2); bone(14, 17, 2, 9); bone(36, 17, 2, 9); bone(12, 25, 6, 2); bone(34, 25, 6, 2);   // tail and legs
  },
  seats: (c, X, Y, W, H, a, b) => { for (let i = 0; i < W; i += 8) { r(c, X + i + 1, Y + 6, 6, 9, b); r(c, X + i + 1, Y + 9, 6, 4, a); r(c, X + i + 1, Y + 13, 6, 2, '#3f1a12'); } },
  nestbox: (c, X, Y, W, H, a, b) => {
    box(c, X, Y + 1, W, 14, a, '#5c371e');
    for (let i = 0; i < W; i += 8) { r(c, X + i + 1, Y + 4, 6, 8, '#3f2a1a'); r(c, X + i + 1, Y + 9, 6, 3, b); if ((i / 8) % 3 === 0) r(c, X + i + 3, Y + 8, 2, 2, '#f4ead2'); }
  },
  hopper: (c, X, Y, W, H, a, b) => { shadow(c, X, Y, W, H); r(c, X + 2, Y - 8, 12, 12, a); r(c, X + 2, Y - 8, 12, 1, GLINT); r(c, X + 4, Y + 4, 8, 6, b); r(c, X + 3, Y + 10, 10, 5, a); r(c, X + 5, Y + 11, 6, 2, '#e3c56a'); },
  trough: (c, X, Y, W, H, a, b, p) => {
    shadow(c, X, Y, W, H); r(c, X + 1, Y + 7, W - 2, 7, a); r(c, X + 2, Y + 8, W - 4, 3, p.hay ? '#e3c56a' : b);
    if (p.hay) for (let i = X + 3; i < X + W - 3; i += 3) r(c, i, Y + 5, 1, 4, '#c9a83a');
    r(c, X + 2, Y + 14, 2, 1, '#3f2a1a'); r(c, X + W - 4, Y + 14, 2, 1, '#3f2a1a');
  },
  stall: (c, X, Y, W, H, a, b) => { r(c, X + 6, Y + 1, 4, H - 2, a); r(c, X + 6, Y + 1, 4, 1, GLINT); r(c, X + 7, Y + 4, 2, H - 8, b); r(c, X + 6, Y + H - 3, 4, 2, b); },
  stage: (c, X, Y, W, H, a, b) => { r(c, X, Y, W, H, a); r(c, X, Y, W, 2, GLINT); for (let j = 4; j < H; j += 5) r(c, X, Y + j, W, 1, b); r(c, X, Y + H - 2, W, 2, b); },
  // ---- on the floor, walked over ----
  boots: (c, X, Y, W, H, a, b) => { r(c, X + 3, Y + 7, 4, 7, a); r(c, X + 3, Y + 12, 6, 2, b); r(c, X + 9, Y + 6, 4, 7, a); r(c, X + 9, Y + 11, 6, 2, b); },
  shavings: (c, X, Y, W, H, a, b) => { [[2, 4], [9, 3], [5, 9], [11, 10], [7, 13]].forEach(([u, v], i) => { r(c, X + u, Y + v, 3, 1, a); r(c, X + u + (i % 2 ? 0 : 2), Y + v + 1, 2, 1, b); r(c, X + u + 1, Y + v - 1, 1, 1, a); }); },
  papers: (c, X, Y, W, H, a, b) => { r(c, X + 2, Y + 4, 9, 7, a); r(c, X + 6, Y + 7, 8, 6, '#e8dcc0'); [6, 8].forEach((o) => r(c, X + 3, Y + o, 6, 1, b)); [9, 11].forEach((o) => r(c, X + 7, Y + o, 6, 1, b)); },
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
export const PIECE_SHAPES = Object.keys(ART);
