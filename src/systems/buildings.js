// Things you interact with by facing a tile: stall, bin, well and pond. The door and bed are in systems/house.js.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { ship } from './economy.js';
import { PLACEABLES } from '../data/crafting.js';
import { placeKey } from './world.js';
import { pickUp } from './placeables.js';

addInteraction(70, ({ tile }) => {
  if (tile === 'B') { ship(); return true; }
  return false;
});

// v30: a mini shipping bin ships like the big one. Priority 73: above opening other placed objects (72).
// The axe or pickaxe takes it back up.
addInteraction(73, ({ tx, ty, mapId, item }) => {
  const p = G.S.placed[placeKey(mapId, tx, ty)];
  if (PLACEABLES[p?.kind]?.kind !== 'bin') return false;
  if (item === 'axe' || item === 'pick') pickUp(tx, ty); else ship();
  return true;
});

addInteraction(60, ({ tile, item }) => {
  if (tile !== 'W' && tile !== 'O') return false;
  if (item !== 'can') { notify('Select the watering can to refill it here.'); return true; }
  G.S.water = G.S.maxw; notify('Watering can refilled.'); changed();
  return true;
});

// v112: the HUD's prompts for the bin, mini bins and water.
addPrompt(73, ({ tx, ty, mapId }) => (PLACEABLES[G.S.placed[placeKey(mapId, tx, ty)]?.kind]?.kind === 'bin' ? 'Ship your basket' : null));
addPrompt(70, ({ tile }) => (tile === 'B' ? 'Ship your basket' : null));
addPrompt(60, ({ tile, item }) => ((tile === 'W' || tile === 'O') && item === 'can' && G.S.water < G.S.maxw ? 'Refill the can' : null));
