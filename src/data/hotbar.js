// Order of the hotbar slots. Tools first, then one seed slot, then one kit slot.
// The seed slot plants whichever crop G.S.seedSel names (see systems/seeds.js).
// The kit slot places whichever crafted object G.S.kitSel names (see systems/placeables.js).
// v19 added the axe at the end so no older key moved.
// v42 added the gold pan at the end (key 9), so no key moved.
export const HOTBAR = ['hoe', 'can', 'rod', 'pick', 'sword', 'seeds', 'kit', 'axe', 'pan'];
// v300: three item slots after the tools (keys 0, - and =): any item from the bag, chosen by the player
// (G.S.itemSlots). Holding food there and pressing Use eats it (systems/hotbarItems.js). No tool key moved.
export const ITEM_SLOTS = 3;
export const SLOT_COUNT = HOTBAR.length + ITEM_SLOTS;
export const isItemSlot = (i) => i >= HOTBAR.length && i < SLOT_COUNT;
// What the farmer holds: a tool kind from HOTBAR, or 'item' in an item slot. Systems compare this to 'hoe', 'sword'...
export const slotKind = (S, i = S.slot) => (isItemSlot(i) ? 'item' : HOTBAR[i]);
// The item key in the slot held (or the slot given), or null.
export const heldItem = (S, i = S.slot) => (isItemSlot(i) ? S.itemSlots?.[i - HOTBAR.length] || null : null);
export const SEED_SLOT = HOTBAR.indexOf('seeds');
export const KIT_SLOT = HOTBAR.indexOf('kit');

// Saves before v8 had one slot per crop at these indexes.
export const OLD_SEED_SLOTS = ['turnip', 'radish', 'melon', 'pumpkin'];
export const OLD_FIRST_SEED_SLOT = 5;

// Names for tools: short for the hotbar, full for the bag.
export const TOOL_NAMES = {
  hoe: ['Hoe', 'Hoe'], can: ['Can', 'Watering can'], rod: ['Rod', 'Fishing rod'],
  pick: ['Pick', 'Pickaxe'], sword: ['Sword', 'Sword'], axe: ['Axe', 'Axe'], pan: ['Pan', 'Gold pan'],
};
