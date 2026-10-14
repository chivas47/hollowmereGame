// Weapons, rings and mine finds (v36). G.S.weapons: owned weapon keys; G.S.weapon: the one hotbar slot 5 swings.
// Rings are items in the bag (data/weapons.js RINGS); G.S.rings: the two worn. Floors in FLOOR_FINDS give their find
// in a treasure chest (systems/treasure.js); monsters rarely drop something from DROP_POOL.
import { G } from '../core/game.js';
import { changed, notify } from '../core/events.js';
import { WEAPONS, WEAPON_KINDS, RINGS } from '../data/weapons.js';
import { CLOTHES } from '../data/clothing.js';
import { ITEMS } from '../data/items.js';

export const weapon = () => WEAPONS[G.S.weapon] || WEAPONS.oldblade;
export const weaponKind = () => WEAPON_KINDS[weapon().kind];
export const wearing = (id) => G.S.rings.includes(id);

// Gives a weapon, ring or pair of boots; says what it was. Returns false if it was a weapon or boots you have.
export function giveFind(key, how = 'You found') {
  const S = G.S;
  if (WEAPONS[key]) {
    if (S.weapons.includes(key)) return false;
    S.weapons.push(key);
    notify(`${how} a ${WEAPONS[key].name.toLowerCase()}! Choose your weapon in the bag (I).`);
  } else if (RINGS[key]) {
    S.bag[key] = (S.bag[key] || 0) + 1;
    notify(`${how} a ${RINGS[key].name.toLowerCase()}! Wear it from the bag (I).`);
  } else if (CLOTHES[key]) {
    if (S.wardrobe[key]) return false;
    S.wardrobe[key] = true;
    notify(`${how} ${CLOTHES[key].name.toLowerCase()}! Wear them from the bag (I).`);
  } else return false;
  changed();
  return true;
}

export function chooseWeapon(key) {
  if (!G.S.weapons.includes(key)) return false;
  G.S.weapon = key; changed();
  return true;
}

// Wears a ring from the bag in the first free hand (or replaces the second one); takes one off.
export function wearRing(key) {
  const S = G.S;
  if (!RINGS[key] || !(S.bag[key] > 0) || S.rings.includes(key)) return false;
  const slot = S.rings[0] ? 1 : 0;
  if (S.rings[slot]) S.bag[S.rings[slot]] = (S.bag[S.rings[slot]] || 0) + 1;
  S.bag[key]--; S.rings[slot] = key;
  changed(); return true;
}
export function removeRing(slot) {
  const S = G.S, k = S.rings[slot];
  if (!k) return false;
  S.bag[k] = (S.bag[k] || 0) + 1; S.rings[slot] = null;
  changed(); return true;
}
export const ringName = (k) => ITEMS[k]?.name;
// v37: floor finds now wait in a treasure chest on their floor (systems/treasure.js).

// ---- v39: the forge's gems and enchantments, and trinkets ----
// G.S.forged[weapon] = { gem: n }; G.S.weaponEnch[weapon] = enchant; G.S.toolEnch[tool] = enchant; G.S.trinket = key.
export const gemsOn = (key = G.S.weapon) => G.S.forged[key] || {};
export const gemCount = (key = G.S.weapon) => Object.values(gemsOn(key)).reduce((a, n) => a + n, 0);
const g = (gem) => gemsOn()[gem] || 0;
export const weaponEnchant = () => G.S.weaponEnch[G.S.weapon] || null;
export const toolEnchant = (tool) => G.S.toolEnch[tool] || null;
// Multipliers and additions the forge puts on the weapon in use.
export const forgeBonus = () => ({
  damage: 1 + 0.1 * g('heartstone'),
  crit: 0.04 * g('tidestone'),
  critPower: 1 + 0.25 * g('frosttear'),
  speed: 1 - 0.1 * g('emberquartz'),
  knock: 1 + 0.25 * g('violet'),
  defense: g('ambergem'),
});

export function wearTrinket(key) {
  const S = G.S;
  if (!ITEMS[key]?.trinket || !(S.bag[key] > 0)) return false;
  if (S.trinket) S.bag[S.trinket] = (S.bag[S.trinket] || 0) + 1;
  S.bag[key]--; S.trinket = key;
  changed(); return true;
}
export function removeTrinket() {
  const S = G.S;
  if (!S.trinket) return false;
  S.bag[S.trinket] = (S.bag[S.trinket] || 0) + 1; S.trinket = null;
  changed(); return true;
}
