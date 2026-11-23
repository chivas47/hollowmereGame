// v318 (roadmap 110): the music database. Every background track and stinger is registered here; the director
// (systems/musicDirector.js) picks from it and the player (audio/music.js) plays it. Add a track by adding an entry:
// no other code changes. Files live in assets/audio/music/ (README there).
//
// Each track:
//   id        unique key (saved in the farm's music memory, so do not rename one lightly)
//   name      a human name, shown in debug logs
//   file      under assets/audio/ (any format the browser plays); if it is missing the gen recipe plays instead
//   category  what it is for, one or several of the LAYERS' categories below
//   location  the location group it belongs to (LOCATIONS below), or none
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
//   plays     loops before the director moves on to another track of the same kind (variety; default 3)
//   gen       the generator recipe the file was recorded from (audio/music.js): root (MIDI), scale, bpm, lead, seed
//
// A track fits when every field it sets matches the moment (a field it leaves out matches anything). Among the
// fitting tracks of a layer, the most specific win, by weight: festival or cutscene, then location, weather, time,
// season (in the rain the rainy village track beats the spring village track, which beats the plain village track),
// so a missing seasonal, weather or time variant falls back to the plainer one.
import { MOODS } from './music.js';

const MAJ = [0, 2, 4, 7, 9], MIN = [0, 3, 5, 7, 10], DOR = [0, 2, 3, 7, 9], PHR = [0, 1, 5, 7, 8], LYD = [0, 2, 4, 6, 7, 9], HEX = [0, 2, 4, 5, 7, 9], BLU = [0, 3, 5, 6, 7, 10];
const g = (root, scale, bpm, lead, seed) => ({ root, scale, bpm, lead, seed });

export const TRACKS = [
  // The farm: the four original season themes, a second spring tune, a night and a rain variant.
  { id: 'farm_spring_01', name: 'Spring on the Farm', file: 'music/spring-farm-theme.ogg', gain: 0.119, category: ['location', 'season'], location: 'farm', season: 'Spring', gen: MOODS.Spring },
  { id: 'farm_spring_02', name: 'First Shoots', file: 'music/spring-farm-theme-2.ogg', gain: 0.119, category: ['location', 'season'], location: 'farm', season: 'Spring', gen: g(62, MAJ, 96, 'triangle', 113) },
  { id: 'farm_summer_01', name: 'Summer on the Farm', file: 'music/summer-farm-theme.ogg', gain: 0.12, category: ['location', 'season'], location: 'farm', season: 'Summer', gen: MOODS.Summer },
  { id: 'farm_autumn_01', name: 'Autumn on the Farm', file: 'music/autumn-farm-theme.ogg', gain: 0.123, category: ['location', 'season'], location: 'farm', season: 'Autumn', gen: MOODS.Autumn },
  { id: 'farm_winter_01', name: 'Winter on the Farm', file: 'music/winter-farm-theme.ogg', gain: 0.121, category: ['location', 'season'], location: 'farm', season: 'Winter', gen: MOODS.Winter },
  { id: 'farm_night_01', name: 'Farm After Dark', file: 'music/farm-night-theme.ogg', gain: 0.123, category: 'location', location: 'farm', time: 'night', gen: g(57, MIN, 70, 'sine', 131) },
  { id: 'farm_rain_01', name: 'Rain on the Rows', file: 'music/farm-rain-theme.ogg', gain: 0.121, category: 'location', location: 'farm', weather: ['rain', 'storm'], gen: g(59, DOR, 84, 'sine', 137) },
  // The village and town: one per season, and rain.
  { id: 'village_spring_01', name: 'Village in Spring', file: 'music/village-spring-theme.ogg', gain: 0.121, category: 'location', location: 'village', season: 'Spring', gen: g(67, HEX, 108, 'triangle', 211) },
  { id: 'village_summer_01', name: 'Village in Summer', file: 'music/village-summer-theme.ogg', gain: 0.12, category: 'location', location: 'village', season: 'Summer', gen: g(69, MAJ, 116, 'square', 223) },
  { id: 'village_autumn_01', name: 'Village in Autumn', file: 'music/village-autumn-theme.ogg', gain: 0.122, category: 'location', location: 'village', season: 'Autumn', gen: g(64, DOR, 98, 'triangle', 227) },
  { id: 'village_winter_01', name: 'Village in Winter', file: 'music/village-winter-theme.ogg', gain: 0.122, category: 'location', location: 'village', season: 'Winter', gen: g(62, MIN, 86, 'sine', 229) },
  { id: 'village_rain_01', name: 'Village in the Rain', file: 'music/village-rain-theme.ogg', gain: 0.121, category: 'location', location: 'village', weather: ['rain', 'storm'], gen: g(60, DOR, 88, 'sine', 233) },
  // Wild places.
  { id: 'forest_01', name: 'Under the Canopy', file: 'music/forest-theme.ogg', gain: 0.118, category: 'location', location: 'forest', gen: g(62, DOR, 92, 'triangle', 307) },
  { id: 'beach_01', name: 'Tide Line', file: 'music/beach-theme.ogg', gain: 0.118, category: 'location', location: 'beach', gen: g(65, LYD, 100, 'sine', 311) },
  { id: 'mountain_01', name: 'High Paths', file: 'music/mountain-theme.ogg', gain: 0.123, category: 'location', location: 'mountains', gen: g(60, HEX, 90, 'triangle', 313) },
  { id: 'exploration_01', name: 'Off the Map', file: 'music/exploration-theme.ogg', gain: 0.115, category: 'location', location: 'wilds', gen: g(57, DOR, 104, 'triangle', 317) },
  // Underground.
  { id: 'mines_01', name: 'The Hollow', file: 'music/hollow-mine-theme.ogg', gain: 0.122, category: 'location', location: 'mines', gen: MOODS.mine },
  { id: 'caves_01', name: 'Drip and Echo', file: 'music/cave-theme.ogg', gain: 0.123, category: 'location', location: 'caves', gen: g(48, PHR, 66, 'sine', 331) },
  // Indoors.
  { id: 'house_01', name: 'Home', file: 'music/farmhouse-theme.ogg', gain: 0.122, category: 'location', location: 'house', gen: g(64, MAJ, 82, 'sine', 401) },
  { id: 'tavern_01', name: 'The Common Room', file: 'music/tavern-theme.ogg', gain: 0.127, category: 'location', location: 'tavern', gen: g(62, BLU, 118, 'square', 409) },
  { id: 'shops_01', name: 'Open for Business', file: 'music/shop-theme.ogg', gain: 0.117, category: 'location', location: 'shops', gen: g(67, HEX, 104, 'triangle', 419) },
  // Special places (they outrank the season and everything below).
  { id: 'special_shrine_01', name: 'Old Stones', file: 'music/shrine-and-graveyard-theme.ogg', gain: 0.118, category: 'special', location: 'secret', gen: g(50, PHR, 64, 'sine', 503) },
  { id: 'special_desert_01', name: 'Heat Shimmer', file: 'music/desert-and-island-theme.ogg', gain: 0.115, category: 'special', location: 'faraway', gen: g(62, PHR, 96, 'triangle', 509) },
  // The season alone and the default, for anywhere without its own music.
  { id: 'default_01', name: 'Hollowmere', file: 'music/default-theme.ogg', gain: 0.115, category: 'default', gen: g(64, MAJ, 96, 'triangle', 601) },
  // Festivals and events (they override everything but cutscenes).
  { id: 'festival_01', name: 'Bunting and Lanterns', file: 'music/festival-square-theme.ogg', gain: 0.12, category: 'event', gen: MOODS.festival },
  { id: 'festival_spring_01', name: 'Spring Fair', file: 'music/spring-festival-theme.ogg', gain: 0.118, category: 'event', season: 'Spring', gen: g(67, MAJ, 128, 'square', 701) },
  { id: 'festival_summer_01', name: 'Midsummer', file: 'music/summer-festival-theme.ogg', gain: 0.122, category: 'event', season: 'Summer', gen: g(69, LYD, 132, 'square', 709) },
  { id: 'festival_autumn_01', name: 'Maze Night', file: 'music/autumn-festival-theme.ogg', gain: 0.114, category: 'event', season: 'Autumn', gen: g(62, DOR, 112, 'triangle', 719) },
  { id: 'festival_winter_01', name: 'Frostlight', file: 'music/winter-festival-theme.ogg', gain: 0.123, category: 'event', season: 'Winter', gen: g(64, HEX, 100, 'sine', 727) },
  { id: 'festival_harvest_01', name: 'Harvest Home', file: 'music/harvest-festival-theme.ogg', gain: 0.107, category: 'event', festival: ['grangefair', 'weighin'], priority: 1, gen: g(65, MAJ, 120, 'triangle', 733) },
  { id: 'competition_01', name: 'The Judges Walk', file: 'music/competition-theme.ogg', gain: 0.119, category: 'event', festival: ['blossom', 'catch'], priority: 1, gen: g(67, BLU, 124, 'square', 739) },
  // Cutscenes and story (they override everything).
  { id: 'story_01', name: 'A Letter at Winter\'s End', file: 'music/story-theme.ogg', gain: 0.121, category: 'cutscene', gen: g(60, LYD, 76, 'sine', 801) },
  { id: 'celebration_01', name: 'The Whole Valley Gathers', file: 'music/celebration-theme.ogg', gain: 0.118, category: 'cutscene', cutscene: ['wedding'], priority: 1, gen: g(65, HEX, 112, 'triangle', 809) },
  // Gameplay.
  { id: 'combat_01', name: 'Teeth in the Dark', file: 'music/combat-theme.ogg', gain: 0.121, category: 'combat', gen: g(52, BLU, 140, 'square', 901) },
  { id: 'combat_02', name: 'Hold the Line', file: 'music/combat-theme-2.ogg', gain: 0.119, category: 'combat', gen: g(50, PHR, 146, 'square', 907) },
  { id: 'boss_01', name: 'The Golden One', file: 'music/boss-theme.ogg', gain: 0.101, category: 'boss', gen: g(48, PHR, 152, 'square', 911) },
  { id: 'fishing_01', name: 'Something on the Line', file: 'music/fishing-theme.ogg', gain: 0.113, category: 'fishing', gen: g(67, MAJ, 132, 'triangle', 919) },
  // Screens.
  { id: 'menu_01', name: 'Hollowmere Farm', file: 'music/main-menu-theme.ogg', gain: 0.119, category: 'menu', gen: g(64, LYD, 88, 'triangle', 1001) },
  { id: 'credits_01', name: 'Thank You for Playing', file: 'music/credits-theme.ogg', gain: 0.119, category: 'credits', gen: g(62, MAJ, 84, 'sine', 1009) },
  // Stingers: short, played once over a ducked background, then the background returns.
  { id: 'sting_gameover', name: 'Carried Home', file: 'music/game-over-sting.ogg', gain: 0.124, category: 'sting:gameover', loop: false, gen: g(57, MIN, 70, 'sine', 1101), bars: 1 },
  { id: 'sting_victory', name: 'Victory', file: 'music/victory-sting.ogg', gain: 0.124, category: 'sting:victory', loop: false, gen: g(67, MAJ, 120, 'square', 1109), bars: 1 },
  { id: 'sting_discovery', name: 'A New Place', file: 'music/discovery-sting.ogg', gain: 0.105, category: 'sting:discovery', loop: false, gen: g(69, LYD, 100, 'triangle', 1117), bars: 1 },
];

// The layers, highest first: the first layer that has a fitting track wins (spec: cutscenes, festivals, boss and
// combat, special places, the location, the season, the default). active(ctx): whether the layer applies now;
// ignore: track fields this layer does not check.
export const LAYERS = [
  { id: 'menu',     category: 'menu',     active: (c) => c.menu },
  { id: 'cutscene', category: 'cutscene', active: (c) => !!c.cutscene },
  { id: 'event',    category: 'event',    active: (c) => !!c.festival },
  { id: 'boss',     category: 'boss',     active: (c) => c.boss },
  { id: 'combat',   category: 'combat',   active: (c) => c.combat },
  { id: 'fishing',  category: 'fishing',  active: (c) => c.fishing },
  { id: 'special',  category: 'special',  active: (c) => !!c.location },
  { id: 'location', category: 'location', active: (c) => !!c.location },
  { id: 'season',   category: 'season',   active: () => true, ignore: ['location'] },   // a season's tune plays in any place
  { id: 'default',  category: 'default',  active: () => true, ignore: ['location'] },
];

// Location groups: each map belongs to one (maps not listed use none and fall to the season and default layers).
// A neighbour's cottage counts as the village; animal buildings as the farm.
export const LOCATIONS = {
  farm: ['farm', 'greenhouse', 'shed', 'inside_coop', 'inside_barn'],
  house: ['house', 'attic'],
  village: ['village', 'town', 'maze'],
  forest: ['forest', 'grove', 'mere'],
  beach: ['beach'],
  mountains: ['mountain', 'quarry', 'railway'],
  wilds: ['wilds', 'gloamwood', 'tangle'],
  mines: ['mine'],
  caves: ['cave', 'sewer'],
  tavern: ['inside_tavern', 'inside_casino'],
  shops: ['inside_store', 'inside_smithy', 'inside_carpenter', 'inside_clinic', 'inside_ranch', 'inside_museum', 'inside_hall', 'inside_lodge', 'inside_theatre'],
  secret: ['shrine', 'crypt', 'mournfield'],
  faraway: ['desert', 'digsite', 'island', 'inside_oasis'],
};
export const locationOf = (map) => (map?.startsWith('home_') ? 'village' : Object.keys(LOCATIONS).find((k) => LOCATIONS[k].includes(map)) || null);

// Time of day by the clock (minutes from midnight; the day runs to 2 am, 26 * 60).
export const TIMES = [['morning', 6 * 60], ['afternoon', 12 * 60], ['evening', 17 * 60], ['night', 20 * 60]];
export const timeOf = (min) => TIMES.reduce((t, [k, from]) => (min >= from ? k : t), 'night');

// Weather nudges loudness without changing the tune where a location has no weather variant (storms are loud).
export const WEATHER_VOLUME = { sun: 1, rain: 0.85, storm: 0.7, snow: 0.9, mist: 0.8 };
export const NIGHT_VOLUME = 0.55;   // after 8 pm, unless the track is a night track (it is already quiet)

export const MUSIC = {
  fade: 2,            // seconds of crossfade between background tracks
  fastFade: 0.8,      // into and out of combat, fishing and stingers
  plays: 3,           // default loops of a track before another of the same kind takes over
  duck: 0.25,         // the background's level under a stinger
  combatRange: 7,     // tiles: an awake monster this near starts combat music
  combatCalm: 4,      // seconds with no monster in range before combat music ends
  festivalMaps: ['village', 'maze'],   // where a festival's music plays while it is open
  history: 4,         // tracks remembered to avoid repeats
};
