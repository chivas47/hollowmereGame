import { MAPS } from './maps.js';

// Weather. Odds follow Stardew's: rain 18.3% in spring and autumn, 12% (+0.3% a day of the month)
// in summer; a rainy day is a storm 25% of the time in spring and autumn, 85% in summer; winter
// snows 63% of days. Festival days and the first day of a new farm are always fair.
// waters: soaks the farm's soil in the morning. outdoors: drawn on the farm, the Wilds and the village.
export const WEATHER = {
  sun:   { name: 'Sunny' },
  rain:  { name: 'Rain', waters: true },
  storm: { name: 'Storm', waters: true },
  snow:  { name: 'Snow' },
  mist:  { name: 'Silvermist', waters: true },   // ours: one day each summer, rare forage in the Wilds
};

export const ODDS = {
  Spring: { wet: 0.183, storm: 0.25 },
  Summer: { wet: 0.12, perDay: 0.003, storm: 0.85 },
  Autumn: { wet: 0.183, storm: 0.25 },
  Winter: { snow: 0.63 },
};

// Storms: strikes land on the farm overnight. Each hits a lightning rod with room first;
// otherwise a random farm tile, killing any crop there (Stardew: about one in three strikes finds a crop).
export const LIGHTNING = { strikes: 3 };

// Silvermist: one random summer day (not a festival) between these days each year.
export const MIST = { from: 5, to: 25, lilies: 6 };

export const OUTDOORS = ['farm', 'wilds', 'village'];   // where the horse can go

// v72: where weather is drawn and heard: every open-air map but the Dunes (it never rains there).
export const underSky = (id) => !!MAPS[id] && !MAPS[id].base && id !== 'desert';

// Items. Stardew roles: battery pack (500g) and a rare summer forage item (fiddlehead fern, 90g).
export const WEATHER_ITEMS = {
  stormcell: { name: 'Storm cell', sell: 500 },
};
