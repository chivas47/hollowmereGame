// Farm layouts, chosen on the new game screen. Every layout keeps the same top of the farm (house,
// path, bin, well, workbench, stall, greenhouse plot) and the coop and barn plots with their yards;
// only the open ground below changes. apply(m) edits a fresh farm grid; perks are read by
// systems/layouts.js. Stardew's farm types by role, under our own names.
// Tiles: O water (fishable), T tree, R boulder, q quarry floor (rocks appear on it), z sand.
const rect = (m, x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m[y][x] = t; };
const dots = (m, list, t) => list.forEach(([x, y]) => { m[y][x] = t; });

export const LAYOUTS = {
  open: {
    name: 'Open field', role: 'Standard',
    desc: 'The most room to farm and build.',
    apply: () => {},
  },
  river: {
    name: 'River farm', role: 'Riverland',
    desc: 'A stream runs through: fish from your own land, but less ground to till.',
    apply: (m) => { rect(m, 11, 6, 12, 14, 'O'); rect(m, 13, 8, 16, 9, 'O'); rect(m, 5, 7, 7, 8, 'O'); },
  },
  woodland: {
    name: 'Woodland farm', role: 'Forest',
    desc: 'Old trees on the west edge. Forage grows in the wood, more alders stand on the land and large stumps grow back every season.',
    apply: (m) => dots(m, [[1, 6], [2, 6], [4, 6], [1, 7], [5, 7], [1, 8], [3, 8], [1, 9], [4, 9], [2, 10], [5, 10], [21, 6], [22, 6], [22, 7], [21, 9], [22, 9]], 'T'),
    perks: { forage: { area: [1, 6, 5, 10], perDay: 2 }, stumps: 4, alders: 6 },
  },
  quarry: {
    name: 'Hill quarry', role: 'Hill-top',
    desc: 'A stony quarry on the farm: stone, copper and iron rocks turn up there every night.',
    apply: (m) => { rect(m, 6, 6, 11, 10, 'q'); dots(m, [[6, 6], [11, 6], [6, 10]], 'R'); },
    perks: { quarry: { cap: 10, perNight: 3 } },
  },
  wild: {
    name: 'Wild farm', role: 'Wilderness',
    desc: 'Slimes come out of the brush onto the farm after 8 pm. Good practice with the sword, and they drop gel.',
    apply: (m) => dots(m, [[1, 6], [22, 6], [1, 10], [22, 10], [9, 12], [14, 12]], 'T'),
    perks: { slimes: { from: 20 * 60, min: 2, max: 4 } },
  },
  corners: {
    name: 'Four corners', role: 'Four Corners',
    desc: 'A little of everything: a pond, a small quarry, a stand of old trees and open ground.',
    apply: (m) => { rect(m, 18, 6, 21, 8, 'O'); rect(m, 1, 6, 4, 9, 'q'); dots(m, [[21, 10], [22, 10], [22, 9], [16, 6]], 'T'); },
    perks: { quarry: { cap: 4, perNight: 1 }, stumps: 2 },
  },
  beach: {
    name: 'Beach farm', role: 'Beach',
    desc: 'Sand and sea on the east side. Sea fishing at home, and a crate of supplies washes up most mornings.',
    apply: (m) => { rect(m, 17, 5, 20, 10, 'z'); rect(m, 21, 5, 22, 12, 'O'); },
    perks: { crates: { cap: 3, chance: 0.6 } },
  },
  meadow: {
    name: 'Meadow farm', role: 'Meadowlands',
    desc: 'Starts with a chicken coop, two hens and a week of feed.',
    apply: () => {},
    perks: { start: { coop: true, hens: 2, feed: 14 } },
  },
};

// What a washed-up crate can hold: item -> [min, max]. One is picked.
export const CRATE = [
  { wood: [5, 10] }, { stone: [5, 10] }, { copper: [2, 4] }, { iron: [1, 2] }, { fiber: [5, 8] }, { hardwood: [1, 2] },
];
