import { HOMES, homeMap } from './homes.js';

// v71: management tools. Chests and signs are placed from the kit (data/crafting.js); the farm computer reads
// the farm; the lost and found at the town hall keeps what a chest still held when you took it up.

// Kinds of item a chest holds (Stardew: chest 36 slots, big chest 70). Our bag has no limit, so a slot is a kind.
export const CHEST_ROOM = { chest: 36, bigchest: 70 };
export const SIGN_LENGTH = 40;   // letters on a sign

// The live world map (journal): outdoor places on a grid, laid out the way their exits join (column, row).
export const WORLD = {
  // v303: two columns more in the west for the Duskmarch (Mournfield west of the town, the woods west of the village)
  desert: [0, 0], mournfield: [2, 0], town: [3, 0], mountain: [5, 0], quarry: [6, 0],
  tangle: [1, 1], gloamwood: [2, 1], village: [3, 1], farm: [4, 1], wilds: [5, 1], railway: [6, 1],
  beach: [2, 2], grove: [3, 2], forest: [4, 2],
  island: [2, 3], digsite: [3, 3],
};
// Rooms and caves show as the place you enter them from.
export const WORLD_PARENT = { house: 'farm', cave: 'farm', shed: 'farm', greenhouse: 'farm', maze: 'village', sewer: 'village', shrine: 'wilds', mine: 'wilds', crypt: 'mournfield', barrow: 'mournfield',
  ...Object.fromEntries(Object.entries(HOMES).filter(([, h]) => h.cottage).map(([id, h]) => [homeMap(id), h.map])) };   // v76: the neighbours' cottages
