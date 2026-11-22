// v303: the Duskmarch, the wild country west of the village and the town. Three maps joined to each other more
// than once, so a walk can loop back on itself and it is easy to lose your way:
//   Gloamwood (48 x 32): old woods west of the village, winding ways through trees and thick weeds.
//   The Tangle (40 x 32): a deeper thicket of narrow, twisting ways and dead ends, west of Gloamwood.
//   Mournfield (48 x 32): the valley's old graveyard, west of the town, north of both woods.
// The woods are carved as a maze with loops (a fixed seed, the same in every game), roughened so they read as
// forest, then choked with weeds (WEED) you cut with the sword, which grow back each morning (systems/duskmarch.js).
// By day the woods have their own creatures; after dark the dead rise in Mournfield.
// Sketch (columns west to east):
//   [ Mournfield ]=====> Town (west edge, row 8)
//     |S 10   |S 36
//   [ Tangle ]==2==[ Gloamwood ]==2==> Village (west edge, rows 4 and 20)
// Stardew by role: its Secret Woods and the Wilderness farm's night monsters; their maps are not copied.

export const WEED = 'ψ';                   // thick weeds: solid until cut
export const HEADSTONE = 'ɤ', CRYPT_ROOF = 'ɮ', CRYPT_FRONT = 'ɯ', RAILING = 'ɸ', DEADTREE = 'ʇ';
export const DUSK_TILES = [WEED, HEADSTONE, CRYPT_ROOF, CRYPT_FRONT, RAILING, DEADTREE];
export const DUSK_SIZE = { gloamwood: { w: 48, h: 32 }, tangle: { w: 40, h: 32 }, mournfield: { w: 48, h: 32 } };
export const DUSK_MAPS = Object.keys(DUSK_SIZE);

// Exits: [x, y] on this map -> [map, x, y] where you land (beside that map's matching exit), dir you face.
export const DUSK_EXITS = {
  gloamwood: [
    { at: [47, 4], to: 'village', x: 1, y: 4, dir: 'right' },
    { at: [47, 20], to: 'village', x: 1, y: 20, dir: 'right' },
    { at: [0, 8], to: 'tangle', x: 38, y: 8, dir: 'left' },
    { at: [0, 24], to: 'tangle', x: 38, y: 24, dir: 'left' },
    { at: [24, 0], to: 'mournfield', x: 36, y: 30, dir: 'up' },
  ],
  tangle: [
    { at: [39, 8], to: 'gloamwood', x: 1, y: 8, dir: 'right' },
    { at: [39, 24], to: 'gloamwood', x: 1, y: 24, dir: 'right' },
    { at: [20, 0], to: 'mournfield', x: 10, y: 30, dir: 'up' },
  ],
  mournfield: [
    { at: [47, 16], to: 'town', x: 1, y: 8, dir: 'right' },
    { at: [10, 31], to: 'tangle', x: 20, y: 1, dir: 'down' },
    { at: [36, 31], to: 'gloamwood', x: 24, y: 1, dir: 'down' },
  ],
};
// The other side of each join: the village's and the town's new west exits.
export const DUSK_WAYS_IN = {
  village: [{ at: [0, 4], to: 'gloamwood', x: 46, y: 4, dir: 'left' }, { at: [0, 20], to: 'gloamwood', x: 46, y: 20, dir: 'left' }],
  town: [{ at: [0, 8], to: 'mournfield', x: 46, y: 16, dir: 'left' }],
};

// A small seeded random (mulberry32), so the woods are the same in every game and every load.
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const blank = (w, h, t) => Array.from({ length: h }, () => Array(w).fill(t));
const fill = (m, x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (m[y]?.[x] !== undefined) m[y][x] = t; };
const inner = (m, x, y) => x > 0 && y > 0 && y < m.length - 1 && x < m[0].length - 1;

// Woods: a maze of `cell`-wide ways between one-tile walls of trees, with `braid` of its dead ends opened into
// loops and `rough` of the remaining wall tiles knocked out (only ever opening, so every way stays joined).
function woods(w, h, { seed, cell, braid, rough }) {
  const R = seeded(seed), m = blank(w, h, 'T'), step = cell + 1;
  const cw = Math.floor((w - 1) / step), ch = Math.floor((h - 1) / step);
  const at = (i, j) => [1 + i * step, 1 + j * step];
  const open = new Set(), links = new Map();
  const link = (a, b) => { (links.get(a) || links.set(a, new Set()).get(a)).add(b); (links.get(b) || links.set(b, new Set()).get(b)).add(a); };
  const carveLink = (i, j, ni, nj) => {
    const [x, y] = at(i, j);
    if (ni > i) fill(m, x + cell, y, x + cell, y + cell - 1, 'g');
    if (ni < i) fill(m, x - 1, y, x - 1, y + cell - 1, 'g');
    if (nj > j) fill(m, x, y + cell, x + cell - 1, y + cell, 'g');
    if (nj < j) fill(m, x, y - 1, x + cell - 1, y - 1, 'g');
    link(`${i},${j}`, `${ni},${nj}`);
  };
  const nbrs = (i, j) => [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < cw && b < ch);
  const stack = [[Math.floor(R() * cw), Math.floor(R() * ch)]];
  open.add(stack[0].join());
  while (stack.length) {
    const [i, j] = stack[stack.length - 1], [x, y] = at(i, j);
    fill(m, x, y, x + cell - 1, y + cell - 1, 'g');
    const next = nbrs(i, j).filter(([a, b]) => !open.has(`${a},${b}`));
    if (!next.length) { stack.pop(); continue; }
    const [ni, nj] = next[Math.floor(R() * next.length)];
    carveLink(i, j, ni, nj); open.add(`${ni},${nj}`); stack.push([ni, nj]);
  }
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    if ((links.get(`${i},${j}`)?.size || 0) > 1 || R() > braid) continue;
    const others = nbrs(i, j).filter(([a, b]) => !links.get(`${i},${j}`)?.has(`${a},${b}`));
    if (others.length) { const [a, b] = others[Math.floor(R() * others.length)]; carveLink(i, j, a, b); }
  }
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (m[y][x] !== 'T' || R() > rough) continue;
    const ns = [m[y][x - 1], m[y][x + 1], m[y - 1][x], m[y + 1][x]].filter((t) => t === 'g').length;
    if (ns >= 2) m[y][x] = 'g';   // a gap between two ways, never a lone hole in the trees
  }
  return { m, R };
}

// A way in from a map edge: path tiles from the edge inward until they meet open ground.
function trail(m, [x, y]) {
  const w = m[0].length, h = m.length, dx = x === 0 ? 1 : x === w - 1 ? -1 : 0, dy = y === 0 ? 1 : y === h - 1 ? -1 : 0;
  m[y][x] = 'E';
  let cx = x + dx, cy = y + dy, n = 0;
  while (inner(m, cx, cy) && (n < 3 || m[cy][cx] !== 'g')) { m[cy][cx] = 'P'; cx += dx; cy += dy; n++; }
}
// Clear ground round each way in, so you never land facing a wall of weeds.
const clearRound = (m, exits, r = 2) => exits.forEach(({ at: [x, y] }) => {
  for (let j = y - r; j <= y + r; j++) for (let i = x - r; i <= x + r; i++) if (inner(m, i, j) && m[j][i] === WEED) m[j][i] = 'g';
});
function weeds(m, R, share, keep = () => false) {
  for (let y = 1; y < m.length - 1; y++) for (let x = 1; x < m[0].length - 1; x++) if (m[y][x] === 'g' && !keep(x, y) && R() < share) m[y][x] = WEED;
}
const glade = (m, x0, y0, x1, y1) => fill(m, x0, y0, x1, y1, 'g');

export function gloamwoodGrid() {
  const { w, h } = DUSK_SIZE.gloamwood, { m, R } = woods(w, h, { seed: 3031, cell: 2, braid: 0.5, rough: 0.14 });
  glade(m, 20, 13, 27, 18); fill(m, 22, 15, 25, 16, 'O');   // the still pool at its heart
  glade(m, 6, 3, 10, 6); fill(m, 8, 4, 8, 5, 'R');          // a mossy stone in a clearing to the north-west
  glade(m, 37, 25, 41, 28);                                  // a quiet glade near the south road
  for (const e of DUSK_EXITS.gloamwood) trail(m, e.at);
  weeds(m, R, 0.2, (x, y) => (x >= 19 && x <= 28 && y >= 12 && y <= 19));
  clearRound(m, DUSK_EXITS.gloamwood);
  return m;
}

export function tangleGrid() {
  const { w, h } = DUSK_SIZE.tangle, { m, R } = woods(w, h, { seed: 7717, cell: 1, braid: 0.12, rough: 0.05 });
  glade(m, 8, 13, 13, 17); m[15][10] = 'R';   // a ring of old ground round a single stone, deep in the thicket
  glade(m, 27, 3, 30, 5);
  for (const e of DUSK_EXITS.tangle) trail(m, e.at);
  weeds(m, R, 0.3);
  clearRound(m, DUSK_EXITS.tangle);
  return m;
}

// Mournfield: dead trees round a railed yard; rows of headstones on either side of two crossing walks; three
// crypts; the old west end gone back to weeds and dead trees, which is where the Tangle path comes in.
export function mournfieldGrid() {
  const { w, h } = DUSK_SIZE.mournfield, m = blank(w, h, 'g'), R = seeded(4409);
  fill(m, 0, 0, w - 1, 0, 'T'); fill(m, 0, h - 1, w - 1, h - 1, 'T'); fill(m, 0, 0, 0, h - 1, 'T'); fill(m, w - 1, 0, w - 1, h - 1, 'T');
  // the railing round the yard (x 15 to 44, y 3 to 27), its gates east, south and west
  const [X0, Y0, X1, Y1] = [15, 3, 44, 27];
  fill(m, X0, Y0, X1, Y0, RAILING); fill(m, X0, Y1, X1, Y1, RAILING); fill(m, X0, Y0, X0, Y1, RAILING); fill(m, X1, Y0, X1, Y1, RAILING);
  fill(m, X1, 15, X1, 17, 'P'); fill(m, 35, Y1, 37, Y1, 'P'); fill(m, X0, 9, X0, 10, 'g');
  // the walks: east gate to the chapel crypt, and north to south
  fill(m, 17, 16, w - 2, 16, 'P'); fill(m, 36, 5, 36, h - 2, 'P');
  // rows of headstones, a stone every second tile, a row every second line, gaps for the walks
  for (let y = 5; y <= 25; y += 2) for (let x = 18; x <= 42; x += 2) {
    if (y === 15 || y === 17 || x === 36 || (x >= 17 && x <= 23 && y >= 13 && y <= 19)) continue;
    if (R() < 0.85) m[y][x] = HEADSTONE;
  }
  // crypts: a roof row and a front row with the door
  const crypt = (x, y, wd) => { fill(m, x, y, x + wd - 1, y, CRYPT_ROOF); fill(m, x, y + 1, x + wd - 1, y + 1, CRYPT_FRONT); fill(m, x, y + 2, x + wd - 1, y + 2, 'g'); };
  crypt(18, 14, 4);               // the chapel crypt at the end of the east walk
  crypt(39, 4, 3); crypt(25, 23, 3);
  m[16][17] = 'P';
  // the overgrown west end: weeds, dead trees, a few lost headstones
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < X0; x++) {
    const v = R();
    m[y][x] = v < 0.16 ? DEADTREE : v < 0.42 ? WEED : v < 0.46 ? HEADSTONE : 'g';
  }
  // dead trees scattered round the yard outside the railing
  for (let y = 1; y < h - 1; y++) for (let x = X0; x < w - 1; x++) if ((y < Y0 || y > Y1 || x > X1) && m[y][x] === 'g' && R() < 0.12) m[y][x] = DEADTREE;
  for (const e of DUSK_EXITS.mournfield) trail(m, e.at);
  // the west gate's way out through the weeds, and the Tangle path north to it
  fill(m, 10, 10, 10, h - 2, 'P'); fill(m, 10, 10, X0, 10, 'P');
  fill(m, 36, Y1 + 1, 36, h - 2, 'P');
  clearRound(m, DUSK_EXITS.mournfield);
  return m;
}

// The woods' and graveyard's creatures (data/weapons.js MONSTERS, wildOnly). day: out at any hour, made each time you
// come in (Zelda's way: they are back when you return); night: from NIGHT.from in Mournfield, a few at first and
// more rising every NIGHT.every game minutes up to NIGHT.max. Counts are bodies (a swarm's pack counts each).
export const DUSK_CREATURES = {
  gloamwood: { day: [['bristle', 2], ['wasp', 1], ['stump', 2]], n: [4, 6] },
  tangle: { day: [['bristle', 1], ['wasp', 2], ['stump', 3]], n: [5, 7] },
};
export const NIGHT = { map: 'mournfield', from: 20 * 60, every: 30, first: [3, 4], rise: [1, 2], max: 10, kinds: [['rattler', 3], ['shambler', 2], ['haunt', 2]] };

// Weeds: what a cut clump gives (Stardew's weeds: fiber about half the time, mixed seeds now and then), and a
// small chance of a little health back (the heart under the grass), foraging XP as farm weeds give.
export const WEED_DROPS = { fiber: 0.5, mixed: 0.03, heal: 0.06, healHp: 5, xp: 1 };

// Signs at the ways in, and few inside on purpose.
export const DUSK_SIGNS = {
  village: [{ x: 1, y: 5, kind: 'post', dir: 'left', text: 'West: Gloamwood. Keep to the trail; the woods turn you round.' }],
  town: [{ x: 2, y: 9, kind: 'post', dir: 'left', text: 'West: Mournfield, the old burial ground. Gates shut at dusk, for your sake.' }],
  gloamwood: [{ x: 44, y: 5, kind: 'post', dir: 'right', text: 'East: Hollowmere Village.' }],
  mournfield: [{ x: 45, y: 15, kind: 'post', dir: 'right', text: 'East: Hollowmere Town.' }, { x: 33, y: 17, kind: 'notice', text: 'Rest here, the people of the valley. Visitors: be gone by dark.' }],
};
