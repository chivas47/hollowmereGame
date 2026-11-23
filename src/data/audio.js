// v317 (roadmap 109): every sound the game plays, as a file under assets/audio/ (see its README). To replace a
// sound, save the new one over the file of the same name; to use another format or name, change `file` here.
// gain: how loud the file plays. The shipped files are normalized (their loudest moment at 90%) and gain restores
// the level the game was mixed at, so a replacement mastered to a normal level sounds right at the same gain.
// loop: plays until stopped (music and ambient beds; the file's end must join its start). vary: each play's pitch
// and speed shift by up to this share either way (so a repeated step or birdsong never sounds the same twice).
// The files were recorded from the game's own sound generators (tools/render_audio.mjs); if a file is missing or
// fails to load, the game falls back to those generators (audio/sfx.js, music.js, ambience.js, footsteps.js).
export const AUDIO_DIR = 'assets/audio/';

// Music: see data/musicTracks.js (v318), which lists every track with its location, season, weather and time.

// Sound effects, by the name systems emit ('sfx', name).
export const SFX_FILES = {
  rustle:      { file: 'sfx/weeds-cut-rustle.wav',       gain: 0.213 },
  hoe:         { file: 'sfx/hoe-till-soil.wav',          gain: 0.0748 },
  can:         { file: 'sfx/watering-can-pour.wav',      gain: 0.192 },
  seed:        { file: 'sfx/seed-plant-pop.wav',         gain: 0.0809 },
  axe:         { file: 'sfx/axe-chop-wood.wav',          gain: 0.0692 },
  pick:        { file: 'sfx/pickaxe-strike-rock.wav',    gain: 0.133 },
  sword:       { file: 'sfx/sword-swing.wav',            gain: 0.0407 },
  swingDagger: { file: 'sfx/dagger-swing.wav',           gain: 0.0639 },
  swingClub:   { file: 'sfx/club-swing.wav',             gain: 0.0505 },
  hit:         { file: 'sfx/weapon-hit.wav',             gain: 0.0686 },
  crit:        { file: 'sfx/weapon-critical-hit.wav',    gain: 0.132 },
  slay:        { file: 'sfx/monster-defeated.wav',       gain: 0.0779 },
  slam:        { file: 'sfx/ground-slam.wav',            gain: 0.158 },
  heartbeat:   { file: 'sfx/low-health-heartbeat.wav',   gain: 0.151 },
  pickup:      { file: 'sfx/item-pickup.wav',            gain: 0.123 },
  bite:        { file: 'sfx/fish-bite-alert.wav',        gain: 0.127 },
  catch:       { file: 'sfx/fish-caught-fanfare.wav',    gain: 0.129 },
  miss:        { file: 'sfx/fish-got-away.wav',          gain: 0.128 },
  hurt:        { file: 'sfx/player-hurt.wav',            gain: 0.1 },
  coin:        { file: 'sfx/coins-earned.wav',           gain: 0.0763 },
  levelup:     { file: 'sfx/skill-level-up.wav',         gain: 0.0766 },
  pet:         { file: 'sfx/animal-petted.wav',          gain: 0.131 },
  place:       { file: 'sfx/object-placed.wav',          gain: 0.0244 },
  door:        { file: 'sfx/door-and-map-change.wav',    gain: 0.0242 },
  boom:        { file: 'sfx/bomb-explosion.wav',         gain: 0.12 },
  thunder:     { file: 'sfx/thunder-rumble.wav',         gain: 0.113 },
  flap:        { file: 'sfx/bird-takes-off.wav',         gain: 0.0207 },
  ui:          { file: 'sfx/menu-click.wav',             gain: 0.0493 },
  chime:       { file: 'sfx/blessing-chime.wav',         gain: 0.059 },
  splash:      { file: 'sfx/lantern-on-water-splash.wav', gain: 0.0512 },
  morning:     { file: 'sfx/morning-wake-jingle.wav',    gain: 0.0684 },
};

// Ambient beds: looped under the scene, faded by audio/ambience.js (rain, wind, falling water, surf, cave hum, fire).
export const BED_FILES = {
  rain:  { file: 'ambience/rain-loop.wav',        gain: 0.0721, loop: true },
  wind:  { file: 'ambience/wind-loop.wav',        gain: 0.0294, loop: true },
  falls: { file: 'ambience/waterfall-loop.wav',   gain: 0.043, loop: true },
  surf:  { file: 'ambience/sea-surf-loop.wav',    gain: 0.0337, loop: true },
  hum:   { file: 'ambience/cave-hum-loop.wav',    gain: 0.0149, loop: true },
  fire:  { file: 'ambience/hearth-fire-loop.wav', gain: 0.0204, loop: true },
};

// Ambient calls: one-off sounds rolled by audio/ambience.js.
export const CALL_FILES = {
  bird:    { file: 'ambience/birdsong-chirp.wav',     gain: 0.0328, vary: 0.25 },
  cricket: { file: 'ambience/cricket-chirp.wav',      gain: 0.0092, vary: 0.05 },
  gull:    { file: 'ambience/gull-cry.wav',           gain: 0.0317, vary: 0.1 },
  drip:    { file: 'ambience/cave-water-drip.wav',    gain: 0.0432, vary: 0.15 },
  bell:    { file: 'ambience/distant-town-bell.wav',  gain: 0.0221 },
  gust:    { file: 'ambience/wind-gust.wav',          gain: 0.014, vary: 0.1 },
  tap:     { file: 'ambience/rain-tap-on-glass.wav',  gain: 0.013, vary: 0.3 },
  crackle: { file: 'ambience/fire-crackle.wav',       gain: 0.0584, vary: 0.2 },
};

// Footsteps by what is underfoot (audio/footsteps.js surfaceAt), and hooves on horseback.
export const STEP_FILES = {
  grass: { file: 'footsteps/footstep-grass.wav',  gain: 0.0217, vary: 0.15 },
  path:  { file: 'footsteps/footstep-dirt-path.wav', gain: 0.0272, vary: 0.15 },
  sand:  { file: 'footsteps/footstep-sand.wav',   gain: 0.0365, vary: 0.15 },
  stone: { file: 'footsteps/footstep-stone.wav',  gain: 0.021, vary: 0.15 },
  wood:  { file: 'footsteps/footstep-wood.wav',   gain: 0.0187, vary: 0.15 },
  snow:  { file: 'footsteps/footstep-snow.wav',   gain: 0.0332, vary: 0.15 },
  wet:   { file: 'footsteps/footstep-wet-ground.wav', gain: 0.0183, vary: 0.15 },
  hoof:  { file: 'footsteps/horse-hoofbeat.wav',  gain: 0.0193, vary: 0.15 },
};

export const ALL_AUDIO = { sfx: SFX_FILES, ambience: BED_FILES, calls: CALL_FILES, footsteps: STEP_FILES };
