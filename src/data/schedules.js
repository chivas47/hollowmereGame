// Where neighbours spend the day. Blocks run from..to (minutes); each walks a looping path of
// tile waypoints (walked x first, then y, so keep every leg clear) on one map.
// stay: walk the path once and stand at the last point. exit: false means they vanish where they
// stand at the end of the block (going indoors) instead of walking off the map.
// One day a week each neighbour rests and stays in the village all day.
const H = 60;
const PLAZA_IN = [16, 8];                               // first village waypoint, reached from the east road
const home = (x) => [PLAZA_IN, [16, 4], [x, 4]];        // walk to the front door of a cottage

export const ENTRIES = { farm: [1, 4], village: [22, 8], town: [10, 15], wilds: [1, 4], beach: [11, 0], forest: [10, 0] };   // where neighbours step onto each map

const VILLAGE_PATHS = {
  ines:  [PLAZA_IN, [16, 6], [9, 6], [9, 10], [16, 10]],
  bram:  [PLAZA_IN, [15, 10], [10, 10], [10, 7], [15, 7]],
  odile: [PLAZA_IN, [16, 12], [9, 12], [9, 10], [16, 10]],
  tavi:  [PLAZA_IN, [16, 4], [4, 4], [4, 6], [16, 6]],
};
const HOMES = { ines: 2, bram: 6, odile: 17, tavi: 21 };
export const REST_DAY = { ines: 0, bram: 2, odile: 4, tavi: 6 };   // (day - 1) % 7

// v49: the six town villagers. Shopkeepers stand by their door through opening hours (data/town.js) and live at
// their shops; a few meet outside the Lantern in the evening. Rest days match the shop's closing day.
const stay = (from, to, map, path, exit = false) => ({ from: from * H, to: to * H, map, path, stay: true, exit });
const walkAbout = (from, to, map, path) => ({ from: from * H, to: to * H, map, path });
const LANE = [[10, 14], [10, 8], [4, 8], [16, 8], [10, 8]];          // the town's upper lane
const TAVERN_STEP = [[10, 14], [10, 12], [6, 12], [8, 12]];          // outside the Lantern
// Town and village villagers (v49, v50).
const town = {
  wren: (rest) => (rest ? [walkAbout(9, 17, 'village', [PLAZA_IN, [9, 6], [9, 12], [16, 12]])] : [walkAbout(8, 9, 'town', LANE), stay(9, 17, 'town', [[10, 14], [10, 8], [2, 8], [2, 6]], false)]).concat(stay(17, 21, 'town', [[10, 14], [10, 8], [4, 8], [4, 7]])),
  corvin: () => [stay(9, 16, 'town', [[10, 14], [10, 8], [9, 8], [9, 6]], false), walkAbout(16, 20, 'town', TAVERN_STEP), stay(20, 22, 'town', [[10, 14], [10, 8], [11, 8], [11, 7]])],
  hob: () => [walkAbout(10, 12, 'village', [PLAZA_IN, [16, 10], [9, 10]]), stay(12, 24, 'town', [[10, 14], [10, 12], [3, 12], [3, 11]])],
  maren: () => [walkAbout(8, 9, 'town', LANE), stay(9, 15, 'town', [[10, 14], [10, 12], [13, 12], [13, 11]], false), walkAbout(15, 18, 'village', [PLAZA_IN, [16, 6], [9, 6], [9, 10]]), stay(18, 21, 'town', [[10, 14], [10, 12], [15, 12]])],
  hale: () => [stay(8, 18, 'wilds', [[13, 4], [13, 3], [14, 3]], false), walkAbout(18, 21, 'town', TAVERN_STEP)],
  lio: () => [walkAbout(9, 13, 'village', [PLAZA_IN, [13, 7], [13, 10], [10, 10], [10, 7]]), walkAbout(13, 17, 'town', LANE), walkAbout(17, 22, 'town', TAVERN_STEP), stay(22, 23, 'town', [[10, 14], [10, 8], [14, 8], [14, 3]])],
  // v50
  pell: (rest) => (rest ? [walkAbout(9, 17, 'forest', [[10, 1], [10, 6], [4, 6], [4, 3], [10, 3]])] : [walkAbout(8, 9, 'village', [PLAZA_IN, [9, 6], [9, 10]]), walkAbout(9, 15, 'town', [[10, 14], [10, 8], [16, 8], [16, 9], [4, 9], [4, 8]]), walkAbout(15, 18, 'village', [PLAZA_IN, [13, 7], [13, 10]])]).concat(stay(18, 22, 'town', [[10, 14], [10, 8], [5, 8], [5, 3]])),
  juno: () => [walkAbout(7, 11, 'village', [PLAZA_IN, [16, 4], [2, 4], [2, 5], [21, 5], [21, 4], [16, 4]]), walkAbout(11, 15, 'town', [[10, 14], [10, 8], [21, 8], [21, 12], [2, 12], [2, 8]]), walkAbout(15, 18, 'village', [PLAZA_IN, [17, 14], [3, 14], [17, 14]]), walkAbout(18, 21, 'town', TAVERN_STEP), stay(21, 22, 'town', [[10, 14], [10, 8], [20, 8], [20, 3], [19, 3]])],
  nell: () => [walkAbout(7, 12, 'village', [PLAZA_IN, [17, 14], [3, 14], [8, 14]]), walkAbout(12, 16, 'village', [PLAZA_IN, [9, 6], [9, 10], [15, 10], [15, 6]]), stay(16, 20, 'village', [PLAZA_IN, [17, 14], [3, 14]])],
  rook: () => [walkAbout(8, 17, 'beach', [[11, 1], [11, 8], [6, 8], [6, 9], [16, 9], [16, 8]]), walkAbout(17, 21, 'town', TAVERN_STEP), stay(21, 22, 'village', [PLAZA_IN, [17, 14], [7, 14]])],
  esme: () => [walkAbout(9, 16, 'forest', [[10, 1], [10, 4], [4, 4], [4, 6], [16, 6], [16, 3], [10, 3]]), walkAbout(16, 19, 'village', [PLAZA_IN, [9, 6], [9, 12], [16, 12]]), stay(19, 22, 'village', [PLAZA_IN, [17, 14], [15, 14]])],
  kit: (rest) => (rest ? [walkAbout(9, 17, 'beach', [[11, 1], [11, 6], [4, 6], [18, 6]])] : [walkAbout(8, 12, 'town', [[10, 14], [10, 8], [9, 8], [9, 7], [13, 8]]), walkAbout(12, 17, 'village', [PLAZA_IN, [13, 7], [13, 10], [10, 10], [10, 7]])]).concat(stay(17, 21, 'village', [PLAZA_IN, [17, 14], [19, 14]])),
};
const TOWN_REST = { wren: 2, pell: 5, kit: 5 };   // (day - 1) % 7: Wren on Wednesday (the store shuts), Pell and Kit on Saturday

// Farm paths are each neighbour's route through the field (data/npcs.js path).
export function scheduleFor(def, day) {
  if (town[def.id]) return town[def.id]((day - 1) % 7 === TOWN_REST[def.id]);
  const village = VILLAGE_PATHS[def.id], evening = { from: 18 * H, to: 21 * H, map: 'village', path: home(HOMES[def.id]), stay: true, exit: false };
  if ((day - 1) % 7 === REST_DAY[def.id]) return [{ from: 8 * H, to: 18 * H, map: 'village', path: village }, evening];
  return [
    { from: 8 * H, to: 11 * H, map: 'village', path: village },
    { from: 11 * H, to: 18 * H, map: 'farm', path: def.path },
    evening,
  ];
}
