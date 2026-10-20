// v76: where every neighbour lives. Each day starts and ends at home; data/schedules.js says where they go between.
// map and door: the tile in front of the front door, where they step in and out.
// cottage: the top-left tile of a cottage (3 x 2 'V' tiles, the door in the middle of its bottom row). Cottages have
// an inside you can visit, built in data/maps.js as home_<id> from its floor plan in data/interiors.js (v97: rooms,
// furniture and what you see when you look at it); spot, where the owner stands indoors, comes from the plan too.
// Shopkeepers live over their shops, the warden at the lodge and the Lamplighter below the village: no inside to
// visit, so they are out of sight while home.
import { INTERIORS, doorOf } from './interiors.js';

export const HOMES = {
  ines: { map: 'village', cottage: [1, 2] },
  bram: { map: 'village', cottage: [5, 2] },
  odile: { map: 'village', cottage: [16, 2] },
  tavi: { map: 'village', cottage: [20, 2] },
  nell: { map: 'village', cottage: [2, 12] },
  rook: { map: 'village', cottage: [6, 12] },
  esme: { map: 'village', cottage: [14, 12] },
  kit: { map: 'village', cottage: [18, 12] },
  lio: { map: 'town', cottage: [13, 1] },
  pell: { map: 'town', cottage: [4, 1] },
  juno: { map: 'town', cottage: [18, 1] },
  wren: { map: 'town', door: [4, 7] },     // over Fenn's Provisions
  corvin: { map: 'town', door: [11, 7] },  // behind the Anvil
  hob: { map: 'town', door: [5, 12] },     // over the Lantern
  maren: { map: 'town', door: [15, 12] },  // over the clinic
  hale: { map: 'wilds', door: [14, 4] },   // the Wardens' Lodge
  lamp: { map: 'sewer', door: [21, 3] },   // a corner of the sewer
};

// A cottage's front door tile is the middle of its bottom row; you stand on the tile below it.
for (const [id, h] of Object.entries(HOMES)) {
  if (h.cottage) h.door = [h.cottage[0] + 1, h.cottage[1] + 2];
  if (h.cottage) h.spot = INTERIORS[id].spot;   // v97: where the floor plan has the owner stand
}
export const homeMap = (id) => `home_${id}`;
export const HOME_ENTRY = [11, 11];   // inside the farmhouse, just past the door mat (E at 11,12)
// v97: the tile just inside a cottage's front door (each floor plan puts its door where the house needs it).
export const homeEntry = (id) => doorOf(id).entry;

// A spouse or roommate lives in the farmhouse (data/schedules.js spouseDay).
export const SPOUSE_HOME = { map: 'farm', door: [3, 4], house: 'house', spot: [14, 8] };

// Stardew: villagers' doors are open from about 8 am to 8 pm; at night you need 2 hearts with someone who lives there.
export const HOME_OPEN = { from: 8 * 60, to: 20 * 60, hearts: 2 };
