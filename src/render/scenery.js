// v195: scenery art (data/scenery.js). Ground cover is drawn into a map's cached background, under everything
// else; props are drawn as tiles (render/tiles.js PROP_ART), on grass. Small sprites in three tones with a darker
// outline in their own colour, like the props in render/doings.js. Seasons change both.
import { T } from '../core/constants.js';
import { r, rng } from './pixel.js';
import { MAPS } from '../data/maps.js';
import { BIOMES, COVER } from '../data/scenery.js';

const SNOW = '#f2f6f8', SHADE = 'rgba(0,0,0,.2)';

// ---- Which cover a tile has: patches from smooth noise over 5-tile cells, then a weighted kind ----
const hash = (a, b, s) => {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(s, 1274126177)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const CELL = 5;
function patchiness(x, y, s) {
  const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL), fx = (x % CELL) / CELL, fy = (y % CELL) / CELL;
  const sm = (t) => t * t * (3 - 2 * t), a = sm(fx), b = sm(fy);
  const v = (i, j) => hash(cx + i, cy + j, s + 7);
  return (v(0, 0) * (1 - a) + v(1, 0) * a) * (1 - b) + (v(0, 1) * (1 - a) + v(1, 1) * a) * b;
}
// Winter: nothing flowers; ferns, heather and the rest die back to twigs poking out of the snow.
const WINTER = { flowers: null, clover: null, bloom: null, mushrooms: null, fern: 'twigs', heather: 'twigs', tall: 'twigs', leaves: null };
const OPEN = new Set(['g', 'z', 'q']);
export function coverKind(mapId, x, y, season) {
  const c = COVER[mapId], map = MAPS[mapId];
  if (!c || !map || !OPEN.has(map.grid[y]?.[x])) return null;
  if (c.keepOff?.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)) return null;
  const s = map.salt * 31, chance = c.rate * (1 - c.patch + c.patch * 2 * patchiness(x, y, s));
  if (hash(x, y, s) >= chance) return null;
  const kinds = BIOMES[c.biome].kinds, total = kinds.reduce((n, [, w]) => n + w, 0);
  let roll = hash(y, x, s + 3) * total, kind = kinds[kinds.length - 1][0];
  for (const [k, w] of kinds) { if ((roll -= w) < 0) { kind = k; break; } }
  if (season === 'Autumn' && (kind === 'flowers' || kind === 'clover') && hash(x, y, s + 5) < 0.5) kind = 'leaves';
  if (season === 'Winter' && kind in WINTER) kind = WINTER[kind];
  return kind;
}

// ---- Ground cover art: (g, X, Y, R, season, p) with X, Y the tile's top left in pixels ----
const FLOWERS = { Spring: ['#f4ead2', '#e9b44c', '#c9a0e8', '#f2a0b8'], Summer: ['#e2707a', '#e9b44c', '#7aa8e8', '#f4ead2'], Autumn: ['#d9644a', '#e8862a', '#c99a3a'] };
const LEAVES = { Spring: ['#7a9a3a', '#5e8d45'], Summer: ['#8a8a3a', '#6e7a34'], Autumn: ['#d9644a', '#e8862a', '#c9a03a', '#a8582a'], Winter: ['#8a6a4a'] };
const at = (R, lo, hi) => lo + ((R() * (hi - lo + 1)) | 0);
const COVER_ART = {
  flowers(g, X, Y, R, season, p) {
    const cols = FLOWERS[season] || FLOWERS.Spring, c = cols[(R() * cols.length) | 0], n = at(R, 3, 5);
    for (let i = 0; i < n; i++) {
      const fx = X + at(R, 2, 12), fy = Y + at(R, 4, 12);
      r(g, fx, fy + 1, 1, 2, p.gd); r(g, fx - 1, fy, 3, 1, c); r(g, fx, fy - 1, 1, 3, c); r(g, fx, fy, 1, 1, i % 2 ? '#f2d14a' : '#fff6d8');
    }
  },
  clover(g, X, Y, R, season, p) {
    for (let i = 0; i < 4; i++) {
      const cx = X + at(R, 2, 12), cy = Y + at(R, 4, 12);
      r(g, cx, cy, 2, 1, p.gd); r(g, cx - 1, cy + 1, 2, 1, p.gd); r(g, cx + 1, cy + 1, 2, 1, '#4f7a3a');
    }
    if (R() < 0.5) { const bx = X + at(R, 4, 10), by = Y + at(R, 4, 9); r(g, bx, by, 2, 2, '#f4ead2'); r(g, bx, by + 2, 1, 2, p.gd); }
  },
  tall(g, X, Y, R, season, p) {
    const bx = X + at(R, 2, 9), by = Y + 14;
    for (let i = 0; i < 5; i++) { const h = at(R, 5, 9); r(g, bx + i, by - h, 1, h, i % 2 ? p.gd : p.gl); }
    r(g, bx - 1, by, 7, 1, SHADE);
    if (season === 'Summer' || season === 'Autumn') r(g, bx + 1, by - 10, 1, 2, '#c9b46a');
  },
  pebbles(g, X, Y, R) {
    for (let i = at(R, 2, 4); i > 0; i--) {
      const sx = X + at(R, 1, 12), sy = Y + at(R, 3, 13), w = at(R, 2, 3);
      r(g, sx, sy + 1, w, 1, '#5f5a54'); r(g, sx, sy, w, 1, '#a5a09a'); r(g, sx, sy, 1, 1, '#c8c4bd');
    }
  },
  fern(g, X, Y, R, season) {
    const [d, m, l] = season === 'Autumn' ? ['#7a3a1e', '#a8582a', '#d68b3a'] : ['#2a5a26', '#3f7a34', '#6aa84f'], bx = X + at(R, 5, 10), by = Y + 14;
    r(g, bx - 6, by, 13, 1, SHADE);
    const frond = (pts) => pts.forEach(([a, b], i) => { r(g, bx + a, by + b, 1, 1, d); r(g, bx + a, by + b - 1, 1, 1, i % 2 ? m : l); });
    frond([[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -4], [-6, -3]]);
    frond([[1, -1], [2, -2], [3, -3], [4, -4], [5, -4], [6, -3]]);
    frond([[0, -1], [0, -3], [-1, -5], [-1, -7], [0, -8]]);
    [[-3, -5], [-2, -4], [3, -5], [2, -4], [1, -6], [-2, -7]].forEach(([a, b]) => r(g, bx + a, by + b, 1, 1, m));
  },
  mushrooms(g, X, Y, R, season) {
    const red = R() < 0.4, cap = red ? '#c0443a' : '#a07a4a', hi = red ? '#e86a5a' : '#c9a06a';
    for (let i = season === 'Autumn' ? 3 : 2; i > 0; i--) {
      const mx = X + at(R, 2, 11), my = Y + at(R, 6, 12);
      r(g, mx, my + 3, 4, 1, SHADE); r(g, mx + 1, my + 1, 2, 3, '#f0e6d0'); r(g, mx, my, 4, 2, cap); r(g, mx + 1, my - 1, 2, 1, cap); r(g, mx + 1, my, 1, 1, hi);
      if (red) r(g, mx + 2, my, 1, 1, '#fff6e8');
    }
  },
  leaves(g, X, Y, R, season) {
    const cols = LEAVES[season] || LEAVES.Autumn;
    for (let i = at(R, 3, 6); i > 0; i--) { const lx = X + at(R, 1, 13), ly = Y + at(R, 2, 13), c = cols[(R() * cols.length) | 0]; r(g, lx, ly, 2, 1, c); r(g, lx + 1, ly + 1, 1, 1, c); }
  },
  moss(g, X, Y, R, season, p) {
    const sx = X + at(R, 2, 7), sy = Y + at(R, 7, 10);
    r(g, sx, sy + 4, 7, 1, SHADE); r(g, sx, sy, 7, 4, '#7d7a74'); r(g, sx + 1, sy - 1, 5, 1, '#8d8a85'); r(g, sx, sy + 3, 7, 1, '#5f5c58');
    r(g, sx + 1, sy - 1, 4, 2, p.snow ? SNOW : '#5f8a3a'); r(g, sx + 2, sy - 1, 2, 1, p.snow ? '#ffffff' : '#7aa84a');
  },
  heather(g, X, Y, R, season) {
    const c = season === 'Spring' ? ['#c88ab8', '#e0b0d0'] : season === 'Autumn' ? ['#8a4a6a', '#a8687a'] : ['#9a5aa8', '#c07ac8'];
    const bx = X + at(R, 2, 7), by = Y + at(R, 8, 11);
    r(g, bx, by + 4, 8, 1, SHADE); r(g, bx, by + 1, 8, 3, '#3f5a30'); r(g, bx + 1, by, 6, 1, '#4f6a3a');
    for (let i = 0; i < 7; i++) r(g, bx + at(R, 0, 7), by + at(R, -1, 2), 1, 1, c[i % 2]);
  },
  twigs(g, X, Y, R) {
    const bx = X + at(R, 3, 10), by = Y + 13;
    r(g, bx - 2, by, 8, 2, '#ffffff'); r(g, bx, by - 5, 1, 5, '#6a4a32'); r(g, bx - 1, by - 4, 1, 1, '#6a4a32'); r(g, bx + 2, by - 4, 1, 4, '#7a5a3a'); r(g, bx + 3, by - 5, 1, 1, '#7a5a3a');
  },
  shells(g, X, Y, R) {
    for (let i = at(R, 1, 2); i > 0; i--) {
      const sx = X + at(R, 2, 11), sy = Y + at(R, 4, 11), c = R() < 0.5 ? ['#f4dccc', '#d8a490'] : ['#f6f0e4', '#c8bca8'];
      r(g, sx, sy + 3, 4, 1, SHADE); r(g, sx, sy, 4, 3, c[0]); r(g, sx + 1, sy - 1, 2, 1, c[0]); r(g, sx + 1, sy, 1, 3, c[1]); r(g, sx + 3, sy + 1, 1, 2, c[1]);
    }
  },
  weed(g, X, Y, R) {
    const sx = X + at(R, 1, 6), sy = Y + at(R, 6, 11);
    for (let i = 0; i < 8; i++) r(g, sx + i, sy + ((i * 3) % 4 === 0 ? 1 : 0) + (i > 4 ? 1 : 0), 1, 1, i % 2 ? '#4a6a3a' : '#3a5a2e');
    r(g, sx + 2, sy - 1, 1, 1, '#5a7a3a');
  },
  driftwood(g, X, Y, R) {
    const sx = X + at(R, 1, 4), sy = Y + at(R, 7, 11);
    r(g, sx, sy + 2, 11, 1, SHADE); r(g, sx, sy, 10, 2, '#b8a88e'); r(g, sx, sy, 10, 1, '#d8ccb4'); r(g, sx + 7, sy - 2, 1, 2, '#b8a88e'); r(g, sx + 3, sy + 1, 2, 1, '#8a7a62');
  },
  scrub(g, X, Y, R) {
    const bx = X + at(R, 3, 9), by = Y + 13;
    r(g, bx - 2, by + 1, 9, 1, SHADE);
    for (let i = 0; i < 6; i++) { const h = at(R, 3, 6); r(g, bx + i - 1, by - h + 1, 1, h, i % 2 ? '#a8945a' : '#c9b47a'); }
  },
  cactus(g, X, Y, R) {
    const cx = X + at(R, 5, 9), cy = Y + 5;
    r(g, cx - 2, cy + 9, 8, 1, SHADE); r(g, cx, cy, 3, 9, '#4f8a4a'); r(g, cx + 2, cy, 1, 9, '#3a6a3a'); r(g, cx, cy, 1, 8, '#6faa5a');
    r(g, cx - 2, cy + 3, 2, 1, '#4f8a4a'); r(g, cx - 2, cy + 1, 1, 2, '#4f8a4a'); r(g, cx + 3, cy + 5, 2, 1, '#4f8a4a'); r(g, cx + 4, cy + 3, 1, 2, '#4f8a4a');
    r(g, cx + 1, cy - 1, 1, 1, '#e2707a');
  },
  bones(g, X, Y, R) {
    const sx = X + at(R, 2, 8), sy = Y + at(R, 7, 11);
    r(g, sx, sy + 2, 7, 1, SHADE); r(g, sx + 1, sy, 5, 1, '#f0e8d8'); r(g, sx, sy - 1, 1, 3, '#f0e8d8'); r(g, sx + 6, sy - 1, 1, 3, '#f0e8d8'); r(g, sx + 1, sy + 1, 5, 1, '#c8bca8');
  },
  cracks(g, X, Y, R) {
    let cx = X + at(R, 2, 6), cy = Y + at(R, 3, 8);
    for (let i = 0; i < 7; i++) { r(g, cx, cy, 1, 1, '#6f685e'); cx += 1; cy += R() < 0.5 ? 1 : 0; }
  },
  bloom(g, X, Y, R) {
    const c = R() < 0.5 ? ['#e0503a', '#f2806a'] : ['#e870a8', '#f8a8c8'], bx = X + at(R, 3, 9), by = Y + at(R, 5, 9);
    r(g, bx - 2, by + 5, 9, 1, SHADE); r(g, bx - 2, by + 3, 4, 2, '#3a8a4a'); r(g, bx + 3, by + 3, 4, 2, '#2f7a3a');
    r(g, bx, by, 5, 3, c[0]); r(g, bx + 1, by - 1, 3, 5, c[0]); r(g, bx + 1, by, 1, 1, c[1]); r(g, bx + 2, by + 1, 1, 1, '#f2d14a');
  },
};

// The cover on every tile of a map, drawn into its background.
export function drawCover(g, mapId, p, season) {
  if (!COVER[mapId]) return;
  const grid = MAPS[mapId].grid;
  for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[y].length; x++) {
    const k = coverKind(mapId, x, y, season);
    if (k) COVER_ART[k](g, x * T, y * T, rng(x * 7919 + y * 104729 + MAPS[mapId].salt), season, p);
  }
}

// ---- Props, solid, one tile each ----
const BUSH = {
  Spring: ['#3f7a34', '#5a9a44', '#7ab85a', '#2a5a26'], Summer: ['#2f6b30', '#4b8b3e', '#6aa84f', '#1f4f24'],
  Autumn: ['#a8582a', '#c97a34', '#e09a4a', '#7a3a1e'], Winter: ['#2f5a3a', '#3f6a48', '#5a8060', '#1f3a28'],
};
function bush(g, x, y, p) {
  const X = x * T, Y = y * T, [c, m, l, o] = BUSH[p.season] || BUSH.Summer, R = rng(x * 31 + y * 17);
  r(g, X + 2, Y + 14, 12, 2, SHADE);
  r(g, X + 2, Y + 6, 12, 8, o); r(g, X + 4, Y + 3, 8, 3, o);
  r(g, X + 3, Y + 6, 10, 7, c); r(g, X + 5, Y + 4, 6, 3, c);
  r(g, X + 4, Y + 5, 5, 3, m); r(g, X + 9, Y + 7, 3, 3, m); r(g, X + 5, Y + 5, 2, 1, l); r(g, X + 10, Y + 7, 1, 1, l);
  if (p.season === 'Spring') [[5, 8], [9, 5], [11, 10], [7, 11]].forEach(([a, b]) => { r(g, X + a, Y + b, 2, 2, '#f4dce4'); r(g, X + a, Y + b, 1, 1, '#ffffff'); });
  if (p.season === 'Summer' && R() < 0.6) [[6, 9], [10, 6], [4, 11]].forEach(([a, b]) => r(g, X + a, Y + b, 1, 1, '#c0443a'));
  if (p.snow) { r(g, X + 4, Y + 2, 8, 3, SNOW); r(g, X + 2, Y + 5, 5, 2, SNOW); r(g, X + 9, Y + 5, 5, 2, SNOW); r(g, X + 5, Y + 2, 6, 1, '#ffffff'); r(g, X + 6, Y + 9, 3, 1, SNOW); }
}
function boulder(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 14, 14, 2, SHADE);
  r(g, X + 1, Y + 6, 14, 8, '#55524e'); r(g, X + 3, Y + 4, 10, 2, '#55524e');
  r(g, X + 2, Y + 6, 12, 7, '#7d7a74'); r(g, X + 4, Y + 5, 8, 2, '#8d8a85');
  r(g, X + 4, Y + 6, 4, 2, '#a5a29c'); r(g, X + 5, Y + 6, 1, 1, '#c4c0ba'); r(g, X + 2, Y + 12, 12, 1, '#65625d'); r(g, X + 9, Y + 9, 3, 1, '#65625d');
  if (p.snow) { r(g, X + 3, Y + 4, 10, 2, SNOW); r(g, X + 2, Y + 6, 3, 1, SNOW); }
  else { r(g, X + 9, Y + 4, 4, 2, '#5f8a3a'); r(g, X + 12, Y + 6, 2, 2, '#4f7a34'); r(g, X + 10, Y + 4, 2, 1, '#7aa84a'); }
}
function stump(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 14, 14, 2, SHADE);
  r(g, X + 1, Y + 12, 3, 2, '#5c3a20'); r(g, X + 12, Y + 12, 3, 2, '#5c3a20');
  r(g, X + 3, Y + 6, 10, 8, '#4a2e1a'); r(g, X + 4, Y + 6, 8, 8, '#7a4e2c'); r(g, X + 4, Y + 7, 2, 6, '#8e6038'); r(g, X + 10, Y + 7, 2, 6, '#5c3a20');
  r(g, X + 3, Y + 4, 10, 3, '#c9a06a'); r(g, X + 4, Y + 4, 8, 1, '#dcb880'); r(g, X + 6, Y + 5, 4, 1, '#a07a4a'); r(g, X + 7, Y + 5, 2, 1, '#8a6038');
  if (p.snow) r(g, X + 3, Y + 3, 10, 3, SNOW);
  else if (p.season === 'Autumn' || p.season === 'Spring') { r(g, X + 11, Y + 9, 3, 2, '#c0443a'); r(g, X + 12, Y + 11, 1, 2, '#f0e6d0'); r(g, X + 12, Y + 9, 1, 1, '#fff6e8'); }
  else { r(g, X + 3, Y + 8, 2, 3, '#5f8a3a'); r(g, X + 3, Y + 8, 1, 1, '#7aa84a'); }
}
function woodpile(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 14, 14, 2, SHADE);
  r(g, X + 1, Y + 4, 2, 11, '#4a2e1a'); r(g, X + 13, Y + 4, 2, 11, '#4a2e1a');
  [[3, 10], [7, 10], [11, 10], [5, 6], [9, 6], [7, 2]].forEach(([a, b]) => {
    if (b === 2 && p.snow) return;
    r(g, X + a - 1, Y + b, 4, 4, '#6e4626'); r(g, X + a - 1, Y + b, 4, 1, '#8a5a32'); r(g, X + a, Y + b + 1, 2, 2, '#d8b480'); r(g, X + a, Y + b + 1, 1, 1, '#a07a4a');
  });
  if (p.snow) r(g, X + 3, Y + 5, 10, 2, SNOW);
}
function hay(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X + 1, Y + 14, 14, 2, SHADE);
  r(g, X + 1, Y + 4, 14, 10, '#a8862e'); r(g, X + 2, Y + 4, 12, 9, '#d8b44a'); r(g, X + 2, Y + 4, 12, 2, '#ecd27a');
  r(g, X + 5, Y + 4, 1, 10, '#8a6a22'); r(g, X + 10, Y + 4, 1, 10, '#8a6a22');
  [[3, 8], [8, 10], [12, 7], [7, 7]].forEach(([a, b]) => r(g, X + a, Y + b, 2, 1, '#c09a3a'));
  if (p.snow) r(g, X + 1, Y + 3, 14, 3, SNOW);
}
function barrels(g, x, y, p) {
  const X = x * T, Y = y * T;
  r(g, X, Y + 14, 16, 2, SHADE);
  r(g, X + 9, Y + 8, 7, 7, '#7a5230'); r(g, X + 9, Y + 8, 7, 1, '#a07a4a'); r(g, X + 9, Y + 11, 7, 1, '#5c3a20'); r(g, X + 12, Y + 8, 1, 7, '#5c3a20');   // a crate
  r(g, X + 1, Y + 3, 8, 12, '#5c3a20'); r(g, X + 2, Y + 3, 6, 12, '#8a5a32'); r(g, X + 3, Y + 4, 1, 10, '#a8743e');
  r(g, X + 1, Y + 5, 8, 1, '#3a3a40'); r(g, X + 1, Y + 12, 8, 1, '#3a3a40'); r(g, X + 2, Y + 2, 6, 2, '#6e4626'); r(g, X + 3, Y + 2, 4, 1, '#b0804a');
  if (p.snow) { r(g, X + 2, Y + 1, 6, 2, SNOW); r(g, X + 9, Y + 7, 7, 2, SNOW); }
}
const PLANTED = { Spring: ['#f2a0b8', '#f4ead2'], Summer: ['#e2707a', '#e9b44c'], Autumn: ['#e8862a', '#c99a3a'], Winter: null };
function planter(g, x, y, p) {
  const X = x * T, Y = y * T, fl = PLANTED[p.season];
  r(g, X + 1, Y + 14, 14, 2, SHADE);
  r(g, X + 3, Y + 4, 10, 4, '#2f6b30'); r(g, X + 4, Y + 3, 8, 2, '#4b8b3e');
  if (fl) [[4, 4], [7, 3], [10, 4], [6, 6], [9, 6]].forEach(([a, b], i) => { r(g, X + a, Y + b, 2, 2, fl[i % 2]); r(g, X + a, Y + b, 1, 1, '#fff6d8'); });
  else r(g, X + 3, Y + 3, 10, 2, SNOW);
  r(g, X + 2, Y + 8, 12, 6, '#5c3a20'); r(g, X + 3, Y + 8, 10, 5, '#8a5a32'); r(g, X + 3, Y + 8, 10, 1, '#b0804a'); r(g, X + 7, Y + 9, 1, 4, '#6e4626');
}
export const SCENERY_ART = { 'ƃ': bush, 'ǫ': boulder, 'ƫ': stump, 'ǥ': woodpile, 'ȟ': hay, 'ȸ': barrels, 'ƥ': planter };
