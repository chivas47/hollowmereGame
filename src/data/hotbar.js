// Order of the hotbar slots. Tools first, then one seed slot, then one kit slot.
// The seed slot plants whichever crop G.S.seedSel names (see systems/seeds.js).
// The kit slot places whichever crafted object G.S.kitSel names (see systems/placeables.js).
export const HOTBAR = ['hoe', 'can', 'rod', 'pick', 'sword', 'seeds', 'kit'];
export const SEED_SLOT = HOTBAR.indexOf('seeds');
export const KIT_SLOT = HOTBAR.indexOf('kit');

// Saves before v8 had one slot per crop at these indexes.
export const OLD_SEED_SLOTS = ['turnip', 'radish', 'melon', 'pumpkin'];
export const OLD_FIRST_SEED_SLOT = 5;

// Names for tools: short for the hotbar, full for the bag.
export const TOOL_NAMES = {
  hoe: ['Hoe', 'Hoe'], can: ['Can', 'Watering can'], rod: ['Rod', 'Fishing rod'],
  pick: ['Pick', 'Pickaxe'], sword: ['Sword', 'Sword'],
};
