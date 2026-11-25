// Combat expansion, part 1 (v36): weapons, rings and mine boots. Stardew by role, original names. The creatures are in data/monsters.js.
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
  gravewarden: { name: 'Gravewarden blade', kind: 'sword', damage: 21, undead: 1.5 },   // 97a: bone sword 20-30, from Mournfield's crypt; half again against the dead
};

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
