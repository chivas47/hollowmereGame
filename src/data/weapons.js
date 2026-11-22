// Combat expansion, part 1 (v36): weapons, the Hollow's monsters, rings and mine boots. Stardew by role, original names.
// Weapon damage is Stardew's average damage scaled to our old blade (Stardew's rusty sword, 2 to 5, is our 3).
// kind: sword (balanced), dagger (fast, weak, short reach), club (slow, strong, long reach, heavy knockback).
export const WEAPON_KINDS = {
  sword:  { cooldown: 0.3,  reach: 16, knock: 160 },
  dagger: { cooldown: 0.16, reach: 13, knock: 90 },
  club:   { cooldown: 0.6,  reach: 18, knock: 260 },
};
// v227: each weapon kind's special move (systems/specials.js), Stardew's: the sword blocks (its cooldown 1.5 s), the
// dagger stabs fast (3 s), the club leaps and slams the ground around you (6 s).
// sword: block, seconds it holds; after, seconds you cannot be hurt once it turns a hit; knock, how hard it throws back.
// dagger: stabs, how many; every, seconds between them; mult, each stab's share of the weapon's damage; reach in px.
// club: windup, seconds in the air; radius in px; mult of the weapon's damage; stun, seconds the monsters stand dazed.
export const SPECIALS = {
  sword:  { name: 'Block',        cooldown: 1.5, block: 0.6, after: 0.5, knock: 220 },
  dagger: { name: 'Quick stab',   cooldown: 3,   stabs: 4, every: 0.08, mult: 0.6, reach: 18 },
  club:   { name: 'Ground slam',  cooldown: 6,   windup: 0.35, radius: 40, mult: 1, stun: 1 },
};

export const WEAPONS = {
  oldblade:   { name: 'Old blade',        kind: 'sword',  damage: 3 },    // rusty sword, the one you start with
  shortsword: { name: 'Steel shortsword', kind: 'sword',  damage: 5 },    // steel smallsword 4-8
  saber:      { name: 'Silver saber',     kind: 'sword',  damage: 10 },   // silver saber 8-15
  cutlass:    { name: 'Hollow cutlass',   kind: 'sword',  damage: 11 },   // cutlass 9-17
  greatsword: { name: 'Greatsword',       kind: 'sword',  damage: 22, slow: true },   // claymore 20-32, slower
  knife:      { name: 'Paring knife',     kind: 'dagger', damage: 2 },    // carving knife 1-3
  dirk:       { name: 'Iron dirk',        kind: 'dagger', damage: 3 },    // iron dirk 2-4
  shank:      { name: 'Burrow shank',     kind: 'dagger', damage: 8 },    // burglar's shank 7-12
  club:       { name: 'Oak club',         kind: 'club',   damage: 11 },   // wood club 9-16
  mallet:     { name: 'Stone mallet',     kind: 'club',   damage: 17 },   // wood mallet 15-24
  duneblade:  { name: 'Dune blade',       kind: 'sword',  damage: 32 },   // v38: obsidian edge 30-45, from cavern chests and monsters
  mitefang:   { name: 'Mite fang',        kind: 'dagger', damage: 13 },   // v37: insect head 10-20, the lodge's reward for 80 mites
};

// Monsters by mine floor (Stardew: slimes and bugs early, bats from 30, skeletons around 70, serpents deep).
// move: hop (slimes), crawl, fly (ignores walls), walk. hp, dmg, speed by floor; xp: combat XP. Drops: data/loot.js (85a).
export const MONSTERS = {
  slime:    { name: 'Slime',       from: 1,  move: 'hop',   hp: (f) => 3 + Math.floor(f / 3),  dmg: (f) => 6 + f,  speed: (f) => 18 + Math.min(20, f * 2), xp: 3 },
  mite:     { name: 'Hollow mite', from: 3,  move: 'crawl', hp: (f) => 2 + Math.floor(f / 5),  dmg: (f) => 4 + Math.floor(f / 2), speed: () => 14, xp: 2, color: '#6b4a2b' },
  bat:      { name: 'Cave bat',    from: 12, cavern: true, move: 'fly',   hp: (f) => 4 + Math.floor(f / 4),  dmg: (f) => 7 + f,  speed: (f) => 34 + Math.min(16, f), xp: 6, color: '#4a3b5a' },
  skeleton: { name: 'Bone walker', from: 30, cavern: true, move: 'walk',  hp: (f) => 12 + Math.floor(f / 3), dmg: (f) => 10 + f, speed: () => 22, xp: 15, color: '#e8e0d0' },
  // v38. cavern: also lives in the Sunken Cavern; cavernOnly: only there (Stardew's mummies and pepper rex).
  wraith:   { name: 'Sand wraith', from: 0, cavernOnly: true, move: 'walk', hp: (f) => 30 + Math.floor(f / 3), dmg: (f) => 18 + Math.floor(f / 4), speed: () => 18, xp: 25, color: '#d9c39a' },
  rex:      { name: 'Scorch rex',  from: 0, cavernOnly: true, vent: true, move: 'fly',  hp: (f) => 22 + Math.floor(f / 4), dmg: (f) => 20 + Math.floor(f / 4), speed: () => 40, xp: 30, color: '#c8352f' },
  // v39. vent: also in the Ember Vent; ventOnly: only there (Stardew's magma sprites and lava lurks).
  sprite:   { name: 'Magma sprite', from: 0, ventOnly: true, move: 'fly',  hp: (f) => 30 + Math.floor(f / 4), dmg: (f) => 24 + Math.floor(f / 5), speed: () => 46, xp: 35, color: '#e9862a' },
  golem:    { name: 'Ember golem',  from: 0, ventOnly: true, move: 'walk', hp: (f) => 60 + Math.floor(f / 2), dmg: (f) => 28 + Math.floor(f / 5), speed: () => 14, xp: 45, color: '#5a3a30' },
  serpent:  { name: 'Hollow serpent', from: 50, cavern: true, vent: true, move: 'fly', hp: (f) => 20 + Math.floor(f / 2), dmg: (f) => 15 + f, speed: () => 44, xp: 20, color: '#5f8a4a' },
};
// v228 (roadmap 80b): chargers (move 'charge', systems/monsters.js). Within `range` px and rested, a charger stops
// and winds up (it flashes and shakes: the tell) for `windup` s, then rushes the way you were at `rush` px/s for
// `time` s, hurting CHARGE.hit times as much on contact, `times` rushes in a row. Then it stands winded for
// `recover` s, open to hits; one that hits a wall, or is blocked by the sword, stands dazed for `stun` s. Between
// charges it walks after you at `speed(f)` and rests CHARGE.rest s. Stats sit beside the walkers of the same floors.
// v266 (roadmap 88a, Nuno): a rush steers after you at up to `turn` radians a second, so it keeps coming but a late
// sidestep still beats it; chargers have `tough` times the health they had (Nuno: way higher, not blade resistance,
// which is the shellbacks' trait). A charger with `burrow` (the burrow beetle) travels under the floor between rushes
// like a burrower (BURROW below) and winds up as soon as it comes up.
export const CHARGE = { range: 72, hit: 1.5, rest: 2, stun: 1.6, turn: 2.4, tough: 2 };
const charger = (o) => ({ move: 'charge', range: CHARGE.range, times: 1, stun: CHARGE.stun, ...o });
Object.assign(MONSTERS, {
  beetle:     { name: 'Burrow beetle', from: 6, ...charger({ burrow: true, windup: 0.5, rush: 110, time: 0.4, recover: 0.8 }), hp: (f) => CHARGE.tough * (4 + Math.floor(f / 4)), dmg: (f) => 5 + Math.floor(f / 2), speed: () => 16, xp: 4, color: '#5a4a6a' },
  boar:       { name: 'Tusk boar', from: 15, ...charger({ windup: 0.6, rush: 140, time: 0.6, recover: 0.9 }), hp: (f) => CHARGE.tough * (8 + Math.floor(f / 3)), dmg: (f) => 8 + f, speed: () => 18, xp: 8, color: '#7a5a3a' },
  ram:        { name: 'Stone ram', from: 35, ...charger({ windup: 0.7, rush: 150, time: 0.7, recover: 0.9, stun: 2 }), hp: (f) => CHARGE.tough * (18 + Math.floor(f / 3)), dmg: (f) => 12 + f, speed: () => 16, xp: 16, color: '#9a928a' },
  gloomhound: { name: 'Gloom hound', from: 60, ...charger({ windup: 0.45, rush: 160, time: 0.45, recover: 0.9, times: 2 }), hp: (f) => CHARGE.tough * (26 + Math.floor(f / 2)), dmg: (f) => 14 + f, speed: () => 24, xp: 22, color: '#3a3550' },
  scuttler:   { name: 'Dune scuttler', from: 0, cavernOnly: true, ...charger({ windup: 0.35, rush: 150, time: 0.35, recover: 0.6 }), hp: (f) => CHARGE.tough * (20 + Math.floor(f / 4)), dmg: (f) => 16 + Math.floor(f / 4), speed: () => 20, xp: 20, color: '#c9a36a' },
  bull:       { name: 'Sand bull', from: 0, cavernOnly: true, ...charger({ windup: 0.8, rush: 170, time: 0.9, recover: 1.1 }), hp: (f) => CHARGE.tough * (40 + Math.floor(f / 3)), dmg: (f) => 22 + Math.floor(f / 4), speed: () => 16, xp: 32, color: '#a5753f' },
  hound:      { name: 'Cinder hound', from: 0, ventOnly: true, ...charger({ windup: 0.4, rush: 170, time: 0.5, recover: 0.8, times: 2 }), hp: (f) => CHARGE.tough * (28 + Math.floor(f / 4)), dmg: (f) => 22 + Math.floor(f / 5), speed: () => 26, xp: 34, color: '#5a2a22' },
  magmaram:   { name: 'Magma ram', from: 0, ventOnly: true, ...charger({ windup: 0.8, rush: 150, time: 0.8, recover: 1, stun: 2.2 }), hp: (f) => CHARGE.tough * (70 + Math.floor(f / 2)), dmg: (f) => 30 + Math.floor(f / 5), speed: () => 14, xp: 48, color: '#4a3430' },
});

// v253 (roadmap 85d1): three new ways to fight, Stardew's by role, each with a kind that uses it. to: the last floor
// it lives on (Stardew's rock crabs, duggies and dust sprites keep to bands of floors).
// mimic: sits as a rock until you step within MIMIC.wake px or hit it; the first hit only cracks its shell (Stardew's
//   rock crab, cracked with the pickaxe; ours with any hit).
// burrow: moves under the floor as a mound (no hits either way), comes up within BURROW.rise px or after BURROW.under s
//   with a BURROW.tell s shake, stays up BURROW.up s (it hurts and can be hurt), then digs down again (Stardew's duggy).
// swarm: a pack of `pack` [min, max] in one spawn slot, weak and quick, weaving as it comes (Stardew's dust sprites).
export const MIMIC = { wake: 20 };
export const BURROW = { rise: 14, under: 4, tell: 0.5, up: 1.6, rest: 2.5, sink: 0.45 };   // v267: sink, the seconds it takes to dig down
Object.assign(MONSTERS, {
  crab:  { name: 'Pebble crab', from: 1, to: 40, move: 'mimic', hp: (f) => 6 + Math.floor(f / 3), dmg: (f) => 5 + Math.floor(f / 2), speed: () => 16, xp: 4, color: '#8a7a6a' },
  mole:  { name: 'Burrow mole', from: 8, to: 35, move: 'burrow', hp: (f) => 5 + Math.floor(f / 4), dmg: (f) => 6 + Math.floor(f / 2), speed: () => 34, xp: 5, color: '#6a5040' },
  puff:  { name: 'Soot puffs', from: 40, to: 80, move: 'swarm', pack: [4, 5], hp: (f) => 2 + Math.floor(f / 10), dmg: (f) => 4 + Math.floor(f / 5), speed: () => 42, xp: 3, color: '#3d3833' },
  // v254 (85d2): the same three ways in the deep dungeons. Stats beside their dungeon's other kinds (the magma
  // sprite and ember golem in the Vent, the sand wraith in the Cavern). Stardew: lava lurks, dust sprites deeper down.
  lurker:    { name: 'Lava lurker', from: 0, ventOnly: true, move: 'burrow', hp: (f) => 40 + Math.floor(f / 4), dmg: (f) => 26 + Math.floor(f / 5), speed: () => 40, xp: 40, color: '#a8352a' },
  dustdevil: { name: 'Dust devils', from: 0, cavernOnly: true, move: 'swarm', pack: [4, 5], hp: (f) => 8 + Math.floor(f / 10), dmg: (f) => 10 + Math.floor(f / 10), speed: () => 46, xp: 8, color: '#c9a36a' },
  ashswarm:  { name: 'Ash swarm', from: 0, ventOnly: true, move: 'swarm', pack: [4, 5], hp: (f) => 12 + Math.floor(f / 10), dmg: (f) => 14 + Math.floor(f / 8), speed: () => 46, xp: 10, color: '#6a5a58' },
});

// v255 (roadmap 85e1): shooters (Stardew's shooting mages and squid kids). A shooter keeps between SHOOT.near and
// SHOOT.far px from you; every SHOOT.every s it glows for SHOOT.tell s (the tell), then spits a glob at you at
// SHOOT.speed px/s that lasts SHOOT.life s and stops at walls and rocks. A glob hurts as the shooter's own damage. The
// sword's block sends it back, and a glob sent back hits monsters for SHOOT.back times its damage. glow: the glob's colour.
export const SHOOT = { near: 48, far: 96, every: 2.4, tell: 0.45, speed: 95, life: 2, hit: 7, back: 0.75 };
Object.assign(MONSTERS, {
  spitter:     { name: 'Hollow spitter', from: 70, move: 'shoot', hp: (f) => 18 + Math.floor(f / 3), dmg: (f) => 12 + Math.floor(f / 2), speed: () => 20, xp: 18, color: '#5a4a6a', glow: '#b07ae0' },
  sandspitter: { name: 'Sand spitter', from: 0, cavernOnly: true, move: 'shoot', hp: (f) => 26 + Math.floor(f / 4), dmg: (f) => 16 + Math.floor(f / 5), speed: () => 22, xp: 26, color: '#b08a5a', glow: '#e9c46a' },
  cragspitter: { name: 'Crag spitter', from: 0, ventOnly: true, move: 'shoot', hp: (f) => 32 + Math.floor(f / 4), dmg: (f) => 20 + Math.floor(f / 5), speed: () => 22, xp: 32, color: '#4a3a36', glow: '#e9862a' },
});

// v256 (roadmap 85e2): splitters (Stardew's big slimes). A big one hops like a slime and is drawn half again as big;
// when it falls it splits into SPLIT.n small ones of the same kind with SPLIT.hp of its health and SPLIT.xp of its XP,
// which do not split again. Each piece rolls its own loot and counts as a defeat.
export const SPLIT = { n: 2, hp: 0.4, xp: 0.5, scale: 1.5, spread: 8 };
Object.assign(MONSTERS, {
  mossslime:  { name: 'Moss slime', from: 20, to: 60, move: 'split', hp: (f) => 14 + Math.floor(f / 2), dmg: (f) => 8 + Math.floor(f / 2), speed: () => 22, xp: 8, color: '#6a9a3a' },
  emberslime: { name: 'Ember slime', from: 0, ventOnly: true, move: 'split', hp: (f) => 50 + Math.floor(f / 4), dmg: (f) => 24 + Math.floor(f / 5), speed: () => 24, xp: 30, color: '#e07a3a' },
});

// v257 (roadmap 85f): two last ways to fight.
// phase (Stardew's ghosts): drifts through walls and rocks, PHASE.solid s solid then PHASE.faint s faded, when nothing
//   touches it either way; it flickers in the last PHASE.flicker s before it changes.
// armored (Stardew's armored bug): swords and daggers do ARMOR of their damage (Nuno: a quarter); clubs, bombs, the
//   blast ring and globs sent back do it all.
// fly: true lets a swarm fly over walls (the storm wing).
export const PHASE = { solid: 2.2, faint: 1.6, flicker: 0.4 };
export const ARMOR = 0.25;
Object.assign(MONSTERS, {
  wisp:        { name: 'Lantern wisp', from: 50, to: 80, move: 'phase', hp: (f) => 16 + Math.floor(f / 4), dmg: (f) => 10 + Math.floor(f / 2), speed: () => 26, xp: 16, color: '#cfe6f0', glow: '#ffe08a' },
  shade:       { name: 'Tomb shade', from: 0, cavernOnly: true, move: 'phase', hp: (f) => 28 + Math.floor(f / 4), dmg: (f) => 18 + Math.floor(f / 4), speed: () => 28, xp: 28, color: '#5a5070', glow: '#b07ae0' },
  shellback:   { name: 'Shellback', from: 85, move: 'armored', armored: true, hp: (f) => 30 + Math.floor(f / 3), dmg: (f) => 14 + Math.floor(f / 2), speed: () => 14, xp: 24, color: '#7a8a6a' },
  cragshell:   { name: 'Crag shellback', from: 0, ventOnly: true, move: 'armored', armored: true, hp: (f) => 70 + Math.floor(f / 3), dmg: (f) => 28 + Math.floor(f / 5), speed: () => 14, xp: 45, color: '#5a4a44' },
  stormwing:   { name: 'Storm wing', from: 0, ventOnly: true, move: 'swarm', fly: true, pack: [3, 4], hp: (f) => 14 + Math.floor(f / 10), dmg: (f) => 16 + Math.floor(f / 8), speed: () => 50, xp: 12, color: '#3a4a6a' },
});

// v261 (roadmap 85j): seasonal creatures, out after dark in the Wilds and on every farm (Nuno), one kind a season.
// surfaceOnly: never in the dungeons. disguise: a mimic's colour asleep (the gourd lurker is a pumpkin). Stats sit
// beside the Hollow's first floors; Stardew has no counterpart beyond the wilderness farm's night monsters.
Object.assign(MONSTERS, {
  bramble:   { name: 'Bramble sprites', from: 0, surfaceOnly: true, season: 'Spring', move: 'swarm', pack: [3, 4], hp: () => 4, dmg: () => 5, speed: () => 40, xp: 3, color: '#6a8a3a' },
  moth:      { name: 'Firefly moth', from: 0, surfaceOnly: true, season: 'Summer', move: 'fly', hp: () => 6, dmg: () => 6, speed: () => 36, xp: 4, color: '#e9d27a' },
  gourd:     { name: 'Gourd lurker', from: 0, surfaceOnly: true, season: 'Autumn', move: 'mimic', disguise: '#e8862a', hp: () => 10, dmg: () => 6, speed: () => 16, xp: 5, color: '#c86a2a' },
  frostwisp: { name: 'Frost wisp', from: 0, surfaceOnly: true, season: 'Winter', move: 'phase', hp: () => 8, dmg: () => 7, speed: () => 22, xp: 6, color: '#bfe0f2', glow: '#9fd8f0' },
});
// v303: the Duskmarch's creatures (data/duskmarch.js DUSK_CREATURES and NIGHT). wildOnly: only on those maps, never in
// the dungeons; lives: the Bestiary's line. By day the woods: a bristle hog (a charger, beside the tusk boar's first
// floors), thorn wasps (a flying swarm, like the bramble sprites) and the stump lurker (a mimic that sleeps as a stump,
// like the pebble crab). After dark in Mournfield: the grave rattler (a walker, a bone walker's role at about a third
// of its depth), the barrow shambler (slow, tough, hits hard) and the mourning haunt (a phaser like the lantern wisp,
// weaker). Stardew's counterparts by role: its Secret Woods and the Wilderness farm's night monsters, whose strength
// sits beside its early to middle mine floors; stats here sit beside the Hollow's floors 10 to 25.
const WOODS_LINE = 'Lives in Gloamwood and the Tangle, west of the village, by day and night.';
const GRAVE_LINE = 'Rises from the graves of Mournfield, west of the town, after dark.';
Object.assign(MONSTERS, {
  bristle:  { name: 'Bristle hog', from: 0, wildOnly: true, lives: WOODS_LINE, ...charger({ windup: 0.7, rush: 120, time: 0.5, recover: 1 }), hp: () => CHARGE.tough * 7, dmg: () => 8, speed: () => 18, xp: 7, color: '#6a4a32' },
  wasp:     { name: 'Thorn wasps', from: 0, wildOnly: true, lives: WOODS_LINE, move: 'swarm', fly: true, pack: [2, 3], hp: () => 4, dmg: () => 5, speed: () => 44, xp: 3, color: '#d9a83a' },
  stump:    { name: 'Stump lurker', from: 0, wildOnly: true, lives: WOODS_LINE, move: 'mimic', disguise: '#7a5a3a', hp: () => 12, dmg: () => 7, speed: () => 18, xp: 6, color: '#8a6a44' },
  rattler:  { name: 'Grave rattler', from: 0, wildOnly: true, lives: GRAVE_LINE, move: 'walk', hp: () => 18, dmg: () => 12, speed: () => 22, xp: 10, color: '#ddd4bc' },
  shambler: { name: 'Barrow shambler', from: 0, wildOnly: true, lives: GRAVE_LINE, move: 'walk', hp: () => 30, dmg: () => 15, speed: () => 12, xp: 14, color: '#7a9a6a' },
  haunt:    { name: 'Mourning haunt', from: 0, wildOnly: true, lives: GRAVE_LINE, move: 'phase', hp: () => 16, dmg: () => 10, speed: () => 26, xp: 12, color: '#b8c8e0', glow: '#8ae0d0' },
});
export const UNDEAD = ['skeleton', 'wraith', 'rattler', 'shambler', 'haunt'];   // the crusader's enchantment hurts these half as much again

// When they come out (game minutes), and how many: bodies on a farm, on the Wilds; a pack counts its bodies.
export const NIGHTFOLK = { from: 20 * 60, farm: [2, 3], wilds: [3, 4] };

export const MONSTER_COUNT = (f) => Math.min(10, 2 + Math.floor(f / 2));
// v259 (roadmap 85h): busy floors (Stardew's infested floors). From Hollow floor `from`, a floor that is not a fifth
// (the lift's stops) is busy with chance `chance`: `mult` times the usual count, up to `max` bodies, all of one kind
// from the floor's own, and no rock hides the ladder; it opens once every creature on the floor is down.
export const BUSY = { from: 10, chance: 1 / 15, mult: 2.5, max: 18 };
// v260 (roadmap 85i): the challenge brazier at the Wardens' Lodge (Stardew's Shrine of Challenge by role; Nuno: opt-in
// only). While it burns (G.S.brazier) every monster in the Hollow, Sunken Cavern, Ember Vent and Smoke Peak has
// `tougher` times its health and damage, and one in `chance` is an elite: `hp` times its health, `dmg` times its
// damage and `xp` times its XP, a sure sunmote or gloommote, and its rare-drop roll `rare` times as likely.
export const ELITE = { chance: 0.1, tougher: 1.25, hp: 3, dmg: 1.5, xp: 3, rare: 5, essences: ['sunmote', 'gloommote'] };
// Each kill: a small chance of a weapon or ring from the floor's pool (Stardew: monsters rarely drop rings and weapons).
export const RARE_DROP = 0.01;

// Rings (Stardew's: ruby +10% attack, topaz +1 defense, aquamarine crits, jade crit power, vampire healing,
// slime charmer, burglar's double drops, glow ring light). Two worn at once. sell: Stardew's prices.
export const RINGS = {
  emberring: { name: 'Ember ring',  sell: 300, desc: 'Weapons hit 10% harder.' },
  stonering: { name: 'Stone ring',  sell: 300, desc: '1 more defense.' },
  tidering:  { name: 'Tide ring',   sell: 300, desc: 'A tenth more of your hits are critical (double damage).' },
  mossring:  { name: 'Moss ring',   sell: 300, desc: 'Critical hits do half again as much.' },
  leechring: { name: 'Leech ring',  sell: 500, desc: 'Each monster you defeat gives back 2 health.' },
  slimeward: { name: 'Slime ward',  sell: 350, desc: 'Slimes cannot hurt you.' },
  thiefring: { name: "Thief's ring", sell: 500, desc: 'Monsters drop twice as much.' },
  glowring:  { name: 'Glow ring',   sell: 100, desc: 'A wider pool of light in the Hollow.' },
  blastring: { name: 'Blast ring',  sell: 1000, desc: 'Monsters you defeat burst, hurting monsters and breaking rocks around them.' },   // v37: napalm ring
  savagering: { name: 'Savage ring', sell: 1000, desc: 'After each monster you defeat, you move faster for 3 seconds.' },   // v230: Stardew's savage ring, the lodge's reward for 150 Hollow chargers
  bracering:  { name: 'Brace ring',  sell: 750,  desc: 'Your sword holds a block twice as long.' },   // v230: the lodge's reward for 60 vent chargers
  shellring:   { name: 'Shell ring',  sell: 400,  desc: '3 more defense.' },   // v258: Stardew's crabshell ring (+5; ours fitted to the stone ring's +1), the lodge's reward for 60 shellbacks
  umbriteband: { name: 'Umbrite band', sell: 1000, counts: ['emberring', 'glowring'], desc: 'Works as an ember ring and a glow ring at once.' },   // v251 (85b): Stardew's iridium band; counts: the rings it stands for
};
export const RING_ITEMS = Object.fromEntries(Object.entries(RINGS).map(([k, r]) => [k, { name: r.name, sell: r.sell, material: true, ring: true }]));

// The first time you reach these floors you find something (Stardew: treasure on every tenth floor).
export const FLOOR_FINDS = {
  5: 'knife', 10: 'shortsword', 15: 'stonering', 20: 'club', 25: 'saber', 30: 'tunnelboots', 35: 'emberring',
  40: 'cutlass', 45: 'glowring', 55: 'mallet', 60: 'emberboots', 65: 'tidering', 70: 'greatsword', 80: 'deepboots',
};
// Rare drops by depth.
export const DROP_POOL = (f, zone) => (zone === 'cavern' || zone === 'vent' || zone === 'peak' ? ['duneblade', 'leechring', 'thiefring'] : [
  ...(f >= 3 ? ['dirk'] : []), ...(f >= 12 ? ['slimeward', 'mossring'] : []), ...(f >= 30 ? ['leechring', 'thiefring'] : []), ...(f >= 50 ? ['shank'] : []),
]);
