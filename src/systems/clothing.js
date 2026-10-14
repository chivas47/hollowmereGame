// Clothing: the wardrobe (G.S.wardrobe: piece key -> true), what you wear (G.S.outfit: slot -> key or
// null for the look from the new game screen), dyes (G.S.dyes: piece key -> colour), and the stations
// in the farmhouse: the sewing machine (weave cloth, tailor), the dye pots and mannequins.
import { G } from '../core/game.js';
import { buff } from './buffs.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addEntities } from '../core/registry.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES, CLOTH } from '../data/clothing.js';
import { FURNITURE } from '../data/furniture.js';
import { playerPal } from '../data/profile.js';
import { drawPerson } from '../render/sprites.js';
import { placeKey, parsePlaceKey } from './world.js';

export const pieceColor = (k) => G.S.dyes?.[k] || CLOTHES[k].color;
// The colour an item can dye with: crops, fruit and fish have one.
export const dyeOf = (item) => ITEMS[item]?.color || null;
// Clothing that a given item tailors into.
export const tailorsInto = (item) => Object.keys(CLOTHES).find((k) => CLOTHES[k].from === item) || null;
export const defense = () => (CLOTHES[G.S.outfit?.shoes]?.def || 0) + buff('defense');   // v35: food buffs add defense

// The palette drawPerson() uses for someone in this outfit.
export function outfitPal(profile, outfit = {}) {
  const pal = playerPal(profile), hat = CLOTHES[outfit.hat];
  if (CLOTHES[outfit.shirt]) pal.shirt = pieceColor(outfit.shirt);
  if (CLOTHES[outfit.pants]) pal.pants = pieceColor(outfit.pants);
  if (CLOTHES[outfit.shoes]) pal.shoes = pieceColor(outfit.shoes);
  if (outfit.hat === null) { pal.hat = null; }
  else if (hat) Object.assign(pal, { hat: hat.color, band: hat.band || hat.color, hatStyle: hat.style });
  return pal;
}

on('game:loaded', () => {
  const S = G.S;
  S.wardrobe ||= { straw: true };
  S.outfit = { shirt: null, pants: null, hat: 'straw', shoes: null, ...(S.outfit || {}) };
  S.dyes ||= {};
});

export function weaveCloth(n = 1) {
  const S = G.S, need = CLOTH.fiber * n;
  if (S.bag.fiber < need) { notify(`Cloth takes ${CLOTH.fiber} fiber. Cut weeds for more.`); return false; }
  S.bag.fiber -= need; S.bag.cloth = (S.bag.cloth || 0) + n;
  emit('sfx', 'place');
  notify(`Wove ${n} cloth.`);
  changed();
  return true;
}

export function tailor(item) {
  const S = G.S, k = tailorsInto(item);
  if (!k || S.wardrobe[k] || !(S.bag.cloth > 0) || !(S.bag[item] > 0)) return false;
  if (item === 'cloth' && S.bag.cloth < 2) return false;
  S.bag.cloth--; S.bag[item]--; S.wardrobe[k] = true;
  emit('sfx', 'levelup');
  notify(`You sewed a ${CLOTHES[k].name}.`);
  changed();
  return true;
}

export function wear(slot, k) {
  const S = G.S;
  if (k && (!S.wardrobe[k] || CLOTHES[k].slot !== slot)) return false;
  S.outfit[slot] = k; changed(); return true;
}

export function dye(k, item) {
  const S = G.S, c = dyeOf(item);
  if (!S.wardrobe[k] || !['shirt', 'pants'].includes(CLOTHES[k].slot) || !c || !(S.bag[item] > 0)) return false;
  S.bag[item]--; S.dyes[k] = c;
  notify(`Dyed the ${CLOTHES[k].name.toLowerCase()} the colour of ${ITEMS[item].name.toLowerCase()}.`);
  changed();
  return true;
}

// Mannequins wear a copy of an outfit.
export function dressMannequin(x, y) {
  const p = G.S.placed[placeKey('house', x, y)];
  if (!p) return false;
  p.outfit = { ...G.S.outfit }; changed(); notify('The mannequin wears your outfit now.');
  return true;
}

// Facing a station opens it. Priority 73: above the pick-up dialog for placed things (72).
addInteraction(73, ({ tx, ty, mapId }) => {
  if (mapId !== 'house') return false;
  const p = G.S.placed[placeKey('house', tx, ty)], st = FURNITURE[p?.kind]?.station;
  if (!st) return false;
  emit(`ui:${st}`, { x: tx, y: ty });
  return true;
});

// The outfit on each mannequin, drawn over its stand.
addEntities(() => (G.S.map !== 'house' ? [] : Object.entries(G.S.placed).filter(([k, p]) => p.kind === 'mannequin' && p.outfit && k.startsWith('house:'))
  .map(([k, p]) => { const { x, y } = parsePlaceKey(k); return { y: (y + 1) * T - 2, draw: (c) => drawPerson(c, x * T + 8, y * T + 13, 'down', false, 0, { ...outfitPal(G.S.profile, p.outfit), skin: '#d9c39a', hair: '#d9c39a' }) }; })));
