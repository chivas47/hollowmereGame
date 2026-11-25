// 97c: the crypt key in three pieces, the north tomb, and the chapel catacombs (systems/catacombs.js).
// Nuno (November 2026): "the west is too easy to get the key; the mausoleum is just one room to get the sword, it
// should be a map with a lot of zones and difficult challenges; the other mausoleum should open without a key."
//   The key: three pieces. One in the Tangle's old chest, which wakes the thicket when opened (beat them, open it
//   again); one under Gloamwood's mossy stone, which gives only after dark and is guarded by the dead; one on a bier
//   at the back of the north tomb. Corvin at the Anvil puts the three back together.
//   The north tomb (Mournfield's northern mausoleum): open to anyone, three rooms of dead, a loot chest, the bier.
//   The chapel catacombs: six zones and the warden's chamber, every solved step saved:
//     1 the entry hall (the dead each time), 2 the ossuary, dark but for four sconces you light (all four open its
//     gate), 3 the lever hall (four levers pulled in the order a plaque's verse gives), the brazier (light it: next
//     time the chapel door brings you down to it), 4 the spike corridor (spikes rise in a wave you time), 5 the
//     crumbling gallery (cracked floor that falls a moment after you step on it, over a pit; reaching the far side
//     braces it for good), 6 the sealed hall (its gates shut on three waves of dead), then the warden's chamber: the
//     Gravewarden itself, and the sarcophagus behind it.
// Stardew by role: its Skull Key chain (a key earned at the bottom of one dungeon opens the next) and the mines'
// treasure floors for the north tomb's chest. The dead are Mournfield's night kinds made tougher (TOUGH), as the
// Hollow's dangerous floors are. Our own maps, names and puzzles.
import { CRYPT } from './duskmarch.js';

// Tiles. Solid: the gate shut, sconces, levers, the plaque, the pit, the brazier, the bier, the ossuary's bone walls.
// Walkable: a raised gate, the spike plates (they hurt only while up), the cracked floor.
export const GATE = 'ʩ', GATE_OPEN = 'ʪ', SCONCE = 'ʫ', SCONCE_LIT = 'ʬ', LEVER = 'ʭ', LEVER_DOWN = 'ʮ', PLAQUE = 'ʯ';
export const SPIKES = 'ʰ', CRUMBLE = 'ʱ', PIT = 'ʲ', BRAZIER = 'ʳ', BRAZIER_LIT = 'ʴ', BIER = 'ʵ', BIER_EMPTY = 'ʶ', BONES = 'ʷ';
export const CATA_SOLID = [GATE, SCONCE, SCONCE_LIT, LEVER, LEVER_DOWN, PLAQUE, PIT, BRAZIER, BRAZIER_LIT, BIER, BIER_EMPTY, BONES];
export const CATA_WALL = [SCONCE, SCONCE_LIT, LEVER, LEVER_DOWN, PLAQUE];   // set into the wall (drawn over wall, not floor)
export const CATA_TILES = [...CATA_SOLID, GATE_OPEN, SPIKES, CRUMBLE];

// ---- the key ----
// pieces: where each is, in the order the journal and Corvin name them.
export const PIECES = {
  tangle: { name: 'the thicket piece', where: 'the old chest in the Tangle' },
  gloam: { name: 'the moss piece', where: 'under the mossy stone in Gloamwood, after dark' },
  barrow: { name: 'the barrow piece', where: 'the bier in Mournfield\'s north tomb' },
};
export const PIECE_KEYS = Object.keys(PIECES);
// The thicket wakes round the chest: the woods' kinds, `n` of them, within `r` tiles of it.
export const AMBUSH = { kinds: [['bristle', 3], ['wasp', 2], ['stump', 2]], n: 7, r: 5 };
// Gloamwood's mossy stone (the glade's rock, data/duskmarch.js gloamwoodGrid): only after `from`; the dead come up
// round it when you first try it, `n` of them, and it gives the piece once they are gone.
export const STONE = { map: 'gloamwood', tiles: [[8, 4], [8, 5]], from: 20 * 60, kinds: [['haunt', 2], ['rattler', 2], ['shambler', 1]], n: 5, r: 4 };

// The dead underground are tougher than Mournfield's by night (the Hollow's dangerous floors make theirs 1.5x).
export const TOUGH = { hp: 1.6, dmg: 1.25 };

// ---- the north tomb ----
// door: on Mournfield, the middle of the northern mausoleum (data/duskmarch.js CRYPTS[1]); stand: below it.
export const BARROW = {
  door: { x: 40, y: 5 }, stand: { x: 40, y: 6 }, land: { x: 6, y: 15 }, out: { x: 6, y: 16 },
  chest: { x: 24, y: 10 }, bier: { x: 8, y: 2 },
  rooms: [
    { id: 'hall', rect: [2, 9, 11, 15], dead: [['rattler', 3, 11], ['rattler', 9, 10]] },
    { id: 'store', rect: [15, 9, 25, 15], dead: [['rattler', 18, 10], ['shambler', 21, 13], ['haunt', 23, 11]] },
    { id: 'bier', rect: [3, 2, 14, 6], dead: [['shambler', 5, 4], ['shambler', 12, 4], ['rattler', 10, 3], ['rattler', 4, 5], ['haunt', 8, 5]] },
  ],
  // Stardew by role: a treasure chest on an early mine floor (a handful of ore, coal and geodes).
  loot: { iron: 5, coal: 4, geode: 2, boneshard: 3 },
};
export function barrowGrid() {
  const m = blank(28, 18, 'X');
  fill(m, 2, 9, 11, 15, 'f'); fill(m, 12, 11, 14, 12, 'f'); fill(m, 15, 9, 25, 15, 'f');
  fill(m, 6, 7, 7, 8, 'f'); fill(m, 3, 2, 14, 6, 'f');
  for (const [x, y] of [[2, 9], [11, 9], [2, 15], [11, 15], [15, 9], [25, 15], [3, 2], [14, 2]]) m[y][x] = 'X';   // pillars
  for (const [x, y] of [[3, 13], [10, 13], [17, 14], [19, 14], [21, 9], [23, 14], [4, 2], [12, 2], [13, 6]]) m[y][x] = 'ʚ';   // coffins (data/duskmarch.js COFFIN)
  m[BARROW.chest.y][BARROW.chest.x] = 'ʊ';   // an old chest (data/duskmarch.js CHEST)
  m[BARROW.bier.y][BARROW.bier.x] = BIER;
  m[BARROW.out.y][BARROW.out.x] = 'E'; m[BARROW.out.y - 1][BARROW.out.x] = 'f';
  return m;
}

// ---- the chapel catacombs (60 x 40) ----
// land: where the chapel door brings you; out: its exit; camp: where it brings you once the brazier burns.
// zones: [x0, y0, x1, y1] inclusive, in the order you walk them; dead: [kind, x, y] met each visit you walk in.
export const CATA = {
  w: 60, h: 40, land: { x: 9, y: 36 }, out: { x: 9, y: 37 }, camp: { x: 40, y: 7 },
  zones: [
    { id: 'entry', rect: [3, 29, 16, 36], dead: [['rattler', 5, 30], ['rattler', 14, 31], ['shambler', 10, 30]] },
    { id: 'ossuary', rect: [2, 2, 21, 25], dead: [['haunt', 5, 6], ['rattler', 14, 9], ['haunt', 8, 15], ['rattler', 17, 20], ['shambler', 4, 21]] },
    { id: 'levers', rect: [22, 2, 37, 9], dead: [] },
    { id: 'camp', rect: [38, 3, 43, 8], dead: [] },
    { id: 'spikes', rect: [44, 4, 57, 10], dead: [] },
    { id: 'gallery', rect: [44, 11, 57, 22], dead: [['haunt', 50, 14], ['haunt', 47, 19]] },
    { id: 'sealed', rect: [30, 26, 42, 36], dead: [] },
    { id: 'warden', rect: [18, 26, 28, 36], dead: [] },
  ],
  // 2: the ossuary's four sconces are placed by the maze (ossuary()); all four lit open GATES.ossuary.
  // 3: the levers, west to east, each under a carving; the plaque's verse gives the order (by carving).
  levers: [{ x: 25, y: 1, mark: 'owl' }, { x: 28, y: 1, mark: 'key' }, { x: 31, y: 1, mark: 'bell' }, { x: 34, y: 1, mark: 'crow' }],
  order: ['bell', 'crow', 'owl', 'key'],
  plaque: { x: 23, y: 1 },
  verse: 'Carved under the dust: "First the bell tolls for the dead. The crow comes to the tolling. When the crow has flown, the owl keeps the watch. And last, the key turns, and the warden sleeps behind it."',
  wrong: 2,   // the dead that rise when the levers are pulled out of order
  brazier: { x: 40, y: 5 },
  // 4: spike plates rise in a wave from west to east: up while (time - x * lag) mod every < up. dmg: a hit's damage.
  spikes: { rect: [46, 5, 55, 7], every: 2.0, up: 0.8, lag: 0.15, dmg: 14 },
  // 5: cracked floor falls `fall` s after you step on it; a fall costs `dmg` and puts you back at `back`.
  gallery: { fall: 0.45, dmg: 12, back: { x: 56, y: 11 }, end: [44, 21, 45, 22] },
  // 6: three waves; each [kind, x, y]. The hall's gates shut until the last falls.
  waves: [
    [['rattler', 32, 27], ['rattler', 40, 27], ['rattler', 36, 35]],
    [['rattler', 32, 35], ['rattler', 40, 35], ['shambler', 33, 31], ['shambler', 39, 31]],
    [['shambler', 32, 27], ['shambler', 40, 35], ['haunt', 36, 28], ['haunt', 36, 34], ['rattler', 31, 31], ['rattler', 41, 31]],
  ],
  // The warden's chamber's guardian and where it rises. v347: its stats, calls and rage are its own creature entry
  // (data/monsters.js MONSTERS.gravewarden boss).
  boss: { kind: 'gravewarden', x: 23, y: 30 },
  sarcophagus: { x: 23, y: 27 },
  blade: 'gravewarden',
};
// Gates: the two tiles of each, and the step that raises it (systems/catacombs.js open()).
export const GATES = {
  ossuary: [[20, 2], [20, 3]],     // the ossuary's way out: all four sconces lit
  levers: [[36, 5], [36, 6]],      // the lever hall's way out: the levers in order
  sealedIn: [[43, 30], [43, 31]],  // the sealed hall's way in: shut while the waves come
  sealedOut: [[29, 30], [29, 31]], // its way out to the warden: shut while the waves come, and while the warden lives once you are in
  back: [[17, 33], [17, 34]],      // the warden's chamber back to the entry hall: once the warden falls
};

// A small seeded random (mulberry32), so the ossuary is the same in every game.
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const blank = (w, h, t) => Array.from({ length: h }, () => Array(w).fill(t));
const fill = (m, x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (m[y]?.[x] !== undefined) m[y][x] = t; };

// The ossuary: a maze of two-wide ways between walls of stacked bones, cells (i, j) at (2 + 3i, 2 + 3j), 6 x 8 of
// them. In at the bottom (cell 2, 7), out at the top right (cell 5, 0). Its four sconces sit in the wall at the end of
// four dead ends far apart, the farthest from the way in first.
export const OSSUARY = { ox: 2, oy: 2, cw: 6, ch: 8, seed: 9713, braid: 0.15, in: [2, 7], out: [5, 0] };
export const SCONCES = [];   // [x, y] of each, filled by ossuary()
function ossuary(m) {
  const { ox, oy, cw, ch, seed, braid } = OSSUARY, R = seeded(seed), at = (i, j) => [ox + i * 3, oy + j * 3];
  fill(m, ox, oy, ox + cw * 3 - 2, oy + ch * 3 - 2, BONES);
  const links = new Map(), key = (i, j) => `${i},${j}`;
  const link = (a, b) => { (links.get(a) || links.set(a, new Set()).get(a)).add(b); (links.get(b) || links.set(b, new Set()).get(b)).add(a); };
  const carve = (i, j, ni, nj) => {
    const [x, y] = at(i, j);
    if (ni > i) fill(m, x + 2, y, x + 2, y + 1, 'f'); if (ni < i) fill(m, x - 1, y, x - 1, y + 1, 'f');
    if (nj > j) fill(m, x, y + 2, x + 1, y + 2, 'f'); if (nj < j) fill(m, x, y - 1, x + 1, y - 1, 'f');
    link(key(i, j), key(ni, nj));
  };
  const nbrs = (i, j) => [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < cw && b < ch);
  const seen = new Set([key(...OSSUARY.in)]), stack = [OSSUARY.in];
  while (stack.length) {
    const [i, j] = stack[stack.length - 1], [x, y] = at(i, j);
    fill(m, x, y, x + 1, y + 1, 'f');
    const next = nbrs(i, j).filter(([a, b]) => !seen.has(key(a, b)));
    if (!next.length) { stack.pop(); continue; }
    const [ni, nj] = next[Math.floor(R() * next.length)];
    carve(i, j, ni, nj); seen.add(key(ni, nj)); stack.push([ni, nj]);
  }
  // a few dead ends opened into loops, so a lost farmer can circle
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    if ((links.get(key(i, j))?.size || 0) > 1 || R() > braid || (i === OSSUARY.out[0] && j === OSSUARY.out[1])) continue;
    const others = nbrs(i, j).filter(([a, b]) => !links.get(key(i, j))?.has(key(a, b)));
    if (others.length) { const [a, b] = others[Math.floor(R() * others.length)]; carve(i, j, a, b); }
  }
  // the sconces: dead ends by walking distance from the way in, farthest first, at least 6 apart
  const dist = new Map([[key(...OSSUARY.in), 0]]), todo = [OSSUARY.in];
  for (let n = 0; n < todo.length; n++) {
    const [i, j] = todo[n];
    for (const k of links.get(key(i, j)) || []) if (!dist.has(k)) { dist.set(k, dist.get(key(i, j)) + 1); todo.push(k.split(',').map(Number)); }
  }
  const ends = [...dist].filter(([k]) => links.get(k).size === 1 && k !== key(...OSSUARY.in) && k !== key(...OSSUARY.out)).sort((a, b) => b[1] - a[1]).map(([k]) => k.split(',').map(Number));
  const picked = [];
  for (const c of ends) if (picked.length < 4 && picked.every((p) => Math.abs(p[0] - c[0]) + Math.abs(p[1] - c[1]) >= 3)) picked.push(c);
  for (const c of ends) if (picked.length < 4 && !picked.includes(c)) picked.push(c);
  SCONCES.length = 0;
  for (const [i, j] of picked) {
    const [x, y] = at(i, j), lk = links.get(key(i, j));
    // the wall on a closed side: north first, then west, east, south
    const side = [[i, j - 1, x, y - 1], [i - 1, j, x - 1, y], [i + 1, j, x + 2, y], [i, j + 1, x, y + 2]].find(([a, b]) => !lk.has(key(a, b)));
    const [, , sx, sy] = side;
    m[sy][sx] = SCONCE; SCONCES.push([sx, sy]);
  }
}

export function cataGrid() {
  const m = blank(CATA.w, CATA.h, 'X'), Z = Object.fromEntries(CATA.zones.map((z) => [z.id, z.rect]));
  // 1 the entry hall, coffins along its walls, the way out at the bottom
  fill(m, ...Z.entry, 'f');
  for (const y of [30, 32, 34]) { m[y][4] = 'ʚ'; m[y][15] = 'ʚ'; }
  m[CATA.out.y][CATA.out.x] = 'E'; m[CATA.out.y - 1][CATA.out.x] = 'f';
  // 2 the ossuary, and the passage up into it from the hall
  ossuary(m);
  fill(m, 8, 25, 9, 28, 'f');
  fill(m, 19, 2, 21, 3, 'f');
  for (const [x, y] of GATES.ossuary) m[y][x] = GATE;
  // 3 the lever hall: levers and the plaque in its north wall, the gate east
  fill(m, 22, 2, 35, 9, 'f');
  for (const l of CATA.levers) m[l.y][l.x] = LEVER;
  m[CATA.plaque.y][CATA.plaque.x] = PLAQUE;
  for (const [x, y] of [[22, 2], [35, 2], [22, 9], [35, 9], [27, 6], [32, 6]]) m[y][x] = 'X';   // pillars
  fill(m, 36, 5, 37, 6, 'f');
  for (const [x, y] of GATES.levers) m[y][x] = GATE;
  // the brazier room
  fill(m, 38, 3, 43, 8, 'f'); m[CATA.brazier.y][CATA.brazier.x] = BRAZIER;
  // 4 the spike corridor, three wide, then down into the gallery
  fill(m, 44, 5, 57, 7, 'f'); fill(m, ...CATA.spikes.rect, SPIKES); fill(m, 56, 8, 57, 10, 'f');
  // 5 the gallery: a pit, a winding way of cracked floor over it, stone to rest on at the bends and false turns
  fill(m, 44, 11, 57, 22, PIT);
  fill(m, 56, 11, 57, 12, 'f');
  const way = (x0, y0, x1, y1) => fill(m, Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1) + 1, Math.max(y0, y1) + 1, CRUMBLE);
  way(56, 13, 56, 15); way(56, 15, 49, 15); way(49, 15, 49, 18); way(49, 18, 54, 18); way(54, 18, 54, 20); way(54, 20, 46, 20);
  way(52, 13, 52, 14); way(52, 13, 46, 13); way(46, 13, 46, 17);   // a false turn north and west: a dead end over the pit
  way(56, 18, 56, 21);                                             // another, down the east side
  fill(m, 49, 15, 50, 16, 'f'); fill(m, 54, 18, 55, 19, 'f');      // two stones to rest on
  fill(m, ...CATA.gallery.end, 'f');
  // the passage down to the sealed hall
  fill(m, 44, 23, 45, 31, 'f'); fill(m, 43, 30, 43, 31, 'f');
  // 6 the sealed hall and its pillars
  fill(m, ...Z.sealed, 'f');
  for (const [x, y] of [[33, 29], [39, 29], [33, 33], [39, 33]]) m[y][x] = 'X';
  for (const [x, y] of GATES.sealedIn) m[y][x] = GATE_OPEN;
  for (const [x, y] of GATES.sealedOut) m[y][x] = GATE_OPEN;
  // the warden's chamber, its sarcophagus, coffins, and the way back to the entry hall
  fill(m, ...Z.warden, 'f');
  m[CATA.sarcophagus.y][CATA.sarcophagus.x] = 'ʛ';   // data/duskmarch.js SARCOPHAGUS
  for (const [x, y] of [[19, 27], [27, 27], [19, 35], [27, 35]]) m[y][x] = 'ʚ';
  for (const [x, y] of GATES.back) m[y][x] = GATE;
  return m;
}
export const cataZone = (x, y) => CATA.zones.find(({ rect: [x0, y0, x1, y1] }) => x >= x0 && x <= x1 && y >= y0 && y <= y1)?.id || null;
export const barrowRoom = (x, y) => BARROW.rooms.find(({ rect: [x0, y0, x1, y1] }) => x >= x0 && x <= x1 && y >= y0 && y <= y1)?.id || null;
export const spikeUp = (x, t) => { const s = CATA.spikes; return ((t - x * s.lag) % s.every + s.every) % s.every < s.up; };

// The crypt door on Mournfield is data/duskmarch.js CRYPT.door; it now brings you to CATA.land.
export { CRYPT };
