// v165 (roadmap 75f): the Saturday stalls (data/stalls.js). Funded at the quest board, they stand on the town green
// for good: their tiles are written whenever the game loads or the project is funded. Saturdays 9:00 to 14:00 the
// week's neighbour sells there (ui/stalls.js); otherwise facing the stall gives a note.
import { G } from '../core/game.js';
import { on, notify, emit, changed } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { STALLS } from '../data/stalls.js';

export const STALL = 'ʂ';   // the stall's grid letter (solid, drawn by render/tiles.js stall)

export const stallsBuilt = (S = G.S) => !!S.projects?.stalls;
export const stallsOpen = (S = G.S) => stallsBuilt(S) && (S.day - 1) % 7 === STALLS.wd && S.time >= STALLS.open && S.time < STALLS.close;
export const sellerOf = (day) => STALLS.sellers[Math.floor((day - 1) / 7) % STALLS.sellers.length];
export const stallPrice = (item) => ITEMS[item].sell * STALLS.markup;

function raise() {
  if (!G.S || !stallsBuilt()) return;
  const g = MAPS[STALLS.map].grid;
  for (const [x, y] of STALLS.tiles) if (g[y][x] !== STALL) { g[y][x] = STALL; emit('world:changed'); }
}
on('game:loaded', raise); on('state:changed', raise);

// Buys one of the week's goods: false when it is not for sale today or costs more than you have.
export function buyStall(item) {
  const S = G.S, price = stallPrice(item);
  if (!stallsOpen() || !sellerOf(S.day).items.includes(item) || S.gold < price) return false;
  S.gold -= price; S.bag[item] = (S.bag[item] || 0) + 1;
  emit('sfx', 'coin'); changed();
  return true;
}

const atStall = (tile, mapId) => mapId === STALLS.map && tile === STALL;
addInteraction(71, ({ tile, mapId }) => {
  if (!atStall(tile, mapId)) return false;
  if (stallsOpen()) emit('ui:stalls'); else notify(STALLS.shut);
  return true;
});
addPrompt(71, ({ tile, mapId }) => (atStall(tile, mapId) ? (stallsOpen() ? `Browse ${sellerOf(G.S.day).name}` : 'Look at the stall') : null));
