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
//   about  what it plays for (the README's tables are written from this: node tools/audio_list.mjs --readme)
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
  rustle:      { files: ['sfx/farming/weeds_cut_rustle_01.wav'], about: 'thick weeds cut with the weapon', gain: 0.213 },
  hoe:         { files: ['sfx/tools/hoe_till_soil_01.wav'], about: 'the hoe tilling soil', gain: 0.0748 },
  can:         { files: ['sfx/tools/watering_can_pour_01.wav'], about: 'the watering can pouring', gain: 0.192 },
  seed:        { files: ['sfx/farming/seed_plant_01.wav'], about: 'a seed planted', gain: 0.0809 },
  axe:         { files: ['sfx/tools/axe_chop_wood_01.wav'], about: 'the axe chopping', gain: 0.0692 },
  pick:        { files: ['sfx/tools/pickaxe_strike_rock_01.wav'], about: 'the pickaxe striking rock', gain: 0.133 },
  sword:       { files: ['sfx/combat/sword_swing_01.wav'], about: 'a sword swing', gain: 0.0407 },
  swingDagger: { files: ['sfx/combat/dagger_swing_01.wav'], about: 'a dagger swing', gain: 0.0639 },
  swingClub:   { files: ['sfx/combat/club_swing_01.wav'], about: 'a club or hammer swing', gain: 0.0505 },
  hit:         { files: ['sfx/combat/weapon_hit_01.wav'], about: 'a blow landing on a creature', gain: 0.0686 },
  crit:        { files: ['sfx/combat/weapon_hit_critical_01.wav'], about: 'a critical hit', gain: 0.132 },
  slay:        { files: ['sfx/combat/monster_defeated_01.wav'], about: 'a creature defeated', gain: 0.0779 },
  slam:        { files: ['sfx/combat/ground_slam_01.wav'], about: 'a weapon special slamming the ground', gain: 0.158 },
  heartbeat:   { files: ['sfx/combat/low_health_heartbeat_01.wav'], about: 'low health in a fight', gain: 0.151 },
  pickup:      { files: ['sfx/items/item_pickup_01.wav'], about: 'picking something up', gain: 0.123 },
  bite:        { files: ['sfx/fishing/fish_bite_alert_01.wav'], about: 'a fish biting', gain: 0.127 },
  catch:       { files: ['sfx/fishing/fish_caught_01.wav'], about: 'a fish caught', gain: 0.129 },
  miss:        { files: ['sfx/fishing/fish_escaped_01.wav'], about: 'a fish getting away', gain: 0.128 },
  hurt:        { files: ['sfx/combat/player_hurt_01.wav'], about: 'the farmer hurt', gain: 0.1 },
  coin:        { files: ['sfx/items/coins_earned_01.wav'], about: 'gold earned', gain: 0.0763 },
  levelup:     { files: ['sfx/jingles/skill_level_up_01.wav'], about: 'a skill levelling up', gain: 0.0766 },
  pet:         { files: ['sfx/animals/animal_pet_01.wav'], about: 'petting an animal', gain: 0.131 },
  place:       { files: ['sfx/items/object_place_01.wav'], about: 'setting an object down', gain: 0.0244 },
  door:        { files: ['sfx/world/door_map_change_01.wav'], about: 'going through a door or onto another map', gain: 0.0242 },
  boom:        { files: ['sfx/combat/bomb_explosion_01.wav'], about: 'a bomb', gain: 0.12 },
  thunder:     { files: ['sfx/world/thunder_rumble_01.wav'], about: 'thunder in a storm', gain: 0.113 },
  flap:        { files: ['sfx/animals/bird_take_off_01.wav'], about: 'a bird taking off', gain: 0.0207 },
  ui:          { files: ['sfx/ui/menu_click_01.wav'], about: 'menu buttons', bus: 'ui', gain: 0.0493 },
  chime:       { files: ['sfx/jingles/wishing_stone_chime_01.wav'], about: 'blessings, guide steps and tips', gain: 0.059 },
  splash:      { files: ['sfx/world/lantern_water_splash_01.wav'], about: 'a lantern set on the water', gain: 0.0512 },
  morning:     { files: ['sfx/jingles/morning_wake_01.wav'], about: 'waking up to the morning report', gain: 0.0684 },
};

// Ambient beds: loops under the scene, faded by audio/ambience.js to the levels data/ambience.js sets. Weather and
// places are in ambience/; sounds of a thing in the world you walk up to (the waterfall, a hearth) in environment/.
export const BED_FILES = {
  rain:  { files: ['ambience/weather/rain_loop_01.wav'], about: 'rain outdoors (and muffled indoors)', gain: 0.0721, loop: true },
  wind:  { files: ['ambience/weather/wind_loop_01.wav'], about: 'wind on windy maps, in winter, in rain and storms, and softly at night', gain: 0.0294, loop: true },
  falls: { files: ['environment/waterfall_loop_01.wav'], about: 'near a waterfall', gain: 0.043, loop: true },
  surf:  { files: ['ambience/water/sea_surf_loop_01.wav'], about: 'on the beach', gain: 0.0337, loop: true },
  hum:   { files: ['ambience/underground/cave_hum_loop_01.wav'], about: 'inside caves', gain: 0.0149, loop: true },
  fire:  { files: ['environment/hearth_fire_loop_01.wav'], about: 'near a hearth or stove', gain: 0.0204, loop: true },
};

// Ambient calls: one-off sounds at random moments, by the rules in data/ambience.js.
export const CALL_FILES = {
  bird:    { files: ['ambience/nature/bird_chirp_01.wav'], about: 'birdsong by day', gain: 0.0328, vary: 0.25 },
  cricket: { files: ['ambience/nature/cricket_chirp_01.wav'], about: 'crickets at night', gain: 0.0092, vary: 0.05 },
  gull:    { files: ['ambience/water/gull_cry_01.wav'], about: 'gulls at the shore', gain: 0.0317, vary: 0.1 },
  drip:    { files: ['ambience/underground/cave_drip_01.wav'], about: 'water dripping in caves', gain: 0.0432, vary: 0.15 },
  bell:    { files: ['ambience/town/town_bell_distant_01.wav'], about: 'a far bell in town', gain: 0.0221 },
  gust:    { files: ['ambience/weather/wind_gust_01.wav'], about: 'gusts on windy maps', gain: 0.014, vary: 0.1 },
  tap:     { files: ['ambience/weather/rain_on_glass_01.wav'], about: 'rain tapping on a window', gain: 0.013, vary: 0.3 },
  owl:     { files: ['ambience/nature/owl_hoot_01.wav'], about: 'an owl at night in the wild', gain: 0.0331, vary: 0.06 },   // v342: night in the wild
  crackle: { files: ['environment/fire_crackle_01.wav'], about: 'a fire crackling', gain: 0.0584, vary: 0.2 },
};

// Footsteps by what is underfoot (audio/footsteps.js surfaceAt), and hooves on horseback. v342: in the effects group.
export const STEP_FILES = {
  grass: { files: ['sfx/footsteps/footstep_grass_01.wav'], about: 'walking on grass', gain: 0.0217, vary: 0.15 },
  path:  { files: ['sfx/footsteps/footstep_dirt_path_01.wav'], about: 'walking on dirt paths', gain: 0.0272, vary: 0.15 },
  sand:  { files: ['sfx/footsteps/footstep_sand_01.wav'], about: 'walking on sand', gain: 0.0365, vary: 0.15 },
  stone: { files: ['sfx/footsteps/footstep_stone_01.wav'], about: 'walking on stone', gain: 0.021, vary: 0.15 },
  wood:  { files: ['sfx/footsteps/footstep_wood_01.wav'], about: 'walking on wooden floors and the pier', gain: 0.0187, vary: 0.15 },
  snow:  { files: ['sfx/footsteps/footstep_snow_01.wav'], about: 'walking on snow', gain: 0.0332, vary: 0.15 },
  wet:   { files: ['sfx/footsteps/footstep_wet_ground_01.wav'], about: 'walking on wet ground in rain', gain: 0.0183, vary: 0.15 },
  hoof:  { files: ['sfx/footsteps/horse_hoof_01.wav'], about: 'riding the horse', gain: 0.0193, vary: 0.15 },
};

export const ALL_AUDIO = { sfx: SFX_FILES, ambience: BED_FILES, calls: CALL_FILES, footsteps: STEP_FILES };
