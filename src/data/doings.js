// v147: what a neighbour is doing where they stop, so they are never just standing there. Each neighbour has a list
// of { map, does } (map '*': anywhere; stay true or false: only on a block where they stand, or one they walk
// round and pause in). The first that fits their current block wins. carry: something they have on them all day,
// walking too. The art for each `does` is render/doings.js.
import { venueMap } from './venues.js';

const LANTERN = venueMap('tavern');

export const DOINGS = {
  ines: [{ map: 'wilds', does: 'bees' }],                                  // her bees follow her round the meadow
  bram: [{ map: venueMap('carpenter'), does: 'saw' }],
  odile: [{ map: 'wilds', does: 'rod' }, { map: 'beach', does: 'nets' }, { map: LANTERN, does: 'nets' }],
  tavi: [{ map: '*', stay: false, does: 'map' }],                          // stops to check the map on every round
  wren: [{ map: venueMap('store'), does: 'ledger' }],
  corvin: [{ map: venueMap('smithy'), does: 'hammer' }],
  hob: [{ map: LANTERN, does: 'cloth' }],
  maren: [{ map: venueMap('clinic'), does: 'bag' }],
  hale: [{ map: venueMap('lodge'), does: 'book' }],                        // the lodge's log
  lio: [{ map: '*', stay: true, does: 'fiddle' }],
  pell: [{ map: venueMap('hall'), does: 'book' }, { map: 'forest', does: 'book' }],
  juno: [{ map: '*', does: 'satchel', carry: true }],
  nell: [{ map: 'village', stay: false, does: 'trowel' }],                 // the garden between the south cottages
  rook: [{ map: 'beach', does: 'brush' }],                                 // one plank a day
  esme: [{ map: 'forest', does: 'easel' }, { map: LANTERN, does: 'sketch' }, { map: 'beach', does: 'sketch' }],
  kit: [{ map: '*', does: 'wrench' }],
  lamp: [{ map: 'sewer', does: 'lantern' }],
};

// What a neighbour is doing on this block (null: home, or nothing here), and whether it shows while they walk.
export function doingFor(id, block) {
  for (const d of DOINGS[id] || []) {
    if (d.carry) return d;
    if (!block || (d.map !== '*' && d.map !== block.map)) continue;
    if (d.stay !== undefined && d.stay !== !!block.stay) continue;
    return d;
  }
  return null;
}
