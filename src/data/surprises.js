// v218 (roadmap 78c): overnight surprises on the farm, rolled each morning (systems/surprises.js), at most one a
// night and none of them bad (Nuno, November 2026). Chances follow Stardew's random night events: the crop fairy 1%,
// the meteorite 1%, the stone owl about 0.5% and the strange capsule about 0.8% (here the odd stone figure); its witch
// is left out. Rolled in this order; the first that happens and finds room is the night's surprise.
export const SURPRISES = [
  { key: 'fairy',     chance: 0.01 },    // ripens a patch of growing crops on the farm (not in winter)
  { key: 'meteorite', chance: 0.01 },    // a meteorite on free farm ground (data/clearing.js DEBRIS.meteorite)
  { key: 'owl',       chance: 0.005 },   // a stone owl by the house (PLACEABLES.stoneowl)
  { key: 'figure',    chance: 0.008 },   // an odd stone figure somewhere on the farm (PLACEABLES.oddfigure)
];
export const FAIRY_REACH = 1;            // the patch: every growing crop within this many tiles of the one picked (3 x 3)
export const OWL_NEAR = { x0: 0, y0: 4, x1: 9, y1: 7 };   // tiles in front of the farmhouse where the owl may sit
