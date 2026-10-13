// Things you interact with by facing a tile: bed, stall, bin, well and pond.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { ship } from './economy.js';

addInteraction(70, ({ tile }) => {
  if (tile === 'D') { emit('ui:sleep'); return true; }
  if (tile === 'S') { emit('ui:shop'); return true; }
  if (tile === 'B') { ship(); return true; }
  return false;
});

addInteraction(60, ({ tile, item }) => {
  if (tile !== 'W' && tile !== 'O') return false;
  if (item !== 'can') { notify('Select the watering can to refill it here.'); return true; }
  G.S.water = G.S.maxw; notify('Watering can refilled.'); changed();
  return true;
});
