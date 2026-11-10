// Static world art: tiles and buildings. Drawn once per map and season into a cached canvas.
import { T } from '../core/constants.js';
import { r, rng } from './pixel.js';
import { SHRINE } from '../data/books.js';
import { CHIMES } from '../data/nuts.js';
import { DECOR_SHEETS, BUILDING_SHEETS, PROPS_SHEET, GREENHOUSE_SHEET, VARIANTS_SHEET } from '../data/sprites.js';
import { BUILDINGS } from '../data/buildings.js';
import { RANCH_PEN } from '../data/ranch.js';
import { ready, sheet } from './sheets.js';
import { SCENERY_ART } from './scenery.js';

const SNOW = '#f2f6f8';

// v201: shared building parts, so homes and shops share one look: shingled gable roofs lit from the top left, board
// walls with a shadow under the eaves and a stone footing, trimmed windows with a sill, panelled doors on a step, and
// brick chimneys. tone(hex, k): k under 1 darkens, over 1 lightens toward white.
export function tone(hex, k) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
  return '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k))).toString(16).padStart(2, '0')).join('');
}
// A gable roof seen from the front: rows from y, the top row `top` wide centred on cx, one pixel wider each side per
// row. Shingle courses every 3 rows with staggered tabs, a lit ridge, a dark eave and fascia. snow: drifts on top.
function roofGable(g, cx, y, top, rows, col, snow) {
  const lite = tone(col, 1.18), dark = tone(col, 0.78), deep = tone(col, 0.6), edge = tone(col, 0.5);
  for (let j = 0; j < rows; j++) {
    const half = top / 2 + j, x0 = Math.round(cx - half), w = Math.round(2 * half);
    const course = j % 3, c = j === 0 ? lite : course === 2 ? dark : col;
    r(g, x0, y + j, w, 1, c);
    if (course === 0 && j) for (let x = x0 + ((j / 3) % 2 ? 2 : 0); x < x0 + w - 1; x += 4) r(g, x, y + j, 1, 2, dark);
    if (course === 1) r(g, x0 + 1, y + j, Math.max(1, Math.round(w * 0.3)), 1, tone(col, 1.08));
    r(g, x0, y + j, 1, 1, edge); r(g, x0 + w - 1, y + j, 1, 1, edge);
  }
  const half = top / 2 + rows, x0 = Math.round(cx - half), w = Math.round(2 * half);
  r(g, x0, y + rows, w, 1, deep); r(g, x0 + 1, y + rows + 1, w - 2, 1, edge);
  if (snow) {
    for (let j = 0; j < 3; j++) { const hh = top / 2 + j; r(g, Math.round(cx - hh), y + j, Math.round(2 * hh), 1, j === 2 ? '#d6e2ea' : SNOW); }
    for (let x = Math.round(cx - top / 2 - 2); x < cx + top / 2 + 2; x += 3) r(g, x, y + 3, 1, 1 + (x % 2), SNOW);
    r(g, x0, y + rows, w, 1, SNOW);
  }
}
// Board walls: lines every 4 rows with a lit board below each, the eave's shadow on top, corner posts, a stone footing.
function boardWall(g, x, y, w, h, col, line) {
  r(g, x, y, w, h, col);
  for (let j = y + 4; j < y + h - 2; j += 4) { r(g, x, j, w, 1, line || tone(col, 0.82)); r(g, x, j + 1, w, 1, tone(col, 1.07)); }
  r(g, x, y, w, 2, tone(col, 0.7)); r(g, x, y + 2, w, 1, tone(col, 0.85));
  r(g, x, y, 1, h, tone(col, 0.78)); r(g, x + w - 1, y, 1, h, tone(col, 0.62));
  r(g, x, y + h - 2, w, 2, '#8d877e'); r(g, x, y + h - 1, w, 1, '#6f6a62');
  for (let i = x + 2; i < x + w - 1; i += 5) r(g, i, y + h - 2, 1, 1, '#6f6a62');
}
// A window: dark outline, light trim, two panes of sky with a glint, a sill under it. box: a flower box below.
function windowArt(g, x, y, w, h, trim, box) {
  trim = trim || '#efe6d0';
  r(g, x - 1, y - 1, w + 2, h + 2, '#3f2f22'); r(g, x, y, w, h, trim);
  r(g, x + 1, y + 1, w - 2, h - 2, '#5e9cc4'); r(g, x + 1, y + 1, w - 2, Math.ceil((h - 2) / 2), '#8fc8e8');
  r(g, x + 2, y + 2, 1, 2, '#e4f4fb'); r(g, x + 3, y + 2, 1, 1, '#e4f4fb');
  r(g, x + Math.floor(w / 2), y + 1, 1, h - 2, trim); r(g, x + 1, y + Math.floor(h / 2), w - 2, 1, trim);
  r(g, x - 2, y + h, w + 4, 1, tone(trim, 0.92)); r(g, x - 2, y + h + 1, w + 4, 1, 'rgba(0,0,0,.22)');
  if (box) {
    r(g, x - 1, y + h + 1, w + 2, 3, '#7a4e2c'); r(g, x - 1, y + h + 1, w + 2, 1, '#9a6a3c');
    for (let i = 0; i < w + 2; i += 2) r(g, x - 1 + i, y + h, 1, 1, i % 4 ? '#e2707a' : '#f0c850');
    for (let i = 1; i < w + 2; i += 2) r(g, x - 1 + i, y + h, 1, 1, '#5da34a');
  }
}
// A panelled door in a dark frame, with a brass knob and a stone step.
function doorArt(g, x, y, w, h, col) {
  r(g, x - 1, y - 1, w + 2, h + 1, '#3a2a1e'); r(g, x, y, w, h, col);
  const pw = Math.floor((w - 3) / 2), ph = Math.floor((h - 4) / 2);
  [[x + 1, y + 1], [x + 2 + pw, y + 1], [x + 1, y + 2 + ph], [x + 2 + pw, y + 2 + ph]].forEach(([a, b]) => {
    r(g, a, b, pw, ph, tone(col, 0.8)); r(g, a, b, pw, 1, tone(col, 0.65)); r(g, a, b + ph - 1, pw, 1, tone(col, 1.15));
  });
  r(g, x + w - 1, y, 1, h, tone(col, 0.7));
  r(g, x + w - 3, y + Math.floor(h / 2), 1, 2, '#e9b44c'); r(g, x + w - 3, y + Math.floor(h / 2), 1, 1, '#fff0a0');
  r(g, x - 2, y + h, w + 4, 1, '#a8a196'); r(g, x - 2, y + h - 1, w + 4, 1, '#c4bdb0');
}
// A brick chimney with a cap; snow on the cap in winter.
function chimneyArt(g, x, y, w, h, snow) {
  r(g, x - 1, y, w + 2, h, '#3f302a'); r(g, x, y, w, h, '#8a6656');
  for (let j = y + 2; j < y + h; j += 2) { r(g, x, j, w, 1, '#6e5044'); r(g, x + ((j / 2) % 2 ? 1 : w - 2), j - 1, 1, 1, '#6e5044'); }
  r(g, x, y, 1, h, '#a07868');
  r(g, x - 1, y - 1, w + 2, 2, '#5a4a44'); r(g, x - 1, y - 1, w + 2, 1, '#7a6a62');
  if (snow) r(g, x - 1, y - 2, w + 2, 2, SNOW);
}

export function drawGrass(g, x, y, p, salt) {
  const X = x * T, Y = y * T, R = rng(x * 92837 + y * 1237 + salt);
  r(g, X, Y, T, T, p.g);
  for (let i = 0; i < 7; i++) r(g, X + (R() * 15 | 0), Y + (R() * 14 | 0), 1, 2, R() < 0.5 ? p.gl : p.gd);
  if (p.fl && R() < 0.07) {
    const fx = X + 3 + (R() * 9 | 0), fy = Y + 3 + (R() * 9 | 0), c = p.fl[R() < 0.5 ? 0 : 1];
    r(g, fx, fy - 1, 1, 1, c); r(g, fx - 1, fy, 3, 1, c); r(g, fx, fy + 1, 1, 1, c); r(g, fx, fy, 1, 1, '#d9644a');
  }
}

// v85: the flowers drawGrass would draw on this tile (the same random draws), for grass from the terrain sheet.
export function drawFlowers(g, x, y, p, salt) {
  const X = x * T, Y = y * T, R = rng(x * 92837 + y * 1237 + salt);
  for (let i = 0; i < 21; i++) R();
  if (p.fl && R() < 0.07) {
    const fx = X + 3 + (R() * 9 | 0), fy = Y + 3 + (R() * 9 | 0), c = p.fl[R() < 0.5 ? 0 : 1];
    r(g, fx, fy - 1, 1, 1, c); r(g, fx - 1, fy, 3, 1, c); r(g, fx, fy + 1, 1, 1, c); r(g, fx, fy, 1, 1, '#d9644a');
  }
}

// v85: ground from a corner tile set (data/sprites.js TERRAIN_SHEET, v87 CAVE_SHEET: S). kind(x, y) names each
// tile's terrain. base fills every tile; each other terrain in S.over is laid on the corners between tiles, the tile
// for each corner chosen by which of its four neighbours have that terrain. Full tiles pick a variant by position.
// decorate(x, y), if given, then runs on every tile (the flowers on grass).
export function drawTerrain(g, img, S, kind, base, w, h, decorate) {
  const s = S.size, at = (x, y) => kind(Math.min(w - 1, Math.max(0, x)), Math.min(h - 1, Math.max(0, y)));
  const tile = (b, i, X, Y) => g.drawImage(img, b * 4 * s + (i % 4) * s, Math.floor(i / 4) * s, s, s, X, Y, s, s);
  const full = (b, x, y, X, Y) => { const v = (x * 7 + y * 13) % 5; tile(b, v === 4 ? 15 : 16 + v, X, Y); };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) full(S.order.indexOf(base), x, y, x * s, y * s);
  for (const t of S.over) {
    if (t === base) continue;
    const b = S.order.indexOf(t);
    for (let y = 0; y <= h; y++) for (let x = 0; x <= w; x++) {
      const i = (at(x - 1, y - 1) === t) + (at(x, y - 1) === t) * 2 + (at(x - 1, y) === t) * 4 + (at(x, y) === t) * 8;
      if (i === 15) full(b, x, y, x * s - s / 2, y * s - s / 2);
      else if (i) tile(b, i, x * s - s / 2, y * s - s / 2);
    }
  }
  if (decorate) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) decorate(x, y);
}

export function drawPath(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 331 + y * 977 + 5);
  r(g, X, Y, T, T, p.path); r(g, X, Y, T, 1, p.pathd); r(g, X, Y + 15, T, 1, p.pathd);
  for (let i = 0; i < 4; i++) r(g, X + 1 + (R() * 13 | 0), Y + 2 + (R() * 11 | 0), 2, 1, p.pathd);
}

// v204: border and field trees, one tile each: a crown of leaf clumps in rows 0 to 11 (the rows that sway, renderer
// CROWN) over a barked trunk with a root flare. Each clump is lit from the top left in the palette's three greens
// (light trl, mid tr, dark trd) inside a darker outline; three crown shapes, picked by position, so a row of trees
// is not a row of copies. In winter snow sits on the lit tops of the clumps.
const TREE_CROWNS = [
  [[8, 4, 4.6], [4.5, 7, 3.6], [11.5, 7, 3.6], [8, 8.2, 3.6]],
  [[7, 4, 4.2], [10.5, 5, 3.8], [5, 7.5, 3.6], [11, 8.2, 3.4], [8, 8.5, 3.4]],
  [[8, 3.5, 3.6], [5, 6, 3.6], [11, 6, 3.6], [8, 7.5, 4.2]],
].map((clumps) => {
  const g = [];
  for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) {
    let v = null;
    for (const [cx, cy, rad] of clumps) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = dx * dx + dy * dy;
      if (d > rad * rad) continue;
      const lit = (-dx - dy * 1.2) / rad;
      v = lit > 0.5 ? 'L' : (lit < -0.55 || (d > (rad - 1) ** 2 && dy > 0.3 * rad)) ? 'k' : 'l';
    }
    if (v) g.push([x, y, v]);
  }
  const on = new Set(g.map(([x, y]) => x + ',' + y)), edge = [];
  for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) {
    if (on.has(x + ',' + y)) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([i, j]) => on.has((x + i) + ',' + (y + j)))) edge.push([x, y]);
  }
  return { g, edge };
});
export function drawTree(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 71 + y * 313), crown = TREE_CROWNS[Math.floor(R() * 3)], flip = R() < 0.5;
  const col = { L: p.trl, l: p.tr, k: p.trd }, line = tone(p.trd, 0.55);
  r(g, X + 2, Y + 13, 12, 2, 'rgba(0,0,0,.18)'); r(g, X + 4, Y + 14, 8, 1, 'rgba(0,0,0,.12)');
  r(g, X + 6, Y + 9, 4, 6, '#3f2a18'); r(g, X + 7, Y + 9, 2, 6, '#6b4a2b'); r(g, X + 7, Y + 9, 1, 6, '#8a6440');
  r(g, X + 5, Y + 14, 6, 1, '#3f2a18'); r(g, X + 6, Y + 14, 4, 1, '#6b4a2b'); r(g, X + 8, Y + 12, 1, 1, '#4e3420');
  for (const [cx, cy] of crown.edge) r(g, X + (flip ? 15 - cx : cx), Y + cy, 1, 1, line);
  for (const [cx, cy, v] of crown.g) r(g, X + (flip ? 15 - cx : cx), Y + cy, 1, 1, col[v]);
  r(g, X + 3, Y + 11, 10, 1, 'rgba(0,0,0,.18)');
  if (p.snow) for (const [cx, cy, v] of crown.g) if (v === 'L' && cy < 8) r(g, X + (flip ? 15 - cx : cx), Y + cy, 1, 1, cy < 3 || (cx + cy) % 3 ? SNOW : '#d6e2ea');
}

export function drawWater(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 17 + y * 29);
  r(g, X, Y, T, T, p.water);
  for (let i = 0; i < 2; i++) r(g, X + 2 + (R() * 9 | 0), Y + 3 + (R() * 10 | 0), 4, 1, p.ripple);
}

// v204: a boulder, lit from the top left, with a crack, a few chips and a shadow on the ground; snow on its top.
export function drawRock(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.22)');
  r(g, X + 3, Y + 4, 10, 1, '#4a4743'); r(g, X + 2, Y + 5, 12, 9, '#4a4743'); r(g, X + 1, Y + 7, 14, 6, '#4a4743');
  r(g, X + 3, Y + 5, 10, 8, '#8d8a85'); r(g, X + 2, Y + 7, 12, 5, '#8d8a85');
  r(g, X + 3, Y + 5, 6, 2, '#b4b0aa'); r(g, X + 2, Y + 7, 3, 2, '#a5a29c'); r(g, X + 4, Y + 5, 2, 1, '#d0ccc4');
  r(g, X + 10, Y + 9, 4, 3, '#77746e'); r(g, X + 3, Y + 12, 10, 1, '#6f6c68');
  r(g, X + 8, Y + 6, 1, 2, '#5f5c57'); r(g, X + 9, Y + 8, 1, 2, '#5f5c57'); r(g, X + 6, Y + 10, 1, 1, '#5f5c57');
  if (p.snow) { r(g, X + 3, Y + 4, 9, 2, SNOW); r(g, X + 2, Y + 6, 4, 1, SNOW); }
}

function house(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 47, 78, 1, 'rgba(0,0,0,.25)');
  boardWall(g, X + 2, Y + 21, 76, 27, '#e8d4a8');
  chimneyArt(g, X + 58, Y - 2, 7, 9, p.snow);
  roofGable(g, 40 + X, Y + 2, 60, 19, '#a5432f', p.snow);
  [X + 8, X + 60].forEach((wx) => windowArt(g, wx, Y + 29, 12, 10, '#f2ead6', true));
  doorArt(g, X + 34, Y + 30, 12, 17, '#7a4b2a');
  r(g, X + 31, Y + 27, 18, 2, '#7a4e2c'); r(g, X + 31, Y + 27, 18, 1, '#9a6a3c');   // a little porch hood
  r(g, X + 22, Y + 33, 2, 3, '#3f2f22'); r(g, X + 21, Y + 36, 4, 1, '#e9b44c');     // a lamp by the door
  r(g, X + 30, Y + 47, 20, 1, '#8f7a5a');
}

function bin(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.25)');
  // A slatted crate with iron corners and a hinged lid, a brass latch and a little ledger of the day's goods.
  r(g, X, Y + 5, 16, 10, '#3f2a18'); r(g, X + 1, Y + 5, 14, 9, '#8a5a32');
  for (let j = Y + 7; j < Y + 14; j += 3) { r(g, X + 1, j, 14, 1, '#6e4626'); r(g, X + 1, j + 1, 14, 1, '#a06c3e'); }
  [X + 1, X + 13].forEach((cx) => { r(g, cx, Y + 5, 2, 9, '#6f747a'); r(g, cx, Y + 5, 1, 9, '#9aa0a6'); });
  r(g, X, Y + 1, 16, 5, '#3f2a18'); r(g, X + 1, Y + 2, 14, 3, '#6e4626'); r(g, X + 1, Y + 2, 14, 1, '#a5753f');
  r(g, X + 7, Y + 4, 2, 2, '#e9b44c'); r(g, X + 7, Y + 4, 1, 1, '#fff0a0');
  r(g, X + 10, Y + 8, 3, 4, '#f4ead2'); r(g, X + 10, Y + 9, 3, 1, '#c9b48a'); r(g, X + 10, Y + 11, 2, 1, '#c9b48a');
  if (p.snow) { r(g, X, Y, 16, 2, SNOW); r(g, X + 2, Y + 2, 1, 1, SNOW); r(g, X + 12, Y + 2, 1, 1, SNOW); }
}

function well(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.25)');
  // Posts and a little shingled roof, a crank and a bucket on its rope, over a ring of fitted stones.
  [X + 2, X + 12].forEach((px) => { r(g, px, Y + 2, 2, 7, '#6b4a2b'); r(g, px, Y + 2, 1, 7, '#8a6440'); });
  r(g, X - 1, Y, 18, 3, '#5e2419'); r(g, X, Y, 16, 2, '#a5432f'); r(g, X + 1, Y, 14, 1, '#c55a44');
  for (let x = X + 2; x < X + 15; x += 3) r(g, x, Y + 1, 1, 1, '#7d3123');
  if (p.snow) r(g, X - 1, Y - 1, 18, 2, SNOW);
  r(g, X + 3, Y + 3, 10, 1, '#5a3a24'); r(g, X + 13, Y + 3, 2, 1, '#8a8f96'); r(g, X + 14, Y + 4, 1, 2, '#8a8f96');
  r(g, X + 8, Y + 4, 1, 3, '#d9c27a'); r(g, X + 6, Y + 6, 5, 3, '#3f2a18'); r(g, X + 7, Y + 6, 3, 2, '#8a5a32'); r(g, X + 7, Y + 7, 3, 1, '#6f747a');
  r(g, X + 1, Y + 9, 14, 7, '#6f6c66'); r(g, X + 2, Y + 9, 12, 2, '#2f4a60'); r(g, X + 3, Y + 9, 4, 1, p.snow ? '#e6f0f6' : '#69aedb');
  for (let j = 0; j < 2; j++) for (let x = X + 1 + (j ? 3 : 0); x < X + 15; x += 5) { const y = Y + 11 + j * 2; r(g, x, y, 4, 2, '#a39f97'); r(g, x, y, 4, 1, '#c2beb4'); }
  r(g, X + 1, Y + 15, 14, 1, '#57534e');
}

function shop(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  // The seed stall: plank back wall, a carved sign with a sprout, a striped scalloped awning, crates of produce on a counter.
  r(g, X + 2, Y + 4, 44, 32, '#b08d55');
  for (let i = 0; i < 5; i++) { r(g, X + 2 + i * 9, Y + 4, 1, 32, '#987745'); r(g, X + 3 + i * 9, Y + 4, 1, 32, '#c4a46c'); }
  [X + 1, X + 45].forEach((px) => { r(g, px, Y + 4, 2, 32, '#6e4626'); r(g, px, Y + 4, 1, 32, '#8a5a32'); });
  r(g, X + 11, Y - 1, 26, 10, '#3f2a18'); r(g, X + 12, Y, 24, 8, '#6e4626'); r(g, X + 12, Y, 24, 1, '#8a5a32'); r(g, X + 12, Y + 7, 24, 1, '#5a3a20');
  r(g, X + 23, Y + 2, 2, 4, '#86b86a'); r(g, X + 21, Y + 2, 2, 2, '#a6d07a'); r(g, X + 25, Y + 3, 2, 2, '#86b86a'); r(g, X + 23, Y + 6, 2, 1, '#8a5a32');
  for (let i = 0; i < 6; i++) {
    const c = i % 2 ? '#f4ead2' : '#c0443a', d = i % 2 ? '#d6ccb4' : '#962f28';
    r(g, X + i * 8, Y + 11, 8, 10, c); r(g, X + i * 8, Y + 11, 8, 1, i % 2 ? '#fffaf0' : '#d8605a'); r(g, X + i * 8, Y + 18, 8, 3, d);
    r(g, X + i * 8 + 1, Y + 21, 6, 1, c); r(g, X + i * 8 + 2, Y + 22, 4, 1, c); r(g, X + i * 8 + 3, Y + 23, 2, 1, d);
  }
  r(g, X, Y + 10, 48, 1, '#5a3a20');
  if (p.snow) { r(g, X, Y + 9, 48, 2, SNOW); r(g, X + 11, Y - 2, 26, 2, SNOW); }
  r(g, X + 2, Y + 34, 44, 14, '#8a5a32'); r(g, X, Y + 32, 48, 3, '#6e4626'); r(g, X, Y + 32, 48, 1, '#a5753f'); r(g, X + 2, Y + 40, 44, 1, '#6e4626');
  for (let i = X + 5; i < X + 44; i += 8) r(g, i, Y + 35, 1, 13, '#6e4626');
  r(g, X + 2, Y + 47, 44, 1, '#3f2a18');
  [['#efe6f2', 6], ['#d8484a', 16], ['#7fbf5a', 26], ['#e8862a', 36]].forEach(([c, off]) => {
    r(g, X + off - 1, Y + 25, 9, 7, '#6e4626'); r(g, X + off, Y + 26, 7, 5, '#e2cda0'); r(g, X + off, Y + 28, 7, 1, '#c9b083');
    r(g, X + off + 1, Y + 26, 5, 2, c); r(g, X + off + 1, Y + 26, 1, 1, '#ffffff'); r(g, X + off + 3, Y + 25, 1, 1, '#5da34a');
  });
}

function workbench(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.25)');
  r(g, X - 1, Y + 5, 18, 5, '#3f2a18'); r(g, X, Y + 6, 16, 3, '#a5753f'); r(g, X, Y + 6, 16, 1, '#c99a5e'); r(g, X, Y + 8, 16, 1, '#6e4626');
  [X + 1, X + 13].forEach((lx) => { r(g, lx, Y + 9, 2, 6, '#6e4626'); r(g, lx, Y + 9, 1, 6, '#8a5a32'); });
  r(g, X + 3, Y + 12, 10, 1, '#6e4626'); r(g, X + 4, Y + 11, 3, 1, '#c9a06a'); r(g, X + 8, Y + 11, 3, 1, '#a9b4bd');   // a shelf with offcuts and a file
  r(g, X + 1, Y + 4, 7, 2, '#a9b4bd'); r(g, X + 1, Y + 4, 7, 1, '#d6dde3'); r(g, X + 8, Y + 4, 2, 2, '#8a5a32');      // a saw
  for (let i = 0; i < 3; i++) r(g, X + 2 + i * 2, Y + 6, 1, 1, '#7f8a93');
  r(g, X + 11, Y + 1, 1, 5, '#8a5a32'); r(g, X + 10, Y + 1, 3, 2, '#7f8a93'); r(g, X + 10, Y + 1, 3, 1, '#a9b4bd');   // a hammer
  r(g, X + 13, Y + 4, 2, 2, '#e8d9b5');
  if (p.snow) r(g, X, Y + 5, 16, 1, SNOW);
}

// v202: walls of upright planks (barns, sheds, the coop): a lit and a shaded edge on each plank, a top rail under the
// eaves' shadow and a stone footing.
function plankWall(g, x, y, w, h, col, step) {
  step = step || 5;
  r(g, x, y, w, h, col);
  for (let i = x; i < x + w; i += step) { r(g, i, y, 1, h, tone(col, 0.72)); r(g, i + 1, y, 1, h, tone(col, 1.1)); }
  for (let i = x + 3; i < x + w; i += step * 2) r(g, i, y + Math.floor(h / 2), 1, 1, tone(col, 0.6));
  r(g, x, y, w, 2, tone(col, 0.6)); r(g, x, y + 2, w, 1, tone(col, 0.8));
  r(g, x, y, 1, h, tone(col, 0.75)); r(g, x + w - 1, y, 1, h, tone(col, 0.55));
  r(g, x, y + h - 2, w, 2, '#8d877e'); r(g, x, y + h - 1, w, 1, '#6f6a62');
  for (let i = x + 2; i < x + w - 1; i += 5) r(g, i, y + h - 2, 1, 1, '#6f6a62');
}
// A barn-style door: a dark frame, plank leaves with a white X brace and trim.
function braceDoor(g, x, y, w, h, col, trim) {
  r(g, x - 1, y - 1, w + 2, h + 1, '#2f241a'); r(g, x, y, w, h, col);
  for (let i = x + 2; i < x + w; i += 3) r(g, i, y, 1, h, tone(col, 0.75));
  const mid = x + Math.floor(w / 2);
  // One X per leaf, drawn as unbroken diagonals from corner to corner.
  [[x, mid - 1], [mid + 1, x + w - 1]].forEach(([a, b]) => {
    const lw = b - a, n = Math.max(lw, h - 1);
    for (let t = 0; t <= n; t++) {
      const dx = Math.round(t * lw / n), dy = Math.round(t * (h - 1) / n);
      r(g, a + dx, y + dy, 1, 1, trim); r(g, b - dx, y + dy, 1, 1, trim);
    }
  });
  r(g, x, y, w, 1, trim); r(g, x, y + h - 1, w, 1, trim); r(g, x, y, 1, h, trim); r(g, x + w - 1, y, 1, h, trim); r(g, mid - 1, y, 2, h, trim);
  r(g, x - 2, y + h, w + 4, 1, '#a8a196');
}
function coop(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 44, 1, 'rgba(0,0,0,.25)');
  plankWall(g, X + 3, Y + 12, 42, 19, '#b5452f', 4);
  roofGable(g, X + 24, Y, 24, 11, '#6b5a48', p.snow);
  r(g, X + 3, Y + 13, 1, 18, '#f4ead2'); r(g, X + 44, Y + 13, 1, 18, '#f4ead2');
  braceDoor(g, X + 19, Y + 18, 10, 12, '#5c371e', '#f4ead2');
  r(g, X + 22, Y + 14, 4, 3, '#2f241a'); r(g, X + 23, Y + 15, 2, 2, '#e9c46a');          // a little round vent
  [X + 7, X + 34].forEach((wx) => windowArt(g, wx, Y + 16, 7, 6, '#f4ead2'));
  for (let i = 0; i < 4; i++) r(g, X + 12 + i * 2, Y + 30 - i, 2, 1, '#a5753f');         // the hens' ramp
  r(g, X + 36, Y + 28, 3, 2, '#f4ead2'); r(g, X + 39, Y + 29, 2, 1, '#e9b44c');          // a stray feather and seed
}

function cave(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  // A rocky face of stacked boulders, lit from the top left, round a timbered mine mouth.
  r(g, X + 2, Y + 4, 44, 28, '#6f6862'); r(g, X + 6, Y, 36, 4, '#6f6862'); r(g, X, Y + 10, 48, 22, '#6f6862');
  [[2, 10, 10, 8], [8, 2, 12, 7], [20, 0, 10, 5], [30, 2, 12, 8], [38, 10, 10, 9], [0, 20, 9, 10], [40, 20, 8, 10]].forEach(([a, b, w, hh]) => {
    r(g, X + a, Y + b, w, hh, '#7d766f'); r(g, X + a, Y + b, w, 1, '#9a928a'); r(g, X + a, Y + b, 1, hh, '#8c847c'); r(g, X + a, Y + b + hh - 1, w, 1, '#57514c');
  });
  r(g, X + 16, Y + 8, 16, 2, '#120e0c'); r(g, X + 14, Y + 10, 20, 2, '#120e0c'); r(g, X + 12, Y + 12, 24, 20, '#120e0c');
  r(g, X + 13, Y + 13, 22, 3, '#1f1814');
  const beam = (x, y, w, hh) => { r(g, x, y, w, hh, '#6b4a2b'); r(g, x, y, 1, hh, '#8a6440'); r(g, x + w - 1, y, 1, hh, '#4e3420'); };
  beam(X + 11, Y + 10, 2, 22); beam(X + 35, Y + 10, 2, 22);
  r(g, X + 10, Y + 9, 28, 2, '#7a5634'); r(g, X + 10, Y + 9, 28, 1, '#9a7650');
  r(g, X + 14, Y + 12, 2, 2, '#e9b44c'); r(g, X + 14, Y + 14, 1, 2, '#3f2f22');                // a lantern
  r(g, X + 16, Y + 30, 16, 1, '#4e3420'); r(g, X + 18, Y + 28, 1, 3, '#4e3420'); r(g, X + 29, Y + 28, 1, 3, '#4e3420');   // rails
  if (p.snow) { r(g, X + 6, Y, 36, 2, SNOW); r(g, X + 2, Y + 4, 8, 1, SNOW); r(g, X + 38, Y + 4, 8, 1, SNOW); r(g, X + 10, Y + 8, 28, 1, SNOW); r(g, X, Y + 10, 3, 1, SNOW); r(g, X + 45, Y + 10, 3, 1, SNOW); }
}

function barn(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 60, 1, 'rgba(0,0,0,.25)');
  plankWall(g, X + 3, Y + 12, 58, 19, '#9a3a27', 5);
  roofGable(g, X + 32, Y, 28, 11, '#5a4a3a', p.snow);
  r(g, X + 3, Y + 12, 1, 19, '#f4ead2'); r(g, X + 60, Y + 12, 1, 19, '#f4ead2');
  // The hayloft door, half open on hay.
  r(g, X + 25, Y + 2, 14, 8, '#2f241a'); r(g, X + 26, Y + 3, 12, 6, '#f4ead2'); r(g, X + 27, Y + 4, 10, 5, '#3f3226');
  r(g, X + 27, Y + 6, 10, 3, '#e2c46a'); r(g, X + 28, Y + 5, 3, 1, '#f2dc8a'); r(g, X + 31, Y + 3, 2, 6, '#f4ead2');
  r(g, X + 31, Y, 2, 2, '#6b5a48'); r(g, X + 32, Y + 1, 1, 2, '#c9c2b4');                 // the pulley
  braceDoor(g, X + 22, Y + 16, 20, 14, '#5c371e', '#f4ead2');
  [X + 7, X + 50].forEach((wx) => { windowArt(g, wx, Y + 17, 7, 6, '#f4ead2'); });
  r(g, X + 5, Y + 27, 6, 3, '#e2c46a'); r(g, X + 5, Y + 27, 6, 1, '#f2dc8a'); r(g, X + 6, Y + 28, 4, 1, '#c9a84a');   // a hay bale
}

function cottage(g, p, o) {
  const X = o.x * T, Y = o.y * T, roof = o.roof || '#a5432f';
  r(g, X + 2, Y + 31, 44, 1, 'rgba(0,0,0,.25)');
  boardWall(g, X + 4, Y + 13, 40, 18, '#e8d4a8');
  chimneyArt(g, X + 34, Y - 3, 5, 7, p.snow);
  roofGable(g, X + 24, Y, 24, 12, roof, p.snow);
  doorArt(g, X + 19, Y + 19, 10, 11, '#7a4b2a');
  [X + 7, X + 33].forEach((wx) => windowArt(g, wx, Y + 18, 8, 6, '#f2ead6', true));
}

function board(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 4, Y + 15, 24, 1, 'rgba(0,0,0,.25)');
  [X + 5, X + 25].forEach((px) => { r(g, px, Y + 8, 2, 8, '#6b4a2b'); r(g, px, Y + 8, 1, 8, '#8a6440'); });
  r(g, X + 1, Y - 1, 30, 13, '#3f2a18'); r(g, X + 2, Y, 28, 11, '#8a5a32'); r(g, X + 3, Y + 1, 26, 9, '#c4a26a');
  for (let j = Y + 3; j < Y + 10; j += 3) r(g, X + 3, j, 26, 1, '#b08d55');
  r(g, X + 2, Y, 28, 1, '#a5753f'); r(g, X + 1, Y - 2, 30, 2, '#6e4626'); r(g, X + 1, Y - 2, 30, 1, '#94673d');   // a little roof
  [[5, 2, '#f4ead2'], [12, 3, '#e8d9b5'], [19, 2, '#f4ead2'], [24, 4, '#e8d9b5']].forEach(([a, b, c]) => {
    r(g, X + a, Y + b + 1, 5, 5, 'rgba(0,0,0,.18)'); r(g, X + a, Y + b, 5, 5, c);
    r(g, X + a + 1, Y + b + 2, 3, 1, '#a89a7a'); r(g, X + a + 1, Y + b + 3, 2, 1, '#a89a7a'); r(g, X + a + 2, Y + b, 1, 1, '#d8484a');
  });
  if (p.snow) r(g, X + 1, Y - 3, 30, 2, SNOW);
}

function fountain(g, p, o) {
  const X = o.x * T, Y = o.y * T, water = p.snow ? '#cfe3ee' : p.water, hi = p.snow ? '#ffffff' : p.ripple;
  r(g, X + 1, Y + 30, 30, 1, 'rgba(0,0,0,.25)');
  // A basin of dressed stone with a lit rim, water with ripples, a two-tier column and a spout.
  r(g, X, Y + 5, 32, 26, '#5f5c57'); r(g, X + 1, Y + 6, 30, 24, '#9a958e');
  for (let x = X + 1; x < X + 31; x += 6) r(g, x, Y + 24, 1, 6, '#7f7a74');
  r(g, X + 1, Y + 24, 30, 1, '#7f7a74');
  r(g, X + 1, Y + 4, 30, 3, '#b4b0aa'); r(g, X + 2, Y + 4, 28, 1, '#d4d0c8'); r(g, X + 1, Y + 29, 30, 2, '#6f6c68');
  r(g, X + 4, Y + 8, 24, 15, water); r(g, X + 4, Y + 8, 24, 2, 'rgba(0,0,0,.18)');
  r(g, X + 7, Y + 12, 6, 1, hi); r(g, X + 18, Y + 19, 6, 1, hi); r(g, X + 6, Y + 17, 3, 1, hi); r(g, X + 22, Y + 13, 4, 1, hi);
  r(g, X + 13, Y + 3, 6, 16, '#6f6c68'); r(g, X + 14, Y + 2, 4, 16, '#b4b0aa'); r(g, X + 14, Y + 2, 1, 16, '#d4d0c8');
  r(g, X + 11, Y + 9, 10, 2, '#9a958e'); r(g, X + 11, Y + 9, 10, 1, '#c9c5be');
  r(g, X + 12, Y, 8, 3, '#c9c5be'); r(g, X + 12, Y, 8, 1, '#e4e0d8');
  if (!p.snow) { r(g, X + 15, Y - 2, 2, 2, '#bfe6f6'); r(g, X + 12, Y + 3, 1, 5, 'rgba(191,230,246,.8)'); r(g, X + 19, Y + 3, 1, 5, 'rgba(191,230,246,.8)'); r(g, X + 10, Y + 11, 1, 6, 'rgba(191,230,246,.7)'); r(g, X + 21, Y + 11, 1, 6, 'rgba(191,230,246,.7)'); }
  else { r(g, X + 12, Y - 1, 8, 1, SNOW); r(g, X + 1, Y + 3, 30, 1, SNOW); r(g, X + 11, Y + 8, 10, 1, SNOW); }
}

function table(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 30, 1, 'rgba(0,0,0,.25)');
  [X + 3, X + 27].forEach((lx) => { r(g, lx, Y + 9, 2, 6, '#6e4626'); r(g, lx, Y + 9, 1, 6, '#8a5a32'); });
  r(g, X + 5, Y + 12, 22, 1, '#6e4626');
  r(g, X - 1, Y + 4, 34, 7, '#3f2a18'); r(g, X, Y + 5, 32, 5, '#94673d'); r(g, X, Y + 5, 32, 1, '#b08250'); r(g, X, Y + 9, 32, 1, '#6e4626');
  for (let i = X + 8; i < X + 32; i += 8) r(g, i, Y + 5, 1, 4, '#7a5432');
  if (p.snow) r(g, X - 1, Y + 3, 34, 2, SNOW);
}

function greenhouse(g, p, o) {
  const X = o.x * T, Y = o.y * T, glass = '#bfe0ec', frame = '#5a4a3a';
  r(g, X + 2, Y + 31, 60, 1, 'rgba(0,0,0,.25)');
  // Glass walls: panes lighter at the top, a reflection streak per pane, plants showing through.
  r(g, X + 2, Y + 10, 60, 21, glass); r(g, X + 2, Y + 21, 60, 10, '#a6d2e2');
  [[6, 23], [10, 22], [40, 22], [46, 24], [52, 23], [56, 22]].forEach(([a, b]) => { r(g, X + a, Y + b, 3, 31 - b - 2, '#4f9440'); r(g, X + a - 1, Y + b, 5, 2, '#86c86a'); r(g, X + a, Y + b - 1, 2, 1, '#e2707a'); });
  for (let i = 0; i < 5; i++) { const px = X + 3 + i * 12; r(g, px + 2, Y + 12, 1, 4, '#eef8fc'); r(g, px + 3, Y + 12, 1, 2, '#eef8fc'); r(g, px + 4, Y + 23, 1, 3, '#d8eef6'); }
  for (let i = 0; i < 6; i++) { r(g, X + 2 + i * 12, Y + 10, 2, 21, frame); r(g, X + 2 + i * 12, Y + 10, 1, 21, tone(frame, 1.3)); }
  r(g, X + 2, Y + 20, 60, 1, frame); r(g, X + 2, Y + 28, 60, 3, '#8d877e'); r(g, X + 2, Y + 30, 60, 1, '#6f6a62');
  // The glass roof: frames on every third row, lit glass between.
  for (let j = 0; j < 10; j++) {
    const x0 = X + 12 - j, w = 40 + 2 * j;
    r(g, x0, Y + j, w, 1, j % 3 === 0 ? frame : j % 3 === 1 ? '#e2f2f8' : '#a6d2e2');
    if (j % 3) for (let x = x0 + 4; x < x0 + w; x += 8) r(g, x, Y + j, 1, 1, frame);
  }
  r(g, X + 2, Y + 9, 60, 2, '#3f3226');
  if (p.snow) { for (let j = 0; j < 2; j++) r(g, X + 12 - j, Y + j, 40 + 2 * j, 1, SNOW); r(g, X + 2, Y + 9, 60, 1, SNOW); }
  doorArt(g, X + 18, Y + 18, 12, 12, '#7a4b2a');
  r(g, X + 19, Y + 19, 10, 4, '#bfe0ec'); r(g, X + 20, Y + 19, 2, 2, '#eef8fc'); r(g, X + 24, Y + 19, 1, 4, '#5a3a24');
}

function trough(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.25)');
  r(g, X, Y + 5, 16, 10, '#3f2a18'); r(g, X + 1, Y + 6, 14, 8, '#6e4626'); r(g, X + 1, Y + 6, 14, 1, '#94673d');
  r(g, X + 2, Y + 7, 12, 4, p.snow ? '#cfe3ee' : '#3f7fb0'); r(g, X + 3, Y + 8, 5, 1, p.snow ? '#ffffff' : '#69aedb');
  r(g, X + 1, Y + 11, 14, 1, '#5a3a20'); [X + 4, X + 11].forEach((bx) => r(g, bx, Y + 6, 1, 8, '#6f747a'));
  r(g, X + 1, Y + 14, 14, 1, '#4e331f');
}

function stable(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 31, 30, 1, 'rgba(0,0,0,.25)');
  plankWall(g, X + 2, Y + 12, 28, 19, '#8a5a32', 4);
  roofGable(g, X + 16, Y + 2, 12, 9, '#7a4a2a', p.snow);
  // A half door: the top open on the dark stall, a horseshoe over it.
  r(g, X + 8, Y + 17, 16, 14, '#2f241a'); r(g, X + 9, Y + 18, 14, 6, '#1f1812');
  r(g, X + 10, Y + 22, 12, 1, '#3f2f22'); r(g, X + 12, Y + 19, 8, 1, '#c9a06a'); r(g, X + 13, Y + 20, 6, 2, '#e2c46a');   // a hay rack in the dark stall
  braceDoor(g, X + 9, Y + 24, 14, 6, '#6e4626', '#c9a06a');
  r(g, X + 14, Y + 14, 4, 1, '#c9c2b4'); r(g, X + 14, Y + 14, 1, 2, '#c9c2b4'); r(g, X + 17, Y + 14, 1, 2, '#c9c2b4');
  r(g, X + 3, Y + 26, 4, 4, '#e2c46a'); r(g, X + 3, Y + 26, 4, 1, '#f2dc8a');               // hay
}

// The pet's water bowl: a tile, so it is drawn with the map (the water in it is drawn by systems/pets.js).
export function drawBowl(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X + 3, Y + 12, 10, 1, 'rgba(0,0,0,.25)'); r(g, X + 3, Y + 8, 10, 4, '#b5452f'); r(g, X + 4, Y + 7, 8, 1, '#d9644a'); r(g, X + 5, Y + 8, 6, 2, '#3f3226');
}

// v30: buildings the player places (systems/sites.js). o.w and o.h are the footprint in tiles.
function shed(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 44, 1, 'rgba(0,0,0,.25)');
  plankWall(g, X + 3, Y + 12, 42, 19, '#a5753f', 6);
  roofGable(g, X + 24, Y + 1, 22, 10, '#5f6870', p.snow);
  braceDoor(g, X + 18, Y + 18, 12, 12, '#5c371e', '#c9a06a');
  [X + 6, X + 35].forEach((wx) => windowArt(g, wx, Y + 16, 7, 6, '#d9c6a0'));
  r(g, X + 40, Y + 22, 1, 8, '#6b4a2b'); r(g, X + 39, Y + 21, 3, 2, '#a9b4bd');             // a spade leaning by the wall
}
// v160: the mere's boathouse, 3 x 2: plank walls, a slate roof, wide doors onto the water (shut).
function boathouse(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 44, 1, 'rgba(0,0,0,.25)');
  plankWall(g, X + 3, Y + 12, 42, 19, '#7a5a3a', 6);
  roofGable(g, X + 24, Y + 1, 22, 10, '#4a5a66', p.snow);
  braceDoor(g, X + 30, Y + 16, 12, 14, '#3f2c1c', '#8a6a4a');                               // the boat doors, toward the dock
  r(g, X + 7, Y + 16, 14, 6, '#2f241a'); r(g, X + 8, Y + 17, 12, 4, '#3f6b8a'); r(g, X + 8, Y + 17, 12, 1, '#5f8fb5');   // the sign
  r(g, X + 10, Y + 19, 8, 1, '#e8d9b5'); r(g, X + 17, Y + 18, 2, 3, '#e8d9b5');             // an oar on it
  for (let i = 0; i < 3; i++) r(g, X + 6 + i * 3, Y + 26, 2, 4, i % 2 ? '#c9b48a' : '#e8d9b5');   // a coil of rope
}
function mill(g, p, o) {
  const X = o.x * T, Y = o.y * T, a = 0.4;
  r(g, X + 1, Y + 31, 30, 1, 'rgba(0,0,0,.25)');
  // A tapering stone tower, lit on the left.
  for (let j = 0; j < 21; j++) {
    const k = Math.floor(j / 7), x0 = X + 7 - k, w = 18 + 2 * k;
    r(g, x0, Y + 10 + j, w, 1, '#d9caa6'); r(g, x0, Y + 10 + j, 3, 1, '#ece0c2'); r(g, x0 + w - 3, Y + 10 + j, 3, 1, '#b8a888');
    if (j % 4 === 3) for (let x = x0 + (j % 8 === 3 ? 1 : 4); x < x0 + w; x += 6) r(g, x, Y + 10 + j, 3, 1, '#c4b694');
  }
  roofGable(g, X + 16, Y + 4, 8, 5, '#8a3a2a', p.snow);
  doorArt(g, X + 13, Y + 22, 6, 8, '#6e4626');
  windowArt(g, X + 14, Y + 14, 4, 4, '#ece0c2');
  for (let k = 0; k < 4; k++) {   // sails: a dark spar with one panel of cloth beside it, ribbed every third pixel
    const ang = a + k * Math.PI / 2, c = Math.cos(ang), sn = Math.sin(ang);
    for (let i = 2; i < 13; i++) {
      const x = X + 16 + Math.round(c * i), y = Y + 9 + Math.round(sn * i);
      if (i > 3) for (let d = 1; d <= 3; d++) r(g, x + Math.round(-sn * d), y + Math.round(c * d), 1, 1, i % 3 === 0 || d === 3 ? '#c9b48a' : '#f4ead2');
    }
    for (let i = 2; i < 13; i++) r(g, X + 16 + Math.round(c * i), Y + 9 + Math.round(sn * i), 1, 1, '#6e4626');
  }
  r(g, X + 15, Y + 8, 3, 3, '#5c371e'); r(g, X + 15, Y + 8, 1, 1, '#8a5a32');
}
function clocktower(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 3, Y + 31, 26, 1, 'rgba(0,0,0,.25)');
  r(g, X + 8, Y + 4, 16, 27, '#e9c46a'); r(g, X + 8, Y + 4, 3, 27, '#f6dc8a'); r(g, X + 21, Y + 4, 3, 27, '#c9a43a');
  for (let j = Y + 8; j < Y + 29; j += 4) r(g, X + 8, j, 16, 1, '#d6b058');
  r(g, X + 7, Y + 4, 18, 2, '#c9a43a'); r(g, X + 7, Y + 21, 18, 1, '#c9a43a');
  r(g, X + 7, Y + 29, 18, 2, '#8d877e'); r(g, X + 7, Y + 30, 18, 1, '#6f6a62');
  roofGable(g, X + 16, Y - 4, 2, 7, '#b5452f', p.snow);
  r(g, X + 15, Y - 7, 2, 3, '#c9a43a'); r(g, X + 15, Y - 8, 2, 1, '#f6dc8a');               // the finial
  // The clock face: a round dial with hour marks and hands.
  r(g, X + 11, Y + 8, 10, 12, '#3f2f22'); r(g, X + 10, Y + 9, 12, 10, '#3f2f22');
  r(g, X + 11, Y + 9, 10, 10, '#fffbe8'); r(g, X + 12, Y + 9, 8, 1, '#fff'); 
  [[16, 10], [16, 17], [12, 13], [20, 13]].forEach(([a, b]) => r(g, X + a - (a === 16 ? 0 : 0), Y + b, 1, 1, '#8a6a3a'));
  r(g, X + 16, Y + 11, 1, 3, '#2b211a'); r(g, X + 16, Y + 14, 3, 1, '#2b211a');
  doorArt(g, X + 13, Y + 23, 6, 6, '#8a5a32');
}
// v31: the fish pond (stone rim, water) and the slime pen (fence, trough). What lives there is drawn by sprites.js.
function pond(g, p, o) {
  const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
  // A rim of fitted stones, lit on top, around the water.
  r(g, X + 1, Y + 2, w - 2, h - 3, '#8d8a84');
  for (let x = X + 1; x < X + w - 1; x += 6) for (const yy of [Y + 2, Y + h - 5]) { r(g, x, yy, 5, 3, '#a39f97'); r(g, x, yy, 5, 1, '#c2beb4'); r(g, x + 5, yy, 1, 3, '#6f6c66'); }
  for (let y = Y + 5; y < Y + h - 5; y += 6) for (const xx of [X + 1, X + w - 4]) { r(g, xx, y, 3, 5, '#a39f97'); r(g, xx, y, 3, 1, '#c2beb4'); r(g, xx, y + 5, 3, 1, '#6f6c66'); }
  const water = p.snow ? '#bcd4e6' : p.water;
  r(g, X + 4, Y + 5, w - 8, h - 10, water); r(g, X + 4, Y + 5, w - 8, 2, 'rgba(0,0,0,.18)'); r(g, X + 4, Y + 7, 2, h - 12, 'rgba(0,0,0,.1)');
  for (let i = 0; i < 3; i++) r(g, X + 8 + i * 12, Y + 14 + (i % 2) * 10, 6, 1, p.snow ? '#e6f0f6' : p.ripple);
  if (!p.snow) { r(g, X + w - 14, Y + h - 14, 5, 3, '#4f9440'); r(g, X + w - 13, Y + h - 15, 3, 1, '#86c86a'); r(g, X + w - 12, Y + h - 14, 1, 1, '#f4ead2'); }   // a lily pad
  else r(g, X + 6, Y + 8, 8, 1, '#ffffff');
}
function slimepen(g, p, o) {
  const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
  r(g, X + 1, Y + 3, w - 2, h - 4, p.snow ? '#e6e2d6' : '#7a8f5a');
  if (!p.snow) for (let i = 0; i < 14; i++) r(g, X + 6 + (i * 37) % (w - 12), Y + 10 + (i * 23) % (h - 20), 1, 2, i % 2 ? '#8faa6a' : '#647a48');
  const post = (x, y, hh) => { r(g, x, y, 2, hh, '#8a5a32'); r(g, x, y, 1, hh, '#a5753f'); r(g, x, y, 2, 1, '#c99a5e'); };
  for (let x = X + 1; x < X + w - 1; x += 6) { post(x, Y + 2, 6); post(x, Y + h - 7, 6); }
  for (let y = Y + 2; y < Y + h - 3; y += 6) { post(X + 1, y, 6); post(X + w - 3, y, 6); }
  [Y + 4, Y + h - 5].forEach((yy) => { r(g, X + 1, yy, w - 2, 1, '#a5753f'); r(g, X + 1, yy + 1, w - 2, 1, '#6e4626'); });
  [X + 1, X + w - 3].forEach((xx) => r(g, xx, Y + 2, 2, h - 3, 'rgba(110,70,38,.6)'));
  r(g, X + 5, Y + h - 15, 18, 8, '#3f2c1c'); r(g, X + 6, Y + h - 14, 16, 6, '#6e4626'); r(g, X + 7, Y + h - 13, 14, 3, '#5d7a90'); r(g, X + 8, Y + h - 13, 5, 1, '#8fb0c4');   // the trough
}
// v32: the helper hut (a round thatched hut) and a waystone (a tall carved stone).
function helperhut(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 28, 1, 'rgba(0,0,0,.25)');
  // Wattle walls, then a domed thatch in layers, each with straw ends hanging over the next.
  r(g, X + 5, Y + 16, 22, 15, '#a07a4f');
  for (let j = Y + 18; j < Y + 29; j += 3) for (let x = X + 5 + ((j / 3) % 2 ? 0 : 2); x < X + 27; x += 4) r(g, x, j, 2, 1, '#8a6640');
  r(g, X + 5, Y + 16, 22, 2, '#6e5032'); r(g, X + 5, Y + 29, 22, 2, '#8d877e');
  for (let j = 0; j < 12; j++) {
    const x0 = X + 14 - j, w = 4 + 2 * j;
    r(g, x0, Y + 4 + j, w, 1, j % 3 === 2 ? '#a07a2a' : j % 3 === 0 ? '#d9b65a' : '#c9a24a');
    if (j % 3 === 2) for (let x = x0 + 1; x < x0 + w; x += 2) r(g, x, Y + 5 + j, 1, 1, '#b8913a');
  }
  r(g, X + 15, Y + 2, 2, 3, '#8a6640');
  if (p.snow) { r(g, X + 11, Y + 4, 10, 2, SNOW); r(g, X + 9, Y + 6, 14, 1, SNOW); r(g, X + 8, Y + 9, 2, 1, SNOW); r(g, X + 21, Y + 10, 2, 1, SNOW); }
  r(g, X + 12, Y + 21, 8, 10, '#2f241a'); r(g, X + 13, Y + 22, 6, 9, '#3f3226'); r(g, X + 14, Y + 23, 4, 2, '#7fcf6a'); r(g, X + 15, Y + 23, 1, 1, '#c6f0b0');
}
// v169: the fortune statue, a figure on a plinth with open hands, gilded.
function statue(g, p, o) {
  const X = o.x * T, Y = o.y * T, gold = '#e2b23a', dark = '#a5752a', lite = '#f6d870';
  r(g, X + 2, Y + 31, 12, 1, 'rgba(0,0,0,.25)');
  // A stepped plinth, then a robed figure with open hands, lit from the left.
  r(g, X + 1, Y + 27, 14, 4, '#6f6c66'); r(g, X + 1, Y + 27, 14, 1, '#a39f97');
  r(g, X + 2, Y + 23, 12, 4, '#8d8a84'); r(g, X + 2, Y + 23, 12, 1, '#c2beb4'); r(g, X + 12, Y + 23, 2, 4, '#6f6c66');
  r(g, X + 6, Y + 25, 4, 1, '#c9a43a');
  r(g, X + 5, Y + 2, 6, 6, '#7a5420'); r(g, X + 6, Y + 3, 4, 4, gold); r(g, X + 6, Y + 3, 1, 3, lite); r(g, X + 9, Y + 4, 1, 3, dark);
  r(g, X + 4, Y + 7, 8, 17, '#7a5420'); r(g, X + 5, Y + 8, 6, 15, gold); r(g, X + 5, Y + 8, 1, 15, lite); r(g, X + 10, Y + 8, 1, 15, dark);
  r(g, X + 7, Y + 12, 1, 11, dark); r(g, X + 5, Y + 18, 6, 1, dark);
  r(g, X + 1, Y + 11, 4, 3, '#7a5420'); r(g, X + 2, Y + 12, 3, 1, gold); r(g, X + 11, Y + 11, 4, 3, '#7a5420'); r(g, X + 11, Y + 12, 3, 1, gold);
  r(g, X + 2, Y + 11, 1, 1, lite); r(g, X + 13, Y + 11, 1, 1, lite);
  r(g, X + 7, Y + 4, 1, 1, '#fff2c0'); r(g, X + 6, Y + 9, 1, 2, '#fff2c0');
  if (p.snow) { r(g, X + 5, Y + 1, 6, 1, SNOW); r(g, X + 1, Y + 10, 4, 1, SNOW); r(g, X + 11, Y + 10, 4, 1, SNOW); r(g, X + 1, Y + 26, 14, 1, SNOW); }
}
function waystone(g, p, o) {
  const X = o.x * T, Y = o.y * T, hollow = o.site === 'wayhollow', rune = hollow ? '#b98ae0' : '#69aedb', glow = hollow ? '#e6d4fb' : '#cfeaf8';
  r(g, X + 3, Y + 31, 10, 1, 'rgba(0,0,0,.25)');
  r(g, X + 3, Y + 4, 10, 25, '#3f3c38');
  r(g, X + 4, Y + 4, 8, 25, '#8d8a84'); r(g, X + 5, Y + 2, 6, 2, '#8d8a84'); r(g, X + 4, Y + 3, 8, 1, '#3f3c38');
  r(g, X + 4, Y + 4, 2, 25, '#b5b1a8'); r(g, X + 10, Y + 4, 2, 25, '#6f6c66'); r(g, X + 5, Y + 2, 2, 2, '#c8c4ba');
  [[6, 20], [8, 24], [5, 26]].forEach(([a, b]) => r(g, X + a, Y + b, 2, 1, '#77746d'));          // cracks
  r(g, X + 7, Y + 8, 2, 9, rune); r(g, X + 6, Y + 11, 4, 2, rune); r(g, X + 6, Y + 8, 1, 1, rune); r(g, X + 9, Y + 16, 1, 1, rune); r(g, X + 7, Y + 9, 1, 2, glow);
  if (!p.snow) { r(g, X + 4, Y + 25, 3, 2, '#5f8a4a'); r(g, X + 10, Y + 23, 2, 2, '#5f8a4a'); }     // moss
  else r(g, X + 4, Y + 2, 8, 2, SNOW);
  r(g, X + 2, Y + 28, 12, 3, '#6a6862'); r(g, X + 2, Y + 28, 12, 1, '#8a8780');
}
function scaffold(g, p, o) {
  const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
  r(g, X + 2, Y + h - 4, w - 4, 3, '#a5753f'); r(g, X + 2, Y + h - 4, w - 4, 1, '#c99a5e'); r(g, X + 2, Y + h - 2, w - 4, 1, '#6e4626');
  for (let x = 3; x < w - 2; x += 10) { r(g, X + x, Y + 6, 2, h - 9, '#8a5a32'); r(g, X + x, Y + 6, 1, h - 9, '#a5753f'); }
  [Y + 8, Y + h / 2].forEach((yy) => { r(g, X + 2, yy, w - 4, 2, '#8a5a32'); r(g, X + 2, yy, w - 4, 1, '#a5753f'); });
  for (let x = 3; x + 10 < w - 2; x += 10) for (let i = 0; i < 10; i++) r(g, X + x + i, Y + 10 + Math.round(i * (h / 2 - 10) / 10), 1, 1, '#6e4626');   // cross braces
  r(g, X + 6, Y + h - 10, 8, 6, '#9aa3ab'); r(g, X + 6, Y + h - 10, 8, 1, '#c4ccd2'); r(g, X + 7, Y + h - 8, 6, 1, '#7f8a93');   // stone blocks
  r(g, X + w - 14, Y + h - 9, 8, 5, '#b08a5a'); r(g, X + w - 14, Y + h - 9, 8, 1, '#d0aa7a'); r(g, X + w - 12, Y + h - 7, 1, 3, '#8a6a3a');   // planks
}

// v37: the Wardens' Lodge, a log cabin by the Hollow with crossed blades over the door.
function lodge(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 31, 46, 1, 'rgba(0,0,0,.3)');
  // Log walls: round logs with lit tops and cut ends at the corners.
  r(g, X + 3, Y + 10, 42, 21, '#6e4626');
  for (let j = Y + 10; j < Y + 30; j += 3) {
    r(g, X + 3, j, 42, 1, '#8a5a32'); r(g, X + 3, j + 2, 42, 1, '#4e3018');
    [X + 2, X + 44].forEach((ex) => { r(g, ex, j, 2, 3, '#c99a5e'); r(g, ex, j + 2, 2, 1, '#8a6a3e'); });
  }
  r(g, X + 3, Y + 10, 42, 2, 'rgba(0,0,0,.3)');
  r(g, X + 2, Y + 29, 44, 2, '#7a746c'); r(g, X + 2, Y + 30, 44, 1, '#5f5a52');
  chimneyArt(g, X + 36, Y - 8, 4, 8, p.snow);
  roofGable(g, X + 24, Y - 6, 20, 13, '#4f3a2a', p.snow);
  doorArt(g, X + 19, Y + 17, 10, 13, '#5c371e');
  [X + 6, X + 34].forEach((wx) => { windowArt(g, wx, Y + 17, 8, 6, '#c99a5e'); r(g, wx + 1, Y + 18, 6, 2, '#e9c46a'); r(g, wx + 1, Y + 20, 6, 3, '#d9a441'); r(g, wx + 4, Y + 18, 1, 5, '#c99a5e'); });
  // An antler sign over the door.
  r(g, X + 17, Y + 8, 14, 7, '#3f2f22'); r(g, X + 18, Y + 9, 12, 5, '#a5753f'); r(g, X + 18, Y + 9, 12, 1, '#c99a5e');
  for (let i = 0; i < 5; i++) { r(g, X + 20 + i, Y + 13 - i, 1, 1, '#ece4d6'); r(g, X + 27 - i, Y + 13 - i, 1, 1, '#ece4d6'); }
  r(g, X + 20, Y + 10, 1, 1, '#ece4d6'); r(g, X + 27, Y + 10, 1, 1, '#ece4d6');
}

// v46: a town shop, 3 by 2 tiles: walls, roof and a sign by kind (store, smithy, carpenter).
export const FRONT = {
  store:     { wall: '#e2cda0', line: '#c9b083', roof: '#c0443a', door: '#7a4b2a' },
  smithy:    { wall: '#8a8f96', line: '#6f747a', roof: '#3f3a36', door: '#3f2f22' },
  carpenter: { wall: '#b08d55', line: '#987745', roof: '#5d7a4a', door: '#6e4626' },
  tavern:    { wall: '#8a5a32', line: '#6e4626', roof: '#7a2f2a', door: '#3f2f22' },   // v47
  clinic:    { wall: '#eef2f4', line: '#d0d8dc', roof: '#4f7a9a', door: '#5a6a7a' },
  hall:      { wall: '#d9c9a6', line: '#c0ae86', roof: '#5a4a6a', door: '#5c371e' },   // v53
  oasis:     { wall: '#e8cf9a', line: '#d0b47a', roof: '#3f8a8a', door: '#6e4626' },   // v64: the dunes
  museum:    { wall: '#cfc6b4', line: '#b5ab96', roof: '#3f5a6a', door: '#4e3a26' },   // v68
  ranch:     { wall: '#c98a5a', line: '#a87048', roof: '#7a2f2a', door: '#5c371e' },   // v69
  theatre:   { wall: '#7a2f3a', line: '#5f2430', roof: '#2b2333', door: '#c9a43a' },   // v70
  casino:    { wall: '#5a3a5a', line: '#4a2e4a', roof: '#c9a43a', door: '#2b211a' },
};
function storefront(g, p, o) {
  const X = o.x * T, Y = o.y * T, f = FRONT[o.kind];
  r(g, X + 1, Y + 31, 46, 1, 'rgba(0,0,0,.3)');
  boardWall(g, X + 2, Y + 10, 44, 21, f.wall, f.line);
  roofGable(g, X + 24, Y - 4, 24, 12, f.roof, p.snow);
  doorArt(g, X + 19, Y + 18, 10, 12, f.door);
  [X + 5, X + 34].forEach((wx) => windowArt(g, wx, Y + 18, 9, 6, tone(f.wall, 1.25)));
  // The shop sign: a framed board under the eaves.
  r(g, X + 15, Y + 10, 18, 8, '#2f241a'); r(g, X + 16, Y + 11, 16, 6, '#e8d9b5'); r(g, X + 16, Y + 11, 16, 1, '#f6ecd2'); r(g, X + 16, Y + 16, 16, 1, '#c9b48a');
  r(g, X + 15, Y + 18, 18, 1, 'rgba(0,0,0,.25)');
  if (o.kind === 'store') { r(g, X + 19, Y + 13, 3, 2, '#7fbf5a'); r(g, X + 23, Y + 13, 3, 2, '#d8484a'); r(g, X + 27, Y + 13, 2, 2, '#e8862a');
    for (let i = 0; i < 6; i++) { r(g, X + 2 + i * 7, Y + 9, 7, 3, i % 2 ? '#f4ead2' : '#c0443a'); r(g, X + 2 + i * 7, Y + 12, 7, 1, i % 2 ? '#d6ccb4' : '#962f28'); } }
  if (o.kind === 'smithy') { r(g, X + 20, Y + 13, 8, 2, '#3f3a36'); r(g, X + 22, Y + 15, 4, 1, '#3f3a36'); chimneyArt(g, X + 38, Y - 8, 5, 10, p.snow); r(g, X + 39, Y - 13, 3, 2, 'rgba(200,200,200,.5)'); r(g, X + 40, Y - 15, 2, 2, 'rgba(200,200,200,.3)'); }
  if (o.kind === 'carpenter') { r(g, X + 19, Y + 13, 9, 2, '#a9b4bd'); for (let i = 0; i < 4; i++) r(g, X + 19 + i * 2, Y + 15, 1, 1, '#7f8a93'); r(g, X + 28, Y + 12, 2, 4, '#8a5a32');
    r(g, X + 40, Y + 25, 6, 5, '#c9a06a'); r(g, X + 40, Y + 25, 6, 1, '#e0bc84'); r(g, X + 40, Y + 27, 6, 1, '#a07a4a'); }
  if (o.kind === 'tavern') { r(g, X + 21, Y + 12, 5, 4, '#e9b44c'); r(g, X + 21, Y + 12, 5, 1, '#f4ead2'); r(g, X + 26, Y + 13, 2, 2, '#e9b44c');
    r(g, X + 3, Y + 26, 2, 4, '#2b211a'); r(g, X + 2, Y + 23, 4, 3, '#e9b44c'); r(g, X + 3, Y + 24, 2, 1, '#fff0a0'); }
  if (o.kind === 'hall') { r(g, X + 22, Y + 12, 4, 4, '#e9b44c'); r(g, X + 23, Y + 13, 2, 2, '#5c371e'); r(g, X + 23, Y - 10, 2, 8, '#6b5a48'); r(g, X + 25, Y - 10, 5, 3, '#c0443a'); r(g, X + 25, Y - 10, 5, 1, '#e0605a'); }
  if (o.kind === 'oasis') { r(g, X + 19, Y + 13, 3, 2, '#7fbf5a'); r(g, X + 23, Y + 13, 3, 2, '#c0445a'); r(g, X + 27, Y + 13, 2, 2, '#f2d14a'); }
  if (o.kind === 'casino') { for (let i = 0; i < 5; i++) r(g, X + 18 + i * 3, Y + 13, 2, 2, i % 2 ? '#e9b44c' : '#c0443a'); for (let i = 0; i < 7; i++) r(g, X + 4 + i * 6, Y + 11, 1, 1, '#f0c850'); }
  if (o.kind === 'museum') { for (let i = 0; i < 4; i++) { r(g, X + 3 + i * 13, Y + 10, 3, 19, '#ece6d8'); r(g, X + 3 + i * 13, Y + 10, 1, 19, '#fbf8f0'); r(g, X + 5 + i * 13, Y + 10, 1, 19, '#c4bba8'); r(g, X + 2 + i * 13, Y + 10, 5, 1, '#d6cfbe'); }
    r(g, X + 21, Y + 12, 6, 4, '#c9a43a'); r(g, X + 23, Y + 13, 2, 2, '#4e3a26'); }
  if (o.kind === 'ranch') { r(g, X + 20, Y + 13, 8, 2, '#e9c46a'); r(g, X + 22, Y + 12, 4, 1, '#f4ead2'); r(g, X + 38, Y + 25, 7, 5, '#e2c46a'); r(g, X + 38, Y + 27, 7, 1, '#b0943a'); r(g, X + 38, Y + 25, 7, 1, '#f2dc8a'); }
  if (o.kind === 'theatre') { for (let i = 0; i < 7; i++) r(g, X + 17 + i * 2, Y + 12, 1, 1, i % 2 ? '#f4ead2' : '#e9b44c'); r(g, X + 19, Y + 14, 10, 1, '#7a2f3a');
    [X + 5, X + 37].forEach((px) => { r(g, px, Y + 25, 6, 5, '#e9b44c'); r(g, px + 1, Y + 26, 4, 3, '#7a2f3a'); r(g, px + 2, Y + 27, 2, 1, '#f4ead2'); }); }
  if (o.kind === 'clinic') { r(g, X + 23, Y + 12, 2, 4, '#4f9a6a'); r(g, X + 22, Y + 13, 4, 2, '#4f9a6a'); }
}

// v65: a small wooden boat on the water.
function boat(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 12, 30, 2, 'rgba(0,0,0,.25)');
  for (let j = 0; j < 5; j++) r(g, X + 2 + j, Y + 6 + j, 28 - 2 * j, 1, j === 0 ? '#c9a06a' : j === 4 ? '#5a3a20' : j % 2 ? '#8a5a32' : '#7a4e2c');
  r(g, X + 1, Y + 5, 30, 1, '#3f2a18'); r(g, X + 4, Y + 7, 2, 1, '#e0bc84');
  r(g, X + 15, Y - 9, 2, 15, '#3f2a18'); r(g, X + 15, Y - 8, 1, 14, '#8a5a32');
  // A sail, filled with the breeze: shaded toward the mast, a seam across it, a little pennant at the top.
  for (let j = 0; j < 10; j++) { const w = 9 - Math.floor(j / 3); r(g, X + 17, Y - 8 + j, w, 1, j % 4 === 3 ? '#e8d9b5' : '#f4ead2'); r(g, X + 17, Y - 8 + j, 1, 1, '#d6ccb4'); }
  r(g, X + 17, Y - 8, 8, 1, '#ffffff'); r(g, X + 17, Y + 2, 7, 1, '#c9b48a');
  r(g, X + 17, Y - 10, 4, 1, '#c0443a'); r(g, X + 17, Y - 11, 2, 1, '#c0443a');
}
// v88: the name of a building's picture on the building sheets: its art and whatever changes how it looks.
export const buildingKey = (o) => [o.art, o.kind, o.roof, o.site, o.w && o.h ? `${o.w}x${o.h}` : null].filter(Boolean).join('.');
// v226: the tiles a building's picture covers whole ("x,y"). A tree on one of them is not drawn: tree crowns are a layer
// over the buildings (render/renderer.js), so the border tree behind the Hollow's mouth in the Wilds hid its top.
export function coveredTiles(o) {
  const b = BUILDINGS[buildingKey(o)];
  if (!b) return [];
  const [, , w, h, dx, dy] = b, x0 = o.x * T + dx, y0 = o.y * T + dy, out = [];
  for (let ty = Math.ceil(y0 / T); (ty + 1) * T <= y0 + h; ty++) for (let tx = Math.ceil(x0 / T); (tx + 1) * T <= x0 + w; tx++) out.push(`${tx},${ty}`);
  return out;
}

// v88: a building from the building sheets (winter's in winter) once they have loaded, else drawn in code.
export function drawBuilding(g, p, o) {
  const name = p.snow ? BUILDING_SHEETS.winter : BUILDING_SHEETS.summer, b = BUILDINGS[buildingKey(o)];
  if (!b || !ready(name)) return OBJECT_ART[o.art](g, p, o);
  const [sx, sy, w, h, dx, dy] = b;
  g.drawImage(sheet(name).img, sx, sy, w, h, o.x * T + dx, o.y * T + dy, w, h);
}

export const OBJECT_ART = { boathouse, boat, storefront, lodge, helperhut, waystone, pond, slimepen, shed, mill, clocktower, statue, scaffold, stable, house, bin, well, shop, workbench, coop, cave, barn, cottage, board, fountain, table, greenhouse, trough };

// ---- Greenhouse interior (ignores seasons) ----
export function drawGreenhouseFloor(g, x, y, t) {
  const X = x * T, Y = y * T, R = rng(x * 37 + y * 113);
  if (ready(GREENHOUSE_SHEET.sheet)) return g.drawImage(sheet(GREENHOUSE_SHEET.sheet).img, (t === 'g' ? 0 : 1 + (x % 2)) * T, 0, T, T, X, Y, T, T);   // v89
  if (t === 'g') {
    r(g, X, Y, T, T, '#5a3b24');
    for (let i = 0; i < 4; i++) r(g, X + (R() * 14 | 0), Y + (R() * 14 | 0), 2, 1, '#6b4a2b');
    return;
  }
  r(g, X, Y, T, T, '#a07a4f'); r(g, X, Y + 7, T, 1, '#8a6640'); r(g, X, Y + 15, T, 1, '#8a6640');
  r(g, X + (x % 2 ? 4 : 11), Y, 1, 7, '#8a6640'); r(g, X + (x % 2 ? 9 : 2), Y + 8, 1, 7, '#8a6640');
}
// v213: a pane of the greenhouse's glass wall: a wooden frame lit on its top and left, glass shading from pale at the
// top to deeper blue at the foot, a crossbar, two diagonal glints and a sill. Tiles join along the frame.
export function drawGlassWall(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X, Y, T, T, '#a9d4e4'); r(g, X, Y + 1, T, 5, '#cfeaf4'); r(g, X, Y + 6, T, 4, '#bfe0ec'); r(g, X, Y + 11, T, 4, '#96c6d8');
  for (let i = 0; i < 4; i++) { r(g, X + 3 + i, Y + 8 - i, 1, 1, '#eef9fc'); r(g, X + 9 + i, Y + 13 - i, 1, 1, '#dff2f8'); }
  r(g, X + 4, Y + 8, 1, 1, '#ffffff');
  r(g, X, Y + 7, T, 1, '#6b5a48'); r(g, X, Y + 8, T, 1, 'rgba(0,0,0,.12)');
  r(g, X, Y, T, 1, '#8a7458'); r(g, X, Y, 1, T, '#8a7458'); r(g, X + 1, Y + 1, 1, T - 2, 'rgba(255,255,255,.25)');
  r(g, X, Y + 14, T, 2, '#5a4a3a'); r(g, X, Y + 14, T, 1, '#7a6650');
}

// ---- Cave tiles (the mine ignores seasons) ----
// Floor and wall colours by theme: the Hollow, the Sunken Cavern's sand (v38), the Ember Vent's basalt (v39).
const CAVE_COLS = {
  rock:  { floor: ['#3b3430', '#463e39', '#302a26'], wall: ['#1f1a18', '#2a2421', '#2e2724'] },
  sand:  { floor: ['#7a5a38', '#8a6a44', '#6a4c2e'], wall: ['#3f2c1c', '#4f3824', '#5a4026'] },
  ember: { floor: ['#3a2422', '#4a2c26', '#2e1c1a'], wall: ['#1a0f0e', '#2a1612', '#3a1a14'] },
  sewer: { floor: ['#3a4038', '#454c42', '#30362e'], wall: ['#1c221e', '#262e28', '#2e3830'] },   // v45
  peak:  { floor: ['#4a3a34', '#56443c', '#3e302a'], wall: ['#221816', '#30201c', '#3c2620'] },   // v67: the Smoke Peak
};
const colsFor = (p) => CAVE_COLS[p?.theme] || CAVE_COLS.rock;
export function drawCaveFloor(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 131 + y * 71), c = colsFor(p).floor;
  r(g, X, Y, T, T, c[0]);
  for (let i = 0; i < 5; i++) r(g, X + (R() * 15 | 0), Y + (R() * 15 | 0), 2, 1, R() < 0.5 ? c[1] : c[2]);
}
function caveWall(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 53 + y * 97), c = colsFor(p).wall;
  r(g, X, Y, T, T, c[0]); r(g, X, Y + 12, T, 4, c[1]);
  for (let i = 0; i < 3; i++) r(g, X + (R() * 13 | 0), Y + (R() * 10 | 0), 3, 1, c[2]);
}
// v39: lava, the vent's door and the forge.
function lava(g, x, y) {
  const X = x * T, Y = y * T, R = rng(x * 17 + y * 29);
  r(g, X, Y, T, T, '#c8352f');
  for (let i = 0; i < 4; i++) r(g, X + (R() * 12 | 0), Y + (R() * 12 | 0), 4, 2, R() < 0.5 ? '#e9862a' : '#ffd98a');
}
function ventDoor(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 1, 12, 15, '#3f3226'); r(g, X + 4, Y + 3, 8, 13, '#1a0f0e');
  r(g, X + 4, Y + 12, 8, 4, '#c8352f'); r(g, X + 6, Y + 13, 4, 2, '#ffd98a'); r(g, X + 2, Y + 1, 12, 1, '#5a3a30');
}
function forgeAnvil(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 14, 14, 1, 'rgba(0,0,0,.4)'); r(g, X + 5, Y + 9, 6, 5, '#3f4850'); r(g, X + 2, Y + 5, 12, 4, '#5f6870'); r(g, X + 1, Y + 5, 3, 2, '#5f6870');
  r(g, X + 2, Y + 5, 12, 1, '#8d939a'); r(g, X + 11, Y + 1, 3, 4, '#e9862a'); r(g, X + 12, Y, 1, 2, '#ffd98a');
}
function mineRock(ore) {
  return (g, x, y) => {
    const X = x * T, Y = y * T;
    r(g, X + 2, Y + 5, 12, 9, '#6f6862'); r(g, X + 3, Y + 4, 10, 1, '#827a73'); r(g, X + 4, Y + 6, 3, 2, '#8d857d'); r(g, X + 2, Y + 13, 12, 1, '#4f4945');
    if (ore) { r(g, X + 5, Y + 8, 2, 2, ore); r(g, X + 9, Y + 6, 2, 1, ore); r(g, X + 10, Y + 10, 2, 2, ore); }
  };
}
function ladderUp(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 4, Y, 8, 16, '#2a2421'); r(g, X + 5, Y, 6, 2, '#e9c46a');
  r(g, X + 4, Y, 1, 16, '#94673d'); r(g, X + 11, Y, 1, 16, '#94673d');
  for (let i = 0; i < 4; i++) r(g, X + 4, Y + 2 + i * 4, 8, 1, '#b8864f');
}
// v38: the sealed door to the Sunken Cavern, and a shaft (a hole with no ladder).
function cavernDoor(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 1, 12, 15, '#6f6862'); r(g, X + 4, Y + 3, 8, 13, '#2b211a');
  r(g, X + 4, Y + 3, 8, 2, '#e9c46a'); r(g, X + 7, Y + 8, 2, 3, '#e9862a'); r(g, X + 2, Y + 1, 12, 1, '#8d857d');
}
function shaft(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 3, 12, 11, '#050403'); r(g, X + 3, Y + 2, 10, 1, '#0e0b0a'); r(g, X + 3, Y + 14, 10, 1, '#0e0b0a');
}
function ladderDown(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X + 3, Y + 3, 10, 10, '#0e0b0a'); r(g, X + 5, Y + 3, 1, 9, '#94673d'); r(g, X + 10, Y + 3, 1, 9, '#94673d');
  for (let i = 0; i < 3; i++) r(g, X + 5, Y + 4 + i * 3, 6, 1, '#b8864f');
}

// v32: the farm cave's mouth in the farm's north edge, and the crate inside the cave.
function caveMouth(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X, Y, T, T, '#5f5a52'); r(g, X + 2, Y + 4, 12, 12, '#1a1512'); r(g, X + 3, Y + 3, 10, 1, '#2a2421'); r(g, X + 1, Y + 1, 3, 3, p.snow ? SNOW : '#4f8f3a');
}
function caveCrate(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 5, 12, 10, '#8a5a32'); r(g, X + 2, Y + 5, 12, 1, '#a5753f'); r(g, X + 2, Y + 10, 12, 1, '#6e4626');
}

// v37: a treasure chest on a Hollow floor.
function chest(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.35)');
  r(g, X + 2, Y + 6, 12, 8, '#8a5a32'); r(g, X + 2, Y + 4, 12, 3, '#a5753f'); r(g, X + 2, Y + 7, 12, 1, '#5c371e');
  r(g, X + 2, Y + 4, 1, 10, '#e9b44c'); r(g, X + 13, Y + 4, 1, 10, '#e9b44c'); r(g, X + 7, Y + 7, 2, 3, '#e9b44c');
}

// v40: the shrine door in the Wilds and a skill's pedestal inside the shrine.
function shrineDoor(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X, Y, T, T, '#6f6862'); r(g, X + 2, Y + 2, 12, 14, '#4f4945'); r(g, X + 3, Y + 3, 10, 13, '#2b2a2e');
  Object.values(SHRINE.colors).forEach((c, i) => r(g, X + 3 + (i % 3) * 4, Y + 5 + Math.floor(i / 3) * 5, 2, 2, c));
  if (p.snow) r(g, X, Y, T, 2, SNOW);
}
function pedestal(g, x, y, p) {
  const X = x * T, Y = y * T, skill = Object.keys(SHRINE.pedestals).find((k) => SHRINE.pedestals[k] === x);
  r(g, X + 3, Y + 13, 10, 2, '#4f4945'); r(g, X + 5, Y + 6, 6, 8, '#8d857d'); r(g, X + 4, Y + 5, 8, 2, '#a8a199');
  r(g, X + 6, Y + 1, 4, 4, SHRINE.colors[skill] || '#e9c46a'); r(g, X + 7, Y + 2, 1, 1, '#ffffff');
}

// v45: the fallen log, the rubble, the sewer grate, the hot spring and the trader's corner.
function fallenLog(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X, Y + 6, T, 8, '#6e4626'); r(g, X, Y + 6, T, 2, '#8a5a32'); r(g, X + 12, Y + 6, 4, 8, '#c9a06a'); r(g, X + 13, Y + 8, 2, 4, '#a07a4a');
}
function rubble(g, x, y, p) {
  const X = x * T, Y = y * T;
  [[1, 6, 7], [7, 3, 8], [4, 9, 9], [10, 8, 6]].forEach(([a, b, s]) => { r(g, X + a, Y + b, s, s - 2, '#8d857d'); r(g, X + a, Y + b, s, 1, '#a8a199'); });
}
function grate(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 2, 12, 12, '#3f4850'); for (let i = 0; i < 4; i++) r(g, X + 3 + i * 3, Y + 3, 1, 10, '#1a1f22'); r(g, X + 2, Y + 2, 12, 1, '#6f7880');
}
// v159 (roadmap 75c): the village's hedges, garden beds and benches.
function hedge(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X, Y + 3, T, 12, '#3f6b33'); r(g, X, Y + 3, T, 2, '#5a8a44');
  [[2, 6], [8, 5], [12, 9], [4, 11]].forEach(([a, b]) => r(g, X + a, Y + b, 3, 2, '#6fa052'));
}
function gardenBed(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 2, 14, 12, '#6e4626'); r(g, X + 1, Y + 2, 14, 1, '#8a5a32');
  [[3, 4, '#5d7a4a'], [8, 5, '#e2a33a'], [4, 9, '#b5452f'], [10, 10, '#5d7a4a']].forEach(([a, b, c]) => { r(g, X + a, Y + b, 3, 3, c); r(g, X + a + 1, Y + b + 3, 1, 2, '#3f6b33'); });
}
function bench(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 6, 14, 3, '#8a5a32'); r(g, X + 1, Y + 6, 14, 1, '#b0804a'); r(g, X + 1, Y + 3, 14, 2, '#6e4626');
  r(g, X + 2, Y + 9, 2, 5, '#4a3020'); r(g, X + 12, Y + 9, 2, 5, '#4a3020');
}
// v166: Tamsin's pens: fence rails round the box, grazed grass, her cows and sheep (data/maps.js RANCH_PEN).
function pen(g, x, y, p) {
  const X = x * T, Y = y * T, [x0, y0, x1, y1] = RANCH_PEN.box, rail = '#8a5a32', post = '#5c371e';
  r(g, X, Y, T, T, p?.snow ? '#e6e2d6' : '#7a9a52');
  if (y === y0) { r(g, X, Y + 2, T, 1, rail); r(g, X, Y + 5, T, 1, rail); }
  if (y === y1) { r(g, X, Y + 11, T, 1, rail); r(g, X, Y + 14, T, 1, rail); }
  if (x === x0) { r(g, X + 1, Y, 1, T, rail); r(g, X + 1, Y, 2, 4, post); }
  if (x === x1) { r(g, X + 14, Y, 1, T, rail); r(g, X + 13, Y, 2, 4, post); }
  const has = (list) => list.some(([a, b]) => a === x && b === y);
  if (has(RANCH_PEN.cows)) {
    r(g, X + 3, Y + 6, 9, 5, '#f4ead2'); r(g, X + 5, Y + 7, 3, 2, '#3a3028'); r(g, X + 11, Y + 5, 3, 4, '#f4ead2');
    r(g, X + 12, Y + 6, 1, 1, '#2b211a'); r(g, X + 4, Y + 11, 1, 3, '#3a3028'); r(g, X + 10, Y + 11, 1, 3, '#3a3028');
  }
  if (has(RANCH_PEN.sheep)) {
    r(g, X + 4, Y + 7, 7, 4, '#fffbe8'); r(g, X + 10, Y + 7, 3, 3, '#3a3028');
    r(g, X + 5, Y + 11, 1, 2, '#3a3028'); r(g, X + 9, Y + 11, 1, 2, '#3a3028');
  }
}
// v165: a market stall on the town green: a striped awning over a plank counter.
function stall(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 2, 2, 13, '#6e4626'); r(g, X + 13, Y + 2, 2, 13, '#6e4626');
  for (let i = 0; i < 4; i++) r(g, X + i * 4, Y + 1, 4, 4, i % 2 ? '#f4ead2' : '#b5452f');
  r(g, X, Y + 9, T, 4, '#a5753f'); r(g, X, Y + 9, T, 1, '#c9955a');
  r(g, X + 3, Y + 7, 3, 2, '#e2a33a'); r(g, X + 9, Y + 7, 3, 2, '#5d7a4a');
}
// v160: reeds on the mere's shore.
function reeds(g, x, y) {
  const X = x * T, Y = y * T;
  [[2, 3], [5, 1], [8, 4], [11, 2], [13, 5]].forEach(([a, b]) => { r(g, X + a, Y + b, 1, 14 - b, '#7a8a3a'); r(g, X + a, Y + b, 2, 3, '#8a5a32'); });
}
function hotSpring(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X, Y, T, T, '#4f9aa8'); r(g, X + 2, Y + 3, 4, 1, '#bfe6ec'); r(g, X + 9, Y + 9, 5, 1, '#bfe6ec'); r(g, X + 6, Y + 1, 1, 3, 'rgba(255,255,255,.4)');
}
function traderSpot(g, x, y) { r(g, x * T + 2, y * T + 12, 12, 3, '#2b2a2e'); }

// v67: the Smoke Peak's mouth, the shell chimes, the dry basins, the altar (the summit's nut cache in the peak) and the lantern.
function peakMouth(g, x, y, p) {
  caveMouth(g, x, y, p); r(g, x * T + 3, y * T + 14, 10, 2, '#7a2a14'); r(g, x * T + 6, y * T + 1, 4, 2, 'rgba(200,200,200,.5)');
}
function shell(g, x, y, p) {
  const X = x * T, Y = y * T, i = CHIMES.findIndex(([a, b]) => a === x && b === y), s = 4 + 2 * Math.max(0, i);
  r(g, X + 8 - s / 2, Y + 13 - s, s, s, '#f0c8b8'); r(g, X + 8 - s / 2, Y + 13 - s, s, 1, '#fbe6dc');
  for (let k = 1; k < s; k += 2) r(g, X + 8 - s / 2 + k, Y + 13 - s, 1, s, '#d89c88');
}
function basin(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 7, 12, 7, '#8d857d'); r(g, X + 2, Y + 7, 12, 1, '#a8a199'); r(g, X + 4, Y + 8, 8, 3, '#5f5a52');
}
function altar(g, x, y, p) {
  const X = x * T, Y = y * T;
  if (p.theme === 'peak') { chest(g, x, y, p); r(g, X + 6, Y + 2, 4, 2, '#c9a06a'); return; }
  r(g, X + 1, Y + 9, 14, 6, '#6f6862'); r(g, X + 1, Y + 8, 14, 2, '#a8a199'); r(g, X + 4, Y + 11, 8, 1, '#4f8f3a');
}
function lantern(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 6, Y + 7, 4, 8, '#8d857d'); r(g, X + 4, Y + 2, 8, 6, '#6f6862'); r(g, X + 6, Y + 4, 4, 2, '#2b2a2e'); r(g, X + 3, Y + 1, 10, 1, '#a8a199');
}

// v69: the travelling cart, the bookseller's stall and the prize machine.
function cartTile(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.3)');
  r(g, X + 1, Y + 5, 14, 7, '#7a4a8a'); r(g, X + 1, Y + 5, 14, 1, '#9a6aaa'); r(g, X, Y + 2, 16, 3, '#e9c46a');
  r(g, X + 4, Y + 7, 3, 3, '#7fbf5a'); r(g, X + 9, Y + 7, 3, 3, '#d8484a');
  [X + 2, X + 10].forEach((wx) => { r(g, wx, Y + 11, 4, 4, '#3f2f22'); r(g, wx + 1, Y + 12, 2, 2, '#c9a06a'); });
}
function bookStall(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.3)');
  r(g, X + 1, Y + 1, 14, 3, '#3f5a6a'); r(g, X + 2, Y + 4, 1, 11, '#6e4626'); r(g, X + 13, Y + 4, 1, 11, '#6e4626');
  r(g, X + 1, Y + 9, 14, 5, '#8a5a32'); r(g, X + 1, Y + 9, 14, 1, '#a07a4a');
  ['#c0443a', '#5fa8d3', '#e9c46a', '#7fbf5a', '#a070c8'].forEach((c, i) => r(g, X + 3 + i * 2, Y + 6, 2, 3, c));
}
function prizeMachine(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 3, Y + 15, 10, 1, 'rgba(0,0,0,.3)');
  r(g, X + 3, Y + 2, 10, 13, '#c9a43a'); r(g, X + 3, Y + 2, 10, 1, '#e9c46a'); r(g, X + 5, Y + 4, 6, 4, '#7fc4e8');
  r(g, X + 6, Y + 5, 2, 2, '#d8484a'); r(g, X + 13, Y + 7, 2, 1, '#6b5a48'); r(g, X + 14, Y + 5, 1, 3, '#6b5a48'); r(g, X + 6, Y + 11, 4, 2, '#3f2f22');
}

// v89: the things on cave and special tiles, without their ground (PROP_GROUND says what lies under each), so a
// tile set can draw the ground (render/renderer.js). CAVE_ART draws both, as before.
export const PROP_ART = {
  '¢': cartTile, '§': bookStall, '¤': prizeMachine,
  y: caveMouth, t: caveCrate, $: chest,
  U: ladderUp, L: ladderDown,
  r: mineRock(null), c: mineRock('#d0874a'), i: mineRock('#c9ccd6'),
  '%': mineRock('#e9c46a'), '*': mineRock('#9a7ae0'), '^': cavernDoor, '!': shaft,
  '#': mineRock('#e9862a'), '~': lava, '>': ventDoor, '=': forgeAnvil,
  '@': shrineDoor, '+': pedestal,
  '|': fallenLog, '}': rubble, ';': grate, '{': hotSpring, '?': traderSpot,
  '7': peakMouth, '8': shell, '9': basin, '<': altar, '`': lantern,
  'ħ': hedge, 'ǧ': gardenBed, 'ƀ': bench, 'ɲ': pen,   // v159; v166 the pens
  'ʋ': reeds,   // v160
  'ʂ': stall,   // v165
  ...SCENERY_ART,   // v195: bushes, boulders, stumps, woodpiles, hay, barrels, planters (render/scenery.js)
};
// The ground under each prop: a cave's floor or wall, grass (with the salt its blades and flowers use) or sand.
// Props not listed draw their whole tile, or sit on whatever the map has there (the ladder down, mine rocks).
export const PROP_GROUND = {
  U: 'wall', '^': 'wall', '>': 'wall', t: 'floor', $: 'floor', '!': 'floor', '=': 'floor', '+': 'floor', '?': 'floor',
  '|': 'grass:29', '}': 'grass:23', ';': 'grass:37', '9': 'grass:41', '<': 'grass:43', '`': 'grass:47',
  '¢': 'grass:53', '§': 'grass:59', '¤': 'grass:61', '8': 'sand',
  'ħ': 'grass:67', 'ǧ': 'grass:71', 'ƀ': 'grass:73', 'ʋ': 'grass:79', 'β': 'grass:83', 'ʂ': 'grass:89', 'ɲ': 'grass:97',
  ...Object.fromEntries(Object.keys(SCENERY_ART).map((t, i) => [t, `grass:${101 + 2 * i}`])),   // v195
};
function propGround(t, g, x, y, p) {
  const k = PROP_GROUND[t];
  if (t === '<' && p.theme === 'peak') return drawCaveFloor(g, x, y, p);   // the summit's altar is a chest
  if (k === 'wall') caveWall(g, x, y, p);
  else if (k === 'floor') drawCaveFloor(g, x, y, t === 't' ? undefined : p);   // the farm cave's crate: always rock
  else if (k === 'sand') drawSand(g, x, y, p);
  else if (k) drawGrass(g, x, y, p, +k.split(':')[1]);
}
// v95: props that change with the place or the season: which variant a tile shows (VARIANTS_SHEET.order keys).
const snowy = (x, y, p) => (p.snow ? 'snow' : '');
export const PROP_VARIANT = {
  '@': snowy, y: snowy, 7: snowy,
  '+': (x) => Object.keys(SHRINE.pedestals).find((k) => SHRINE.pedestals[k] === x) || '',
  8: (x, y) => String(Math.max(0, CHIMES.findIndex(([a, b]) => a === x && b === y))),
  '<': (x, y, p) => (p.theme === 'peak' ? 'peak' : ''),
};
export const variantKey = (t, x, y, p) => { const v = PROP_VARIANT[t]?.(x, y, p); return v ? `${t}:${v}` : t; };
// v89: a prop from the props sheet once it has loaded, else drawn in code; over a ground drawn by a tile set.
// v95: props with variants from the variants sheet, one frame per variant.
export function drawProp(g, t, x, y, p) {
  const P = PROPS_SHEET, i = P.order.indexOf(t);
  if (i >= 0 && ready(P.sheet)) return g.drawImage(sheet(P.sheet).img, i * P.size, 0, P.size, P.size, x * T, y * T, P.size, P.size);
  const V = VARIANTS_SHEET, j = PROP_VARIANT[t] ? V.order.indexOf(variantKey(t, x, y, p)) : -1;
  if (j >= 0 && ready(V.sheet)) return g.drawImage(sheet(V.sheet).img, j * V.size, 0, V.size, V.size, x * T, y * T, V.size, V.size);
  PROP_ART[t](g, x, y, p);
}
export const CAVE_ART = Object.fromEntries([['X', caveWall], ...Object.entries(PROP_ART).map(([t, f]) => [t, (g, x, y, p) => { propGround(t, g, x, y, p); f(g, x, y, p); }])]);

// v22 farm layouts: quarry floor and sand.
export function drawQuarry(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 613 + y * 211 + 3);
  r(g, X, Y, T, T, p.snow ? '#c9cdd0' : '#9a9286');
  for (let i = 0; i < 6; i++) r(g, X + (R() * 14 | 0), Y + (R() * 14 | 0), 2, 1, R() < 0.5 ? '#857d72' : '#b3ab9e');
}
export function drawSand(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 457 + y * 883 + 9);
  r(g, X, Y, T, T, p.snow ? '#e6e2d6' : '#e3cf9a');
  for (let i = 0; i < 5; i++) r(g, X + (R() * 15 | 0), Y + (R() * 15 | 0), 1, 1, R() < 0.5 ? '#cdb77f' : '#f0e2b8');
}

// ---- The farmhouse inside (v24). decor: { wall, floor } indexes into WALLPAPERS and FLOORS. ----
function pattern(g, X, Y, d, wall) {
  r(g, X, Y, T, T, d.base);
  const a = d.accent;
  if (d.pattern === 'stripe') { r(g, X + 3, Y, 2, T, a); r(g, X + 11, Y, 2, T, a); }
  else if (d.pattern === 'dots') { r(g, X + 3, Y + 3, 2, 2, a); r(g, X + 11, Y + 11, 2, 2, a); r(g, X + 11, Y + 3, 1, 1, a); r(g, X + 3, Y + 11, 1, 1, a); }
  else if (d.pattern === 'check') { r(g, X, Y, 8, 8, a); r(g, X + 8, Y + 8, 8, 8, a); }
  else if (d.pattern === 'boards') { [0, 5, 10].forEach((o) => r(g, X, Y + o + 4, T, 1, a)); r(g, X + (wall ? 7 : 5), Y, 1, 5, a); r(g, X + 11, Y + 5, 1, 5, a); }
  else if (d.pattern === 'tiles') { r(g, X, Y + 7, T, 1, a); r(g, X + 7, Y, 1, T, a); r(g, X + 1, Y + 1, 5, 5, 'rgba(255,255,255,.08)'); }
  else if (d.pattern === 'weave') { for (let i = 0; i < 4; i++) r(g, X + i * 4, Y + (i % 2) * 4, 3, 8, a); r(g, X, Y + 8, T, 1, a); }
  else if (d.pattern === 'sprig') { r(g, X + 5, Y + 4, 1, 6, a); r(g, X + 3, Y + 5, 2, 1, a); r(g, X + 6, Y + 7, 2, 1, a); }
  else if (d.pattern === 'brick') { [0, 5, 10].forEach((o, i) => { r(g, X, Y + o + 4, T, 1, a); r(g, X + (i % 2 ? 4 : 10), Y + o, 1, 4, a); }); }
}
export function drawHouseTile(g, x, y, t, below, walls, floors, decor) {
  const X = x * T, Y = y * T;
  if (t === '.') { r(g, X, Y, T, T, '#14100c'); return; }
  if (t === 'I' || t === '_' || t === 'ʌ') {   // v47: the phone hangs on a wall face (v172: and the attic ladder)
    if (below && below !== 'I' && below !== '.') {   // the wall's face (v87: from the wallpaper sheet once it has loaded)
      if (ready(DECOR_SHEETS.walls)) return g.drawImage(sheet(DECOR_SHEETS.walls).img, (walls[decor.wall] ? decor.wall : 0) * T, 0, T, T, X, Y, T, T);
      pattern(g, X, Y, walls[decor.wall] || walls[0], true); r(g, X, Y + 14, T, 2, '#3f3226'); return;
    }
    r(g, X, Y, T, T, '#4a3828'); r(g, X, Y, T, 1, '#5c4632'); r(g, X, Y + 15, T, 1, '#2b2018');   // wall tops
    return;
  }
  if (ready(DECOR_SHEETS.floors)) g.drawImage(sheet(DECOR_SHEETS.floors).img, (floors[decor.floor] ? decor.floor : 0) * T, 0, T, T, X, Y, T, T);   // v87
  else pattern(g, X, Y, floors[decor.floor] || floors[0], false);
  if (t === 'E') { r(g, X + 2, Y + 3, 12, 10, '#8a5a32'); r(g, X + 3, Y + 4, 10, 8, '#b5452f'); }   // doormat
}
const bed = (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 1, Y, 14, T, '#7a4a2a'); r(g, X + 2, Y + 1, 12, 14, '#f4ead2'); r(g, X + 2, Y + 6, 12, 9, '#5f8fb5'); r(g, X + 2, Y + 6, 12, 1, '#3d6a8f'); };
const bedHead = (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 1, Y, 14, T, '#7a4a2a'); r(g, X + 2, Y + 3, 12, 13, '#f4ead2'); r(g, X + 4, Y + 4, 8, 4, '#ffffff'); r(g, X + 1, Y, 14, 3, '#5c371e'); };
export const HOUSE_ART = {
  // v173: the dining room's long table: a polished top, an edge, chairs drawn at its long sides.
  'ŧ': (g, x, y, m) => {
    const X = x * T, Y = y * T, top = m[y - 1]?.[x] !== 'ŧ';
    r(g, X, Y + (top ? 4 : 0), T, top ? 12 : 12, '#8a5a32'); r(g, X, Y + (top ? 4 : 0), T, 2, '#b0804a');
    if (!top) r(g, X, Y + 11, T, 2, '#5c371e');
    r(g, X + 5, top ? Y : Y + 13, 6, 3, '#6e4626');
    if (top && x % 2) r(g, X + 6, Y + 7, 4, 3, '#f4ead2');
  },
  // v172: the attic ladder: rails and rungs on a wall face, or a hatch in the attic floor's edge.
  'ʌ': (g, x, y, m) => {
    const X = x * T, Y = y * T;
    if (m[y + 1]?.[x] === '.') { r(g, X + 2, Y + 3, 12, 10, '#3f3226'); r(g, X + 3, Y + 4, 10, 8, '#14100c'); for (let i = 0; i < 3; i++) r(g, X + 4, Y + 5 + i * 3, 8, 1, '#8a5a32'); return; }
    r(g, X + 3, Y, 2, T, '#8a5a32'); r(g, X + 11, Y, 2, T, '#8a5a32'); for (let i = 0; i < 4; i++) r(g, X + 3, Y + 2 + i * 4, 10, 1, '#a5753f');
  },
  _: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 5, Y + 3, 6, 9, '#3f3226'); r(g, X + 6, Y + 4, 4, 7, '#b5452f'); r(g, X + 4, Y + 4, 2, 6, '#2b211a'); r(g, X + 7, Y + 6, 2, 1, '#e9c46a'); r(g, X + 7, Y + 8, 2, 1, '#e9c46a'); },
  Z: (g, x, y, m) => (m[y - 1]?.[x] === 'Z' ? bed(g, x, y) : bedHead(g, x, y)),
  l: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 6, Y + 8, 4, 7, '#6e4626'); r(g, X + 2, Y + 3, 12, 6, '#8a5a32'); r(g, X + 3, Y + 3, 5, 5, '#f4ead2'); r(g, X + 8, Y + 3, 5, 5, '#e8dcc0'); r(g, X + 7, Y + 3, 1, 5, '#b5452f'); },
  n: (g, x, y) => { const X = x * T, Y = y * T; r(g, X, Y + 2, T, 14, '#a5753f'); r(g, X, Y + 2, T, 3, '#d9caa6'); r(g, X + 3, Y + 8, 10, 6, '#8a5a32'); r(g, X + 7, Y + 10, 2, 1, '#e9c46a'); },
  o: (g, x, y) => { const X = x * T, Y = y * T; r(g, X, Y + 2, T, 14, '#5f6870'); r(g, X + 2, Y + 3, 4, 2, '#2b211a'); r(g, X + 9, Y + 3, 4, 2, '#2b211a'); r(g, X + 3, Y + 8, 10, 6, '#3f4850'); r(g, X + 4, Y + 9, 8, 1, '#e8862a'); },
  x: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 1, Y + 4, 14, 10, '#c9955a'); r(g, X + 3, Y + 6, 10, 6, '#f4ead2'); [3, 6, 9, 12].forEach((o) => r(g, X + o, Y + 4, 1, 10, '#a5753f')); },
  v: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 2, Y + 3, 12, 12, '#8a5a32'); r(g, X + 1, Y + 6, 14, 6, '#8a5a32'); r(g, X + 1, Y + 5, 14, 1, '#5c371e'); r(g, X + 1, Y + 12, 14, 1, '#5c371e'); r(g, X + 7, Y + 8, 2, 2, '#3f3226'); },
};
