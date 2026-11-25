// v318 (roadmap 110): the music database. Every background track and stinger is registered here; the director
// (systems/musicDirector.js) picks from it and the player (audio/music.js) plays it. Add a track by adding an entry:
// no other code changes. Files live in assets/audio/music/ (README there).
//
// Each track:
//   id        unique key (saved in the farm's music memory, so do not rename one lightly)
//   name      a human name, shown in debug logs
//   brief     v343: what to compose: the moment it plays in, mood, instruments, tempo and form (assets/audio/README.md
//             is written from it: node tools/audio_list.mjs --readme)
//   file      under assets/audio/music/<folder>/<id>.ogg (any format the browser plays; README there); if it is
//             missing the gen recipe plays instead
//   category  what it is for, one or several of the LAYERS' categories below
//   region    v343: the region it belongs to (REGIONS below: the farm, the village, the Duskmarch, the island...)
//   floors    v343: [from, to] floors of a deep place (the Hollow), or [from] for that floor and every one below;
//             with a place, a depth band's track beats the place's plain one
//   place     v343: one place or several (a map id, or a zone of the Hollow's map: MINE_ZONES below); a place's own track
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
//   rotateAfter  v343: seconds of play after which, at the end of a loop, another track that fits as well takes over
//             (default MUSIC.rotateAfter). Counted in time, not loops, so a 10-second sketch and a 3-minute piece rotate alike
//   gen       the generator recipe the file was recorded from (audio/music.js): root (MIDI), scale, bpm, lead, seed
//
// A track fits when every field it sets matches the moment (a field it leaves out matches anything). Among the
// fitting tracks of a layer, the most specific win, by weight: festival or cutscene, then place, region, weather, time,
// season (Mournfield's own track beats anything of the Duskmarch's; in the rain the rainy village track beats the
// spring village track, which beats the plain village track), so a missing variant falls back to the plainer one.
import { MOODS } from './music.js';
import { CAVERN } from './cavern.js';
import { VENT } from './forge.js';
import { PEAK } from './nuts.js';

const MAJ = [0, 2, 4, 7, 9], MIN = [0, 3, 5, 7, 10], DOR = [0, 2, 3, 7, 9], PHR = [0, 1, 5, 7, 8], LYD = [0, 2, 4, 6, 7, 9], HEX = [0, 2, 4, 5, 7, 9], BLU = [0, 3, 5, 6, 7, 10];
const g = (root, scale, bpm, lead, seed) => ({ root, scale, bpm, lead, seed });

// v343: the Hollow's depth bands (floors, inclusive; one number: that floor and every one below).
export const HOLLOW_DEPTHS = { upper: [1, 39], middle: [40, 79], deep: [80] };
// The Sunken Cavern's, from its own data so they move with it: above the Ember Vent's door, from the door down to
// where umbrite is richest, and below. (Its creatures do not change with depth; only their strength and the ore.)
const UMBRITE_RICHEST = (() => { let n = 1; while (CAVERN.umbrite(n) < CAVERN.umbrite(1000) && n < 1000) n++; return n; })();
export const CAVERN_DEPTHS = { upper: [1, VENT.doorFloor - 1], middle: [VENT.doorFloor, UMBRITE_RICHEST - 1], deep: [UMBRITE_RICHEST] };
// The Ember Vent and the Smoke Peak are short climbs (ten floors) with a quiet room at the top, no rocks and no
// monsters: the forge, the summit cache. The climb is one band, the top room the other.
export const VENT_DEPTHS = { climb: [1, VENT.floors - 1], forge: [VENT.floors] };
export const PEAK_DEPTHS = { climb: [1, PEAK.floors - 1], summit: [PEAK.floors] };

export const TRACKS = [
  // The farm: the four original season themes, a second spring tune, a night and a rain variant.
  { id: 'farm_spring_01', name: 'Spring on the Farm', brief: 'The game\'s signature morning theme, heard more than any other track. Fresh and hopeful, a melody you can hum after one listen. Acoustic guitar carries it, flute answers, light marimba or glockenspiel on top. Medium-gentle tempo; 1.5 to 2.5 minutes, looping seamlessly.', file: 'music/farm/farm_spring_01.ogg', gain: 0.119, category: ['location', 'season'], region: 'farm', season: 'Spring', gen: MOODS.Spring },
  { id: 'farm_spring_02', name: 'First Shoots', brief: 'A second spring farm tune to rotate with Spring on the Farm. Same warmth, different shape: more pastoral and airy, as if the first shoots are up. Flute or recorder lead over fingerpicked guitar, soft strings underneath. Avoid quoting the first spring theme.', file: 'music/farm/farm_spring_02.ogg', gain: 0.119, category: ['location', 'season'], region: 'farm', season: 'Spring', gen: g(62, MAJ, 96, 'triangle', 113) },
  { id: 'farm_summer_01', name: 'Summer on the Farm', brief: 'Bright, lazy, sunlit afternoons in the fields. Banjo or ukulele strumming, a whistled or fiddle melody, hand percussion (shaker, cajón). A little swing; relaxed, never rushed.', file: 'music/farm/farm_summer_01.ogg', gain: 0.12, category: ['location', 'season'], region: 'farm', season: 'Summer', gen: MOODS.Summer },
  { id: 'farm_autumn_01', name: 'Autumn on the Farm', brief: 'Mellow and golden: harvest time, the year turning. Piano or nylon guitar melody, warm strings, clarinet or bassoon counter-line. Slightly slower than summer, a touch of wistfulness without sadness.', file: 'music/farm/farm_autumn_01.ogg', gain: 0.123, category: ['location', 'season'], region: 'farm', season: 'Autumn', gen: MOODS.Autumn },
  { id: 'farm_winter_01', name: 'Winter on the Farm', brief: 'Quiet, sparse, snow on the fields. Solo piano or celesta with soft pads and the occasional sleigh-bell or chime. Lots of space between notes; calm and cosy, not cold.', file: 'music/farm/farm_winter_01.ogg', gain: 0.121, category: ['location', 'season'], region: 'farm', season: 'Winter', gen: MOODS.Winter },
  { id: 'farm_night_01', name: 'Farm After Dark', brief: 'The farm after 8 pm in any season. Hushed and slow: soft piano, muted strings, a distant music-box or harp figure. Must sit under crickets and wind without competing; keep the mix soft and the low end light.', file: 'music/farm/farm_night_01.ogg', gain: 0.123, category: 'location', region: 'farm', time: 'night', gen: g(57, MIN, 70, 'sine', 131) },
  { id: 'farm_rain_01', name: 'Rain on the Rows', brief: 'Rain on the farm (and storms). Reflective, indoorsy even outdoors: Rhodes or felt piano, muted guitar, gentle brushed drums. Leave room for the rain sound in the high frequencies.', file: 'music/farm/farm_rain_01.ogg', gain: 0.121, category: 'location', region: 'farm', weather: ['rain', 'storm'], gen: g(59, DOR, 84, 'sine', 137) },
  // The village and town: one per season, and rain.
  { id: 'village_spring_01', name: 'Village in Spring', brief: 'The village square in spring: sociable, neighbours chatting, market stalls opening. Guitar and accordion or concertina, light percussion, a cheerful walking bass. Busier than the farm themes but still relaxed.', file: 'music/village/village_spring_01.ogg', gain: 0.121, category: 'location', region: 'village', season: 'Spring', gen: g(67, HEX, 108, 'triangle', 211) },
  { id: 'village_summer_01', name: 'Village in Summer', brief: 'The village in summer: warm evenings, people out of doors. Upbeat folk band feel: fiddle, guitar, upright bass, tambourine. Danceable but easy.', file: 'music/village/village_summer_01.ogg', gain: 0.12, category: 'location', region: 'village', season: 'Summer', gen: g(69, MAJ, 116, 'square', 223) },
  { id: 'village_autumn_01', name: 'Village in Autumn', brief: 'The village in autumn: woodsmoke, apples, early dusk. Accordion or harmonium melody, plucked strings, a lilting 6/8 or slow waltz would suit.', file: 'music/village/village_autumn_01.ogg', gain: 0.122, category: 'location', region: 'village', season: 'Autumn', gen: g(64, DOR, 98, 'triangle', 227) },
  { id: 'village_winter_01', name: 'Village in Winter', brief: 'The village in winter: lit windows, frost, people hurrying home. Piano and bells, soft strings, a gentle carol-like melody (original, not a real carol).', file: 'music/village/village_winter_01.ogg', gain: 0.122, category: 'location', region: 'village', season: 'Winter', gen: g(62, MIN, 86, 'sine', 229) },
  { id: 'village_rain_01', name: 'Village in the Rain', brief: 'Rain in the village. Cosy and unhurried, like watching the street from a café window. Muted trumpet or clarinet, brushed drums, soft piano chords.', file: 'music/village/village_rain_01.ogg', gain: 0.121, category: 'location', region: 'village', weather: ['rain', 'storm'], gen: g(60, DOR, 88, 'sine', 233) },
  // Wild places.
  { id: 'forest_01', name: 'Under the Canopy', brief: 'Brackenwood, the hidden grove and the mere: tall trees, dappled light, curiosity. Flute and marimba, plucked strings, light woodblock. Slightly mysterious but welcoming.', file: 'music/wild/forest_01.ogg', gain: 0.118, category: 'location', region: 'forest', gen: g(62, DOR, 92, 'triangle', 307) },
  { id: 'beach_01', name: 'Tide Line', brief: 'Saltreach Beach: breezy and open, gulls and surf underneath. Ukulele or steel-string guitar, steel drum or vibraphone, laid-back groove. Leave space for the surf loop.', file: 'music/wild/beach_01.ogg', gain: 0.118, category: 'location', region: 'beach', gen: g(65, LYD, 100, 'sine', 311) },
  { id: 'mountain_01', name: 'High Paths', brief: 'Cragmoor, the quarry and the railway: high paths, wind, wide views. Open fifths, acoustic guitar, low whistle or pan flute, a steady walking pulse.', file: 'music/wild/mountain_01.ogg', gain: 0.123, category: 'location', region: 'mountains', gen: g(60, HEX, 90, 'triangle', 313) },
  { id: 'exploration_01', name: 'Off the Map', brief: 'Ashgrove Wilds: off the beaten path, a little adventure. Driving but light: plucked strings, hand drums, flute; a sense of discovery.', file: 'music/wild/exploration_01.ogg', gain: 0.115, category: 'location', region: 'wilds', gen: g(57, DOR, 104, 'triangle', 317) },
  // Underground.
  // v343: the Hollow by depth, in the bands its creatures and ore change at (data/monsters.js MONSTERS, cavern.js):
  // earth and copper above 40, soot puffs, moss slimes and lantern wisps from 40, gold and the Cavern's door from 80.
  { id: 'hollow_upper_01', name: 'The Hollow', brief: 'The Hollow, floors 1 to 39: earth, copper, crabs and moles. Mysterious, not yet threatening. Soft synth pads, low bass pulse, sparse percussion (drips, woodblocks), a simple modal melody on marimba or kalimba.', file: 'music/underground/hollow_upper_01.ogg', gain: 0.122, category: 'location', region: 'mines', place: 'hollow', floors: HOLLOW_DEPTHS.upper, gen: MOODS.mine },
  { id: 'hollow_middle_01', name: 'Lantern Dark', brief: 'The Hollow, floors 40 to 79: soot puffs, moss slimes, lantern wisps. Darker and colder than the upper floors: drones, glassy bell tones, slower and lower, a faint eerie lead.', file: 'music/underground/hollow_middle_01.ogg', gain: 0.122, category: 'location', region: 'mines', place: 'hollow', floors: HOLLOW_DEPTHS.middle, gen: g(48, PHR, 70, 'sine', 349) },
  { id: 'hollow_deep_01', name: 'The Gold Seam', brief: 'The Hollow, floor 80 and deeper: gold, armoured creatures, the Cavern\'s door. Heavy and tense: deep bass ostinato, metallic percussion, dissonant pads. The most oppressive of the three.', file: 'music/underground/hollow_deep_01.ogg', gain: 0.122, category: 'location', region: 'mines', place: 'hollow', floors: HOLLOW_DEPTHS.deep, gen: g(46, BLU, 84, 'square', 353) },
  { id: 'caves_01', name: 'Drip and Echo', brief: 'The farm cave and the sewer: small, damp, echoing places. Sparse and atmospheric: plucked notes with long reverb, water-drop percussion, a low hum; calm rather than dangerous.', file: 'music/underground/caves_01.ogg', gain: 0.123, category: 'location', region: 'caves', gen: g(48, PHR, 66, 'sine', 331) },
  // Indoors.
  { id: 'house_01', name: 'Home', brief: 'The farmhouse and attic: home. The warmest, simplest piece in the game. Solo piano or guitar, maybe a soft cello; slow and comforting.', file: 'music/indoors/house_01.ogg', gain: 0.122, category: 'location', region: 'house', gen: g(64, MAJ, 82, 'sine', 401) },
  { id: 'tavern_01', name: 'The Common Room', brief: 'The Lantern tavern: a lively pub evening. Folk band: fiddle, accordion, guitar, foot-stomp percussion; jolly and loose.', file: 'music/indoors/tavern_01.ogg', gain: 0.127, category: 'location', region: 'tavern', gen: g(62, BLU, 118, 'square', 409) },
  { id: 'shops_01', name: 'Open for Business', brief: 'Every working shop in town (store, smithy, carpentry, clinic, ranch, town hall, lodge): light and friendly background music. Pizzicato strings or ukulele, soft bells; unobtrusive, it plays while you browse menus.', file: 'music/indoors/shops_01.ogg', gain: 0.117, category: 'location', region: 'shops', gen: g(67, HEX, 104, 'triangle', 419) },
  // v343: the two quieter rooms in town, each its own.
  { id: 'museum_01', name: 'Quiet Halls', brief: 'Hollowmere Museum: quiet halls of artifacts and donations. Calm and thoughtful: solo piano or harp, soft strings, a gentle sense of wonder. Very quiet dynamics.', file: 'music/indoors/museum_01.ogg', gain: 0.116, category: 'location', region: 'shops', place: 'inside_museum', gen: g(64, LYD, 72, 'sine', 421) },
  { id: 'theatre_01', name: 'House Lights', brief: 'The Starlight Picture House: a small old cinema. Nostalgic and charming: an old-time piano or small band (clarinet, upright bass, brushes), like the warm-up music before a film.', file: 'music/indoors/theatre_01.ogg', gain: 0.121, category: 'location', region: 'shops', place: 'inside_theatre', gen: g(62, HEX, 96, 'triangle', 431) },
  // v343: the Hollow's deeper zones, each its own (the mine map is one map; the zone you are in is the place).
  { id: 'cavern_upper_01', name: 'The Sunken Cavern', brief: 'The Sunken Cavern, floors 1 to 9: an ancient buried place of sand and ruins. Middle-eastern tinged modes (phrygian), low drones, hand drums, a reed or ney-like lead.', file: 'music/underground/cavern_upper_01.ogg', gain: 0.126, category: 'location', region: 'mines', place: 'cavern', floors: CAVERN_DEPTHS.upper, gen: g(49, PHR, 78, 'sine', 337) },
  { id: 'cavern_middle_01', name: 'Past the Ember Door', brief: 'The Sunken Cavern, floors 10 to 24, past the Ember Vent\'s door: heat rising, more urgent. Faster hand drums, darker drones, a rhythmic plucked figure.', file: 'music/underground/cavern_middle_01.ogg', gain: 0.118, category: 'location', region: 'mines', place: 'cavern', floors: CAVERN_DEPTHS.middle, gen: g(47, PHR, 84, 'triangle', 359) },
  { id: 'cavern_deep_01', name: 'Umbrite Veins', brief: 'The Sunken Cavern, floor 25 and deeper, where umbrite is richest: the hardest everyday place in the game. Driving and dangerous: pounding low percussion, distorted drones, a strained high lead.', file: 'music/underground/cavern_deep_01.ogg', gain: 0.12, category: 'location', region: 'mines', place: 'cavern', floors: CAVERN_DEPTHS.deep, gen: g(45, BLU, 90, 'square', 367) },
  { id: 'vent_climb_01', name: 'The Ember Vent', brief: 'The Ember Vent, floors 1 to 9: lava, cinder and fire. Hot and relentless: low brass or synth bass, anvil-like metallic hits, a fast pulse.', file: 'music/underground/vent_climb_01.ogg', gain: 0.12, category: 'location', region: 'mines', place: 'vent', floors: VENT_DEPTHS.climb, gen: g(51, BLU, 92, 'square', 347) },
  { id: 'vent_forge_01', name: 'The Forge', brief: 'The Ember Vent\'s forge room on floor 10: no monsters, a safe hearth after the climb. Warm and steady: low strings, a slow anvil rhythm, a calm melody. Relief.', file: 'music/underground/vent_forge_01.ogg', gain: 0.125, category: 'location', region: 'mines', place: 'vent', floors: VENT_DEPTHS.forge, gen: g(55, DOR, 72, 'triangle', 373) },
  // v343: the Duskmarch, the wild country west of the village: each map its own, Mournfield darker after dark.
  { id: 'gloamwood_01', name: 'Gloamwood', brief: 'Gloamwood, the old woods west of the village: winding paths, easy to get lost, watched from the trees. Low flute, plucked strings, wooden percussion; dorian, a little uneasy but not scary.', file: 'music/duskmarch/gloamwood_01.ogg', gain: 0.116, category: 'location', region: 'duskmarch', place: 'gloamwood', gen: g(57, DOR, 86, 'triangle', 521) },
  { id: 'tangle_01', name: 'The Tangle', brief: 'The Tangle, a deeper thicket of dead ends west of Gloamwood. More claustrophobic than Gloamwood: closer harmonies, a repeating circular figure (as if walking in circles), sparse percussion.', file: 'music/duskmarch/tangle_01.ogg', gain: 0.114, category: 'location', region: 'duskmarch', place: 'tangle', gen: g(55, PHR, 80, 'triangle', 523) },
  { id: 'mournfield_01', name: 'Mournfield', brief: 'Mournfield, the valley\'s old graveyard, by day. Mournful and still, respectful: solo cello or violin, soft organ or harmonium, a distant bell.', file: 'music/duskmarch/mournfield_01.ogg', gain: 0.125, category: 'location', region: 'duskmarch', place: 'mournfield', gen: g(53, MIN, 66, 'sine', 541) },
  { id: 'mournfield_night_01', name: 'When the Dead Walk', brief: 'Mournfield after dark, when the dead rise. The day theme\'s mood turned eerie: tremolo strings, low choir pads, a slow uneven pulse. Unsettling, but leave room for combat music to take over in fights.', file: 'music/duskmarch/mournfield_night_01.ogg', gain: 0.122, category: 'location', region: 'duskmarch', place: 'mournfield', time: 'night', gen: g(50, PHR, 72, 'sine', 547) },
  // The shrine and the chapel crypt.
  { id: 'sacred_01', name: 'Old Stones', brief: 'The shrine and the chapel crypt: old stones, reverence and mystery. Choir pads or organ, a single bell, very slow; ancient-sounding modes.', file: 'music/sacred/sacred_01.ogg', gain: 0.118, category: 'location', region: 'sacred', gen: g(50, PHR, 64, 'sine', 503) },
  // v343: across the sea (Rook's boat): the island, the dig site and the Smoke Peak.
  { id: 'island_01', name: 'Warm Water', brief: 'The island across the sea (Rook\'s boat): sunny, far from home, a holiday. Marimba, steel drum, nylon guitar, light shakers; lydian brightness.', file: 'music/island/island_01.ogg', gain: 0.122, category: 'location', region: 'island', gen: g(65, LYD, 104, 'triangle', 557) },
  { id: 'digsite_01', name: 'Bones in the Sand', brief: 'The island\'s dig site: bones and old secrets in the sand. Curious and adventurous: plucked strings, hand drums, a playful woodwind; a touch of mystery.', file: 'music/island/digsite_01.ogg', gain: 0.121, category: 'location', region: 'island', place: 'digsite', gen: g(62, DOR, 94, 'triangle', 563) },
  { id: 'peak_climb_01', name: 'The Smoke Peak', brief: 'The Smoke Peak, floors 1 to 9: the island\'s volcano dungeon. Tropical heat turned dangerous: tribal-style drums, low brass or synth, smoky drones.', file: 'music/island/peak_climb_01.ogg', gain: 0.117, category: 'location', region: 'island', place: 'peak', floors: PEAK_DEPTHS.climb, gen: g(52, BLU, 100, 'square', 569) },
  { id: 'peak_summit_01', name: 'Above the Smoke', brief: 'The Smoke Peak\'s summit on floor 10: the climb is over, the cache is found, the view opens. Open, triumphant but calm: strings and marimba, a soaring melody.', file: 'music/island/peak_summit_01.ogg', gain: 0.125, category: 'location', region: 'island', place: 'peak', floors: PEAK_DEPTHS.summit, gen: g(64, LYD, 80, 'sine', 577) },
  // The Dunes, and its two rooms: the casino and the Oasis shop (each its own).
  { id: 'desert_01', name: 'Heat Shimmer', brief: 'The Dunes: heat haze, wind, endless sand. Hand drums, drones, a reed instrument (duduk-like) or bowed lead; slow, hypnotic.', file: 'music/desert/desert_01.ogg', gain: 0.115, category: 'location', region: 'desert', gen: g(62, PHR, 96, 'triangle', 509) },
  { id: 'casino_01', name: 'The Gilded Dune', brief: 'The Gilded Dune casino: a little glamorous, a little shady. Lounge jazz with a desert tint: brushed drums, upright bass, vibraphone or muted trumpet.', file: 'music/desert/casino_01.ogg', gain: 0.12, category: 'location', region: 'desert', place: 'inside_casino', gen: g(60, BLU, 112, 'square', 571) },
  { id: 'oasis_01', name: 'Shade and Seeds', brief: 'The Oasis shop in the desert: cool shade and rare seeds after the heat. Gentle and refreshing: harp or kalimba, soft hand percussion, a light flute; a breath of relief.', file: 'music/desert/oasis_01.ogg', gain: 0.116, category: 'location', region: 'desert', place: 'inside_oasis', gen: g(65, HEX, 92, 'triangle', 587) },
  // The season alone and the default, for anywhere without its own music.
  { id: 'default_01', name: 'Hollowmere', brief: 'The fallback for anywhere without its own music (rare). A neutral, gentle Hollowmere theme: guitar and flute, works in any season or place.', file: 'music/default/default_01.ogg', gain: 0.115, category: 'default', gen: g(64, MAJ, 96, 'triangle', 601) },
  // Festivals and events (they override everything but cutscenes).
  { id: 'festival_01', name: 'Bunting and Lanterns', brief: 'Any festival without its own track: bunting, lanterns, crowds. Festive folk band: fiddle, accordion, drums; cheerful and busy.', file: 'music/festivals/festival_01.ogg', gain: 0.12, category: 'event', gen: MOODS.festival },
  { id: 'festival_spring_01', name: 'Spring Fair', brief: 'Spring festivals (Egg Hunt, Ribbon Dance): playful and light. Flutes, pizzicato, tambourine; a dance tune.', file: 'music/festivals/festival_spring_01.ogg', gain: 0.118, category: 'event', season: 'Spring', gen: g(67, MAJ, 128, 'square', 701) },
  { id: 'festival_summer_01', name: 'Midsummer', brief: 'Summer festivals (Summer Potluck): sunny, bustling, celebratory. Brass or fiddle lead, guitars, lively percussion.', file: 'music/festivals/festival_summer_01.ogg', gain: 0.122, category: 'event', season: 'Summer', gen: g(69, LYD, 132, 'square', 709) },
  { id: 'festival_autumn_01', name: 'Maze Night', brief: 'Autumn festivals (Maze Night, 10 pm in the hedge maze): mischievous and spooky-fun, never truly scary. Pizzicato, bassoon, xylophone, a swinging 6/8.', file: 'music/festivals/festival_autumn_01.ogg', gain: 0.114, category: 'event', season: 'Autumn', gen: g(62, DOR, 112, 'triangle', 719) },
  { id: 'festival_winter_01', name: 'Frostlight', brief: 'Winter festivals (Frostlight Market, Longnight Feast): lanterns in the snow, warm cider. Bells, celesta, soft choir pads, strings; magical and cosy.', file: 'music/festivals/festival_winter_01.ogg', gain: 0.123, category: 'event', season: 'Winter', gen: g(64, HEX, 100, 'sine', 727) },
  { id: 'festival_harvest_01', name: 'Harvest Home', brief: 'The Grange Fair and the Harvest Weigh-in: proud, generous, the year\'s work shown off. Big folk band: fiddle, banjo, accordion, drums; a stomping anthem.', file: 'music/festivals/festival_harvest_01.ogg', gain: 0.107, category: 'event', festival: ['grangefair', 'weighin'], priority: 1, gen: g(65, MAJ, 120, 'triangle', 733) },
  { id: 'competition_01', name: 'The Judges Walk', brief: 'Judged contests (Blossom Show, Midsummer Catch): a little tension while the judges walk the rows. Light suspense with a playful edge: pizzicato, ticking percussion, a rising figure that resolves warmly.', file: 'music/festivals/competition_01.ogg', gain: 0.119, category: 'event', festival: ['blossom', 'catch'], priority: 1, gen: g(67, BLU, 124, 'square', 739) },
  // Cutscenes and story (they override everything).
  { id: 'story_01', name: 'A Letter at Winter\'s End', brief: 'Story scenes and the opening, the letter that brings you to Hollowmere. Emotional and intimate: solo piano, then strings. Through-composed is fine; it loops if a scene runs long.', file: 'music/story/story_01.ogg', gain: 0.121, category: 'cutscene', gen: g(60, LYD, 76, 'sine', 801) },
  { id: 'celebration_01', name: 'The Whole Valley Gathers', brief: 'The wedding: the whole valley gathers. Joyful and moving: strings, piano, bells, a warm melody that swells.', file: 'music/story/celebration_01.ogg', gain: 0.118, category: 'cutscene', cutscene: ['wedding'], priority: 1, gen: g(65, HEX, 112, 'triangle', 809) },
  // Gameplay.
  { id: 'combat_01', name: 'Teeth in the Dark', brief: 'Fighting monsters anywhere. Tense and driving but not overwhelming (fights are short and frequent): bass ostinato, punchy drums, short synth or brass stabs. Starts strong, no long intro.', file: 'music/combat/combat_01.ogg', gain: 0.121, category: 'combat', gen: g(52, BLU, 140, 'square', 901) },
  { id: 'combat_02', name: 'Hold the Line', brief: 'A second fight track to rotate with Teeth in the Dark. Different colour: faster, more percussive, strings ostinato.', file: 'music/combat/combat_02.ogg', gain: 0.119, category: 'combat', gen: g(50, PHR, 146, 'square', 907) },
  { id: 'boss_01', name: 'The Golden One', brief: 'Elite and boss monsters. The biggest, most dramatic piece: full drums, brass or heavy synths, a strong motif.', file: 'music/combat/boss_01.ogg', gain: 0.101, category: 'boss', gen: g(48, PHR, 152, 'square', 911) },
  { id: 'fishing_01', name: 'Something on the Line', brief: 'Reeling in a fish (the minigame). Quick, bouncy, playful tension: pizzicato or banjo, a running bassline, light percussion. Short loop (30 to 60 s) since reels are brief.', file: 'music/fishing/fishing_01.ogg', gain: 0.113, category: 'fishing', gen: g(67, MAJ, 132, 'triangle', 919) },
  // Screens.
  { id: 'menu_01', name: 'Hollowmere Farm', brief: 'The main menu: the game\'s identity. A gentle, memorable main theme others can quote; guitar and piano, strings swelling a little. Loops while you choose a farm.', file: 'music/menu/menu_01.ogg', gain: 0.119, category: 'menu', gen: g(64, LYD, 88, 'triangle', 1001) },
  { id: 'credits_01', name: 'Thank You for Playing', brief: 'The end credits (not shown yet): a warm farewell. A fuller arrangement of the main theme; reflective and grateful.', file: 'music/menu/credits_01.ogg', gain: 0.119, category: 'credits', gen: g(62, MAJ, 84, 'sine', 1009) },
  // Stingers: short, played once over a ducked background, then the background returns.
  { id: 'sting_gameover', name: 'Carried Home', brief: 'Played once when you faint and are carried home. 3 to 5 seconds, soft and sympathetic (not a harsh fail sound): a falling piano phrase ending on a quiet chord.', file: 'music/stingers/sting_gameover.ogg', gain: 0.124, category: 'sting:gameover', loop: false, gen: g(57, MIN, 70, 'sine', 1101), bars: 1 },
  { id: 'sting_victory', name: 'Victory', brief: 'Played once over the music when you defeat an elite. 2 to 4 seconds, bright and triumphant: brass or bells, ending on the home note.', file: 'music/stingers/sting_victory.ogg', gain: 0.124, category: 'sting:victory', loop: false, gen: g(67, MAJ, 120, 'square', 1109), bars: 1 },
  { id: 'sting_discovery', name: 'A New Place', brief: 'Played once when you find a new place. 2 to 4 seconds, wonder and curiosity: harp or celesta rising to a shimmering chord.', file: 'music/stingers/sting_discovery.ogg', gain: 0.105, category: 'sting:discovery', loop: false, gen: g(69, LYD, 100, 'triangle', 1117), bars: 1 },
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

// v343: places and regions. A place is where you are: the map, except on the Hollow's map, whose zone (systems/mine.js
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
  sacred: ['shrine', 'crypt', 'barrow'],
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
