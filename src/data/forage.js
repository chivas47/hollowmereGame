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
  // v43: beach and forest forage (area: where it grows; season 'all': any season). Stardew's beach: clam 50g,
  // cockle 50g, coral 80g, sea urchin 160g (summer, autumn), nautilus shell 120g (winter); the forest: morel 150g
  // (spring), fiddlehead fern 90g (summer), chanterelle 160g and hazelnut 90g (autumn), holly 80g (winter).
  clam:       { name: 'Ridge clam',     sell: 50,  season: 'all', area: 'beach' },
  cockle:     { name: 'Sand cockle',    sell: 50,  season: 'all', area: 'beach' },
  coral:      { name: 'Sea coral',      sell: 80,  season: 'all', area: 'beach' },
  urchin:     { name: 'Purple urchin',  sell: 160, season: 'Summer', area: 'beach' },
  spiralshell:{ name: 'Spiral shell',   sell: 120, season: 'Winter', area: 'beach' },
  morel:      { name: 'Honeycomb morel', sell: 150, season: 'Spring', area: 'forest' },
  fiddlehead: { name: 'Curled fern',    sell: 90,  season: 'Summer', area: 'forest' },
  chanterelle:{ name: 'Gold chanterelle', sell: 160, season: 'Autumn', area: 'forest' },
  hazelnut:   { name: 'Wild hazelnut',  sell: 90,  season: 'Autumn', area: 'forest' },
  holly:      { name: 'Winter holly',   sell: 80,  season: 'Winter', area: 'forest' },
  // Stardew's forest also has daffodils (30g, spring), sweet peas (50g, summer) and crystal fruit (150g, winter).
  narcissus:  { name: 'Wood narcissus', sell: 30,  season: 'Spring', area: 'forest' },
  vetch:      { name: 'Sweet vetch',    sell: 50,  season: 'Summer', area: 'forest' },
  frostberry: { name: 'Frost berry',    sell: 150, season: 'Winter', area: 'forest' },
  // Only on Silvermist days (systems/weather.js), never in the daily spawn.
  mistlily:  { name: 'Mist lily',   sell: 90,  season: null },
};
// v33: weeds in the Wilds, cut for fiber with any tool (Stardew: weeds give fiber all over the valley).
export const WILD_WEEDS = { perDay: 6, fiber: 1 };
export const FORAGE_PER_DAY = 6;
