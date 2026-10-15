// Cooking, buffs, daily luck and the wishfruit (v35).
// Recipes known: G.S.recipes (keys of DISHES). Cook at the farmhouse stove (the kitchen, from the first house
// upgrade) with what is in the bag and the fridge (G.S.fridge, a kitchen counter). Eating a dish restores energy and
// health and may give a buff: G.S.buff (food) and G.S.drink, each { id, until, ...effects }, gone at bedtime.
// Daily luck: G.S.luck, rolled each morning; luck buffs add to it (luck()). Recipes come from the cooking show on the
// TV (furniture), from neighbours at 3 and 7 hearts and from the seed stall.
// Wishfruit: five in the valley (G.S.wish: source -> true), each eaten one +34 max energy (G.S.wishfruits).
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { DISHES, TV_RECIPES, HEALTH_PER_ENERGY, LUCK, WISHFRUIT } from '../data/cooking.js';
import { ITEMS } from '../data/items.js';
import { FISH } from '../data/fish.js';
import { PROJECTS } from '../data/projects.js';
import { NPCS } from '../data/npcs.js';
import { recalcStats } from './upgrades.js';
import { addItem } from './quality.js';
import { hearts } from './npcs.js';
import { buff } from './buffs.js';
export { buff, luck, speedMult, attackMult } from './buffs.js';

export const knows = (k) => G.S.recipes.includes(k);
const have = (k) => (G.S.bag[k] || 0) + (G.S.fridge[k] || 0);
export const canCook = (k) => knows(k) && Object.entries(DISHES[k].needs).every(([i, n]) => have(i) >= n);
export const kitchen = () => (G.S.upgrades.house || 0) >= 1;

export function learn(k, how) {
  if (!DISHES[k] || knows(k)) return false;
  G.S.recipes.push(k);
  notify(`${how ? `${how} ` : ''}You learned to cook ${DISHES[k].name.toLowerCase()}.`);
  changed();
  return true;
}

// Uses the bag first, then the fridge.
export function cook(k) {
  if (!kitchen() || !canCook(k)) return false;
  for (const [i, n] of Object.entries(DISHES[k].needs)) {
    const fromBag = Math.min(G.S.bag[i] || 0, n);
    G.S.bag[i] -= fromBag; if (n > fromBag) G.S.fridge[i] -= n - fromBag;
  }
  addItem(k, 1);
  emit('sfx', 'pickup');
  changed();
  return true;
}

// ---- Eating and buffs ----
export const edible = (k) => !!DISHES[k] || k === 'wishfruit';
export function eat(k) {
  const S = G.S;
  if (!edible(k) || !(S.bag[k] > 0)) return false;
  S.bag[k]--;
  if (k === 'wishfruit') {
    S.wishfruits = (S.wishfruits || 0) + 1; recalcStats(); S.energy = S.maxEnergy;
    notify(`The wishfruit tastes of starlight. Max energy +${WISHFRUIT.energy}.`);
    changed(); return true;
  }
  const d = DISHES[k];
  S.energy = Math.min(S.maxEnergy, S.energy + d.energy);
  S.hp = Math.min(S.maxHp, S.hp + Math.round(d.energy * HEALTH_PER_ENERGY));
  if (d.buff) {
    S[d.drink ? 'drink' : 'buff'] = { id: k, until: S.time + (d.mins || 600), ...d.buff };
    recalcStats();
  }
  notify(`You eat the ${d.name.toLowerCase()}. +${d.energy} energy.${d.buff ? ` ${buffText(d.buff)}.` : ''}`);
  emit('sfx', 'pickup');
  changed();
  return true;
}
export const buffText = (b) => Object.entries(b).map(([k, v]) => (k === 'maxEnergy' ? `Max energy +${v}` : `${k[0].toUpperCase()}${k.slice(1)} +${v}`)).join(', ');

// ---- Each morning: buffs end, luck rolls, recipes and wishfruit arrive ----
const WEEK = 7;
on('day:start', (report) => {
  const S = G.S;
  S.buff = null; S.drink = null; recalcStats();
  S.luck = Math.round((LUCK.min + Math.random() * (LUCK.max - LUCK.min)) * 1000) / 1000;
  report.luck = S.luck;
  for (const [k, d] of Object.entries(DISHES)) {   // neighbours' recipes
    if (typeof d.from !== 'string' || !d.from.startsWith('npc:') || knows(k)) continue;
    const [, id, h] = d.from.split(':'), st = S.npcs[id];
    if (st && hearts(st) >= +h) { S.recipes.push(k); (report.recipes ||= []).push(`${NPCS.find((n) => n.id === id).name}: ${d.name}`); }
  }
  const give = (src) => { if (S.wish[src]) return; S.wish[src] = true; addItem('wishfruit', 1); report.wishfruit = src; };
  if (Object.values(S.npcs).some((st) => hearts(st) >= 10)) give('friend');
  if (Object.keys(PROJECTS).every((k) => S.projects[k])) give('projects');
  if (Object.keys(FISH).every((k) => S.fishLog[k])) give('fish');
});
on('mine:floor', ({ floor }) => {
  if (floor >= WISHFRUIT.mineFloor && !G.S.wish.mine) { G.S.wish.mine = true; addItem('wishfruit', 1); notify('Something glows in the rubble: a wishfruit!'); changed(); }
});

// The TV's cooking show: a new recipe every seventh day, a rerun of an aired one three days later.
export function tvShow() {
  const S = G.S, d = S.day % WEEK, aired = Math.floor(S.day / WEEK);
  if (d === 0) { const k = TV_RECIPES[(aired - 1) % TV_RECIPES.length]; return { k, rerun: false }; }
  if (d === 3) { const k = TV_RECIPES.slice(0, Math.min(aired, TV_RECIPES.length)).find((x) => !knows(x)); return k ? { k, rerun: true } : null; }
  return null;
}
export const fortune = (l) => (l > 0.07 ? 'The spirits are very happy today.' : l > 0.02 ? 'The spirits are in good humour today.' : l >= -0.02 ? 'The spirits feel neutral today.' : l >= -0.07 ? 'The spirits are somewhat annoyed today.' : 'The spirits are very displeased today.');

// Stove and fridge. Priority 71: above the farmhouse's flavour lines (70).
addInteraction(71, ({ tile, mapId }) => {
  if (mapId !== 'house' || (tile !== 'o' && tile !== 'n')) return false;
  emit(tile === 'o' ? 'ui:cook' : 'ui:fridge');
  return true;
});

// Recipes sold at the seed stall.
export function buyRecipe(k) {
  const price = DISHES[k]?.from?.tavern;
  if (!price || knows(k) || G.S.gold < price) return false;
  G.S.gold -= price;
  emit('sfx', 'coin');
  return learn(k, 'Bought the recipe.');
}

export function store(k, n) {
  if (!(n > 0) || (G.S.bag[k] || 0) < n) return false;
  G.S.bag[k] -= n; G.S.fridge[k] = (G.S.fridge[k] || 0) + n;
  changed(); return true;
}
export function takeOut(k, n) {
  if (!(n > 0) || (G.S.fridge[k] || 0) < n) return false;
  G.S.fridge[k] -= n; addItem(k, n);
  changed(); return true;
}
