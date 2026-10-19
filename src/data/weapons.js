// Combat expansion, part 1 (v36): weapons, the Hollow's monsters, rings and mine boots. Stardew by role, original names.
// Weapon damage is Stardew's average damage scaled to our old blade (Stardew's rusty sword, 2 to 5, is our 3).
// kind: sword (balanced), dagger (fast, weak, short reach), club (slow, strong, long reach, heavy knockback).
export const WEAPON_KINDS = {
  sword:  { cooldown: 0.3,  reach: 16, knock: 160 },
  dagger: { cooldown: 0.16, reach: 13, knock: 90 },
  club:   { cooldown: 0.6,  reach: 18, knock: 260 },
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
// move: hop (slimes), crawl, fly (ignores walls), walk. hp, dmg, speed by floor; xp: combat XP; drop: [item, chance].
export const MONSTERS = {
  slime:    { name: 'Slime',       from: 1,  move: 'hop',   hp: (f) => 3 + Math.floor(f / 3),  dmg: (f) => 6 + f,  speed: (f) => 18 + Math.min(20, f * 2), xp: 3, drop: ['gel', 0.6] },
  mite:     { name: 'Hollow mite', from: 3,  move: 'crawl', hp: (f) => 2 + Math.floor(f / 5),  dmg: (f) => 4 + Math.floor(f / 2), speed: () => 14, xp: 2, drop: ['fiber', 0.3], color: '#6b4a2b' },
  bat:      { name: 'Cave bat',    from: 12, cavern: true, move: 'fly',   hp: (f) => 4 + Math.floor(f / 4),  dmg: (f) => 7 + f,  speed: (f) => 34 + Math.min(16, f), xp: 6, drop: ['coal', 0.2], color: '#4a3b5a' },
  skeleton: { name: 'Bone walker', from: 30, cavern: true, move: 'walk',  hp: (f) => 12 + Math.floor(f / 3), dmg: (f) => 10 + f, speed: () => 22, xp: 15, drop: ['iron', 0.3], color: '#e8e0d0' },
  // v38. cavern: also lives in the Sunken Cavern; cavernOnly: only there (Stardew's mummies and pepper rex).
  wraith:   { name: 'Sand wraith', from: 0, cavernOnly: true, move: 'walk', hp: (f) => 30 + Math.floor(f / 3), dmg: (f) => 18 + Math.floor(f / 4), speed: () => 18, xp: 25, drop: ['cloth', 0.1], color: '#d9c39a' },
  rex:      { name: 'Scorch rex',  from: 0, cavernOnly: true, vent: true, move: 'fly',  hp: (f) => 22 + Math.floor(f / 4), dmg: (f) => 20 + Math.floor(f / 4), speed: () => 40, xp: 30, drop: ['coal', 0.4], color: '#c8352f' },
  // v39. vent: also in the Ember Vent; ventOnly: only there (Stardew's magma sprites and lava lurks).
  sprite:   { name: 'Magma sprite', from: 0, ventOnly: true, move: 'fly',  hp: (f) => 30 + Math.floor(f / 4), dmg: (f) => 24 + Math.floor(f / 5), speed: () => 46, xp: 35, drop: ['cinder', 0.5], color: '#e9862a' },
  golem:    { name: 'Ember golem',  from: 0, ventOnly: true, move: 'walk', hp: (f) => 60 + Math.floor(f / 2), dmg: (f) => 28 + Math.floor(f / 5), speed: () => 14, xp: 45, drop: ['cinder', 0.8], color: '#5a3a30' },
  serpent:  { name: 'Hollow serpent', from: 50, cavern: true, vent: true, move: 'fly', hp: (f) => 20 + Math.floor(f / 2), dmg: (f) => 15 + f, speed: () => 44, xp: 20, drop: ['violet', 0.05], color: '#5f8a4a' },
};
export const MONSTER_COUNT = (f) => Math.min(10, 2 + Math.floor(f / 2));
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
