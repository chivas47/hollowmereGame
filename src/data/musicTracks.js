// v318 (roadmap 110): the music database. Every background track and stinger is registered here; the director
// (systems/musicDirector.js) picks from it and the player (audio/music.js) plays it. Add a track by adding an entry:
// no other code changes. Files live in assets/audio/music/ (README there).
//
// Each track:
//   id        unique key (saved in the farm's music memory, so do not rename one lightly)
//   name      a human name, shown in debug logs
//   file      under assets/audio/music/<folder>/<id>.ogg (any format the browser plays; README there); if it is
//             missing the gen recipe plays instead
//   category  what it is for, one or several of the LAYERS' categories below
//   region    v342: the region it belongs to (REGIONS below: the farm, the village, the Duskmarch, the island...)
//   floors    v342: [from, to] floors of a deep place (the Hollow), or [from] for that floor and every one below;
//             with a place, a depth band's track beats the place's plain one
//   place     v342: one place or several (a map id, or a zone of the Hollow's map: PLACES below); a place's own track
//             beats its region's, whatever the region's track is tagged with
//   season    Spring, Summer, Autumn, Winter, or none (any season)
//   weather   one or several of sun, rain, storm, snow, mist, or none (any weather)
//   time      one or several of morning, afternoon, evening, night, or none (any time)
//   festival  festival keys it scores (data/festivals.js), for the event layer
//   cutscene  cutscene ids it scores (data/cutscenes.js), for the cutscene layer
//   priority  among equally fitting tracks, higher plays first (default 0)
//   weight    among equal priority, the chance of being picked (default 1)
//   volume    the designer's level for this track, 0 to 1 (default 1)
//   gain      the level the file was mastered for (written by tools/render_audio.mjs; with volume, sets loudness)
//   loop      repeats (default true for music; stingers play once)
//   loopStart, loopEnd  v342: seconds into the file where the loop starts and ends, for a track with an intro that
//             plays once (or a tail that does not loop). Leave them out to loop the whole file.
//   rotateAfter  v342: seconds of play after which, at the end of a loop, another track that fits as well takes over
//             (default MUSIC.rotateAfter). Counted in time, not loops, so a 10-second sketch and a 3-minute piece rotate alike
//   gen       the generator recipe the file was recorded from (audio/music.js): root (MIDI), scale, bpm, lead, seed
//
// A track fits when every field it sets matches the moment (a field it leaves out matches anything). Among the
// fitting tracks of a layer, the most specific win, by weight: festival or cutscene, then place, region, weather, time,
// season (Mournfield's own track beats anything of the Duskmarch's; in the rain the rainy village track beats the
// spring village track, which beats the plain village track), so a missing variant falls back to the plainer one.
import { MOODS } from './music.js';

const MAJ = [0, 2, 4, 7, 9], MIN = [0, 3, 5, 7, 10], DOR = [0, 2, 3, 7, 9], PHR = [0, 1, 5, 7, 8], LYD = [0, 2, 4, 6, 7, 9], HEX = [0, 2, 4, 5, 7, 9], BLU = [0, 3, 5, 6, 7, 10];
const g = (root, scale, bpm, lead, seed) => ({ root, scale, bpm, lead, seed });

// v342: the Hollow's depth bands (floors, inclusive; one number: that floor and every one below).
export const HOLLOW_DEPTHS = { upper: [1, 39], middle: [40, 79], deep: [80] };

export const TRACKS = [
  // The farm: the four original season themes, a second spring tune, a night and a rain variant.
  { id: 'farm_spring_01', name: 'Spring on the Farm', file: 'music/farm/farm_spring_01.ogg', gain: 0.119, category: ['location', 'season'], region: 'farm', season: 'Spring', gen: MOODS.Spring },
  { id: 'farm_spring_02', name: 'First Shoots', file: 'music/farm/farm_spring_02.ogg', gain: 0.119, category: ['location', 'season'], region: 'farm', season: 'Spring', gen: g(62, MAJ, 96, 'triangle', 113) },
  { id: 'farm_summer_01', name: 'Summer on the Farm', file: 'music/farm/farm_summer_01.ogg', gain: 0.12, category: ['location', 'season'], region: 'farm', season: 'Summer', gen: MOODS.Summer },
  { id: 'farm_autumn_01', name: 'Autumn on the Farm', file: 'music/farm/farm_autumn_01.ogg', gain: 0.123, category: ['location', 'season'], region: 'farm', season: 'Autumn', gen: MOODS.Autumn },
  { id: 'farm_winter_01', name: 'Winter on the Farm', file: 'music/farm/farm_winter_01.ogg', gain: 0.121, category: ['location', 'season'], region: 'farm', season: 'Winter', gen: MOODS.Winter },
  { id: 'farm_night_01', name: 'Farm After Dark', file: 'music/farm/farm_night_01.ogg', gain: 0.123, category: 'location', region: 'farm', time: 'night', gen: g(57, MIN, 70, 'sine', 131) },
  { id: 'farm_rain_01', name: 'Rain on the Rows', file: 'music/farm/farm_rain_01.ogg', gain: 0.121, category: 'location', region: 'farm', weather: ['rain', 'storm'], gen: g(59, DOR, 84, 'sine', 137) },
  // The village and town: one per season, and rain.
  { id: 'village_spring_01', name: 'Village in Spring', file: 'music/village/village_spring_01.ogg', gain: 0.121, category: 'location', region: 'village', season: 'Spring', gen: g(67, HEX, 108, 'triangle', 211) },
  { id: 'village_summer_01', name: 'Village in Summer', file: 'music/village/village_summer_01.ogg', gain: 0.12, category: 'location', region: 'village', season: 'Summer', gen: g(69, MAJ, 116, 'square', 223) },
  { id: 'village_autumn_01', name: 'Village in Autumn', file: 'music/village/village_autumn_01.ogg', gain: 0.122, category: 'location', region: 'village', season: 'Autumn', gen: g(64, DOR, 98, 'triangle', 227) },
  { id: 'village_winter_01', name: 'Village in Winter', file: 'music/village/village_winter_01.ogg', gain: 0.122, category: 'location', region: 'village', season: 'Winter', gen: g(62, MIN, 86, 'sine', 229) },
  { id: 'village_rain_01', name: 'Village in the Rain', file: 'music/village/village_rain_01.ogg', gain: 0.121, category: 'location', region: 'village', weather: ['rain', 'storm'], gen: g(60, DOR, 88, 'sine', 233) },
  // Wild places.
  { id: 'forest_01', name: 'Under the Canopy', file: 'music/wild/forest_01.ogg', gain: 0.118, category: 'location', region: 'forest', gen: g(62, DOR, 92, 'triangle', 307) },
  { id: 'beach_01', name: 'Tide Line', file: 'music/wild/beach_01.ogg', gain: 0.118, category: 'location', region: 'beach', gen: g(65, LYD, 100, 'sine', 311) },
  { id: 'mountain_01', name: 'High Paths', file: 'music/wild/mountain_01.ogg', gain: 0.123, category: 'location', region: 'mountains', gen: g(60, HEX, 90, 'triangle', 313) },
  { id: 'exploration_01', name: 'Off the Map', file: 'music/wild/exploration_01.ogg', gain: 0.115, category: 'location', region: 'wilds', gen: g(57, DOR, 104, 'triangle', 317) },
  // Underground.
  // v342: the Hollow by depth, in the bands its creatures and ore change at (data/weapons.js MONSTERS, cavern.js):
  // earth and copper above 40, soot puffs, moss slimes and lantern wisps from 40, gold and the Cavern's door from 80.
  { id: 'hollow_upper_01', name: 'The Hollow', file: 'music/underground/hollow_upper_01.ogg', gain: 0.122, category: 'location', region: 'mines', place: 'hollow', floors: HOLLOW_DEPTHS.upper, gen: MOODS.mine },
  { id: 'hollow_middle_01', name: 'Lantern Dark', file: 'music/underground/hollow_middle_01.ogg', gain: 0.122, category: 'location', region: 'mines', place: 'hollow', floors: HOLLOW_DEPTHS.middle, gen: g(48, PHR, 70, 'sine', 349) },
  { id: 'hollow_deep_01', name: 'The Gold Seam', file: 'music/underground/hollow_deep_01.ogg', gain: 0.122, category: 'location', region: 'mines', place: 'hollow', floors: HOLLOW_DEPTHS.deep, gen: g(46, BLU, 84, 'square', 353) },
  { id: 'caves_01', name: 'Drip and Echo', file: 'music/underground/caves_01.ogg', gain: 0.123, category: 'location', region: 'caves', gen: g(48, PHR, 66, 'sine', 331) },
  // Indoors.
  { id: 'house_01', name: 'Home', file: 'music/indoors/house_01.ogg', gain: 0.122, category: 'location', region: 'house', gen: g(64, MAJ, 82, 'sine', 401) },
  { id: 'tavern_01', name: 'The Common Room', file: 'music/indoors/tavern_01.ogg', gain: 0.127, category: 'location', region: 'tavern', gen: g(62, BLU, 118, 'square', 409) },
  { id: 'shops_01', name: 'Open for Business', file: 'music/indoors/shops_01.ogg', gain: 0.117, category: 'location', region: 'shops', gen: g(67, HEX, 104, 'triangle', 419) },
  // v342: the Hollow's deeper zones, each its own (the mine map is one map; the zone you are in is the place).
  { id: 'cavern_01', name: 'The Sunken Cavern', file: 'music/underground/cavern_01.ogg', gain: 0.126, category: 'location', region: 'mines', place: 'cavern', gen: g(49, PHR, 78, 'sine', 337) },
  { id: 'vent_01', name: 'The Ember Vent', file: 'music/underground/vent_01.ogg', gain: 0.12, category: 'location', region: 'mines', place: 'vent', gen: g(51, BLU, 92, 'square', 347) },
  // v342: the Duskmarch, the wild country west of the village: each map its own, Mournfield darker after dark.
  { id: 'gloamwood_01', name: 'Gloamwood', file: 'music/duskmarch/gloamwood_01.ogg', gain: 0.116, category: 'location', region: 'duskmarch', place: 'gloamwood', gen: g(57, DOR, 86, 'triangle', 521) },
  { id: 'tangle_01', name: 'The Tangle', file: 'music/duskmarch/tangle_01.ogg', gain: 0.114, category: 'location', region: 'duskmarch', place: 'tangle', gen: g(55, PHR, 80, 'triangle', 523) },
  { id: 'mournfield_01', name: 'Mournfield', file: 'music/duskmarch/mournfield_01.ogg', gain: 0.125, category: 'location', region: 'duskmarch', place: 'mournfield', gen: g(53, MIN, 66, 'sine', 541) },
  { id: 'mournfield_night_01', name: 'When the Dead Walk', file: 'music/duskmarch/mournfield_night_01.ogg', gain: 0.122, category: 'location', region: 'duskmarch', place: 'mournfield', time: 'night', gen: g(50, PHR, 72, 'sine', 547) },
  // The shrine and the chapel crypt.
  { id: 'sacred_01', name: 'Old Stones', file: 'music/sacred/sacred_01.ogg', gain: 0.118, category: 'location', region: 'sacred', gen: g(50, PHR, 64, 'sine', 503) },
  // v342: across the sea (Rook's boat): the island, the dig site and the Smoke Peak.
  { id: 'island_01', name: 'Warm Water', file: 'music/island/island_01.ogg', gain: 0.122, category: 'location', region: 'island', gen: g(65, LYD, 104, 'triangle', 557) },
  { id: 'digsite_01', name: 'Bones in the Sand', file: 'music/island/digsite_01.ogg', gain: 0.121, category: 'location', region: 'island', place: 'digsite', gen: g(62, DOR, 94, 'triangle', 563) },
  { id: 'peak_01', name: 'The Smoke Peak', file: 'music/island/peak_01.ogg', gain: 0.117, category: 'location', region: 'island', place: 'peak', gen: g(52, BLU, 100, 'square', 569) },
  // The Dunes, the Oasis and the casino.
  { id: 'desert_01', name: 'Heat Shimmer', file: 'music/desert/desert_01.ogg', gain: 0.115, category: 'location', region: 'desert', gen: g(62, PHR, 96, 'triangle', 509) },
  { id: 'casino_01', name: 'The Gilded Dune', file: 'music/desert/casino_01.ogg', gain: 0.12, category: 'location', region: 'desert', place: 'inside_casino', gen: g(60, BLU, 112, 'square', 571) },
  // The season alone and the default, for anywhere without its own music.
  { id: 'default_01', name: 'Hollowmere', file: 'music/default/default_01.ogg', gain: 0.115, category: 'default', gen: g(64, MAJ, 96, 'triangle', 601) },
  // Festivals and events (they override everything but cutscenes).
  { id: 'festival_01', name: 'Bunting and Lanterns', file: 'music/festivals/festival_01.ogg', gain: 0.12, category: 'event', gen: MOODS.festival },
  { id: 'festival_spring_01', name: 'Spring Fair', file: 'music/festivals/festival_spring_01.ogg', gain: 0.118, category: 'event', season: 'Spring', gen: g(67, MAJ, 128, 'square', 701) },
  { id: 'festival_summer_01', name: 'Midsummer', file: 'music/festivals/festival_summer_01.ogg', gain: 0.122, category: 'event', season: 'Summer', gen: g(69, LYD, 132, 'square', 709) },
  { id: 'festival_autumn_01', name: 'Maze Night', file: 'music/festivals/festival_autumn_01.ogg', gain: 0.114, category: 'event', season: 'Autumn', gen: g(62, DOR, 112, 'triangle', 719) },
  { id: 'festival_winter_01', name: 'Frostlight', file: 'music/festivals/festival_winter_01.ogg', gain: 0.123, category: 'event', season: 'Winter', gen: g(64, HEX, 100, 'sine', 727) },
  { id: 'festival_harvest_01', name: 'Harvest Home', file: 'music/festivals/festival_harvest_01.ogg', gain: 0.107, category: 'event', festival: ['grangefair', 'weighin'], priority: 1, gen: g(65, MAJ, 120, 'triangle', 733) },
  { id: 'competition_01', name: 'The Judges Walk', file: 'music/festivals/competition_01.ogg', gain: 0.119, category: 'event', festival: ['blossom', 'catch'], priority: 1, gen: g(67, BLU, 124, 'square', 739) },
  // Cutscenes and story (they override everything).
  { id: 'story_01', name: 'A Letter at Winter\'s End', file: 'music/story/story_01.ogg', gain: 0.121, category: 'cutscene', gen: g(60, LYD, 76, 'sine', 801) },
  { id: 'celebration_01', name: 'The Whole Valley Gathers', file: 'music/story/celebration_01.ogg', gain: 0.118, category: 'cutscene', cutscene: ['wedding'], priority: 1, gen: g(65, HEX, 112, 'triangle', 809) },
  // Gameplay.
  { id: 'combat_01', name: 'Teeth in the Dark', file: 'music/combat/combat_01.ogg', gain: 0.121, category: 'combat', gen: g(52, BLU, 140, 'square', 901) },
  { id: 'combat_02', name: 'Hold the Line', file: 'music/combat/combat_02.ogg', gain: 0.119, category: 'combat', gen: g(50, PHR, 146, 'square', 907) },
  { id: 'boss_01', name: 'The Golden One', file: 'music/combat/boss_01.ogg', gain: 0.101, category: 'boss', gen: g(48, PHR, 152, 'square', 911) },
  { id: 'fishing_01', name: 'Something on the Line', file: 'music/fishing/fishing_01.ogg', gain: 0.113, category: 'fishing', gen: g(67, MAJ, 132, 'triangle', 919) },
  // Screens.
  { id: 'menu_01', name: 'Hollowmere Farm', file: 'music/menu/menu_01.ogg', gain: 0.119, category: 'menu', gen: g(64, LYD, 88, 'triangle', 1001) },
  { id: 'credits_01', name: 'Thank You for Playing', file: 'music/menu/credits_01.ogg', gain: 0.119, category: 'credits', gen: g(62, MAJ, 84, 'sine', 1009) },
  // Stingers: short, played once over a ducked background, then the background returns.
  { id: 'sting_gameover', name: 'Carried Home', file: 'music/stingers/sting_gameover.ogg', gain: 0.124, category: 'sting:gameover', loop: false, gen: g(57, MIN, 70, 'sine', 1101), bars: 1 },
  { id: 'sting_victory', name: 'Victory', file: 'music/stingers/sting_victory.ogg', gain: 0.124, category: 'sting:victory', loop: false, gen: g(67, MAJ, 120, 'square', 1109), bars: 1 },
  { id: 'sting_discovery', name: 'A New Place', file: 'music/stingers/sting_discovery.ogg', gain: 0.105, category: 'sting:discovery', loop: false, gen: g(69, LYD, 100, 'triangle', 1117), bars: 1 },
];

// The layers, highest first: the first layer that has a fitting track wins (spec: cutscenes, festivals, boss and
// combat, the place or its region, the season, the default). active(ctx): whether the layer applies now;
// ignore: track fields this layer does not check.
export const LAYERS = [
  { id: 'menu',     category: 'menu',     active: (c) => c.menu },
  { id: 'cutscene', category: 'cutscene', active: (c) => !!c.cutscene },
  { id: 'event',    category: 'event',    active: (c) => !!c.festival },
  { id: 'boss',     category: 'boss',     active: (c) => c.boss },
  { id: 'combat',   category: 'combat',   active: (c) => c.combat },
  { id: 'fishing',  category: 'fishing',  active: (c) => c.fishing },
  { id: 'location', category: 'location', active: (c) => !!c.region },   // a place's track or its region's
  { id: 'season',   category: 'season',   active: () => true, ignore: ['region', 'place'] },   // a season's tune plays in any place
  { id: 'default',  category: 'default',  active: () => true, ignore: ['region', 'place'] },
];

// v342: places and regions. A place is where you are: the map, except on the Hollow's map, whose zone (systems/mine.js
// MINE.zone) is the place. Each place belongs to one region, whose tracks play wherever a place has none of its own.
// A neighbour's cottage (home_*) counts as the village; animal buildings as the farm. Every place has music (tests).
export const REGIONS = {
  farm: ['farm', 'greenhouse', 'shed', 'inside_coop', 'inside_barn'],
  house: ['house', 'attic'],
  village: ['village', 'town', 'maze'],
  forest: ['forest', 'grove', 'mere'],
  beach: ['beach'],
  mountains: ['mountain', 'quarry', 'railway'],
  wilds: ['wilds'],
  duskmarch: ['gloamwood', 'tangle', 'mournfield'],
  mines: ['hollow', 'cavern', 'vent'],
  caves: ['cave', 'sewer'],
  sacred: ['shrine', 'crypt'],
  island: ['island', 'digsite', 'peak'],
  desert: ['desert', 'inside_oasis', 'inside_casino'],
  tavern: ['inside_tavern'],
  shops: ['inside_store', 'inside_smithy', 'inside_carpenter', 'inside_clinic', 'inside_ranch', 'inside_museum', 'inside_hall', 'inside_lodge', 'inside_theatre'],
};
export const MINE_ZONES = ['hollow', 'cavern', 'vent', 'peak'];   // systems/mine.js zones, each a place
export const placeOf = (map, zone = 'hollow') => (map === 'mine' ? (MINE_ZONES.includes(zone) ? zone : 'hollow') : map || null);
export const regionOf = (place) => (place?.startsWith('home_') ? 'village' : Object.keys(REGIONS).find((k) => REGIONS[k].includes(place)) || null);

// Time of day by the clock (minutes from midnight; the day runs to 2 am, 26 * 60).
export const TIMES = [['morning', 6 * 60], ['afternoon', 12 * 60], ['evening', 17 * 60], ['night', 20 * 60]];
export const timeOf = (min) => TIMES.reduce((t, [k, from]) => (min >= from ? k : t), 'night');

// Weather nudges loudness without changing the tune where a location has no weather variant (storms are loud).
export const WEATHER_VOLUME = { sun: 1, rain: 0.85, storm: 0.7, snow: 0.9, mist: 0.8 };
export const NIGHT_VOLUME = 0.55;   // after 8 pm, unless the track is a night track (it is already quiet)

export const MUSIC = {
  fade: 2,            // seconds of crossfade between background tracks
  fastFade: 0.8,      // into and out of combat, fishing and stingers
  rotateAfter: 300,   // seconds a track plays (to the end of that loop) before another that fits as well takes over
  duck: 0.25,         // the background's level under a stinger
  combatRange: 7,     // tiles: an awake monster this near starts combat music
  combatCalm: 4,      // seconds with no monster in range before combat music ends
  festivalMaps: ['village', 'maze'],   // where a festival's music plays while it is open
  history: 4,         // tracks remembered to avoid repeats
};
