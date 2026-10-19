// v71: management tools. Chests and signs are placed from the kit (data/crafting.js); the farm computer reads
// the farm; the lost and found at the town hall keeps what a chest still held when you took it up.

// Kinds of item a chest holds (Stardew: chest 36 slots, big chest 70). Our bag has no limit, so a slot is a kind.
export const CHEST_ROOM = { chest: 36, bigchest: 70 };
export const SIGN_LENGTH = 40;   // letters on a sign

// The live world map (journal): outdoor places on a grid, laid out the way their exits join (column, row).
export const WORLD = {
  desert: [0, 0], town: [1, 0], mountain: [3, 0], quarry: [4, 0],
  village: [1, 1], farm: [2, 1], wilds: [3, 1], railway: [4, 1],
  beach: [0, 2], grove: [1, 2], forest: [2, 2],
  island: [0, 3], digsite: [1, 3],
};
// Rooms and caves show as the place you enter them from.
export const WORLD_PARENT = { house: 'farm', cave: 'farm', shed: 'farm', greenhouse: 'farm', maze: 'village', sewer: 'village', shrine: 'wilds', mine: 'wilds' };
