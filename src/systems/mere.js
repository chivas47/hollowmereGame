// v160 (roadmap 75d): the mere's boathouse. v161 (75e): Garrow keeps it, 9:00 to 17:00, shut Thursdays: facing its door
// in those hours opens his counter (ui/boathouse.js), otherwise a note. Its fish come through systems/fishing.js
// (WATERS.mere); the map is data/maps.js mereGrid().
import { G } from '../core/game.js';
import { notify, emit, changed } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { MERE } from '../data/mere.js';

export const BOATHOUSE = 'β';   // the boathouse's grid letter (solid, drawn by render/tiles.js boathouse)

export const boathouseOpen = (S = G.S) => (S.day - 1) % 7 !== MERE.shop.closedDay && S.time >= MERE.shop.open && S.time < MERE.shop.close;

// Buys stock line i: false when it costs more than you have.
export function buyBoathouse(i) {
  const S = G.S, o = MERE.stock[i];
  if (!o || S.gold < o.price) return false;
  S.gold -= o.price;
  if (o.kit) S.kit[o.item] = (S.kit[o.item] || 0) + o.n;
  else S.bag[o.item] = (S.bag[o.item] || 0) + o.n;
  if (o.item === 'bait' && !S.bait) S.bait = 'bait';
  emit('sfx', 'coin'); changed();
  return true;
}

// Priority 71: with the other shut doors, below anything you talk to.
addInteraction(71, ({ tile, mapId }) => {
  if (mapId !== 'mere' || tile !== BOATHOUSE) return false;
  if (boathouseOpen()) emit('ui:boathouse'); else notify(MERE.shut);
  return true;
});
addPrompt(71, ({ tile, mapId }) => (mapId === 'mere' && tile === BOATHOUSE ? (boathouseOpen() ? 'Bait and tackle' : 'Try the boathouse door') : null));
