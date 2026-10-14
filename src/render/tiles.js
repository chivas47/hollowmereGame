// Static world art: tiles and buildings. Drawn once per map and season into a cached canvas.
import { T } from '../core/constants.js';
import { r, rng } from './pixel.js';

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
function scaffold(g, p, o) {
  const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
  r(g, X + 2, Y + h - 4, w - 4, 3, '#a5753f');
  for (let x = 3; x < w - 2; x += 10) r(g, X + x, Y + 6, 2, h - 9, '#8a5a32');
  r(g, X + 2, Y + 8, w - 4, 2, '#8a5a32'); r(g, X + 2, Y + h / 2, w - 4, 2, '#8a5a32');
  r(g, X + 6, Y + h - 10, 8, 6, '#9aa3ab'); r(g, X + w - 14, Y + h - 9, 8, 5, '#b08a5a');
}

export const OBJECT_ART = { pond, slimepen, shed, mill, clocktower, scaffold, stable, house, bin, well, shop, workbench, coop, cave, barn, cottage, board, fountain, table, greenhouse, trough };

// ---- Greenhouse interior (ignores seasons) ----
export function drawGreenhouseFloor(g, x, y, t) {
  const X = x * T, Y = y * T, R = rng(x * 37 + y * 113);
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
export function drawCaveFloor(g, x, y) {
  const X = x * T, Y = y * T, R = rng(x * 131 + y * 71);
  r(g, X, Y, T, T, '#3b3430');
  for (let i = 0; i < 5; i++) r(g, X + (R() * 15 | 0), Y + (R() * 15 | 0), 2, 1, R() < 0.5 ? '#463e39' : '#302a26');
}
function caveWall(g, x, y) {
  const X = x * T, Y = y * T, R = rng(x * 53 + y * 97);
  r(g, X, Y, T, T, '#1f1a18'); r(g, X, Y + 12, T, 4, '#2a2421');
  for (let i = 0; i < 3; i++) r(g, X + (R() * 13 | 0), Y + (R() * 10 | 0), 3, 1, '#2e2724');
}
function mineRock(ore) {
  return (g, x, y) => {
    const X = x * T, Y = y * T;
    r(g, X + 2, Y + 5, 12, 9, '#6f6862'); r(g, X + 3, Y + 4, 10, 1, '#827a73'); r(g, X + 4, Y + 6, 3, 2, '#8d857d'); r(g, X + 2, Y + 13, 12, 1, '#4f4945');
    if (ore) { r(g, X + 5, Y + 8, 2, 2, ore); r(g, X + 9, Y + 6, 2, 1, ore); r(g, X + 10, Y + 10, 2, 2, ore); }
  };
}
function ladderUp(g, x, y) {
  const X = x * T, Y = y * T;
  caveWall(g, x, y); r(g, X + 4, Y, 8, 16, '#2a2421'); r(g, X + 5, Y, 6, 2, '#e9c46a');
  r(g, X + 4, Y, 1, 16, '#94673d'); r(g, X + 11, Y, 1, 16, '#94673d');
  for (let i = 0; i < 4; i++) r(g, X + 4, Y + 2 + i * 4, 8, 1, '#b8864f');
}
function ladderDown(g, x, y) {
  const X = x * T, Y = y * T;
  r(g, X + 3, Y + 3, 10, 10, '#0e0b0a'); r(g, X + 5, Y + 3, 1, 9, '#94673d'); r(g, X + 10, Y + 3, 1, 9, '#94673d');
  for (let i = 0; i < 3; i++) r(g, X + 5, Y + 4 + i * 3, 6, 1, '#b8864f');
}

export const CAVE_ART = {
  X: caveWall, U: ladderUp, L: ladderDown,
  r: mineRock(null), c: mineRock('#d0874a'), i: mineRock('#c9ccd6'),
};

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
  if (t === 'I') {
    if (below && below !== 'I' && below !== '.') { pattern(g, X, Y, walls[decor.wall] || walls[0], true); r(g, X, Y + 14, T, 2, '#3f3226'); return; }   // the wall's face
    r(g, X, Y, T, T, '#4a3828'); r(g, X, Y, T, 1, '#5c4632'); r(g, X, Y + 15, T, 1, '#2b2018');   // wall tops
    return;
  }
  pattern(g, X, Y, floors[decor.floor] || floors[0], false);
  if (t === 'E') { r(g, X + 2, Y + 3, 12, 10, '#8a5a32'); r(g, X + 3, Y + 4, 10, 8, '#b5452f'); }   // doormat
}
const bed = (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 1, Y, 14, T, '#7a4a2a'); r(g, X + 2, Y + 1, 12, 14, '#f4ead2'); r(g, X + 2, Y + 6, 12, 9, '#5f8fb5'); r(g, X + 2, Y + 6, 12, 1, '#3d6a8f'); };
const bedHead = (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 1, Y, 14, T, '#7a4a2a'); r(g, X + 2, Y + 3, 12, 13, '#f4ead2'); r(g, X + 4, Y + 4, 8, 4, '#ffffff'); r(g, X + 1, Y, 14, 3, '#5c371e'); };
export const HOUSE_ART = {
  Z: (g, x, y, m) => (m[y - 1]?.[x] === 'Z' ? bed(g, x, y) : bedHead(g, x, y)),
  l: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 6, Y + 8, 4, 7, '#6e4626'); r(g, X + 2, Y + 3, 12, 6, '#8a5a32'); r(g, X + 3, Y + 3, 5, 5, '#f4ead2'); r(g, X + 8, Y + 3, 5, 5, '#e8dcc0'); r(g, X + 7, Y + 3, 1, 5, '#b5452f'); },
  n: (g, x, y) => { const X = x * T, Y = y * T; r(g, X, Y + 2, T, 14, '#a5753f'); r(g, X, Y + 2, T, 3, '#d9caa6'); r(g, X + 3, Y + 8, 10, 6, '#8a5a32'); r(g, X + 7, Y + 10, 2, 1, '#e9c46a'); },
  o: (g, x, y) => { const X = x * T, Y = y * T; r(g, X, Y + 2, T, 14, '#5f6870'); r(g, X + 2, Y + 3, 4, 2, '#2b211a'); r(g, X + 9, Y + 3, 4, 2, '#2b211a'); r(g, X + 3, Y + 8, 10, 6, '#3f4850'); r(g, X + 4, Y + 9, 8, 1, '#e8862a'); },
  x: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 1, Y + 4, 14, 10, '#c9955a'); r(g, X + 3, Y + 6, 10, 6, '#f4ead2'); [3, 6, 9, 12].forEach((o) => r(g, X + o, Y + 4, 1, 10, '#a5753f')); },
  v: (g, x, y) => { const X = x * T, Y = y * T; r(g, X + 2, Y + 3, 12, 12, '#8a5a32'); r(g, X + 1, Y + 6, 14, 6, '#8a5a32'); r(g, X + 1, Y + 5, 14, 1, '#5c371e'); r(g, X + 1, Y + 12, 14, 1, '#5c371e'); r(g, X + 7, Y + 8, 2, 2, '#3f3226'); },
};
