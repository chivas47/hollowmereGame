// v172 (roadmap 75p): the attic, a renovation at Bram's (data/furniture.js RENOVATIONS.attic). Its ladder ʌ on the
// bed corner's north wall climbs up; the hatch ʌ in the attic's south wall climbs down. Furniture and chests go
// there as in the house (systems/placeables.js, systems/house.js).
import { G } from '../core/game.js';
import { on, emit, notify } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { placePlayer } from './world.js';

export const ATTIC = { tile: 'ʌ', up: { map: 'attic', x: 11, y: 9, dir: 'up' }, down: { map: 'house', x: 9, y: 3, dir: 'down' } };
export const hasAttic = () => !!G.S.house?.renos?.includes('attic');

function climb(to) {
  placePlayer(to.map, to.x, to.y, to.dir);
  G.keys = {}; G.swing = null;
  emit('map:changed', to.map);
  notify(to.map === 'attic' ? 'Attic' : 'Farmhouse');
}

// Priority 72, with the other things you open or enter.
addInteraction(72, ({ tile, mapId }) => {
  if (tile !== ATTIC.tile) return false;
  if (mapId === 'house' && hasAttic()) { climb(ATTIC.up); return true; }
  if (mapId === 'attic') { climb(ATTIC.down); return true; }
  return false;
});
addPrompt(72, ({ tile, mapId }) => (tile !== ATTIC.tile ? null : mapId === 'house' ? 'Climb to the attic' : mapId === 'attic' ? 'Climb down' : null));

// A save left in the attic without the renovation (it cannot happen in play) wakes in the farmhouse.
on('game:loaded', () => { if (G.S.map === 'attic' && !hasAttic()) placePlayer('house', ATTIC.down.x, ATTIC.down.y, 'down'); });
