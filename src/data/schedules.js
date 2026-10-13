// Where neighbours spend the day. Blocks run from..to (minutes); each walks a looping path of
// tile waypoints (walked x first, then y, so keep every leg clear) on one map.
// stay: walk the path once and stand at the last point. exit: false means they vanish where they
// stand at the end of the block (going indoors) instead of walking off the map.
// One day a week each neighbour rests and stays in the village all day.
const H = 60;
const PLAZA_IN = [16, 8];                               // first village waypoint, reached from the east road
const home = (x) => [PLAZA_IN, [16, 4], [x, 4]];        // walk to the front door of a cottage

export const ENTRIES = { farm: [1, 4], village: [22, 8] };   // where neighbours step onto each map

const VILLAGE_PATHS = {
  ines:  [PLAZA_IN, [16, 6], [9, 6], [9, 10], [16, 10]],
  bram:  [PLAZA_IN, [15, 10], [10, 10], [10, 7], [15, 7]],
  odile: [PLAZA_IN, [16, 12], [9, 12], [9, 10], [16, 10]],
  tavi:  [PLAZA_IN, [16, 4], [4, 4], [4, 6], [16, 6]],
};
const HOMES = { ines: 2, bram: 6, odile: 17, tavi: 21 };
export const REST_DAY = { ines: 0, bram: 2, odile: 4, tavi: 6 };   // (day - 1) % 7

// Farm paths are each neighbour's route through the field (data/npcs.js path).
export function scheduleFor(def, day) {
  const village = VILLAGE_PATHS[def.id], evening = { from: 18 * H, to: 21 * H, map: 'village', path: home(HOMES[def.id]), stay: true, exit: false };
  if ((day - 1) % 7 === REST_DAY[def.id]) return [{ from: 8 * H, to: 18 * H, map: 'village', path: village }, evening];
  return [
    { from: 8 * H, to: 11 * H, map: 'village', path: village },
    { from: 11 * H, to: 18 * H, map: 'farm', path: def.path },
    evening,
  ];
}
