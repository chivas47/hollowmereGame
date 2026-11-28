// v195: scenery, so the open ground between places reads as a real countryside rather than bare grass.
// Two kinds, both drawn only (nothing saved, nothing earned):
//   ground cover: small walkable things drawn into the map's background (flower clumps, ferns, mushrooms, pebbles,
//     shells), in patches rather than an even sprinkle, by biome and season (render/scenery.js);
//   props: solid things placed on open ground when a map is built (bushes, boulders, stumps, woodpiles, hay,
//     barrels, planters, flower pots, flower beds), by hand, where someone would have put them or where they would grow.
// The farm has neither: its grass is for the player to farm and build on.

// Biomes: which cover each map grows. Each kind is [name, weight]; rate is the share of open tiles that get
// something, patch how strongly it gathers into patches (0 even, 1 only in patches).
export const BIOMES = {
  meadow:   { kinds: [['flowers', 5], ['clover', 3], ['tall', 3], ['pebbles', 1]], on: 'g' },
  lane:     { kinds: [['flowers', 4], ['clover', 2], ['tall', 1], ['pebbles', 2]], on: 'g' },
  garden:   { kinds: [['flowers', 7], ['clover', 2], ['tall', 1], ['pebbles', 1]], on: 'g' },   // v356: the town's tended verges
  woods:    { kinds: [['fern', 5], ['mushrooms', 2], ['leaves', 3], ['moss', 2], ['flowers', 1]], on: 'g' },
  highland: { kinds: [['heather', 4], ['pebbles', 4], ['tall', 2], ['flowers', 1]], on: 'g' },
  shore:    { kinds: [['shells', 3], ['pebbles', 3], ['driftwood', 1], ['weed', 2]], on: 'z' },
  dunes:    { kinds: [['scrub', 4], ['pebbles', 3], ['cactus', 1], ['bones', 1]], on: 'z' },
  stone:    { kinds: [['pebbles', 5], ['cracks', 3]], on: 'q' },
  tropic:   { kinds: [['bloom', 4], ['fern', 3], ['tall', 2]], on: 'g' },
};

// Per map: the biome, rate (share of open tiles with cover) and patch. keepOff: [x0, y0, x1, y1] boxes left bare
// (the island's farm plot).
export const COVER = {
  wilds:    { biome: 'meadow', rate: 0.22, patch: 0.6 },
  village:  { biome: 'lane', rate: 0.14, patch: 0.7 },
  town:     { biome: 'garden', rate: 0.18, patch: 0.6 },   // v356: more flowers, so the town reads lived in
  mere:     { biome: 'meadow', rate: 0.22, patch: 0.6 },
  railway:  { biome: 'meadow', rate: 0.2, patch: 0.5 },
  forest:   { biome: 'woods', rate: 0.3, patch: 0.5 },
  grove:    { biome: 'woods', rate: 0.32, patch: 0.5 },
  mountain: { biome: 'highland', rate: 0.26, patch: 0.5 },
  beach:    { biome: 'shore', rate: 0.12, patch: 0.4 },
  desert:   { biome: 'dunes', rate: 0.1, patch: 0.4 },
  digsite:  { biome: 'dunes', rate: 0.1, patch: 0.4 },
  quarry:   { biome: 'stone', rate: 0.12, patch: 0.3 },
  gloamwood: { biome: 'woods', rate: 0.3, patch: 0.5 },   // v303
  tangle:   { biome: 'woods', rate: 0.34, patch: 0.4 },
  mournfield: { biome: 'highland', rate: 0.14, patch: 0.6 },
  island:   { biome: 'tropic', rate: 0.25, patch: 0.5, keepOff: [[4, 3, 17, 8]] },
};

// Props, solid, each on an open tile of its map ([kind, x, y]). Tile letters are in PROP_TILES; the art is in
// render/scenery.js. Kept clear of paths' edges where people walk, doors, exits, signs and every neighbour's spots
// (tests/scenery.test.mjs). Trees are the maps' own trees (T), planted in small stands on the widest open ground.
export const PROP_TILES = { tree: 'T', bush: 'ƃ', boulder: 'ǫ', stump: 'ƫ', woodpile: 'ǥ', hay: 'ȟ', barrels: 'ȸ', planter: 'ƥ', pots: 'ǒ', flowerbed: 'ǚ' };   // v356: pots and flower beds
export const PROPS = {
  village: [
    // shrubs along the north row's gardens and the east road's hedge end, a woodpile by Kit's, hay by Tamsin's pens
    ['bush', 4, 1], ['bush', 15, 1], ['bush', 23, 1], ['planter', 19, 6], ['bush', 35, 5], ['woodpile', 33, 6],
    ['hay', 35, 11], ['hay', 35, 12], ['barrels', 23, 12],
    // the green and the lower lane: shrubs, a planter by Rook's, a stump by the pond
    ['bush', 1, 16], ['planter', 16, 19], ['bush', 20, 17], ['bush', 27, 17], ['stump', 28, 24], ['boulder', 37, 25],
    ['bush', 2, 25], ['bush', 13, 25], ['bush', 21, 26], ['bush', 37, 16], ['boulder', 36, 1],
    // stands of trees: the north-east corner, the east lane's verge, the meadow south of the lower lane
    ['tree', 27, 2], ['tree', 31, 1], ['tree', 34, 3], ['tree', 36, 10], ['tree', 35, 15], ['tree', 19, 23], ['tree', 22, 24], ['tree', 27, 26],
    // v356: pots by the north row's and the lower lane's doors
    ['pots', 4, 3], ['pots', 19, 3], ['pots', 3, 19], ['pots', 7, 19], ['pots', 12, 19],
  ],
  town: [
    // barrels and crates by the store, the smithy's woodpile, planters at the clinic and museum, shrubs on the edges
    ['barrels', 2, 6], ['woodpile', 36, 5], ['barrels', 32, 6], ['planter', 13, 11], ['planter', 21, 11],
    ['bush', 22, 2], ['bush', 27, 4], ['bush', 31, 2], ['bush', 37, 11], ['bush', 25, 14], ['bush', 2, 19],
    ['boulder', 6, 21], ['bush', 20, 20], ['stump', 28, 21], ['bush', 33, 17], ['bush', 17, 18], ['planter', 13, 15],
    // a copse in the open south-east, and trees by the tavern's back field
    ['tree', 24, 18], ['tree', 26, 20], ['tree', 22, 21], ['tree', 30, 19], ['tree', 33, 21], ['tree', 35, 13], ['tree', 4, 17], ['tree', 8, 18],
    // v356: pots of flowers by the doors, flower beds along the lanes and on the open east side
    ['pots', 3, 7], ['pots', 6, 3], ['pots', 15, 3], ['pots', 18, 3], ['pots', 17, 7], ['pots', 19, 7],
    ['pots', 16, 16], ['pots', 31, 6],
    ['flowerbed', 4, 13], ['flowerbed', 5, 13], ['flowerbed', 19, 13], ['flowerbed', 20, 13],
    ['flowerbed', 23, 6], ['flowerbed', 24, 6], ['flowerbed', 25, 6], ['planter', 26, 6], ['planter', 29, 3], ['bush', 22, 6],
  ],
  mere: [
    ['bush', 2, 6], ['boulder', 9, 2], ['bush', 16, 2], ['stump', 30, 2], ['boulder', 34, 4], ['bush', 37, 8],
    ['bush', 2, 14], ['woodpile', 8, 19], ['boulder', 11, 16], ['bush', 34, 18], ['stump', 37, 23], ['bush', 14, 24],
    ['boulder', 24, 25], ['bush', 6, 25], ['bush', 29, 25],
    ['tree', 5, 4], ['tree', 3, 9], ['tree', 12, 23], ['tree', 17, 25], ['tree', 37, 14], ['tree', 32, 1],
  ],
  grove: [
    ['stump', 4, 2], ['boulder', 15, 1], ['bush', 25, 2], ['bush', 36, 6], ['boulder', 23, 9], ['bush', 2, 15],
    ['stump', 9, 16], ['boulder', 16, 15], ['bush', 21, 14], ['stump', 34, 18], ['bush', 37, 9], ['bush', 30, 14],
    ['boulder', 3, 21], ['bush', 15, 21], ['bush', 38, 21],
    ['tree', 28, 21], ['tree', 33, 10], ['tree', 10, 7],
  ],
  wilds: [['bush', 1, 2], ['stump', 4, 7], ['bush', 2, 10], ['boulder', 6, 12], ['bush', 13, 14], ['bush', 20, 14], ['stump', 22, 10]],
  forest: [['bush', 5, 2], ['stump', 16, 3], ['bush', 21, 5], ['boulder', 5, 10], ['stump', 17, 13], ['bush', 20, 12], ['bush', 3, 4]],
  railway: [['bush', 2, 1], ['woodpile', 11, 4], ['boulder', 17, 2], ['bush', 22, 4], ['bush', 2, 10], ['boulder', 12, 12], ['bush', 19, 13]],
  mountain: [['boulder', 1, 2], ['boulder', 19, 5], ['bush', 1, 7], ['boulder', 8, 12], ['bush', 18, 11], ['boulder', 4, 14]],
};
