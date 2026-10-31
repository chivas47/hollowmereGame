// Static world art: tiles and buildings. Drawn once per map and season into a cached canvas.
import { T } from '../core/constants.js';
import { r, rng } from './pixel.js';
import { SHRINE } from '../data/books.js';
import { CHIMES } from '../data/nuts.js';
import { DECOR_SHEETS, BUILDING_SHEETS, PROPS_SHEET, GREENHOUSE_SHEET, VARIANTS_SHEET } from '../data/sprites.js';
import { BUILDINGS } from '../data/buildings.js';
import { ready, sheet } from './sheets.js';

const SNOW = '#f2f6f8';

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

export function drawTree(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 71 + y * 313), dark = R() < 0.5 ? p.trd : p.tr, lite = p.trl;
  r(g, X + 6, Y + 10, 4, 6, '#6b4a2b'); r(g, X + 6, Y + 10, 1, 6, '#553a21');
  r(g, X + 1, Y + 2, 14, 10, dark); r(g, X + 3, Y, 10, 2, dark); r(g, X, Y + 4, 16, 5, dark);
  r(g, X + 3, Y + 2, 4, 3, lite); r(g, X + 9, Y + 5, 3, 2, lite); r(g, X + 5, Y + 7, 2, 2, lite);
  r(g, X + 1, Y + 11, 14, 1, 'rgba(0,0,0,.25)');
  if (p.snow) { r(g, X + 3, Y, 10, 2, SNOW); r(g, X + 1, Y + 2, 6, 1, SNOW); r(g, X + 9, Y + 3, 6, 1, SNOW); r(g, X, Y + 4, 4, 1, SNOW); }
}

export function drawWater(g, x, y, p) {
  const X = x * T, Y = y * T, R = rng(x * 17 + y * 29);
  r(g, X, Y, T, T, p.water);
  for (let i = 0; i < 2; i++) r(g, X + 2 + (R() * 9 | 0), Y + 3 + (R() * 10 | 0), 4, 1, p.ripple);
}

export function drawRock(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 2, Y + 6, 12, 8, '#8d8a85'); r(g, X + 3, Y + 5, 10, 1, '#a5a29c'); r(g, X + 4, Y + 7, 3, 2, '#b4b0aa'); r(g, X + 2, Y + 13, 12, 1, '#6f6c68');
  if (p.snow) r(g, X + 3, Y + 5, 10, 2, SNOW);
}

function house(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 20, 76, 28, '#e2cda0');
  for (let i = 0; i < 4; i++) r(g, X + 2, Y + 25 + i * 6, 76, 1, '#c9b083');
  for (let j = 0; j <= 20; j++) { const k = Math.floor(j / 2); r(g, X + 10 - k, Y + 2 + j, 60 + 2 * k, 1, j % 4 === 3 ? '#7d3123' : '#a5432f'); }
  if (p.snow) for (let j = 0; j <= 4; j++) { const k = Math.floor(j / 2); r(g, X + 10 - k, Y + 2 + j, 60 + 2 * k, 1, SNOW); }
  r(g, X, Y + 22, 80, 2, '#5e2419');
  r(g, X + 58, Y - 2, 7, 9, '#7a6e66'); r(g, X + 57, Y - 3, 9, 2, '#5f554e');
  [X + 8, X + 60].forEach((wx) => {
    r(g, wx, Y + 29, 12, 10, '#4e3a26'); r(g, wx + 1, Y + 30, 10, 8, '#7fc4e8');
    r(g, wx + 6, Y + 30, 1, 8, '#4e3a26'); r(g, wx + 1, Y + 34, 10, 1, '#4e3a26'); r(g, wx + 2, Y + 31, 2, 2, '#c6e7f7');
  });
  r(g, X + 34, Y + 30, 12, 18, '#7a4b2a'); r(g, X + 34, Y + 30, 12, 1, '#5c371e'); r(g, X + 39, Y + 30, 1, 18, '#5c371e'); r(g, X + 43, Y + 39, 1, 2, '#e9b44c');
  r(g, X + 32, Y + 47, 16, 1, '#8f7a5a');
}

function bin(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.25)');
  r(g, X + 1, Y + 5, 14, 10, '#8a5a32'); r(g, X + 1, Y + 8, 14, 1, '#6e4626'); r(g, X + 1, Y + 11, 14, 1, '#6e4626');
  r(g, X, Y + 2, 16, 4, '#6e4626'); r(g, X + 1, Y + 2, 14, 1, '#94673d'); r(g, X + 7, Y + 4, 2, 1, '#e9b44c');
  if (p.snow) r(g, X, Y + 1, 16, 2, SNOW);
}

function well(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 2, 2, 7, '#6b4a2b'); r(g, X + 12, Y + 2, 2, 7, '#6b4a2b');
  r(g, X, Y, 16, 3, '#a5432f'); r(g, X, Y + 2, 16, 1, '#7d3123'); if (p.snow) r(g, X, Y, 16, 1, SNOW);
  r(g, X + 8, Y + 3, 1, 4, '#d9c27a'); r(g, X + 7, Y + 6, 3, 2, '#8a5a32');
  r(g, X + 1, Y + 8, 14, 8, '#8d8a85'); r(g, X + 3, Y + 9, 10, 3, '#3f7fb0'); r(g, X + 4, Y + 9, 4, 1, '#69aedb');
  [[1, 13], [5, 12], [10, 13], [13, 11], [7, 15]].forEach(([a, b]) => r(g, X + a, Y + b, 3, 1, '#6f6c68'));
}

function shop(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 4, 44, 32, '#b08d55'); for (let i = 0; i < 5; i++) r(g, X + 2 + i * 9, Y + 4, 1, 32, '#987745');
  r(g, X + 12, Y, 24, 8, '#6e4626'); r(g, X + 23, Y + 2, 2, 4, '#86b86a'); r(g, X + 21, Y + 2, 2, 2, '#86b86a'); r(g, X + 25, Y + 3, 2, 2, '#86b86a');
  for (let i = 0; i < 6; i++) r(g, X + i * 8, Y + 12, 8, 9, i % 2 ? '#f4ead2' : '#c0443a');
  for (let i = 0; i < 6; i++) r(g, X + i * 8 + 2, Y + 21, 4, 2, i % 2 ? '#f4ead2' : '#c0443a');
  if (p.snow) r(g, X, Y + 11, 48, 2, SNOW);
  r(g, X + 2, Y + 34, 44, 14, '#8a5a32'); r(g, X, Y + 32, 48, 3, '#6e4626'); r(g, X + 2, Y + 40, 44, 1, '#6e4626');
  [['#efe6f2', 6], ['#d8484a', 16], ['#7fbf5a', 26], ['#e8862a', 36]].forEach(([c, off]) => {
    r(g, X + off, Y + 26, 7, 6, '#e2cda0'); r(g, X + off + 1, Y + 27, 5, 3, c); r(g, X + off, Y + 25, 7, 1, '#c9b083');
  });
}

function workbench(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 14, 1, 'rgba(0,0,0,.25)');
  r(g, X, Y + 6, 16, 3, '#94673d'); r(g, X, Y + 8, 16, 1, '#6e4626');
  r(g, X + 1, Y + 9, 2, 6, '#6e4626'); r(g, X + 13, Y + 9, 2, 6, '#6e4626'); r(g, X + 3, Y + 12, 10, 1, '#6e4626');
  r(g, X + 2, Y + 4, 6, 2, '#a9b4bd'); r(g, X + 8, Y + 4, 2, 2, '#8a5a32');
  r(g, X + 11, Y + 2, 1, 4, '#8a5a32'); r(g, X + 10, Y + 2, 3, 1, '#7f8a93');
  if (p.snow) r(g, X, Y + 5, 16, 1, SNOW);
}

function coop(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 44, 1, 'rgba(0,0,0,.25)');
  r(g, X + 3, Y + 12, 42, 19, '#b5452f');
  for (let i = 0; i < 5; i++) r(g, X + 3, Y + 15 + i * 4, 42, 1, '#9a3a27');
  for (let j = 0; j < 12; j++) r(g, X + 12 - j, Y + j, 24 + 2 * j, 1, j % 3 === 2 ? '#4e3a26' : '#6b5a48');
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 12 - j, Y + j, 24 + 2 * j, 1, SNOW);
  r(g, X, Y + 11, 48, 2, '#3f3226');
  r(g, X + 3, Y + 13, 1, 18, '#f4ead2'); r(g, X + 44, Y + 13, 1, 18, '#f4ead2');
  r(g, X + 19, Y + 18, 10, 13, '#5c371e'); r(g, X + 19, Y + 18, 10, 1, '#f4ead2'); r(g, X + 23, Y + 18, 1, 13, '#4e331f');
  r(g, X + 20, Y + 31, 8, 1, '#94673d');
  [X + 7, X + 34].forEach((wx) => { r(g, wx, Y + 16, 7, 6, '#4e3a26'); r(g, wx + 1, Y + 17, 5, 4, '#e9c46a'); });
}

function cave(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 4, 44, 28, '#6f6862'); r(g, X + 6, Y, 36, 4, '#6f6862'); r(g, X, Y + 10, 48, 22, '#6f6862');
  [[4, 12], [30, 6], [38, 20], [8, 24], [20, 2]].forEach(([a, b]) => r(g, X + a, Y + b, 6, 2, '#857d76'));
  r(g, X + 16, Y + 8, 16, 2, '#120e0c'); r(g, X + 14, Y + 10, 20, 2, '#120e0c'); r(g, X + 12, Y + 12, 24, 20, '#120e0c');
  r(g, X + 11, Y + 10, 2, 22, '#6b4a2b'); r(g, X + 35, Y + 10, 2, 22, '#6b4a2b'); r(g, X + 10, Y + 9, 28, 2, '#7a5634');
  if (p.snow) { r(g, X + 6, Y, 36, 2, SNOW); r(g, X + 2, Y + 4, 8, 1, SNOW); r(g, X + 38, Y + 4, 8, 1, SNOW); }
}

function barn(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 60, 1, 'rgba(0,0,0,.25)');
  r(g, X + 3, Y + 12, 58, 19, '#9a3a27');
  for (let i = 0; i < 6; i++) r(g, X + 3 + i * 10, Y + 12, 1, 19, '#7d2f20');
  for (let j = 0; j < 12; j++) r(g, X + 18 - j, Y + j, 28 + 2 * j, 1, j % 3 === 2 ? '#3f3226' : '#5a4a3a');
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 18 - j, Y + j, 28 + 2 * j, 1, SNOW);
  r(g, X + 2, Y + 11, 60, 2, '#3f3226');
  r(g, X + 24, Y + 3, 16, 7, '#f4ead2'); r(g, X + 25, Y + 4, 14, 5, '#3f3226'); r(g, X + 31, Y + 4, 2, 5, '#f4ead2');
  r(g, X + 22, Y + 16, 20, 15, '#5c371e'); r(g, X + 22, Y + 16, 20, 1, '#f4ead2'); r(g, X + 22, Y + 16, 1, 15, '#f4ead2'); r(g, X + 41, Y + 16, 1, 15, '#f4ead2');
  for (let i = 0; i < 20; i++) { r(g, X + 22 + i, Y + 16 + Math.round(i * 0.75), 1, 1, '#f4ead2'); r(g, X + 41 - i, Y + 16 + Math.round(i * 0.75), 1, 1, '#f4ead2'); }
  r(g, X + 31, Y + 16, 2, 15, '#f4ead2');
  [X + 7, X + 50].forEach((wx) => { r(g, wx, Y + 17, 7, 6, '#3f3226'); r(g, wx + 1, Y + 18, 5, 4, '#e9c46a'); });
}

function cottage(g, p, o) {
  const X = o.x * T, Y = o.y * T, roof = o.roof || '#a5432f';
  r(g, X + 2, Y + 31, 44, 1, 'rgba(0,0,0,.25)');
  r(g, X + 4, Y + 13, 40, 18, '#e2cda0');
  for (let i = 0; i < 3; i++) r(g, X + 4, Y + 17 + i * 5, 40, 1, '#c9b083');
  for (let j = 0; j < 12; j++) r(g, X + 12 - j, Y + j, 24 + 2 * j, 1, j % 4 === 3 ? 'rgba(0,0,0,.25)' : roof);
  r(g, X + 12, Y, 24, 12, roof); for (let j = 3; j < 12; j += 4) r(g, X + 12 - j, Y + j, 24 + 2 * j, 1, 'rgba(0,0,0,.22)');
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 12 - j, Y + j, 24 + 2 * j, 1, SNOW);
  r(g, X + 34, Y - 3, 5, 7, '#7a6e66');
  r(g, X + 19, Y + 19, 10, 12, '#7a4b2a'); r(g, X + 19, Y + 19, 10, 1, '#5c371e'); r(g, X + 26, Y + 25, 1, 2, '#e9b44c');
  [X + 7, X + 33].forEach((wx) => { r(g, wx, Y + 18, 8, 7, '#4e3a26'); r(g, wx + 1, Y + 19, 6, 5, '#7fc4e8'); r(g, wx + 4, Y + 19, 1, 5, '#4e3a26'); });
}

function board(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 4, Y + 15, 24, 1, 'rgba(0,0,0,.25)');
  r(g, X + 5, Y + 8, 2, 8, '#6b4a2b'); r(g, X + 25, Y + 8, 2, 8, '#6b4a2b');
  r(g, X + 2, Y, 28, 11, '#8a5a32'); r(g, X + 3, Y + 1, 26, 9, '#b08d55'); r(g, X + 2, Y, 28, 1, '#a5753f');
  [[5, 2, '#f4ead2'], [12, 3, '#e8d9b5'], [19, 2, '#f4ead2'], [24, 4, '#e8d9b5']].forEach(([a, b, c]) => { r(g, X + a, Y + b, 5, 5, c); r(g, X + a + 2, Y + b, 1, 1, '#d8484a'); });
  if (p.snow) r(g, X + 2, Y, 28, 1, SNOW);
}

function fountain(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 6, 30, 24, '#9a958e'); r(g, X + 3, Y + 4, 26, 2, '#b4b0aa'); r(g, X + 1, Y + 29, 30, 2, '#6f6c68');
  r(g, X + 4, Y + 8, 24, 18, p.snow ? '#cfe3ee' : p.water); r(g, X + 7, Y + 12, 6, 1, p.snow ? '#ffffff' : p.ripple); r(g, X + 18, Y + 20, 6, 1, p.snow ? '#ffffff' : p.ripple);
  r(g, X + 14, Y + 2, 4, 16, '#b4b0aa'); r(g, X + 12, Y, 8, 3, '#c9c5be');
}

function table(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 15, 30, 1, 'rgba(0,0,0,.25)');
  r(g, X + 3, Y + 9, 2, 6, '#6e4626'); r(g, X + 27, Y + 9, 2, 6, '#6e4626');
  r(g, X, Y + 5, 32, 5, '#94673d'); r(g, X, Y + 5, 32, 1, '#b08250'); r(g, X, Y + 9, 32, 1, '#6e4626');
  if (p.snow) r(g, X, Y + 4, 32, 2, SNOW);
}

function greenhouse(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 60, 1, 'rgba(0,0,0,.25)');
  r(g, X + 2, Y + 10, 60, 21, '#bfe0ec');
  for (let i = 0; i < 6; i++) r(g, X + 2 + i * 12, Y + 10, 1, 21, '#6b5a48');
  r(g, X + 2, Y + 20, 60, 1, '#6b5a48');
  for (let j = 0; j < 10; j++) r(g, X + 12 - j, Y + j, 40 + 2 * j, 1, j % 3 === 2 ? '#8fc2d6' : '#d8eef6');
  for (let j = 0; j < 10; j += 3) r(g, X + 12 - j, Y + j, 40 + 2 * j, 1, '#6b5a48');
  if (p.snow) for (let j = 0; j < 2; j++) r(g, X + 12 - j, Y + j, 40 + 2 * j, 1, SNOW);
  r(g, X + 2, Y + 9, 60, 2, '#4e3a26'); r(g, X + 2, Y + 30, 60, 1, '#4e3a26');
  [[8, 23], [44, 22], [52, 24]].forEach(([a, b]) => { r(g, X + a, Y + b, 3, 6, '#5da34a'); r(g, X + a - 1, Y + b, 5, 2, '#86b86a'); });
  r(g, X + 18, Y + 18, 12, 13, '#7a4b2a'); r(g, X + 18, Y + 18, 12, 1, '#4e3a26'); r(g, X + 24, Y + 18, 1, 13, '#4e3a26'); r(g, X + 27, Y + 25, 1, 2, '#e9b44c');
}

function trough(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 6, 14, 9, '#6e4626'); r(g, X + 2, Y + 7, 12, 4, '#3f7fb0'); r(g, X + 3, Y + 8, 5, 1, '#69aedb'); r(g, X + 1, Y + 14, 14, 1, '#4e331f');
}

function stable(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 31, 30, 1, 'rgba(0,0,0,.25)');
  r(g, X + 2, Y + 12, 28, 19, '#8a5a32');
  for (let i = 0; i < 4; i++) r(g, X + 2 + i * 8, Y + 12, 1, 19, '#6e4626');
  for (let j = 0; j < 10; j++) r(g, X + 10 - j, Y + 2 + j, 12 + 2 * j, 1, j % 3 === 2 ? '#3f3226' : '#7a4a2a');
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 10 - j, Y + 2 + j, 12 + 2 * j, 1, SNOW);
  r(g, X + 9, Y + 18, 14, 13, '#3f3226'); r(g, X + 9, Y + 18, 14, 2, '#c9a06a'); r(g, X + 15, Y + 20, 2, 11, '#5c371e');
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
  r(g, X + 3, Y + 12, 42, 19, '#a5753f');
  for (let i = 0; i < 7; i++) r(g, X + 3 + i * 6, Y + 12, 1, 19, '#8a5a32');
  for (let j = 0; j < 11; j++) r(g, X + 13 - j, Y + 1 + j, 22 + 2 * j, 1, j % 3 === 2 ? '#3f4850' : '#5f6870');
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 13 - j, Y + 1 + j, 22 + 2 * j, 1, SNOW);
  r(g, X + 18, Y + 18, 12, 13, '#5c371e'); r(g, X + 18, Y + 18, 12, 2, '#c9a06a'); r(g, X + 27, Y + 25, 1, 2, '#e9c46a');
  r(g, X + 6, Y + 16, 7, 6, '#3f3226'); r(g, X + 7, Y + 17, 5, 4, '#bfe0ec'); r(g, X + 35, Y + 16, 7, 6, '#3f3226'); r(g, X + 36, Y + 17, 5, 4, '#bfe0ec');
}
// v160: the mere's boathouse, 3 x 2: plank walls, a slate roof, wide doors onto the water (shut).
function boathouse(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 44, 1, 'rgba(0,0,0,.25)');
  r(g, X + 3, Y + 12, 42, 19, '#7a5a3a');
  for (let i = 0; i < 7; i++) r(g, X + 3 + i * 6, Y + 12, 1, 19, '#5c4128');
  for (let j = 0; j < 11; j++) r(g, X + 13 - j, Y + 1 + j, 22 + 2 * j, 1, j % 3 === 2 ? '#2f3a44' : '#4a5a66');
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 13 - j, Y + 1 + j, 22 + 2 * j, 1, SNOW);
  r(g, X + 30, Y + 16, 12, 15, '#3f2c1c'); r(g, X + 35, Y + 16, 1, 15, '#2a1d12');   // the boat doors, toward the dock
  r(g, X + 8, Y + 17, 12, 4, '#3f6b8a'); r(g, X + 9, Y + 18, 10, 2, '#5f8fb5');        // an oar sign
}
function mill(g, p, o) {
  const X = o.x * T, Y = o.y * T, a = 0.4;
  r(g, X + 1, Y + 31, 30, 1, 'rgba(0,0,0,.25)');
  r(g, X + 6, Y + 10, 20, 21, '#d9caa6'); r(g, X + 6, Y + 10, 20, 2, '#b8a888');
  for (let j = 0; j < 6; j++) r(g, X + 11 - j, Y + 4 + j, 10 + 2 * j, 1, '#8a3a2a');
  if (p.snow) r(g, X + 8, Y + 6, 16, 2, SNOW);
  r(g, X + 13, Y + 22, 6, 9, '#6e4626');
  for (let k = 0; k < 4; k++) {   // sails
    const ang = a + k * Math.PI / 2;
    for (let i = 2; i < 13; i++) r(g, X + 16 + Math.round(Math.cos(ang) * i), Y + 9 + Math.round(Math.sin(ang) * i), 2, 2, '#f4ead2');
  }
  r(g, X + 15, Y + 8, 3, 3, '#5c371e');
}
function clocktower(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 3, Y + 31, 26, 1, 'rgba(0,0,0,.25)');
  r(g, X + 8, Y + 4, 16, 27, '#e9c46a'); r(g, X + 8, Y + 4, 3, 27, '#f6dc8a'); r(g, X + 21, Y + 4, 3, 27, '#c9a43a');
  for (let j = 0; j < 6; j++) r(g, X + 15 - j, Y - 4 + j, 2 + 2 * j, 1, '#b5452f');
  r(g, X + 10, Y + 8, 12, 12, '#fffbe8'); r(g, X + 10, Y + 8, 12, 1, '#c9a43a'); r(g, X + 15, Y + 10, 2, 5, '#2b211a'); r(g, X + 16, Y + 14, 4, 1, '#2b211a');
  r(g, X + 13, Y + 24, 6, 7, '#8a5a32');
}
// v31: the fish pond (stone rim, water) and the slime pen (fence, trough). What lives there is drawn by sprites.js.
function pond(g, p, o) {
  const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
  r(g, X + 1, Y + 2, w - 2, h - 3, '#8d8a84'); r(g, X + 1, Y + 2, w - 2, 2, '#b5b1a8');
  r(g, X + 4, Y + 5, w - 8, h - 10, p.snow ? '#bcd4e6' : p.water); r(g, X + 4, Y + 5, w - 8, 2, 'rgba(0,0,0,.15)');
  for (let i = 0; i < 3; i++) r(g, X + 8 + i * 12, Y + 14 + (i % 2) * 10, 6, 1, p.ripple);
}
function slimepen(g, p, o) {
  const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
  r(g, X + 1, Y + 3, w - 2, h - 4, p.snow ? '#e6e2d6' : '#7a8f5a');
  for (let x = X + 1; x < X + w - 1; x += 6) { r(g, x, Y + 2, 2, 6, '#8a5a32'); r(g, x, Y + h - 7, 2, 6, '#8a5a32'); }
  r(g, X + 1, Y + 4, w - 2, 1, '#a5753f'); r(g, X + 1, Y + h - 5, w - 2, 1, '#a5753f');
  r(g, X + 1, Y + 2, 2, h - 3, '#8a5a32'); r(g, X + w - 3, Y + 2, 2, h - 3, '#8a5a32');
  r(g, X + 6, Y + h - 14, 16, 6, '#6e4626'); r(g, X + 7, Y + h - 13, 14, 3, '#5d7a90');   // the trough
}
// v32: the helper hut (a round thatched hut) and a waystone (a tall carved stone).
function helperhut(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 2, Y + 31, 28, 1, 'rgba(0,0,0,.25)');
  r(g, X + 5, Y + 16, 22, 15, '#a07a4f'); r(g, X + 5, Y + 16, 22, 2, '#8a6640');
  for (let j = 0; j < 12; j++) r(g, X + 16 - j - 2, Y + 4 + j, 4 + 2 * j + 4, 1, j % 2 ? '#c9a24a' : '#b8913a');
  if (p.snow) r(g, X + 10, Y + 5, 12, 3, SNOW);
  r(g, X + 13, Y + 22, 6, 9, '#3f3226'); r(g, X + 14, Y + 23, 4, 2, '#7fcf6a');
}
function waystone(g, p, o) {
  const X = o.x * T, Y = o.y * T, hollow = o.site === 'wayhollow';
  r(g, X + 3, Y + 31, 10, 1, 'rgba(0,0,0,.25)');
  r(g, X + 4, Y + 4, 8, 27, '#8d8a84'); r(g, X + 5, Y + 2, 6, 2, '#8d8a84'); r(g, X + 4, Y + 4, 2, 27, '#b5b1a8');
  r(g, X + 7, Y + 9, 2, 8, hollow ? '#b98ae0' : '#69aedb'); r(g, X + 6, Y + 12, 4, 2, hollow ? '#b98ae0' : '#69aedb');
  r(g, X + 3, Y + 28, 10, 3, '#6a6862');
}
function scaffold(g, p, o) {
  const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
  r(g, X + 2, Y + h - 4, w - 4, 3, '#a5753f');
  for (let x = 3; x < w - 2; x += 10) r(g, X + x, Y + 6, 2, h - 9, '#8a5a32');
  r(g, X + 2, Y + 8, w - 4, 2, '#8a5a32'); r(g, X + 2, Y + h / 2, w - 4, 2, '#8a5a32');
  r(g, X + 6, Y + h - 10, 8, 6, '#9aa3ab'); r(g, X + w - 14, Y + h - 9, 8, 5, '#b08a5a');
}

// v37: the Wardens' Lodge, a log cabin by the Hollow with crossed blades over the door.
function lodge(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 31, 46, 1, 'rgba(0,0,0,.3)');
  r(g, X + 3, Y + 10, 42, 21, '#6e4626');
  for (let i = 0; i < 5; i++) r(g, X + 3, Y + 12 + i * 4, 42, 1, '#5a3a20');
  for (let j = 0; j < 10; j++) r(g, X + 14 - j, Y - 4 + j, 20 + 2 * j, 1, j % 3 === 2 ? '#3f2f22' : '#4f3a2a');
  r(g, X + 14, Y - 6, 20, 2, '#4f3a2a');
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 14 - j, Y - 6 + j, 20 + 2 * j, 1, SNOW);
  r(g, X + 36, Y - 8, 4, 8, '#5f5a52');
  r(g, X + 19, Y + 17, 10, 14, '#3f2f22'); r(g, X + 20, Y + 18, 8, 13, '#5c371e'); r(g, X + 26, Y + 24, 1, 2, '#e9b44c');
  r(g, X + 6, Y + 17, 8, 6, '#2b211a'); r(g, X + 7, Y + 18, 6, 4, '#e9b44c'); r(g, X + 34, Y + 17, 8, 6, '#2b211a'); r(g, X + 35, Y + 18, 6, 4, '#e9b44c');
  r(g, X + 18, Y + 8, 12, 7, '#a5753f'); r(g, X + 18, Y + 8, 12, 1, '#c99a5e');
  for (let i = 0; i < 6; i++) { r(g, X + 20 + i, Y + 9 + i, 1, 1, '#d6dde3'); r(g, X + 27 - i, Y + 9 + i, 1, 1, '#d6dde3'); }
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
  r(g, X + 2, Y + 10, 44, 21, f.wall);
  for (let i = 0; i < 4; i++) r(g, X + 2, Y + 14 + i * 4, 44, 1, f.line);
  for (let j = 0; j < 10; j++) r(g, X + 12 - j, Y - 2 + j, 24 + 2 * j, 1, j % 3 === 2 ? 'rgba(0,0,0,.25)' : f.roof);
  r(g, X + 12, Y - 4, 24, 2, f.roof);
  if (p.snow) for (let j = 0; j < 3; j++) r(g, X + 12 - j, Y - 4 + j, 24 + 2 * j, 1, SNOW);
  r(g, X + 19, Y + 18, 10, 13, f.door); r(g, X + 26, Y + 24, 1, 2, '#e9b44c');
  [X + 5, X + 34].forEach((wx) => { r(g, wx, Y + 17, 9, 7, '#3f2f22'); r(g, wx + 1, Y + 18, 7, 5, '#7fc4e8'); });
  r(g, X + 16, Y + 11, 16, 6, '#4e3a26'); r(g, X + 17, Y + 12, 14, 4, '#e8d9b5');
  if (o.kind === 'store') { r(g, X + 19, Y + 13, 3, 2, '#7fbf5a'); r(g, X + 23, Y + 13, 3, 2, '#d8484a'); r(g, X + 27, Y + 13, 2, 2, '#e8862a');
    for (let i = 0; i < 6; i++) r(g, X + 2 + i * 7, Y + 9, 7, 3, i % 2 ? '#f4ead2' : '#c0443a'); }
  if (o.kind === 'smithy') { r(g, X + 20, Y + 13, 8, 2, '#3f3a36'); r(g, X + 22, Y + 15, 4, 1, '#3f3a36'); r(g, X + 38, Y - 8, 5, 10, '#5f5a52'); r(g, X + 39, Y - 11, 3, 3, 'rgba(200,200,200,.5)'); }
  if (o.kind === 'carpenter') { r(g, X + 19, Y + 13, 9, 2, '#a9b4bd'); for (let i = 0; i < 4; i++) r(g, X + 19 + i * 2, Y + 15, 1, 1, '#7f8a93'); r(g, X + 28, Y + 12, 2, 4, '#8a5a32');
    r(g, X + 40, Y + 26, 6, 5, '#c9a06a'); r(g, X + 40, Y + 26, 6, 1, '#a07a4a'); }
  if (o.kind === 'tavern') { r(g, X + 21, Y + 12, 5, 4, '#e9b44c'); r(g, X + 21, Y + 12, 5, 1, '#f4ead2'); r(g, X + 26, Y + 13, 2, 2, '#e9b44c');
    r(g, X + 3, Y + 26, 2, 4, '#2b211a'); r(g, X + 2, Y + 24, 4, 3, '#e9b44c'); }
  if (o.kind === 'hall') { r(g, X + 22, Y + 12, 4, 4, '#e9b44c'); r(g, X + 23, Y + 13, 2, 2, '#5c371e'); r(g, X + 23, Y - 10, 2, 8, '#6b5a48'); r(g, X + 25, Y - 10, 5, 3, '#c0443a'); }
  if (o.kind === 'oasis') { r(g, X + 19, Y + 13, 3, 2, '#7fbf5a'); r(g, X + 23, Y + 13, 3, 2, '#c0445a'); r(g, X + 27, Y + 13, 2, 2, '#f2d14a'); }
  if (o.kind === 'casino') { for (let i = 0; i < 5; i++) r(g, X + 18 + i * 3, Y + 13, 2, 2, i % 2 ? '#e9b44c' : '#c0443a'); }
  if (o.kind === 'museum') { for (let i = 0; i < 4; i++) r(g, X + 3 + i * 13, Y + 10, 3, 21, '#ece6d8'); r(g, X + 21, Y + 12, 6, 4, '#c9a43a'); r(g, X + 23, Y + 13, 2, 2, '#4e3a26'); }
  if (o.kind === 'ranch') { r(g, X + 20, Y + 13, 8, 2, '#e9c46a'); r(g, X + 22, Y + 12, 4, 1, '#f4ead2'); r(g, X + 38, Y + 26, 7, 5, '#e2c46a'); r(g, X + 38, Y + 28, 7, 1, '#b0943a'); }
  if (o.kind === 'theatre') { for (let i = 0; i < 7; i++) r(g, X + 17 + i * 2, Y + 12, 1, 1, i % 2 ? '#f4ead2' : '#e9b44c'); r(g, X + 19, Y + 14, 10, 1, '#7a2f3a'); r(g, X + 5, Y + 26, 6, 5, '#e9b44c'); r(g, X + 37, Y + 26, 6, 5, '#e9b44c'); }
  if (o.kind === 'clinic') { r(g, X + 23, Y + 12, 2, 4, '#4f9a6a'); r(g, X + 22, Y + 13, 4, 2, '#4f9a6a'); }
}

// v65: a small wooden boat on the water.
function boat(g, p, o) {
  const X = o.x * T, Y = o.y * T;
  r(g, X + 1, Y + 12, 30, 2, 'rgba(0,0,0,.25)');
  for (let j = 0; j < 5; j++) r(g, X + 2 + j, Y + 6 + j, 28 - 2 * j, 1, j === 0 ? '#c9a06a' : '#8a5a32');
  r(g, X + 15, Y - 8, 2, 14, '#6e4626'); r(g, X + 17, Y - 7, 9, 9, '#f4ead2'); r(g, X + 17, Y - 7, 9, 1, '#e8d9b5');
}
// v88: the name of a building's picture on the building sheets: its art and whatever changes how it looks.
export const buildingKey = (o) => [o.art, o.kind, o.roof, o.site, o.w && o.h ? `${o.w}x${o.h}` : null].filter(Boolean).join('.');

// v88: a building from the building sheets (winter's in winter) once they have loaded, else drawn in code.
export function drawBuilding(g, p, o) {
  const name = p.snow ? BUILDING_SHEETS.winter : BUILDING_SHEETS.summer, b = BUILDINGS[buildingKey(o)];
  if (!b || !ready(name)) return OBJECT_ART[o.art](g, p, o);
  const [sx, sy, w, h, dx, dy] = b;
  g.drawImage(sheet(name).img, sx, sy, w, h, o.x * T + dx, o.y * T + dy, w, h);
}

export const OBJECT_ART = { boathouse, boat, storefront, lodge, helperhut, waystone, pond, slimepen, shed, mill, clocktower, scaffold, stable, house, bin, well, shop, workbench, coop, cave, barn, cottage, board, fountain, table, greenhouse, trough };

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
export function drawGlassWall(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X, Y, T, T, '#bfe0ec'); r(g, X, Y, T, 1, '#6b5a48'); r(g, X, Y + 15, T, 1, '#6b5a48'); r(g, X, Y, 1, T, '#6b5a48');
  r(g, X + 3, Y + 3, 3, 1, '#e8f6fb'); r(g, X + 3, Y + 4, 1, 3, '#e8f6fb');
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
  'ħ': hedge, 'ǧ': gardenBed, 'ƀ': bench,   // v159
  'ʋ': reeds,   // v160
};
// The ground under each prop: a cave's floor or wall, grass (with the salt its blades and flowers use) or sand.
// Props not listed draw their whole tile, or sit on whatever the map has there (the ladder down, mine rocks).
export const PROP_GROUND = {
  U: 'wall', '^': 'wall', '>': 'wall', t: 'floor', $: 'floor', '!': 'floor', '=': 'floor', '+': 'floor', '?': 'floor',
  '|': 'grass:29', '}': 'grass:23', ';': 'grass:37', '9': 'grass:41', '<': 'grass:43', '`': 'grass:47',
  '¢': 'grass:53', '§': 'grass:59', '¤': 'grass:61', '8': 'sand',
  'ħ': 'grass:67', 'ǧ': 'grass:71', 'ƀ': 'grass:73', 'ʋ': 'grass:79', 'β': 'grass:83',
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
  if (t === 'I' || t === '_') {   // v47: the phone hangs on a wall face
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
  _: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 5, Y + 3, 6, 9, '#3f3226'); r(g, X + 6, Y + 4, 4, 7, '#b5452f'); r(g, X + 4, Y + 4, 2, 6, '#2b211a'); r(g, X + 7, Y + 6, 2, 1, '#e9c46a'); r(g, X + 7, Y + 8, 2, 1, '#e9c46a'); },
  Z: (g, x, y, m) => (m[y - 1]?.[x] === 'Z' ? bed(g, x, y) : bedHead(g, x, y)),
  l: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 6, Y + 8, 4, 7, '#6e4626'); r(g, X + 2, Y + 3, 12, 6, '#8a5a32'); r(g, X + 3, Y + 3, 5, 5, '#f4ead2'); r(g, X + 8, Y + 3, 5, 5, '#e8dcc0'); r(g, X + 7, Y + 3, 1, 5, '#b5452f'); },
  n: (g, x, y) => { const X = x * T, Y = y * T; r(g, X, Y + 2, T, 14, '#a5753f'); r(g, X, Y + 2, T, 3, '#d9caa6'); r(g, X + 3, Y + 8, 10, 6, '#8a5a32'); r(g, X + 7, Y + 10, 2, 1, '#e9c46a'); },
  o: (g, x, y) => { const X = x * T, Y = y * T; r(g, X, Y + 2, T, 14, '#5f6870'); r(g, X + 2, Y + 3, 4, 2, '#2b211a'); r(g, X + 9, Y + 3, 4, 2, '#2b211a'); r(g, X + 3, Y + 8, 10, 6, '#3f4850'); r(g, X + 4, Y + 9, 8, 1, '#e8862a'); },
  x: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 1, Y + 4, 14, 10, '#c9955a'); r(g, X + 3, Y + 6, 10, 6, '#f4ead2'); [3, 6, 9, 12].forEach((o) => r(g, X + o, Y + 4, 1, 10, '#a5753f')); },
  v: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 2, Y + 3, 12, 12, '#8a5a32'); r(g, X + 1, Y + 6, 14, 6, '#8a5a32'); r(g, X + 1, Y + 5, 14, 1, '#5c371e'); r(g, X + 1, Y + 12, 14, 1, '#5c371e'); r(g, X + 7, Y + 8, 2, 2, '#3f3226'); },
};
