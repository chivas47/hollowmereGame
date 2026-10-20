// Grass tufts and clotheslines (v103): open grass away from the farm grows tufts that bend in the wind, and
// washing on a few lines flaps (data/atmosphere.js CLOTHESLINES). Drawn only, never saved.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on } from '../core/events.js';
import { addLayer, addEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS, SOLID } from '../data/maps.js';
import { PAL } from '../data/seasons.js';
import { WIND, CLOTHESLINES } from '../data/atmosphere.js';
import { r, rng } from '../render/pixel.js';
import { lean, shiftOf } from './wind.js';
import { outfitPal } from './clothing.js';

// ---- Grass tufts on open grass away from the farm (its own grass patches sway in systems/clearing.js) ----
let tufts = { key: null, list: [] };
on('world:changed', () => { tufts.key = null; });
function tuftsHere() {
  const key = G.S.map;
  if (tufts.key === key) return tufts.list;
  const map = MAPS[key], R = rng(map.salt * 13 + 5), list = [];
  if (key !== 'farm' && !map.base) map.grid.forEach((row, y) => [...row].forEach((t, x) => {
    const below = map.grid[y + 1]?.[x];
    if (t === 'g' && (!SOLID.has(below) || below === 'T') && R() < WIND.tufts / 100) list.push({ x, y, ox: 2 + ((R() * 9) | 0), oy: 6 + ((R() * 7) | 0) });
  }));
  return (tufts = { key, list }).list;
}
addLayer(5, (c) => {
  const list = tuftsHere(), season = today().season;
  if (!list.length || season === 'Winter') return;
  const p = PAL[season];
  for (const f of list) {
    const X = f.x * T + f.ox, Y = f.y * T + f.oy, s = shiftOf(lean(X), 1);
    for (const [dx, hgt] of [[0, 4], [2, 5], [4, 4]]) {
      r(c, X + dx, Y - 2, 1, 2, p.gd); r(c, X + dx + s, Y - hgt, 1, hgt - 2, p.gl);
    }
  }
});

// ---- Clotheslines: two posts, a sagging line, washing whose hems flap ----
function washOf(line) {
  if (line.wash !== 'player') return line.wash;
  const pal = outfitPal(G.S.profile, G.S.outfit);
  return [pal.shirt, pal.pants, '#f2f2ee'];
}
const standing = (line) => G.S.map !== 'farm' || [0, line.w].every((d) => MAPS.farm.grid[line.y][line.x + d] === 'g'
  && !G.S.placed?.[`${line.x + d},${line.y}`] && !G.S.soil?.[`${line.x + d},${line.y}`] && !G.S.debris?.[`${line.x + d},${line.y}`]);
function drawLine(c, line) {
  const X0 = line.x * T + 7, X1 = (line.x + line.w) * T + 7, Y = line.y * T;
  for (const X of [X0, X1]) { r(c, X, Y - 6, 2, 20, '#6b4a2b'); r(c, X - 1, Y - 6, 4, 1, '#553a21'); }
  const span = X1 - X0, sag = (i) => Math.round(Math.sin((i / span) * Math.PI) * 2);
  for (let i = 2; i < span; i++) r(c, X0 + i, Y - 5 + sag(i), 1, 1, '#d8d0c0');
  const wash = washOf(line), gap = Math.floor((span - 4) / wash.length);
  wash.forEach((col, i) => {
    const gx = X0 + 4 + i * gap, w = Math.min(gap - 2, 9), top = Y - 4 + sag(gx - X0), hgt = 6 + (i % 2) * 2, s = shiftOf(lean(gx), 2);
    r(c, gx, top, w, Math.ceil(hgt / 2), col);
    r(c, gx + Math.round(s / 2), top + Math.ceil(hgt / 2), w, Math.floor(hgt / 2) - 1, col);
    r(c, gx + s, top + hgt - 1, w, 1, col);
    r(c, gx + 1, top, 1, 1, '#c0a070'); r(c, gx + w - 2, top, 1, 1, '#c0a070');   // pegs
  });
}
addEntities(() => (CLOTHESLINES[G.S.map] || []).filter(standing).map((line) => ({ y: (line.y + 1) * T - 2, draw: (c) => drawLine(c, line) })));
