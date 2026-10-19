// v65: Rook's boat to the island (data/island.js). G.S.boatFixed once repaired; the island farm's soil is
// G.S.islandSoil (systems/world.js soilOf), where crops ignore seasons.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { placePlayer } from './world.js';
import { BOAT } from '../data/island.js';
import { fmtTime } from '../core/time.js';

export const canRepair = () => !G.S.boatFixed && Object.entries(BOAT.repair).every(([k, n]) => (G.S.bag[k] || 0) >= n);
export function repairBoat() {
  const S = G.S;
  if (!canRepair()) return false;
  for (const [k, n] of Object.entries(BOAT.repair)) S.bag[k] -= n;
  S.boatFixed = true;
  notify('Rook helps you caulk the hull and wire up the old engine. The boat floats, and it even runs.');
  changed();
  return true;
}
export const boatRunning = () => G.S.time >= BOAT.from && G.S.time < BOAT.to;
export function sail() {
  const S = G.S;
  if (!S.boatFixed || !boatRunning() || S.gold < BOAT.fare) return false;
  S.gold -= BOAT.fare;
  placePlayer('island', 11, 13, 'up'); emit('map:changed', 'island');
  notify('Spray, gulls and a long green coast. Rook ties up at the island dock. "I\'ll be here when you want to go back."');
  changed();
  return true;
}
export function sailHome() {
  placePlayer('beach', 6, 11, 'up'); emit('map:changed', 'beach');
  notify('Rook brings you back across the bay.');
  changed();
  return true;
}
addInteraction(72, ({ tile, mapId }) => {
  if (tile !== '4') return false;
  if (mapId === 'island') { sailHome(); return true; }
  if (mapId !== 'beach') return false;
  if (G.S.boatFixed && !boatRunning()) { notify(`Rook takes the boat out ${fmtTime(BOAT.from)} to ${fmtTime(BOAT.to)}.`); return true; }
  emit('ui:boat');
  return true;
});
