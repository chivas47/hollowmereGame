// The town (v46): the general store, the smithy and Bram's carpentry, north of the village; v47 the tavern and the
// clinic. Each opens its dialog from its door during opening hours (data/town.js); the farm's old stall and
// workbench point the way. v47: the farmhouse phone (hours, the forecast, Bram's orders) and the tavern and clinic stock.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { SHOPS, DAY_NAMES, TAVERN, CLINIC } from '../data/town.js';
import { DISHES, TV_RECIPES } from '../data/cooking.js';
import { ITEMS } from '../data/items.js';
import { addItem } from './quality.js';
import { hearts } from './npcs.js';
import { CANDIDATES, BOUQUET } from '../data/romance.js';
import { SHOP_SPOTS } from '../data/maps.js';
import { today, fmtTime } from '../core/time.js';
import { festivalToday } from './festivals.js';

const BY_TILE = Object.fromEntries(Object.entries(SHOP_SPOTS).map(([k, s]) => [s.tile, k]));

// Whether a shop opens at all today: not on its closing day or a festival day.
export const openToday = (k) => !festivalToday() && !SHOPS[k].closed.includes(today().wd);
export const isOpen = (k, t = G.S.time) => openToday(k) && t >= SHOPS[k].open && t < SHOPS[k].close;
export function closedWhy(k) {
  const s = SHOPS[k];
  if (festivalToday()) return `${s.name} is shut today: everyone is at the festival.`;
  if (s.closed.includes(today().wd)) return `${s.name} is closed on ${DAY_NAMES[today().wd]}s.`;
  if (!isOpen(k)) return `${s.name} is open ${fmtTime(s.open)} to ${fmtTime(s.close)}.`;
  return null;
}

addInteraction(72, ({ tile, mapId }) => {
  const k = mapId === 'town' && BY_TILE[tile];
  if (!k) return false;
  const why = closedWhy(k);
  if (why) { notify(why); return true; }
  emit(SHOPS[k].ui);
  return true;
});

// The farm's stall and workbench: their trade moved to town.
addInteraction(70, ({ tile, mapId }) => {
  if (mapId !== 'farm') return false;
  if (tile === 'S') { notify(`The stall is empty: seeds and supplies are sold at ${SHOPS.store.name} in town, north of the village.`); return true; }
  if (tile === 'K') { notify(`Bram works from ${SHOPS.carpenter.name} in town now; tools go to ${SHOPS.smithy.keeper} at ${SHOPS.smithy.name}.`); return true; }
  return false;
});

// v49: the keepers are villagers now (data/npcs.js, data/schedules.js) and stand by their doors while open.

// ---- v47: the phone on the farmhouse wall ----
addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'house' || tile !== '_') return false;
  emit('ui:phone');
  return true;
});

// ---- v47: the tavern ----
// The dish of the day: a dish off the cooking show not on the menu, a new one each day.
export function special(day = G.S.day) {
  const list = TV_RECIPES.filter((k) => !TAVERN.menu.includes(k));
  return list[(day * 7 + 3) % list.length];
}
export const dishPrice = (k) => DISHES[k].sell * TAVERN.markup;
export function buyDish(k) {
  const S = G.S;
  if (!(TAVERN.menu.includes(k) || k === special()) || S.gold < dishPrice(k)) return false;
  S.gold -= dishPrice(k);
  addItem(k, 1);
  emit('sfx', 'coin');
  notify(`${SHOPS.tavern.keeper} slides over a plate: ${DISHES[k].name.toLowerCase()}. Eat it from the bag.`);
  changed();
  return true;
}

// ---- v47: the clinic ----
export function buyClinic(k) {
  const S = G.S, o = CLINIC.stock.find((x) => x.key === k);
  if (!o || S.gold < o.cost) return false;
  S.gold -= o.cost;
  addItem(k, 1);
  emit('sfx', 'coin');
  notify(`Bought an ${ITEMS[k].name.toLowerCase()}. Drink it from the bag.`);
  changed();
  return true;
}

// ---- v51: the bouquet, at the store once any candidate is at 8 hearts ----
export const bouquetOnSale = () => CANDIDATES.some((id) => hearts(G.S.npcs[id]) >= BOUQUET.hearts);
export function buyBouquet() {
  const S = G.S;
  if (!bouquetOnSale() || S.gold < BOUQUET.cost) return false;
  S.gold -= BOUQUET.cost;
  addItem('bouquet', 1);
  emit('sfx', 'coin');
  notify('Bought a bouquet. Give it to someone at 8 hearts or more to start dating.');
  changed();
  return true;
}
