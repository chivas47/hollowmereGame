// v342 (roadmap 119): the ambience database. What you hear under the music, by place, weather, season and time, as
// rules: no code changes to add a layer. systems/ambienceDirector.js turns the moment into levels and chances
// (pure), audio/ambience.js plays them (BED_FILES and CALL_FILES in data/audio.js are the sounds). Several layers
// play at once: a summer night in the wild is crickets and a little wind with an owl now and then; a rainy day is
// rain and wind under the music (thunder comes with the lightning, systems/atmosphere.js).
//
// The moment (ambienceContext): area (data/atmosphere.js AMBIENCE: wild, shore, town, wind; cave underground),
// sky (outdoors), weather (sun, rain, storm, snow, mist), wet (rain or storm, even indoors), season, time (morning,
// afternoon, evening, night; data/musicTracks.js TIMES), indoorRain (rain outside this building's door), and how
// near you are to a waterfall or a hearth (0 far to 1 beside it).
//
// A rule's `when` must all match (a list matches any of its values) and its `except` must not.
//   Beds (loops): level 0 to 1; the loudest matching rule of a bed wins. near: scales the level by the nearness to
//     'waterfall' or 'hearth'. swell: the level rises and falls by this much every few seconds (surf).
//   Calls (one-offs): chance of playing on each check (every AMBIENCE_TICK seconds). near: adds perNear times the
//     nearness to the chance and plays at the nearness's volume (the hearth's crackle).

export const AMBIENCE_TICK = 0.25;   // seconds between checks

export const BED_RULES = [
  { bed: 'rain', level: 1,    when: { sky: true, weather: 'storm' } },
  { bed: 'rain', level: 0.7,  when: { sky: true, weather: 'rain' } },
  { bed: 'rain', level: 0.25, when: { indoorRain: true } },   // muffled through the walls
  { bed: 'wind', level: 0.8,  when: { area: 'wind' } },        // the desert and the quarry
  { bed: 'wind', level: 0.5,  when: { sky: true, weather: 'storm' } },
  { bed: 'wind', level: 0.4,  when: { sky: true, season: 'Winter' } },
  { bed: 'wind', level: 0.25, when: { sky: true, weather: 'rain' } },
  { bed: 'wind', level: 0.15, when: { sky: true, time: 'night' } },
  { bed: 'surf', level: 0.6,  swell: 0.4, when: { area: 'shore' } },
  { bed: 'hum',  level: 0.7,  when: { area: 'cave' } },
  { bed: 'falls', level: 1,   near: 'waterfall' },
  { bed: 'fire',  level: 0.5, near: 'hearth' },
];

export const CALL_RULES = [
  { call: 'crackle', chance: 0.25, perNear: 0.5, near: 'hearth' },
  { call: 'tap',     chance: 0.6,  when: { indoorRain: true } },
  { call: 'bird',    chance: 0.12, when: { area: 'wild', wet: false }, except: { time: 'night', season: 'Winter' } },
  { call: 'bird',    chance: 0.06, when: { area: 'town', wet: false }, except: { time: 'night', season: 'Winter' } },
  { call: 'cricket', chance: 0.5,  when: { area: 'wild', time: 'night', wet: false }, except: { season: 'Winter' } },
  { call: 'owl',     chance: 0.008, when: { area: 'wild', time: 'night', wet: false } },
  { call: 'bell',    chance: 0.004, when: { area: 'town', wet: false }, except: { time: 'night' } },
  { call: 'gull',    chance: 0.05, when: { area: 'shore', wet: false }, except: { time: 'night' } },
  { call: 'drip',    chance: 0.08, when: { area: 'cave', wet: false } },
  { call: 'gust',    chance: 0.03, when: { area: 'wind', wet: false } },
];
