// Forage spawned daily in the wilds. Each day's spots pick at random among
// the items whose season matches; art lives in FORAGE_ART (render/sprites.js).
export const FORAGE = {
  leek:      { name: 'Wild leek',   sell: 30, season: 'Spring' },
  sorrel:    { name: 'Wood sorrel', sell: 35, season: 'Spring' },
  berry:     { name: 'Sunberry',    sell: 40, season: 'Summer' },
  thyme:     { name: 'Wild thyme',  sell: 45, season: 'Summer' },
  mushroom:  { name: 'Hollow cap',  sell: 45, season: 'Autumn' },
  rosehip:   { name: 'Rosehip',     sell: 50, season: 'Autumn' },
  frostroot: { name: 'Frost root',  sell: 50, season: 'Winter' },
  icemoss:   { name: 'Ice moss',    sell: 55, season: 'Winter' },
};
export const FORAGE_PER_DAY = 6;
