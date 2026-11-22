// v300: the hotbar's item slots (keys 0, - and =, data/hotbar.js): any item from the bag, as Stardew lets the
// toolbar hold anything. Assigned from the Bag (ui/inventory.js: a button, the slot's key, or a drag). Holding food
// and pressing Use eats it; a slot keeps its item when you run out, so it fills again when you have more.
import { G } from '../core/game.js';
import { changed, notify } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { ITEMS } from '../data/items.js';
import { HOTBAR, ITEM_SLOTS, heldItem } from '../data/hotbar.js';
import { edible, eat, energyOf } from './cooking.js';

const slots = () => (G.S.itemSlots ||= Array(ITEM_SLOTS).fill(null));

// Puts item k in item slot n (0 to 2); it leaves any other slot it was in. Returns false for an unknown item.
export function assignItem(n, k) {
  if (!(n >= 0 && n < ITEM_SLOTS) || !ITEMS[k]) return false;
  const s = slots();
  for (let i = 0; i < ITEM_SLOTS; i++) if (s[i] === k) s[i] = null;
  s[n] = k;
  changed();
  return true;
}
export function clearItem(n) {
  if (!(n >= 0 && n < ITEM_SLOTS)) return false;
  slots()[n] = null;
  if (G.S.slot === HOTBAR.length + n) G.S.slot = 0;
  changed();
  return true;
}
export const slotOf = (k) => slots().indexOf(k);

// Priority 44: under harvesting, forage, doors, neighbours and machines, so those still answer first; on open
// ground, food in hand is eaten (systems/farming.js lets an item slot through when there is nothing to pick).
addInteraction(44, ({ item }) => {
  if (item !== 'item') return false;
  const k = heldItem(G.S);
  if (!k) return false;
  if (!edible(k)) { notify(`You hold the ${ITEMS[k].name.toLowerCase()}. It is not something to eat.`); return true; }
  if (!(G.S.bag[k] > 0)) { notify(`No ${ITEMS[k].name.toLowerCase()} left.`); return true; }
  return eat(k);
});
addPrompt(44, ({ item }) => {
  if (item !== 'item') return null;
  const k = heldItem(G.S);
  return k && edible(k) && G.S.bag[k] > 0 ? `Eat ${ITEMS[k].name.toLowerCase()} (+${energyOf(k)} energy)` : null;
});
