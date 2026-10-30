// v65: Rook's boat: the repair, then the trip to the island (systems/island.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { BOAT } from '../data/island.js';
import { canRepair, repairBoat, sail } from '../systems/island.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function boat() {
  const S = G.S;
  if (!S.boatFixed) {
    const need = Object.entries(BOAT.repair).map(([k, n]) => `${n} ${ITEMS[k].name.toLowerCase()} (you have ${S.bag[k] || 0})`).join(', ');
    openModal(`<h2>Rook's old boat</h2><p class="role">The hull is sound, mostly. Rook pats it. "Patch her up and she'll take us to the island past the bay. I need ${need}."</p>`,
      [['Repair it', () => { if (repairBoat()) boat(); }], ['Not now', closeModal, true]]);
    if (!canRepair()) $('#mact button').disabled = true;
    return;
  }
  openModal(`<h2>Rook's boat</h2><p class="role">"The island and back, ${BOAT.fare.toLocaleString('en-US')}g. Fuel isn't free." You have <b>${S.gold.toLocaleString('en-US')}g</b>.</p>`,
    [['Sail', () => { closeModal(); sail(); }], ['Not now', closeModal, true]]);
  if (S.gold < BOAT.fare) $('#mact button').disabled = true;
}
on('ui:boat', boat);
