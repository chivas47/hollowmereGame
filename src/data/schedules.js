// Where neighbours spend the day. v76: every day starts and ends at home (data/homes.js); between, blocks run
// from..to (minutes) on one map each. go: walk the path's spots in a loop, pausing at each. at: walk the spots once
// and stand at the last one. Neighbours find their own way between spots and from map to map (systems/routes.js),
// setting off a little early when the next block is on another map, so a path is just the places that matter.
// Rest days: (day - 1) % 7, 0 = Monday.
import { VENUES, venueMap } from './venues.js';

const H = 60;
const go = (from, to, map, ...path) => ({ from: from * H, to: to * H, map, path });
const at = (from, to, map, ...path) => ({ from: from * H, to: to * H, map, path, stay: true });

// Places they share.
const SQUARE = [[9, 7], [14, 7], [14, 10], [9, 10]];               // around the fountain
const BOARD = [11, 6];                                              // in front of the quest board
const LANE = [[3, 8], [12, 8], [21, 8], [12, 8]];                   // the town's upper lane
const LOWER = [[3, 12], [12, 12], [20, 12], [12, 12]];              // the town's lower lane
// In the Lantern in the evening, each in their own place (v98: inside, at the tables; Lio on the stage).
const LANTERN = venueMap('tavern');
const TAVERN = { bram: [4, 9], corvin: [7, 9], maren: [10, 9], hale: [13, 9], lio: [15, 10], juno: [11, 11], rook: [5, 11], wren: [6, 11], pell: [12, 11] };
// v98: keepers work inside their buildings, behind the counter (data/venues.js spot).
const KEEP = (id) => [venueMap(id), VENUES[id].spot];
// Every front door in the village, for Juno's round.
const DOORS = [[2, 4], [6, 4], [17, 4], [21, 4], [19, 14], [15, 14], [7, 14], [3, 14]];

const DAYS = {
  // Ines keeps hives in the Wilds meadow and lets the bees work your field; Sundays in the square and on the shore.
  ines: (wd, def) => (wd === 6
    ? [go(9, 12, 'village', ...SQUARE), go(12, 16, 'beach', [8, 4], [16, 5], [12, 7])]
    : [go(7, 11, 'wilds', [5, 6], [8, 11], [3, 12], [6, 9]), go(11, 15, 'farm', ...def.path), go(15, 18, 'village', [9, 7], BOARD, [14, 10])]),
  // Bram runs the carpentry in town, shut on Tuesdays; then he checks on the bin he built you and the square.
  bram: (wd, def) => (wd === 1
    ? [go(9, 12, 'village', ...SQUARE), go(12, 17, 'farm', ...def.path)]
    : [at(9, 17, ...KEEP('carpenter')), at(17, 19, LANTERN, TAVERN.bram)]),
  // Odile fishes the Wilds pond at dawn, walks the farm, then mends nets on the pier. Fridays she only fishes.
  odile: (wd, def) => (wd === 4
    ? [at(6, 11, 'wilds', [14, 10]), go(11, 17, 'village', ...SQUARE)]
    : [at(6, 10, 'wilds', [14, 10]), go(10, 14, 'farm', ...def.path), at(14, 18, 'beach', [7, 9])]),
  // Tavi charts the valley: the village lanes, your fence line and the forest one day, the town and the shore the next.
  tavi: (wd, def) => (wd === 6
    ? [go(10, 16, 'village', ...SQUARE)]
    : wd % 2 === 0
      ? [go(8, 11, 'village', [1, 5], [22, 5], [22, 10], [17, 11]), go(11, 15, 'farm', ...def.path), go(15, 18, 'forest', [3, 3], [20, 5], [12, 13])]
      : [go(8, 12, 'town', [2, 9], [21, 9], [21, 13], [2, 13]), go(12, 16, 'beach', [2, 2], [21, 4], [12, 8]), go(16, 18, 'village', ...SQUARE)]),
  // Wren keeps the store 9 to 5 (shut Wednesdays), then a stroll through the village.
  wren: (wd) => (wd === 2
    ? [go(10, 16, 'village', ...SQUARE, [8, 14], [18, 14]), go(16, 19, 'beach', [10, 3], [18, 6])]
    : [at(9, 17, ...KEEP('store')), go(17, 20, 'village', ...SQUARE)]),
  // Corvin at his anvil, then the Lantern.
  corvin: () => [at(9, 16, ...KEEP('smithy')), at(16, 20, LANTERN, TAVERN.corvin)],
  // Hob does his errands in the village, then keeps the Lantern from noon to midnight.
  hob: () => [go(9, 11, 'village', BOARD, [9, 10], [14, 7]), at(12, 24, ...KEEP('tavern'))],
  // Doctor Maren: a morning walk, the clinic 9 to 3, house calls on the south lane, the Lantern.
  maren: () => [go(8, 9, 'town', ...LANE), at(9, 15, ...KEEP('clinic')), go(15, 18, 'village', [3, 14], [7, 14], ...SQUARE), at(18, 21, LANTERN, TAVERN.maren)],
  // Warden Hale keeps the lodge all day and walks into town for the evening.
  hale: () => [at(8, 18, ...KEEP('lodge')), at(18, 21, LANTERN, TAVERN.hale)],
  // Lio fiddles by the fountain, wanders the town, then plays outside the Lantern.
  lio: () => [at(10, 13, 'village', [12, 10]), go(13, 17, 'town', ...LANE), at(17, 22, LANTERN, TAVERN.lio)],
  // Pell teaches at the town hall, shut Saturdays; Saturdays are for the forest.
  pell: (wd) => (wd === 5
    ? [go(9, 16, 'forest', [4, 4], [16, 6], [3, 10]), go(16, 19, 'town', ...LOWER)]
    : [at(9, 15, venueMap('hall'), [14, 5]), go(15, 18, 'village', ...SQUARE), at(18, 21, LANTERN, TAVERN.pell)]),
  // Juno carries the mail: every village door, your farm, the town's doors, then the Lantern.
  juno: () => [go(7, 10, 'village', ...DOORS), go(10, 12, 'farm', [4, 4], [12, 4], [20, 5]), go(12, 17, 'town', [4, 7], [11, 7], [16, 7], [5, 12], [15, 12], [19, 12], [14, 3]), at(17, 21, LANTERN, TAVERN.juno)],
  // Nell tends the garden between the south cottages, visits the old mine mouth, then sits by the square.
  nell: () => [go(7, 11, 'village', [5, 12], [4, 11], [6, 11]), go(11, 15, 'wilds', [12, 2], [10, 4], [13, 5]), at(15, 19, 'village', [8, 11])],
  // Rook works on the beach all day, then the Lantern.
  rook: () => [go(8, 17, 'beach', [6, 11], [6, 9], [8, 7], [4, 8]), at(17, 21, LANTERN, TAVERN.rook)],
  // Esme paints in the forest, then the village, then the shore at dusk.
  esme: () => [go(9, 16, 'forest', [4, 4], [16, 6], [6, 11]), go(16, 19, 'village', ...SQUARE), at(19, 21, 'beach', [12, 4])],
  // Kit hangs about the Anvil in the morning and the square after; Saturdays at the beach.
  kit: (wd) => (wd === 5
    ? [go(9, 17, 'beach', [4, 6], [18, 6])]
    : [at(8, 12, 'town', [12, 8]), go(12, 17, 'village', ...SQUARE), at(17, 21, 'village', [20, 14])]),
  // The Lamplighter only comes out after dark.
  lamp: () => [at(18, 26, 'sewer', [20, 3])],
};

// v146: rain days (Stardew's villagers keep a rain schedule). In rain or a storm every block outdoors goes to the
// neighbour's shelter instead: 'home' (their cottage, or out of sight over their shop), a place indoors, or 'out'
// for the two who go out anyway (Juno's mail does not wait; Kit tests the go-cart). Blocks already indoors stay.
export const RAIN_WEATHERS = ['rain', 'storm'];
const OUTDOORS = new Set(['farm', 'village', 'town', 'beach', 'forest', 'wilds', 'mountain', 'railway', 'grove', 'desert']);
const RAIN = {
  ines: 'home',                      // jars honey in the kitchen
  bram: 'home',                      // his rest day by the stove
  odile: [LANTERN, [3, 8]],          // mends nets by the Lantern's window
  tavi: 'home',                      // inks the week's maps
  wren: [LANTERN, TAVERN.wren],
  hob: 'home',                       // errands can wait
  maren: KEEP('clinic'),             // wet days bring colds: the clinic stays open till evening
  lio: [LANTERN, TAVERN.lio],        // plays to a damp, grateful room
  pell: [LANTERN, TAVERN.pell],      // marks slates at a table
  juno: 'out',
  nell: [LANTERN, [9, 8]],           // by the fire
  rook: 'home',
  esme: [LANTERN, [3, 7]],           // sketches the regulars, beside Odile
  kit: 'out',                        // tests the go-cart in the wet
};
export function rainDay(id, blocks) {
  const shelter = RAIN[id] || 'home';
  if (shelter === 'out') return blocks;
  return blocks.flatMap((b) => (!OUTDOORS.has(b.map) ? [b] : shelter === 'home' ? [] : [at(b.from / H, b.to / H, ...shelter)]));
}

// Farm paths are each neighbour's route through the field (data/npcs.js path).
export function scheduleFor(def, day) {
  return DAYS[def.id] ? DAYS[def.id]((day - 1) % 7, def) : [];
}

// v52: a spouse lives at the farm: the farmhouse in the morning, about the yard by the house through the day,
// home again in the evening.
export function spouseDay() {
  return [
    at(6, 10, 'house', [11, 7], [13, 7]),
    go(10, 17, 'farm', [3, 5], [7, 5], [7, 6], [3, 6]),
  ];
}
// v146: a spouse stays in on a wet day.
export const spouseRainDay = () => [at(6, 17, 'house', [11, 7], [13, 7])];

// v76: a festival day: everyone walks to their place in the square for the festival's hours, then home.
// v110: map for a gathering somewhere else (the Lantern Float on the beach).
export const festivalDay = (spot, hours, map = 'village') => [{ from: hours.from, to: hours.to, map, path: [spot], stay: true }];
