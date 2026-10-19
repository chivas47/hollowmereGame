// v66: tide nuts, the island's found currency (Stardew's golden walnuts: never bought, found by digging, farming,
// fishing and puzzles on the island, and spent to open its areas). Each source gives its nuts once.
export const NUT = { name: 'tide nut', plural: 'tide nuts' };
// Hidden dig spots on the island beach (sand): dig with the hoe, one nut each, once.
export const BEACH_DIGS = [[3, 13], [8, 12], [16, 13], [21, 12]];
export const NUT_CROPS = 5;     // the first harvest of each of this many different crops on the island gives a nut
export const NUT_FISH = 3;      // so do the first fish caught in the island's waters
// The old bridge to the dig site, east of the island (Stardew: a parrot fixes the dig site bridge for 10 walnuts).
export const BRIDGE = { nuts: 10 };
// The dig site (Stardew's island dig site, its artifact troves and bone nodes): four fresh dig spots each morning.
export const DIG_SITE = { spots: 4, loot: [['geode', 0.35], ['frostgeode', 0.2], ['quartz', 0.2], ['ambergem', 0.15], ['frosttear', 0.1]], nutDigs: 3 };
// The island trader takes tide nuts (Stardew's island trader barters island goods; Nuno: nuts buy here too).
export const ISLAND_SHOP = [
  { key: 'booster3', label: '10 Heirloom booster', kit: { booster3: 10 }, nuts: 3 },
  { key: 'tonic2', label: '10 Strong growth tonic', kit: { tonic2: 10 }, nuts: 2 },
  { key: 'gleamfruit', label: '5 Gleamfruit seeds', seeds: { gleamfruit: 5 }, nuts: 2 },
  { key: 'sprinkler3', label: 'Steel sprinkler', kit: { sprinkler3: 1 }, nuts: 5 },
  { key: 'islandhat', label: 'Palm-leaf hat', hat: 'islandhat', nuts: 10, once: true },
];

// v67: the Smoke Peak, the island's dungeon (Stardew's volcano dungeon by role: ten floors, lava, cinder and gold,
// the strongest monsters, a reward at the top). It runs on the mine engine (systems/mine.js, zone 'peak') and opens
// for 5 nuts. Floors 2, 4, 6 and 8 give a nut with their first ladder; the summit cache gives 3.
export const PEAK = {
  name: 'The Smoke Peak', nuts: 5, floors: 10, entrance: { x: 12, y: 1 },
  eff: (n) => 100 + 3 * n,   // between the Sunken Cavern (100 + 2n) and the Ember Vent (130 + 3n)
  lava: 0.06, cinder: 0.2, gold: 0.12, umbrite: 0.08,
  monsters: (n) => Math.min(12, 6 + n),
  nutFloors: [2, 4, 6, 8], summitNuts: 3,
};
// v67: hidden puzzles on the island, 2 nuts each, once (Stardew's island puzzles give 1 to 5 walnuts each).
export const PUZZLE_NUTS = 2;
export const CHIMES = [[13, 13], [18, 13], [15, 12]];   // shells, small to large: strike them in that order
export const STONES = [[2, 4], [2, 6], [2, 8]];          // dry basins: water all three on one day
export const ALTAR = { x: 22, y: 6, item: 'gleamfruit' };  // leave an island crop on it
export const LANTERN = { x: 9, y: 11, from: 20 * 60, coal: 1 };   // light it with coal after 8pm
