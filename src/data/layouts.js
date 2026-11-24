// Farm layouts, chosen on the new game screen. Every layout keeps the same top of the farm (house,
// path, bin, well, workbench, stall, greenhouse plot) and the coop and barn plots with their yards;
// only the open ground below changes. apply(m) edits a fresh farm grid; perks are read by
// systems/layouts.js. Stardew's farm types by role, under our own names.
// Tiles: O water (fishable), T tree, R boulder, q quarry floor (rocks appear on it), z sand.
// v320 (roadmap 112a): size { w, h } in tiles, for a layout larger than 24 x 16 (core/constants.js W, H); the camera
// follows you across it. apply(m) gets a grid of that size from data/maps.js farmGrid(w, h).
import { W, H } from '../core/constants.js';
const rect = (m, x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m[y][x] = t; };
const dots = (m, list, t) => list.forEach(([x, y]) => { m[y][x] = t; });
// v321: a pond with its corners left as grass, and a loose stand of old trees around (cx, cy).
const pond = (m, x0, y0, x1, y1) => { rect(m, x0, y0, x1, y1, 'O'); dots(m, [[x0, y0], [x1, y0], [x0, y1], [x1, y1]], 'g'); };
const grove = (cx, cy) => [[0, 0], [2, 0], [1, 1], [3, 1], [-1, 2], [1, 2], [2, 3], [0, 4], [3, 4]].map(([dx, dy]) => [cx + dx, cy + dy]);

// v340 (roadmap 118b): a scatter of t over the grass in a box, the same every time (about one in `every` of the tiles on
// odd columns and rows, so every even row and column stays open and nothing is walled in).
const scatter = (m, x0, y0, x1, y1, every, t, salt = 1) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!(x % 2 && y % 2) || m[y][x] !== 'g') continue;
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(salt, 1013904223) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    if ((h >>> 0) % every === 0) m[y][x] = t;
  }
};

// v340 (roadmap 118b): every layout at the big size (Stardew's farm maps, by role, about half their area). big.apply
// adds to the small layout's own land, which stays where it was (so a farm can grow east and south, 118c); big.perks
// replace its perks for the larger land. Only farms whose save says bigFarm (every farm started from v340) use it.
export const BIG = { w: 64, h: 48 };

export const LAYOUTS = {
  open: {
    name: 'Open field', role: 'Standard',
    desc: 'The most room to farm and build.',
    apply: () => {},
    // A few old trees and boulders at the far edges; the rest is open ground (Stardew's Standard Farm).
    big: {
      apply: (m) => { dots(m, grove(56, 38).concat(grove(4, 38)), 'T'); dots(m, [[44, 12], [30, 40], [52, 24]], 'R'); },
      perks: { clutter: 6 },
    },
  },
  river: {
    name: 'River farm', role: 'Riverland',
    desc: 'A stream runs through: fish from your own land, but less ground to till.',
    apply: (m) => { rect(m, 11, 6, 12, 14, 'O'); rect(m, 13, 8, 16, 9, 'O'); rect(m, 5, 7, 7, 8, 'O'); },
    // The stream runs on south and bends east to leave by the south edge; a brook comes in from the east to meet it.
    big: {
      apply: (m) => {
        rect(m, 11, 15, 12, 31, 'O'); rect(m, 11, 31, 40, 32, 'O'); rect(m, 39, 33, 40, 46, 'O');
        rect(m, 41, 18, 62, 19, 'O'); rect(m, 40, 18, 40, 30, 'O'); m[25][40] = 'P'; rect(m, 22, 20, 27, 24, 'O');   // a ford over the brook; a pool
        dots(m, grove(54, 38).concat(grove(26, 40)), 'T');
      },
      perks: { clutter: 6 },
    },
  },
  woodland: {
    name: 'Woodland farm', role: 'Forest',
    desc: 'Old trees on the west edge. Forage grows in the wood, more alders stand on the land and large stumps grow back every season.',
    apply: (m) => dots(m, [[1, 6], [2, 6], [4, 6], [1, 7], [5, 7], [1, 8], [3, 8], [1, 9], [4, 9], [2, 10], [5, 10], [21, 6], [22, 6], [22, 7], [21, 9], [22, 9]], 'T'),
    perks: { forage: { area: [1, 6, 5, 10], perDay: 2 }, stumps: 4, alders: 6 },
    // The wood runs the length of the west side, with a second stand in the north-east.
    big: {
      apply: (m) => { scatter(m, 1, 15, 10, 46, 2, 'T', 1); scatter(m, 1, 15, 4, 46, 1, 'T', 7); scatter(m, 44, 6, 62, 16, 3, 'T', 2); dots(m, grove(30, 36), 'T'); },
      perks: { forage: { area: [1, 6, 8, 46], perDay: 4 }, stumps: 8, alders: 12, clutter: 6 },
    },
  },
  quarry: {
    name: 'Hill quarry', role: 'Hill-top',
    desc: 'A stony quarry on the farm: stone, copper and iron rocks turn up there every night.',
    apply: (m) => { rect(m, 6, 6, 11, 10, 'q'); dots(m, [[6, 6], [11, 6], [6, 10]], 'R'); },
    perks: { quarry: { cap: 10, perNight: 3 } },
    // The hill's main quarry in the east, ringed by boulders.
    big: {
      apply: (m) => { rect(m, 42, 8, 57, 20, 'q'); dots(m, [[42, 8], [57, 8], [42, 20], [57, 20], [50, 8], [40, 14], [59, 14]], 'R'); dots(m, grove(8, 36), 'T'); },
      perks: { quarry: { cap: 24, perNight: 6 }, clutter: 6 },
    },
  },
  wild: {
    name: 'Wild farm', role: 'Wilderness',
    desc: 'Slimes come out of the brush onto the farm after 8 pm. Good practice with the sword, and they drop gel.',
    apply: (m) => dots(m, [[1, 6], [22, 6], [1, 10], [22, 10], [9, 12], [14, 12]], 'T'),
    perks: { slimes: { from: 20 * 60, min: 2, max: 4 } },
    // Brush all round the edges and thickets in the open, where the slimes come from.
    big: {
      apply: (m) => {
        scatter(m, 1, 16, 4, 46, 2, 'T', 3); scatter(m, 57, 6, 62, 46, 2, 'T', 4); scatter(m, 5, 41, 56, 46, 2, 'T', 5);
        dots(m, grove(30, 24).concat(grove(48, 30), grove(16, 32)), 'T');
      },
      perks: { slimes: { from: 20 * 60, min: 4, max: 8 }, clutter: 6 },
    },
  },
  corners: {
    name: 'Four corners', role: 'Four Corners',
    desc: 'A little of everything: a pond, a small quarry, a stand of old trees and open ground.',
    apply: (m) => { rect(m, 18, 6, 21, 8, 'O'); rect(m, 1, 6, 4, 9, 'q'); dots(m, [[21, 10], [22, 10], [22, 9], [16, 6]], 'T'); },
    perks: { quarry: { cap: 4, perNight: 1 }, stumps: 2 },
    // A corner each: old wood in the north-east, a quarry in the south-west, a pond in the south-east.
    big: {
      apply: (m) => {
        scatter(m, 44, 6, 62, 20, 2, 'T', 6);
        rect(m, 4, 30, 16, 42, 'q'); dots(m, [[4, 30], [16, 30], [4, 42], [16, 42]], 'R');
        pond(m, 44, 32, 56, 42);
      },
      perks: { quarry: { cap: 10, perNight: 3 }, stumps: 4, clutter: 6 },
    },
  },
  beach: {
    name: 'Beach farm', role: 'Beach',
    desc: 'Sand and sea on the east side. Sea fishing at home, and a crate of supplies washes up most mornings.',
    apply: (m) => { rect(m, 17, 5, 20, 10, 'z'); rect(m, 21, 5, 22, 12, 'O'); },
    perks: { crates: { cap: 3, chance: 0.6 } },
    // The shore runs down the whole east side: a wide strand, then the sea.
    big: {
      apply: (m) => { rect(m, 48, 6, 55, 46, 'z'); rect(m, 56, 6, 62, 46, 'O'); rect(m, 46, 40, 47, 46, 'z'); },
      perks: { crates: { cap: 5, chance: 0.6 }, clutter: 6 },
    },
  },
  // v321 (roadmap 112b): the big farm, 64 x 48 (Stardew's Standard Farm by role, about half its area; eight times the
  // open field). The homestead corner is the same as every layout; the rest is wild land: two ponds to fish, old
  // groves and boulders along the edges, and six times the open field's starting clutter to clear.
  wide: {
    name: 'Wide acres', role: 'Standard (large)',
    desc: 'Wild land to start: two ponds to fish, old groves, and plenty to clear before it is all yours.',   // v340: every layout is this size now
    size: { w: 64, h: 48 },
    apply: (m) => {
      pond(m, 40, 20, 46, 25); pond(m, 14, 33, 18, 36);
      dots(m, grove(54, 7).concat(grove(58, 30), grove(4, 40), grove(30, 42), grove(50, 41), grove(27, 18)), 'T');
      dots(m, [[34, 12], [47, 33], [22, 27], [60, 18], [8, 24], [38, 37]], 'R');
    },
    perks: { clutter: 6 },
  },
  meadow: {
    name: 'Meadow farm', role: 'Meadowlands',
    desc: 'Starts with a chicken coop, two hens and a week of feed.',
    apply: () => {},
    perks: { start: { coop: true, hens: 2, feed: 14 } },
    big: {
      apply: (m) => { dots(m, grove(56, 38).concat(grove(34, 40)), 'T'); dots(m, [[46, 14], [20, 36]], 'R'); },
      perks: { start: { coop: true, hens: 2, feed: 14 }, clutter: 6 },
    },
  },
};

// v339 (roadmap 118a): the layout the new game screen starts on (and lists first). A save with no layout is
// still 'open' (core/state.js newState), so old farms keep theirs.
export const NEW_FARM_LAYOUT = 'wide';

// v340 (roadmap 118b): what a farm is built from: its size, its land and its perks, small or big (G.S.bigFarm). A layout
// with its own size (Wide acres) is that size either way.
export function farmPlan(id, big = false) {
  const L = LAYOUTS[id] || LAYOUTS.open, grow = big && L.big;
  return {
    size: L.size || (grow ? BIG : { w: W, h: H }),
    apply: (m) => { L.apply(m); if (grow) L.big.apply(m); },
    perks: grow ? L.big.perks : (L.perks || {}),
  };
}
export const farmSize = (id, big = false) => farmPlan(id, big).size;

// What a washed-up crate can hold: item -> [min, max]. One is picked.
export const CRATE = [
  { wood: [5, 10] }, { stone: [5, 10] }, { copper: [2, 4] }, { iron: [1, 2] }, { fiber: [5, 8] }, { hardwood: [1, 2] },
];
