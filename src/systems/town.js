// The town (v46): the general store, the smithy and Bram's carpentry, north of the village. Each opens its dialog
// from its door during opening hours (data/town.js); the farm's old stall and workbench point the way.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { emit, notify } from '../core/events.js';
import { addInteraction, addEntities } from '../core/registry.js';
import { SHOPS, DAY_NAMES } from '../data/town.js';
import { SHOP_SPOTS } from '../data/maps.js';
import { NPCS } from '../data/npcs.js';
import { today, fmtTime } from '../core/time.js';
import { drawPerson } from '../render/sprites.js';
import { festivalToday } from './festivals.js';

const BY_TILE = Object.fromEntries(Object.entries(SHOP_SPOTS).map(([k, s]) => [s.tile, k]));
const look = (k) => SHOPS[k].look || NPCS.find((n) => n.id === 'bram').pal;

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

// Keepers stand by their doors while the shop is open.
addEntities(() => (G.S.map !== 'town' ? [] : Object.entries(SHOP_SPOTS).filter(([k]) => isOpen(k)).map(([k, s]) => {
  const [x, y] = s.keeper;
  return { y: y * T + 14, draw: (c) => drawPerson(c, x * T + 8, y * T + 14, 'down', false, 0, look(k)) };
})));
