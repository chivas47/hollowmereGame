// Every creature you can fight: its stats, where it lives, how it moves and what it drops, one entry each.
// Stardew by role, original names. A balance patch edits the numbers here and nothing else.
//
// Stats (hp, dmg, speed) are plain numbers so they can be read, diffed and tuned:
//   n                 the same on every floor
//   [base, every]     base + 1 for every `every` floors (floor 30 with [12, 3] is 12 + 10 = 22); every 1 is +1 a
//                     floor, 0.5 is +2 a floor
//   [base, every, cap] the same, the growth stopping at `cap`
// `floor` is the Hollow-floor strength: a Hollow floor's number, or the Cavern's, Vent's or Peak's eff (data/cavern.js,
// forge.js, nuts.js). statsAt() is the one place they are worked out. A charger's health is multiplied by its
// `tough` (CHARGE.tough).
//
// zones: where it spawns (ZONES below). from / to: the Hollow floors it lives on (only with 'hollow').
// move: how it fights (systems/monsters.js; the Bestiary's data/bestiary.js HOW). xp: combat XP a defeat gives.
// color: its body colour (slimes take theirs from the floor); glow: a second colour (a spitter's glob, a wisp's light).
// weight: how often it is picked among the kinds of a floor (default 1, all equal; 2 is twice as often, 0.25 a
//   quarter as often). A number, or one per zone ({ hollow: 1, vent: 0.3 }; zones left out count 1). v353: any of
//   those can instead be bands by depth, [[from, w], ...] in rising order: from that floor of its zone down (a Hollow,
//   Cavern, Vent or Peak floor number, not the strength), w applies, so { hollow: [[1, 2], [30, 1], [60, 0.5]] } is
//   common early and rare deep; floors above the first band take the first band's weight. spawnShare() gives the
//   resulting odds, and tools/monster_stats.mjs prints them.
// boss: a named guardian (systems/monsters.js spawnBoss): drawn `scale` times as big with a health bar, boss music
//   while it lives; each time its health falls past a share in `marks` it calls up `calls` [kind, n] round it; below
//   `rage` of its health it moves at `rageSpeed`. callLine: what you are told when it calls.
// notice: how near you come (px) before it notices you: it chases (or keeps its distance, or comes up from under
//   the floor), cries its alert and is heard fading in and out. Default NOTICE; a balance patch can give a kind its
//   own (Stardew's bats and ghosts sense you from further off than its slow crawlers).
// knockback: how far a blow pushes it, times the usual (default 1; 0.5 half as far, 0 not at all: Stardew's heavy
//   golems and guardians barely move). Every push it takes is scaled: swings, bombs, the blast ring, a sword's block.
// mound: what a burrower's mound looks like, 'earth' (the default) or 'lava'.
// loot: rows of [item, chance, min, max], each rolled on its own at every defeat (data/loot.js rollLoot); Stardew by
// role: each kind drops a material of its own and sometimes the ore of its floors.
// tags: the families rules read (TAGS below), so a ring or an enchantment covers every kind of a family, new ones too.
// voice: the family of sounds it makes (VOICES below; its cries are the `<voice>Alert` and `<voice>Death` effects in
// data/audio.js).

// ---- how each way of fighting works (systems/monsters.js) ----

// v228 (roadmap 80b): chargers (move 'charge'). Within `range` px and rested, a charger stops and winds up (it flashes
// and shakes: the tell) for `windup` s, then rushes the way you were at `rush` px/s for `time` s, hurting CHARGE.hit
// times as much on contact, `times` rushes in a row. Then it stands winded for `recover` s, open to hits; one that hits
// a wall, or is blocked by the sword, stands dazed for `stun` s. Between charges it walks after you at its speed and
// rests CHARGE.rest s. v266 (88a, Nuno): a rush steers after you at up to `turn` radians a second; chargers have `tough`
// times the health of a walker of their floors (not blade resistance, which is the shellbacks' trait). A charger with
// `burrow` (the burrow beetle) travels under the floor between rushes like a burrower and winds up as soon as it is up.
export const CHARGE = { range: 72, hit: 1.5, rest: 2, stun: 1.6, turn: 2.4, tough: 2 };
const charger = (o) => ({ move: 'charge', range: CHARGE.range, times: 1, stun: CHARGE.stun, tough: CHARGE.tough, ...o });

// v253 (85d1):
// mimic: sits as a rock until you step within MIMIC.wake px or hit it; the first hit only cracks its shell (Stardew's
//   rock crab). disguise: its colour asleep (the gourd lurker is a pumpkin).
// burrow: moves under the floor as a mound (no hits either way), comes up within BURROW.rise px or after BURROW.under s
//   with a BURROW.tell s shake, stays up BURROW.up s, then sinks for BURROW.sink s (Stardew's duggy).
// swarm: a pack of `pack` [min, max] in one spawn slot, weak and quick, weaving as it comes (Stardew's dust sprites).
//   fly: true lets a swarm pass over walls.
export const MIMIC = { wake: 20 };
export const BURROW = { rise: 14, under: 4, tell: 0.5, up: 1.6, rest: 2.5, sink: 0.45 };
// v255 (85e1): shooters keep between SHOOT.near and SHOOT.far px from you; every SHOOT.every s they glow for SHOOT.tell s,
// then spit a glob at SHOOT.speed px/s that lasts SHOOT.life s and hurts as the shooter's own damage. The sword's block
// sends it back, and a glob sent back hits monsters for SHOOT.back times its damage.
export const SHOOT = { near: 48, far: 96, every: 2.4, tell: 0.45, speed: 95, life: 2, hit: 7, back: 0.75 };
// v256 (85e2): splitters (Stardew's big slimes) hop like slimes, drawn SPLIT.scale times as big; a defeat splits one into
// SPLIT.n small ones with SPLIT.hp of its health and SPLIT.xp of its XP, which do not split again. Each rolls its loot.
export const SPLIT = { n: 2, hp: 0.4, xp: 0.5, scale: 1.5, spread: 8 };
// v257 (85f): phase (Stardew's ghosts): drifts through walls, PHASE.solid s solid then PHASE.faint s faded, when nothing
// touches it either way; it flickers in the last PHASE.flicker s. armored (Stardew's armored bug): swords and daggers do
// ARMOR of their damage (Nuno: a quarter); clubs, bombs, the blast ring and globs sent back do it all.
export const PHASE = { solid: 2.2, faint: 1.6, flicker: 0.4 };
export const ARMOR = 0.25;

// ---- where they live ----
// hollow: the Hollow, floors from..to. cavern: the Sunken Cavern. vent: the Ember Vent and the Smoke Peak.
// wildfarm: the wild farm after dark (systems/farmPerks.js). night: the seasonal night creatures on every farm and the
// Wilds, one a season (systems/nightfolk.js). duskmarch: Gloamwood, the Tangle and Mournfield (data/duskmarch.js
// DUSK_CREATURES and NIGHT); `lives` is its Bestiary line.
// v347: lair: a boss's own room, where its place sets it (never drawn by a floor's spawns); `lives` is its line.
export const ZONES = ['hollow', 'cavern', 'vent', 'wildfarm', 'night', 'duskmarch', 'lair'];
const WOODS_LINE = 'Lives in Gloamwood and the Tangle, west of the village, by day and night.';
const GRAVE_LINE = 'Rises from the graves of Mournfield, west of the town, after dark.';

// v346: families for rules. slime: the slime ward keeps them off you. bug: the bug killer enchantment doubles damage
// to them (Stardew's bug killer works on every insect). undead: the crusader's enchantment and the gravewarden blade
// hurt them more. A kind can have several tags, or none.
export const TAGS = ['slime', 'bug', 'undead'];
// v346: the families of creature sounds. Each needs an `<voice>Alert` (it notices you) and a `<voice>Death` (its cry as
// it falls, under the defeat chime) in data/audio.js and audio/sfx.js.
export const VOICES = ['slime', 'bug', 'beast', 'bone', 'ghost', 'ember', 'plant'];

// v352: spawn weights and notice distances set by role (Nuno). Weights: swarms 0.4 (a pack is 4 to 5 bodies in
// one pick, so even weights made them a third of a floor), signature and tanky kinds 0.5, mid-difficulty 0.6 to 0.7,
// everyday kinds 1; the pebble crab 0.5 so floors 1 and 2 are not half mimics. Notice: flyers 160, ghosts, wasps and
// spitters 140 (beyond SHOOT.far), chargers 128 (before CHARGE.range), burrowers 96 (they ambush), slow crawlers and
// tanks 80, the Gravewarden 200 (its chamber); the rest NOTICE.
// v354: weights by depth in the Hollow (Stardew's mines change their mix as you go down): the first floors' kinds
// fade deeper (slimes 2 to 0.3, mites, burrow beetles, tusk boars), and kinds that arrive deep start rare on their
// first floors and grow commoner (bone walkers, serpents, gloom hounds, spitters, shellbacks).
// v355: knockback by weight (scripted duels, a standing farmer, checked each): light flyers and swarms 1.3; the
// beetle, boars, pebble crab and sand wraith 0.7; rams, the sand bull, shellbacks and the barrow shambler 0.5; the
// magma ram and crag shellback 0.4; the ember golem 0.3; the lava lurker 0 (it sits in its pool). The hounds keep 1:
// a strong blow drives a charging hound into a wall, which dazes it, and lighter knockback made their fights three
// times as long. The Gravewarden keeps 1 until its fight is played through.
// The order here is the Bestiary's within a zone (data/bestiary.js sorts by zone, then by first floor).
export const MONSTERS = {
  // v36: the Hollow by floor (Stardew: slimes and bugs early, bats from 30, skeletons around 70, serpents deep).
  slime:    { name: 'Slime', zones: ['hollow', 'wildfarm'], tags: ['slime'], voice: 'slime', weight: { hollow: [[1, 2], [20, 1], [50, 0.5], [80, 0.3]] }, from: 1, move: 'hop', hp: [3, 3], dmg: [6, 1], speed: [18, 0.5, 20], xp: 3,
    loot: [['gel', 0.75, 1, 2], ['copper', 0.05, 1, 1]] },
  mite:     { name: 'Hollow mite', zones: ['hollow'], tags: ['bug'], voice: 'bug', weight: [[3, 1.2], [30, 0.7], [60, 0.4]], notice: 80, from: 3, move: 'crawl', hp: [2, 5], dmg: [4, 2], speed: 14, xp: 2, color: '#6b4a2b',
    loot: [['chitin', 0.5, 1, 1], ['fiber', 0.2, 1, 1]] },
  bat:      { name: 'Cave bat', zones: ['hollow', 'cavern'], tags: [], voice: 'beast', knockback: 1.3, notice: 160, from: 12, move: 'fly', hp: [4, 4], dmg: [7, 1], speed: [34, 1, 16], xp: 6, color: '#4a3b5a',
    loot: [['leatherwing', 0.5, 1, 1], ['coal', 0.15, 1, 1]] },
  skeleton: { name: 'Bone walker', zones: ['hollow', 'cavern'], tags: ['undead'], voice: 'bone', weight: { hollow: [[30, 0.6], [45, 1]] }, from: 30, move: 'walk', hp: [12, 3], dmg: [10, 1], speed: 22, xp: 15, color: '#e8e0d0',
    loot: [['boneshard', 0.6, 1, 2], ['iron', 0.2, 1, 1]] },
  // v38: the Sunken Cavern's own (Stardew's mummies and pepper rex). v39: the Ember Vent's (magma sprites and golems).
  wraith:   { name: 'Sand wraith', zones: ['cavern'], tags: ['undead'], voice: 'bone', knockback: 0.7, move: 'walk', hp: [30, 3], dmg: [18, 4], speed: 18, xp: 25, color: '#d9c39a',
    loot: [['boneshard', 0.4, 1, 1], ['cloth', 0.1, 1, 1], ['wispsilk', 0.05, 1, 1]] },
  rex:      { name: 'Scorch rex', zones: ['cavern', 'vent'], tags: [], voice: 'beast', weight: 0.7, notice: 160, move: 'fly', hp: [22, 4], dmg: [20, 4], speed: 40, xp: 30, color: '#c8352f',
    loot: [['sunmote', 0.25, 1, 1], ['coal', 0.4, 1, 1]] },
  sprite:   { name: 'Magma sprite', zones: ['vent'], tags: [], voice: 'ember', notice: 160, move: 'fly', hp: [30, 4], dmg: [24, 5], speed: 46, xp: 35, color: '#e9862a',
    loot: [['cinder', 0.5, 1, 1], ['sunmote', 0.1, 1, 1]] },
  golem:    { name: 'Ember golem', zones: ['vent'], tags: [], voice: 'ember', knockback: 0.3, weight: 0.6, notice: 80, move: 'walk', hp: [60, 2], dmg: [28, 5], speed: 14, xp: 45, color: '#5a3a30',
    loot: [['cinder', 0.8, 1, 2], ['gold', 0.1, 1, 1]] },
  // v251: sunmote too, so the Hollow has one (Stardew: solar essence from its mines' ghosts).
  serpent:  { name: 'Hollow serpent', zones: ['hollow', 'cavern', 'vent'], tags: [], voice: 'beast', weight: { hollow: [[50, 0.4], [70, 0.7]], cavern: 0.6, vent: 0.5 }, notice: 160, from: 50, move: 'fly', hp: [20, 2], dmg: [15, 1], speed: 44, xp: 20, color: '#5f8a4a',
    loot: [['gloommote', 0.1, 1, 1], ['sunmote', 0.1, 1, 1], ['violet', 0.05, 1, 1]] },

  // v228: chargers, their stats beside the walkers of the same floors.
  beetle:     { name: 'Burrow beetle', zones: ['hollow'], tags: ['bug'], voice: 'bug', knockback: 0.7, weight: [[6, 1], [50, 0.6]], notice: 128, from: 6, ...charger({ burrow: true, windup: 0.5, rush: 110, time: 0.4, recover: 0.8 }), hp: [4, 4], dmg: [5, 2], speed: 16, xp: 4, color: '#5a4a6a',
    loot: [['chitin', 0.4, 1, 1], ['copper', 0.2, 1, 1]] },
  boar:       { name: 'Tusk boar', zones: ['hollow'], tags: [], voice: 'beast', knockback: 0.7, weight: [[15, 1], [70, 0.7]], notice: 128, from: 15, ...charger({ windup: 0.6, rush: 140, time: 0.6, recover: 0.9 }), hp: [8, 3], dmg: [8, 1], speed: 18, xp: 8, color: '#7a5a3a',
    loot: [['coal', 0.25, 1, 1], ['boneshard', 0.2, 1, 1]] },
  ram:        { name: 'Stone ram', zones: ['hollow'], tags: [], voice: 'beast', knockback: 0.5, weight: 0.6, notice: 128, from: 35, ...charger({ windup: 0.7, rush: 150, time: 0.7, recover: 0.9, stun: 2 }), hp: [18, 3], dmg: [12, 1], speed: 16, xp: 16, color: '#9a928a',
    loot: [['iron', 0.3, 1, 1], ['stone', 0.5, 2, 3]] },
  gloomhound: { name: 'Gloom hound', zones: ['hollow'], tags: [], voice: 'beast', weight: [[60, 0.3], [75, 0.5]], notice: 128, from: 60, ...charger({ windup: 0.45, rush: 160, time: 0.45, recover: 0.9, times: 2 }), hp: [26, 2], dmg: [14, 1], speed: 24, xp: 22, color: '#3a3550',
    loot: [['gloommote', 0.15, 1, 1], ['gold', 0.2, 1, 1]] },
  scuttler:   { name: 'Dune scuttler', zones: ['cavern'], tags: ['bug'], voice: 'bug', notice: 128, ...charger({ windup: 0.35, rush: 150, time: 0.35, recover: 0.6 }), hp: [20, 4], dmg: [16, 4], speed: 20, xp: 20, color: '#c9a36a',
    loot: [['chitin', 0.4, 1, 1], ['copper', 0.4, 1, 1]] },
  bull:       { name: 'Sand bull', zones: ['cavern'], tags: [], voice: 'beast', knockback: 0.5, weight: 0.5, notice: 128, ...charger({ windup: 0.8, rush: 170, time: 0.9, recover: 1.1 }), hp: [40, 3], dmg: [22, 4], speed: 16, xp: 32, color: '#a5753f',
    loot: [['boneshard', 0.3, 1, 1], ['iron', 0.3, 1, 1]] },
  hound:      { name: 'Cinder hound', zones: ['vent'], tags: [], voice: 'beast', notice: 128, ...charger({ windup: 0.4, rush: 170, time: 0.5, recover: 0.8, times: 2 }), hp: [28, 4], dmg: [22, 5], speed: 26, xp: 34, color: '#5a2a22',
    loot: [['cinder', 0.4, 1, 1], ['gloommote', 0.1, 1, 1]] },
  magmaram:   { name: 'Magma ram', zones: ['vent'], tags: [], voice: 'beast', knockback: 0.4, weight: 0.5, notice: 128, ...charger({ windup: 0.8, rush: 150, time: 0.8, recover: 1, stun: 2.2 }), hp: [70, 2], dmg: [30, 5], speed: 14, xp: 48, color: '#4a3430',
    loot: [['cinder', 0.8, 1, 1], ['umbrite', 0.03, 1, 1]] },

  // v253 (85d1): mimic, burrow and swarm, kept to bands of floors (Stardew's rock crabs, duggies and dust sprites).
  crab:  { name: 'Pebble crab', zones: ['hollow'], tags: [], voice: 'bug', knockback: 0.7, weight: 0.5, from: 1, to: 40, move: 'mimic', hp: [6, 3], dmg: [5, 2], speed: 16, xp: 4, color: '#8a7a6a',
    loot: [['chitin', 0.4, 1, 1], ['stone', 0.6, 2, 4], ['copper', 0.15, 1, 1]] },
  mole:  { name: 'Burrow mole', zones: ['hollow'], tags: [], voice: 'beast', weight: 0.7, notice: 96, from: 8, to: 35, move: 'burrow', hp: [5, 4], dmg: [6, 2], speed: 34, xp: 5, color: '#6a5040',
    loot: [['fiber', 0.3, 1, 1], ['copper', 0.25, 1, 1], ['geode', 0.03, 1, 1]] },
  puff:  { name: 'Soot puffs', zones: ['hollow'], tags: [], voice: 'ember', knockback: 1.3, weight: 0.4, from: 40, to: 80, move: 'swarm', pack: [4, 5], hp: [2, 10], dmg: [4, 5], speed: 42, xp: 3, color: '#3d3833',
    loot: [['coal', 0.3, 1, 1], ['quartz', 0.03, 1, 1]] },
  // v254 (85d2): the same three in the deep dungeons, beside their dungeon's other kinds (Stardew: lava lurks).
  lurker:    { name: 'Lava lurker', zones: ['vent'], tags: [], voice: 'ember', knockback: 0, weight: 0.7, notice: 96, move: 'burrow', mound: 'lava', hp: [40, 4], dmg: [26, 5], speed: 40, xp: 40, color: '#a8352a',
    loot: [['cinder', 0.5, 1, 1], ['sunmote', 0.15, 1, 1]] },
  dustdevil: { name: 'Dust devils', zones: ['cavern'], tags: [], voice: 'ghost', knockback: 1.3, weight: 0.4, move: 'swarm', pack: [4, 5], hp: [8, 10], dmg: [10, 10], speed: 46, xp: 8, color: '#c9a36a',
    loot: [['stone', 0.3, 1, 2], ['copper', 0.1, 1, 1]] },
  ashswarm:  { name: 'Ash swarm', zones: ['vent'], tags: [], voice: 'ember', knockback: 1.3, weight: 0.4, move: 'swarm', pack: [4, 5], hp: [12, 10], dmg: [14, 8], speed: 46, xp: 10, color: '#6a5a58',
    loot: [['cinder', 0.2, 1, 1], ['sunmote', 0.03, 1, 1]] },

  // v255 (85e1): shooters (Stardew's shooting mages and squid kids).
  spitter:     { name: 'Hollow spitter', zones: ['hollow'], tags: [], voice: 'ghost', weight: [[70, 0.4], [85, 0.6]], notice: 140, from: 70, move: 'shoot', hp: [18, 3], dmg: [12, 2], speed: 20, xp: 18, color: '#5a4a6a', glow: '#b07ae0',
    loot: [['sunmote', 0.2, 1, 1], ['gold', 0.1, 1, 1]] },
  sandspitter: { name: 'Sand spitter', zones: ['cavern'], tags: [], voice: 'bug', weight: 0.6, notice: 140, move: 'shoot', hp: [26, 4], dmg: [16, 5], speed: 22, xp: 26, color: '#b08a5a', glow: '#e9c46a',
    loot: [['sunmote', 0.25, 1, 1], ['gold', 0.15, 1, 1]] },
  cragspitter: { name: 'Crag spitter', zones: ['vent'], tags: [], voice: 'ember', weight: 0.6, notice: 140, move: 'shoot', hp: [32, 4], dmg: [20, 5], speed: 22, xp: 32, color: '#4a3a36', glow: '#e9862a',
    loot: [['sunmote', 0.3, 1, 1], ['gloommote', 0.15, 1, 1]] },

  // v256 (85e2): splitters (Stardew's big slimes).
  mossslime:  { name: 'Moss slime', zones: ['hollow'], tags: ['slime'], voice: 'slime', weight: 0.6, from: 20, to: 60, move: 'split', hp: [14, 2], dmg: [8, 2], speed: 22, xp: 8, color: '#6a9a3a',
    loot: [['gel', 0.8, 1, 3], ['fiber', 0.25, 1, 1]] },
  emberslime: { name: 'Ember slime', zones: ['vent'], tags: ['slime'], voice: 'slime', weight: 0.5, move: 'split', hp: [50, 4], dmg: [24, 5], speed: 24, xp: 30, color: '#e07a3a',
    loot: [['gel', 0.6, 1, 2], ['cinder', 0.3, 1, 1]] },

  // v257 (85f): phasers and the armored. The lantern wisp is wisp silk's own source.
  wisp:      { name: 'Lantern wisp', zones: ['hollow'], tags: [], voice: 'ghost', weight: 0.5, notice: 140, from: 50, to: 80, move: 'phase', hp: [16, 4], dmg: [10, 2], speed: 26, xp: 16, color: '#cfe6f0', glow: '#ffe08a',
    loot: [['wispsilk', 0.15, 1, 1], ['sunmote', 0.05, 1, 1]] },
  shade:     { name: 'Tomb shade', zones: ['cavern'], tags: [], voice: 'ghost', weight: 0.5, notice: 140, move: 'phase', hp: [28, 4], dmg: [18, 4], speed: 28, xp: 28, color: '#5a5070', glow: '#b07ae0',
    loot: [['gloommote', 0.25, 1, 1], ['boneshard', 0.3, 1, 1]] },
  shellback: { name: 'Shellback', zones: ['hollow'], tags: ['bug'], voice: 'bug', knockback: 0.5, weight: [[85, 0.3], [100, 0.5]], notice: 80, from: 85, move: 'armored', armored: true, hp: [30, 3], dmg: [14, 2], speed: 14, xp: 24, color: '#7a8a6a',
    loot: [['chitin', 0.6, 2, 3], ['umbrite', 0.05, 1, 1]] },
  cragshell: { name: 'Crag shellback', zones: ['vent'], tags: ['bug'], voice: 'bug', knockback: 0.4, weight: 0.5, notice: 80, move: 'armored', armored: true, hp: [70, 3], dmg: [28, 5], speed: 14, xp: 45, color: '#5a4a44',
    loot: [['chitin', 0.6, 2, 3], ['umbrite', 0.08, 1, 1]] },
  stormwing: { name: 'Storm wing', zones: ['vent'], tags: [], voice: 'beast', knockback: 1.3, weight: 0.4, notice: 160, move: 'swarm', fly: true, pack: [3, 4], hp: [14, 10], dmg: [16, 8], speed: 50, xp: 12, color: '#3a4a6a',
    loot: [['leatherwing', 0.5, 1, 1], ['gloommote', 0.1, 1, 1]] },

  // v261 (85j): the seasonal night creatures, one a season. Stats beside the Hollow's first floors; Stardew has no
  // counterpart beyond the wilderness farm's night monsters.
  bramble:   { name: 'Bramble sprites', zones: ['night'], tags: [], voice: 'plant', knockback: 1.3, season: 'Spring', move: 'swarm', pack: [3, 4], hp: 4, dmg: 5, speed: 40, xp: 3, color: '#6a8a3a',
    loot: [['fiber', 0.4, 1, 1], ['wood', 0.1, 1, 2]] },
  moth:      { name: 'Firefly moth', zones: ['night'], tags: ['bug'], voice: 'bug', knockback: 1.3, notice: 160, season: 'Summer', move: 'fly', hp: 6, dmg: 6, speed: 36, xp: 4, color: '#e9d27a',
    loot: [['leatherwing', 0.3, 1, 1], ['sunmote', 0.05, 1, 1]] },
  gourd:     { name: 'Gourd lurker', zones: ['night'], tags: [], voice: 'plant', season: 'Autumn', move: 'mimic', disguise: '#e8862a', hp: 10, dmg: 6, speed: 16, xp: 5, color: '#c86a2a',
    loot: [['chitin', 0.3, 1, 1], ['pumpkin', 0.1, 1, 1]] },
  frostwisp: { name: 'Frost wisp', zones: ['night'], tags: [], voice: 'ghost', notice: 140, season: 'Winter', move: 'phase', hp: 8, dmg: 7, speed: 22, xp: 6, color: '#bfe0f2', glow: '#9fd8f0',
    loot: [['wispsilk', 0.1, 1, 1], ['gloommote', 0.05, 1, 1]] },

  // v303: the Duskmarch. By day the woods: a charger, a flying swarm and a mimic that sleeps as a stump. After dark in
  // Mournfield: a walker, a slow tough one and a phaser. Stardew's Secret Woods and Wilderness night monsters by role;
  // stats beside the Hollow's floors 10 to 25; bone fragments from its skeletons, essences from its ghosts.
  bristle:  { name: 'Bristle hog', zones: ['duskmarch'], tags: [], voice: 'beast', knockback: 0.7, notice: 128, lives: WOODS_LINE, ...charger({ windup: 0.7, rush: 120, time: 0.5, recover: 1 }), hp: 7, dmg: 8, speed: 18, xp: 7, color: '#6a4a32',
    loot: [['boneshard', 0.3, 1, 1], ['fiber', 0.4, 1, 2]] },
  wasp:     { name: 'Thorn wasps', zones: ['duskmarch'], tags: ['bug'], voice: 'bug', knockback: 1.3, notice: 140, lives: WOODS_LINE, move: 'swarm', fly: true, pack: [2, 3], hp: 4, dmg: 5, speed: 44, xp: 3, color: '#d9a83a',
    loot: [['chitin', 0.5, 1, 1], ['honey', 0.05, 1, 1]] },
  stump:    { name: 'Stump lurker', zones: ['duskmarch'], tags: [], voice: 'plant', lives: WOODS_LINE, move: 'mimic', disguise: '#7a5a3a', hp: 12, dmg: 7, speed: 18, xp: 6, color: '#8a6a44',
    loot: [['wood', 0.8, 2, 4], ['hardwood', 0.1, 1, 1], ['mushroom', 0.1, 1, 1]] },
  rattler:  { name: 'Grave rattler', zones: ['duskmarch'], tags: ['undead'], voice: 'bone', lives: GRAVE_LINE, move: 'walk', hp: 18, dmg: 12, speed: 22, xp: 10, color: '#ddd4bc',
    loot: [['boneshard', 0.6, 1, 2], ['iron', 0.1, 1, 1]] },
  shambler: { name: 'Barrow shambler', zones: ['duskmarch'], tags: ['undead'], voice: 'bone', knockback: 0.5, notice: 80, lives: GRAVE_LINE, move: 'walk', hp: 30, dmg: 15, speed: 12, xp: 14, color: '#7a9a6a',
    loot: [['boneshard', 0.3, 1, 1], ['cloth', 0.12, 1, 1], ['gloommote', 0.05, 1, 1]] },
  haunt:    { name: 'Mourning haunt', zones: ['duskmarch'], tags: ['undead'], voice: 'ghost', notice: 140, lives: GRAVE_LINE, move: 'phase', hp: 16, dmg: 10, speed: 26, xp: 12, color: '#b8c8e0', glow: '#8ae0d0',
    loot: [['wispsilk', 0.08, 1, 1], ['gloommote', 0.1, 1, 1], ['sunmote', 0.04, 1, 1]] },

  // v347: the Gravewarden, the chapel catacombs' guardian (data/catacombs.js CATA.boss sets where). A grave rattler
  // grown huge. Stardew by role: a dungeon's named guardian, about ten of its floor's creatures in one, so ten times a
  // rattler's XP and bone shards, with a void essence's chance (its ghosts' drop); the sarcophagus behind it holds the
  // gravewarden blade.
  gravewarden: { name: 'The Gravewarden', zones: ['lair'], tags: ['undead'], voice: 'bone', notice: 200, lives: 'Guards the sarcophagus at the heart of the chapel catacombs, under Mournfield\'s chapel.',
    move: 'walk', hp: 320, dmg: 18, speed: 20, xp: 100, color: '#cfc4a8',
    boss: { scale: 2, marks: [0.66, 0.33], calls: ['rattler', 2], rage: 0.33, rageSpeed: 30, callLine: 'The Gravewarden strikes the floor, and the dead answer!' },
    loot: [['boneshard', 1, 6, 10], ['iron', 1, 1, 2], ['gloommote', 0.5, 1, 1]] },
};

// ---- reading the table ----

// One stat of a kind on a floor (the formats at the top).
export function statAt(kind, stat, floor) {
  const d = MONSTERS[kind], s = d[stat];
  const v = typeof s === 'number' ? s : s[0] + Math.min(s[2] ?? Infinity, Math.floor(floor / s[1]));
  return stat === 'hp' && d.tough ? v * d.tough : v;
}
export const statsAt = (kind, floor) => ({ hp: statAt(kind, 'hp', floor), dmg: statAt(kind, 'dmg', floor), speed: statAt(kind, 'speed', floor) });

export const livesIn = (kind, zone) => MONSTERS[kind].zones.includes(zone);
// The Smoke Peak shares the Ember Vent's creatures.
const zoneOf = (zone) => (zone === 'peak' ? 'vent' : zone);
// Each zone's kinds, worked out once (the table does not change while the game runs).
const BY_ZONE = Object.fromEntries(ZONES.map((z) => [z, Object.keys(MONSTERS).filter((k) => livesIn(k, z))]));
// The kinds that can spawn on a dungeon floor: the Hollow's by floor band, the other dungeons' all at once.
export function kindsFor(zone, floor) {
  const list = BY_ZONE[zoneOf(zone)] || [];
  if (zoneOf(zone) !== 'hollow') return list;
  return list.filter((k) => floor >= MONSTERS[k].from && floor <= (MONSTERS[k].to ?? Infinity));
}
export const kindsIn = (zone) => BY_ZONE[zoneOf(zone)] || [];
// v348: how near you come before a kind notices you (notice above), in px: about seven tiles.
export const NOTICE = 110;
export const noticeOf = (kind) => MONSTERS[kind]?.notice ?? NOTICE;
// v350: how far a blow pushes a kind, times the usual (knockback above).
export const knockbackOf = (kind) => MONSTERS[kind]?.knockback ?? 1;
// v350: the dungeons, for a query that means "in the Hollow, the Sunken Cavern or the Ember Vent".
export const DUNGEONS = ['hollow', 'cavern', 'vent'];
// v350: the kinds a query picks, in MONSTERS order: { kind } one kind; or any of { move, zones (lives in any of
// them), tag } together. A Guild goal is a query (data/guild.js), so a new kind that fits counts with no list to edit.
export function kindsWhere(q) {
  if (q.kind) return MONSTERS[q.kind] ? [q.kind] : [];
  return Object.keys(MONSTERS).filter((k) => (!q.move || MONSTERS[k].move === q.move)
    && (!q.zones || q.zones.some((z) => livesIn(k, z))) && (!q.tag || hasTag(k, q.tag)));
}
// v346: a kind's spawn weight in a zone (weight above); v353: on floor n of that zone, for weights in bands by depth.
export function weightIn(kind, zone, n = 1) {
  const w = MONSTERS[kind].weight, v = typeof w === 'number' || Array.isArray(w) ? w : w?.[zoneOf(zone)] ?? 1;
  if (!Array.isArray(v)) return v;
  let out = v[0][1];
  for (const [from, x] of v) if (n >= from) out = x;
  return out;
}
// v346: one kind drawn from `kinds` by their weights in `zone`, with one roll of R (a floor's seeded rng). With every
// weight 1 it picks exactly what an even draw did, so floors stay as they were until a weight changes.
// v353: n, the floor of its zone (for weights in bands by depth).
export function pickKind(kinds, zone, R = Math.random, n = 1) {
  const total = kinds.reduce((a, k) => a + weightIn(k, zone, n), 0);
  let t = R() * total;
  for (const k of kinds) if ((t -= weightIn(k, zone, n)) < 0) return k;
  return kinds[kinds.length - 1];
}
// v346: each kind's chance to be picked on a floor ({ kind: share }, summing to 1). floor: the floor of its zone.
export function spawnShare(zone, floor) {
  const kinds = kindsFor(zone, floor), total = kinds.reduce((a, k) => a + weightIn(k, zone, floor), 0);
  return Object.fromEntries(kinds.map((k) => [k, total ? weightIn(k, zone, floor) / total : 0]));
}

// v346: whether a kind belongs to a family (TAGS).
export const hasTag = (kind, tag) => !!MONSTERS[kind]?.tags.includes(tag);
// The crusader's enchantment and the gravewarden blade hurt these more.
export const UNDEAD = Object.keys(MONSTERS).filter((k) => hasTag(k, 'undead'));

// ---- spawning rules ----

// When the seasonal night creatures come out (game minutes), and how many: bodies on a farm, on the Wilds.
export const NIGHTFOLK = { from: 20 * 60, farm: [2, 3], wilds: [3, 4] };
// Bodies on a Hollow floor (the Cavern's, Vent's and Peak's counts are in their own data files).
export const MONSTER_COUNT = (f) => Math.min(10, 2 + Math.floor(f / 2));
// v259 (85h): busy floors (Stardew's infested floors). From Hollow floor `from`, a floor that is not a fifth (the lift's
// stops) is busy with chance `chance`: `mult` times the usual count, up to `max` bodies, all of one kind from the
// floor's own, and no rock hides the ladder; it opens once every creature on the floor is down.
export const BUSY = { from: 10, chance: 1 / 15, mult: 2.5, max: 18 };
// v260 (85i): the challenge brazier at the Wardens' Lodge (Stardew's Shrine of Challenge by role; Nuno: opt-in only).
// While it burns every dungeon monster has `tougher` times its health and damage, and one in `chance` is an elite:
// `hp` times its health, `dmg` times its damage and `xp` times its XP, a sure essence, and its rare drop `rare` times
// as likely.
export const ELITE = { chance: 0.1, tougher: 1.25, hp: 3, dmg: 1.5, xp: 3, rare: 5, essences: ['sunmote', 'gloommote'] };
