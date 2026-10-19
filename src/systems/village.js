// Small things to look at in the village. The board and the festival table live in quests.js and festivals.js.
import { notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { festivalToday } from './festivals.js';

addInteraction(71, ({ tile, mapId }) => {
  if (mapId !== 'village') return false;
  if (tile === 'F') { notify(festivalToday() ? 'Coins glint at the bottom of the fountain. Someone made a wish for good weather.' : 'The fountain gurgles. Its water is too cold and too public for fishing.'); return true; }
  if (tile === 'V') { notify('The front door is on the lane side.'); return true; }   // v76: cottages open from the front (systems/homes.js)
  return false;
});
