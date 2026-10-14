// Forage spawned daily in the wilds. Each day's spots pick at random among
// the items whose season matches; art lives in FORAGE_ART (render/sprites.js).
export const FORAGE = {
  leek:      { name: 'Wild leek',   sell: 60, season: 'Spring' },
  sorrel:    { name: 'Wood sorrel', sell: 40, season: 'Spring' },
  berry:     { name: 'Sunberry',    sell: 80, season: 'Summer' },
  thyme:     { name: 'Wild thyme',  sell: 50, season: 'Summer' },
  mushroom:  { name: 'Hollow cap',  sell: 40, season: 'Autumn' },
  rosehip:   { name: 'Rosehip',     sell: 80, season: 'Autumn' },
  frostroot: { name: 'Frost root',  sell: 70, season: 'Winter' },
  icemoss:   { name: 'Ice moss',    sell: 100, season: 'Winter' },
  // Only on Silvermist days (systems/weather.js), never in the daily spawn.
  mistlily:  { name: 'Mist lily',   sell: 90,  season: null },
};
// v33: weeds in the Wilds, cut for fiber with any tool (Stardew: weeds give fiber all over the valley).
export const WILD_WEEDS = { perDay: 6, fiber: 1 };
export const FORAGE_PER_DAY = 6;
