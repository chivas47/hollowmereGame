// v306 (roadmap 99): how far Use reaches (systems/reach.js). Use acts on the tile you face, or, when nothing is
// there, on the nearest thing in reach: the tile you stand on, then the tiles either side of the one in front and
// either side of you, nearest to a point just ahead of your feet first. Tools that work the ground stay on the
// exact tile in front (or under you) where there is farmland, so tilling, watering, sowing and placing never jump to a
// neighbouring crop; the weapon stays exact everywhere.
// Any other tool aimed at something solid in front (a rock, a tree, debris) stays on it as well.
// The mouse or a tap reaches any of the eight tiles around you, and your own.
export const REACH = {
  exact: ['hoe', 'can', 'seeds', 'kit'],   // on maps with farmland (the farm, the greenhouse, the island farm)
  always: ['sword'],   // everywhere: a swing is never taken over by a pickup
  ahead: 10,
  outline: ['hoe', 'can', 'seeds', 'kit'],   // v307: the tile outline shows only while holding these (the prompt still names other targets)   // pixels ahead of the feet the side tiles are measured from
};
