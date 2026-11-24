// v317 (roadmap 109), reorganized in v342 (roadmap 119): every sound the game plays except music, as files under
// assets/audio/ (see its README for the folders and naming rules). Music is in data/musicTracks.js.
//
// Each entry, by the id the code plays it by:
//   files  one or more files under assets/audio/. Several make a pool: each play draws one at random, never the same
//          one twice in a row, so record footstep_grass_02.wav, add it here, and steps stop sounding mechanical.
//   gain   how loud the files play, 0 to 1. The shipped files are normalized (their loudest moment at 90%) and gain
//          restores the level the game was mixed at, so a replacement mastered to a normal level fits at the same gain.
//   loop   plays until stopped (ambient beds; the file's end must join its start).
//   vary   each play's pitch and speed shift by up to this share either way.
//   about  what it plays for, in a few words
//   brief  what to record or design: the moment, character, length, how often it plays and how many variants
//          (the README's sections are written from about and brief: node tools/audio_list.mjs --readme)
//   bus    the volume group it plays in (VOLUME_GROUPS), when not the usual one for its kind.
// The files were recorded from the game's own sound generators (tools/render_audio.mjs); while a file is missing or
// fails to load, the game plays that generator instead (audio/sfx.js, ambience.js, footsteps.js), so it never goes silent.
export const AUDIO_DIR = 'assets/audio/';

// The mixer's volume groups (audio/mixer.js), each a bus under the master: one slider each in the Sound menu.
export const VOLUME_GROUPS = ['music', 'ambience', 'sfx', 'ui'];

// An entry's files (older entries had one `file`).
export const filesOf = (e) => (e ? e.files || (e.file ? [e.file] : []) : []);

// Sound effects, by the name systems emit ('sfx', name).
export const SFX_FILES = {
  rustle:      { files: ['sfx/farming/weeds_cut_rustle_01.wav'], about: 'thick weeds cut with the weapon', brief: 'Cutting thick weeds with a weapon. A quick leafy swish and snap, 0.15 to 0.3 s. Heard in bursts while clearing, so keep it light; 2 or 3 variants help.', gain: 0.213 },
  hoe: {
    files: [
      'sfx/tools/hoe_till_soil_01.wav',
      'sfx/tools/hoe_till_soil_02.wav',
      'sfx/tools/hoe_till_soil_03.wav',
    ],
    about: 'the hoe tilling soil',
    brief: 'The hoe biting into soil. A soft dull thunk with a little crumble of earth, 0.15 to 0.25 s. One of the most repeated sounds in the game (dozens a day): short, low, never harsh. Record 3 variants.',
    gain: 0.0748,
  },
  can: {
    files: [
      'sfx/tools/watering_can_pour_01.wav',
      'sfx/tools/watering_can_pour_02.wav',
      'sfx/tools/watering_can_pour_03.wav',
    ],
    about: 'the watering can pouring',
    brief: 'Watering a tile. A short gentle pour, water onto soil, 0.3 to 0.5 s. Very frequent: soft, no splash peak. 2 or 3 variants.',
    gain: 0.192,
  },
  seed:        { files: ['sfx/farming/seed_plant_01.wav'], about: 'a seed planted', brief: 'A seed pressed into the soil. A tiny soft pop or tap, under 0.1 s. Frequent and small; it should feel satisfying, not loud.', gain: 0.0809 },
  axe: {
    files: [
      'sfx/tools/axe_chop_wood_01.wav',
      'sfx/tools/axe_chop_wood_02.wav',
      'sfx/tools/axe_chop_wood_03.wav',
    ],
    about: 'the axe chopping',
    brief: 'The axe hitting wood (trees, stumps, twigs). A solid woody chock with a short resonance, 0.15 to 0.3 s. 3 variants; the last hit that fells a tree is the same sound.',
    gain: 0.0692,
  },
  pick: {
    files: [
      'sfx/tools/pickaxe_strike_rock_01.wav',
      'sfx/tools/pickaxe_strike_rock_02.wav',
      'sfx/tools/pickaxe_strike_rock_03.wav',
    ],
    about: 'the pickaxe striking rock',
    brief: 'The pickaxe striking stone or ore. A bright clink with a gritty crunch, 0.1 to 0.25 s. Heard hundreds of times in the mines: crisp but not piercing. 3 variants.',
    gain: 0.133,
  },
  sword:       { files: ['sfx/combat/sword_swing_01.wav'], about: 'a sword swing', brief: 'A sword swing through the air. A clean whoosh, 0.15 to 0.25 s, mid-pitched. Played on every swing, hit or miss.', gain: 0.0407 },
  swingDagger: { files: ['sfx/combat/dagger_swing_01.wav'], about: 'a dagger swing', brief: 'A dagger\'s quick stab or slash. A short, high, thin whip, under 0.15 s: faster and lighter than the sword.', gain: 0.0639 },
  swingClub:   { files: ['sfx/combat/club_swing_01.wav'], about: 'a club or hammer swing', brief: 'A club or hammer swing. A heavy, low, slow whoosh, 0.25 to 0.35 s, with weight at the end.', gain: 0.0505 },
  hit:         { files: ['sfx/combat/weapon_hit_01.wav'], about: 'a blow landing on a creature', brief: 'A blow landing on a creature. A short punchy thud with a soft squelch or crack, under 0.12 s. Plays with every hit, so tight and dry.', gain: 0.0686 },
  crit:        { files: ['sfx/combat/weapon_hit_critical_01.wav'], about: 'a critical hit', brief: 'A critical hit. The normal hit plus a bright metallic ring or sparkle on top, 0.15 to 0.25 s. Must stand out from a normal hit at once.', gain: 0.132 },
  slay:        { files: ['sfx/combat/monster_defeated_01.wav'], about: 'a creature defeated', brief: 'A creature defeated. A soft poof or deflate with a small rising two-note chime, 0.2 to 0.4 s. Rewarding, never gory.', gain: 0.0779 },
  slam:        { files: ['sfx/combat/ground_slam_01.wav'], about: 'a weapon special slamming the ground', brief: 'A weapon special slamming the ground. A deep boom with rocks and dust, 0.3 to 0.5 s, strong low end.', gain: 0.158 },
  heartbeat:   { files: ['sfx/combat/low_health_heartbeat_01.wav'], about: 'low health in a fight', brief: 'Low health in a fight. Two soft low heartbeat thumps (lub-dub), about 0.3 s, repeated by the game. Felt more than heard; no high frequencies.', gain: 0.151 },
  pickup:      { files: ['sfx/items/item_pickup_01.wav'], about: 'picking something up', brief: 'Picking anything up. A light, happy two-note blip or soft pluck, about 0.15 s. Extremely frequent: pleasant and quick, the game\'s most \'feel-good\' tiny sound.', gain: 0.123 },
  bite:        { files: ['sfx/fishing/fish_bite_alert_01.wav'], about: 'a fish biting', brief: 'A fish biting: the reel starts now. A sharp alert, two quick plucks or a bobber plunk with a ping, about 0.2 s. Must cut through music and ambience.', gain: 0.127 },
  catch:       { files: ['sfx/fishing/fish_caught_01.wav'], about: 'a fish caught', brief: 'A fish caught. A short rising fanfare, 0.4 to 0.6 s, bright plucked or bell tones. Celebratory but small.', gain: 0.129 },
  miss:        { files: ['sfx/fishing/fish_escaped_01.wav'], about: 'a fish getting away', brief: 'A fish getting away. A soft falling slide or \'aww\' plunk, 0.3 to 0.4 s. Disappointed, not punishing.', gain: 0.128 },
  hurt:        { files: ['sfx/combat/player_hurt_01.wav'], about: 'the farmer hurt', brief: 'The farmer taking damage. A short low grunt-like tone or impact with a slight down-bend, 0.15 to 0.25 s. No real voice recording (the farmer has no voice).', gain: 0.1 },
  coin:        { files: ['sfx/items/coins_earned_01.wav'], about: 'gold earned', brief: 'Gold earned (selling, rewards). Two bright coin chings, about 0.2 s. Classic and clean.', gain: 0.0763 },
  levelup:     { files: ['sfx/jingles/skill_level_up_01.wav'], about: 'a skill levelling up', brief: 'A skill levelling up. A rising arpeggio jingle, 0.5 to 0.8 s, bells or plucked strings, ending on the home note. A proud moment.', gain: 0.0766 },
  pet:         { files: ['sfx/animals/animal_pet_01.wav'], about: 'petting an animal', brief: 'Petting an animal. A soft affectionate chirp or rising coo, about 0.15 s. Warm, never squeaky.', gain: 0.131 },
  place:       { files: ['sfx/items/object_place_01.wav'], about: 'setting an object down', brief: 'Setting an object, furniture or a building piece down. A soft wooden thud, about 0.1 s.', gain: 0.0244 },
  door:        { files: ['sfx/world/door_map_change_01.wav'], about: 'going through a door or onto another map', brief: 'Going through a door or onto another map. A short swing-and-latch or soft whoosh, 0.3 to 0.4 s. Very frequent: quiet and neutral.', gain: 0.0242 },
  boom:        { files: ['sfx/combat/bomb_explosion_01.wav'], about: 'a bomb', brief: 'A bomb exploding. A deep explosion with rubble, 0.6 to 1 s, strong low end but not painful.', gain: 0.12 },
  thunder:     { files: ['sfx/world/thunder_rumble_01.wav'], about: 'thunder in a storm', brief: 'Thunder with the lightning in a storm. A distant crack then a long rolling rumble, 2 to 3 s. Played over the rain loop; vary the distance across 2 or 3 variants.', gain: 0.113 },
  flap:        { files: ['sfx/animals/bird_take_off_01.wav'], about: 'a bird taking off', brief: 'A bird taking off when you walk near. A quick flutter of wings, 0.15 to 0.25 s.', gain: 0.0207 },
  ui:          { files: ['sfx/ui/menu_click_01.wav'], about: 'menu buttons', brief: 'Menu buttons and clicks. A tiny soft tick or wooden tap, under 0.05 s. Heard constantly in menus: almost subliminal (it plays at the Interface volume).', bus: 'ui', gain: 0.0493 },
  chime:       { files: ['sfx/jingles/wishing_stone_chime_01.wav'], about: 'blessings, guide steps and tips', brief: 'Blessings at the wishing stone, guide steps and tips. Two gentle bell or chime tones, about 0.6 s, a little magical.', gain: 0.059 },
  splash:      { files: ['sfx/world/lantern_water_splash_01.wav'], about: 'a lantern set on the water', brief: 'A lantern set on the water. A soft small splash with a ripple, about 0.3 s.', gain: 0.0512 },
  morning:     { files: ['sfx/jingles/morning_wake_01.wav'], about: 'waking up to the morning report', brief: 'Waking up to the morning report. A short bright 3-note morning jingle, 0.4 to 0.6 s, like a music-box or glockenspiel. Heard every in-game day: friendly, not alarm-like.', gain: 0.0684 },
};

// Ambient beds: loops under the scene, faded by audio/ambience.js to the levels data/ambience.js sets. Weather and
// places are in ambience/; sounds of a thing in the world you walk up to (the waterfall, a hearth) in environment/.
export const BED_FILES = {
  rain:  { files: ['ambience/weather/rain_loop_01.wav'], about: 'rain outdoors (and muffled indoors)', brief: 'Steady rain outdoors, 10 to 30 s seamless loop. Even texture with no single drops or thunder standing out (a pattern you can hear repeat gets annoying fast). Plays at 70% in rain, 100% in storms, 25% (muffled) indoors.', gain: 0.0721, loop: true },
  wind:  { files: ['ambience/weather/wind_loop_01.wav'], about: 'wind on windy maps, in winter, in rain and storms, and softly at night', brief: 'Wind outdoors: on the desert and quarry, in winter, in rain and storms, softly at night. 15 to 30 s seamless loop, gentle and broad, slowly rising and falling; no sharp gusts (those are a separate call).', gain: 0.0294, loop: true },
  falls: { files: ['environment/waterfall_loop_01.wav'], about: 'near a waterfall', brief: 'A waterfall, heard as you walk near (louder the closer). 10 to 20 s seamless loop of falling water, full and steady.', gain: 0.043, loop: true },
  surf:  { files: ['ambience/water/sea_surf_loop_01.wav'], about: 'on the beach', brief: 'Waves on the beach, 15 to 30 s seamless loop of gentle surf. The game also swells it slowly, so keep it even.', gain: 0.0337, loop: true },
  hum:   { files: ['ambience/underground/cave_hum_loop_01.wav'], about: 'inside caves', brief: 'The air inside caves and the Hollow: a very low, soft hum or room tone, 10 to 20 s seamless loop. Felt rather than heard, under the music.', gain: 0.0149, loop: true },
  fire:  { files: ['environment/hearth_fire_loop_01.wav'], about: 'near a hearth or stove', brief: 'A hearth or stove indoors, heard as you get near. 10 to 20 s seamless loop of a soft fire breath and low roar; the crackles are a separate call.', gain: 0.0204, loop: true },
};

// Ambient calls: one-off sounds at random moments, by the rules in data/ambience.js.
export const CALL_FILES = {
  bird: {
    files: [
      'ambience/nature/bird_chirp_01.wav',
      'ambience/nature/bird_chirp_02.wav',
      'ambience/nature/bird_chirp_03.wav',
      'ambience/nature/bird_chirp_04.wav',
    ],
    about: 'birdsong by day',
    brief: 'Birdsong by day in the wild and in town (not in winter or rain). One short phrase of 2 to 4 chirps, 0.3 to 0.8 s. Record 4 different calls, as if from different birds, to make the world feel alive; the game varies the pitch too.',
    gain: 0.0328, vary: 0.25,
  },
  cricket: { files: ['ambience/nature/cricket_chirp_01.wav'], about: 'crickets at night', brief: 'Crickets on dry nights out of winter. One short chirp burst, under 0.2 s, played often; keep it soft and high.', gain: 0.0092, vary: 0.05 },
  gull:    { files: ['ambience/water/gull_cry_01.wav'], about: 'gulls at the shore', brief: 'Gulls at the shore by day. One or two gull cries, 0.5 to 0.8 s, from a little distance.', gain: 0.0317, vary: 0.1 },
  drip: {
    files: [
      'ambience/underground/cave_drip_01.wav',
      'ambience/underground/cave_drip_02.wav',
      'ambience/underground/cave_drip_03.wav',
    ],
    about: 'water dripping in caves',
    brief: 'Water dripping in caves. A single drop into a pool with a small echo, 0.1 to 0.3 s. 3 variants.',
    gain: 0.0432, vary: 0.15,
  },
  bell:    { files: ['ambience/town/town_bell_distant_01.wav'], about: 'a far bell in town', brief: 'A far bell in town by day, rare. One distant church-like bell strike with a long tail, 1 to 2 s, very soft.', gain: 0.0221 },
  gust:    { files: ['ambience/weather/wind_gust_01.wav'], about: 'gusts on windy maps', brief: 'A gust on windy maps (the Dunes, the quarry). A swelling whoosh that fades, 1.5 to 2 s, over the wind loop.', gain: 0.014, vary: 0.1 },
  tap: {
    files: [
      'ambience/weather/rain_on_glass_01.wav',
      'ambience/weather/rain_on_glass_02.wav',
      'ambience/weather/rain_on_glass_03.wav',
    ],
    about: 'rain tapping on a window',
    brief: 'Rain tapping on a window, indoors while it rains outside. One tiny tick of a drop on glass, under 0.05 s, played very often. 3 variants.',
    gain: 0.013, vary: 0.3,
  },
  owl:     { files: ['ambience/nature/owl_hoot_01.wav'], about: 'an owl at night in the wild', brief: 'An owl at night in the wild, rare. A soft two-note hoot, about 1 s, from a distance.', gain: 0.0331, vary: 0.06 },   // v342: night in the wild
  crackle: {
    files: [
      'environment/fire_crackle_01.wav',
      'environment/fire_crackle_02.wav',
      'environment/fire_crackle_03.wav',
    ],
    about: 'a fire crackling',
    brief: 'A fire crackling near a hearth or stove. One to three small pops and snaps, under 0.3 s, played often. 3 variants.',
    gain: 0.0584, vary: 0.2,
  },
};

// Footsteps by what is underfoot (audio/footsteps.js surfaceAt), and hooves on horseback. v342: in the effects group,
// four takes of each so no two steps in a row sound alike.
export const STEP_FILES = {
  grass: {
    files: [
      'sfx/footsteps/footstep_grass_01.wav',
      'sfx/footsteps/footstep_grass_02.wav',
      'sfx/footsteps/footstep_grass_03.wav',
      'sfx/footsteps/footstep_grass_04.wav',
    ],
    about: 'walking on grass',
    brief: 'Walking on grass (the default outdoors). A soft brushy step, under 0.1 s. About 4 steps a second, so it must be very subtle. Record 4 variants.',
    gain: 0.0217, vary: 0.15,
  },
  path:  {
    files: [
      'sfx/footsteps/footstep_dirt_path_01.wav',
      'sfx/footsteps/footstep_dirt_path_02.wav',
      'sfx/footsteps/footstep_dirt_path_03.wav',
      'sfx/footsteps/footstep_dirt_path_04.wav',
    ],
    about: 'walking on dirt paths',
    brief: 'Walking on dirt paths and roads. A soft gritty crunch, under 0.1 s, a bit firmer than grass. 4 variants.',
    gain: 0.0272, vary: 0.15,
  },
  sand:  {
    files: [
      'sfx/footsteps/footstep_sand_01.wav',
      'sfx/footsteps/footstep_sand_02.wav',
      'sfx/footsteps/footstep_sand_03.wav',
      'sfx/footsteps/footstep_sand_04.wav',
    ],
    about: 'walking on sand',
    brief: 'Walking on sand (the beach, the Dunes, the island). A soft shifting hiss, under 0.12 s. 4 variants.',
    gain: 0.0365, vary: 0.15,
  },
  stone: {
    files: [
      'sfx/footsteps/footstep_stone_01.wav',
      'sfx/footsteps/footstep_stone_02.wav',
      'sfx/footsteps/footstep_stone_03.wav',
      'sfx/footsteps/footstep_stone_04.wav',
    ],
    about: 'walking on stone',
    brief: 'Walking on stone (the quarry, caves, the Hollow, stone paths). A hard dry tap, under 0.08 s, slightly echoey underground. 4 variants.',
    gain: 0.021, vary: 0.15,
  },
  wood:  {
    files: [
      'sfx/footsteps/footstep_wood_01.wav',
      'sfx/footsteps/footstep_wood_02.wav',
      'sfx/footsteps/footstep_wood_03.wav',
      'sfx/footsteps/footstep_wood_04.wav',
    ],
    about: 'walking on wooden floors and the pier',
    brief: 'Walking on wooden floors indoors, the pier and wood paths. A hollow wooden knock, under 0.1 s. 4 variants.',
    gain: 0.0187, vary: 0.15,
  },
  snow:  {
    files: [
      'sfx/footsteps/footstep_snow_01.wav',
      'sfx/footsteps/footstep_snow_02.wav',
      'sfx/footsteps/footstep_snow_03.wav',
      'sfx/footsteps/footstep_snow_04.wav',
    ],
    about: 'walking on snow',
    brief: 'Walking on snow outdoors in winter. A soft compressing crunch, under 0.15 s. 4 variants.',
    gain: 0.0332, vary: 0.15,
  },
  wet:   {
    files: [
      'sfx/footsteps/footstep_wet_ground_01.wav',
      'sfx/footsteps/footstep_wet_ground_02.wav',
      'sfx/footsteps/footstep_wet_ground_03.wav',
      'sfx/footsteps/footstep_wet_ground_04.wav',
    ],
    about: 'walking on wet ground in rain',
    brief: 'Walking on wet ground outdoors in rain. A soft squelchy splash, under 0.12 s. 4 variants.',
    gain: 0.0183, vary: 0.15,
  },
  hoof:  {
    files: [
      'sfx/footsteps/horse_hoof_01.wav',
      'sfx/footsteps/horse_hoof_02.wav',
      'sfx/footsteps/horse_hoof_03.wav',
      'sfx/footsteps/horse_hoof_04.wav',
    ],
    about: 'riding the horse',
    brief: 'Riding the horse. One hoofbeat clop on earth, under 0.1 s, played about 3 times a second. 4 variants.',
    gain: 0.0193, vary: 0.15,
  },
};

export const ALL_AUDIO = { sfx: SFX_FILES, ambience: BED_FILES, calls: CALL_FILES, footsteps: STEP_FILES };
