// Fishing overhaul, part 1 (v41): the catch minigame, bait, tackle, bobber styles, treasure and trash.
// Stardew by role, original names.

// The catch bar (Stardew's bobber bar): hold Use to lift your bar, let go and it falls; keep the fish inside it
// until the meter fills. Units are pixels of the TRACK; times in seconds.
export const CATCH = {
  track: 120,                 // height of the water column
  bar: 28,                    // your bar's base height (Stardew: 96 of 568, a sixth; ours a little more for 120 px)
  perLevel: 1.5,              // + per fishing level (Stardew: +8 of 568 a level)
  lift: 240, fall: 260, maxSpeed: 140, bounce: 0.35,
  start: 0.3, gain: 0.22, drain: 0.3,  // meter: where it starts, filled a second with the fish inside, drained outside
  fishSpeed: (d) => 50 + d * 28,       // how fast the fish swims at difficulty d
  fishPause: (d) => 0.9 - d * 0.13,    // seconds between its moves
  dart: 3,                    // from this difficulty fish dart: sudden long moves (Stardew's dart behaviour)
  // Tuned so a player who reacts every quarter second lands about 80% of easy fish and a third of the hardest
  // (tools/balance.mjs plays it that way), near Stardew's feel.
  treasure: 0.15, treasureGain: 0.5,   // chance of a chest in the column (Stardew: about 15%), fill rate inside the bar
};

// Bait: crafted, used up one per cast; needs the ashwood rod or better (Stardew: the fiberglass rod).
// Stardew: bait (1 bug meat for 5) halves the wait; wild bait (fiber, slime, bug meat) sometimes doubles the catch.
export const BAIT = {
  bait:     { name: 'Bait',      sell: 1, desc: 'Fish bite in half the time.', wait: 0.5 },
  wildbait: { name: 'Wild bait', sell: 15, desc: 'Fish bite sooner, and a quarter of catches come in pairs.', wait: 0.75, double: 0.25 },
};
// Tackle: fixed to the rod, wears out after 20 catches (Stardew); needs the ironwood rod (Stardew: the iridium rod).
export const TACKLE = {
  spinner:   { name: 'Spinner',         sell: 250, desc: 'Fish bite a quarter sooner.' },
  corkbob:   { name: 'Cork bobber',     sell: 250, desc: 'A quarter bigger catch bar.' },
  trapbob:   { name: 'Trap bobber',     sell: 200, desc: 'The meter drains a third slower when the fish escapes the bar.' },
  leadbob:   { name: 'Lead bobber',     sell: 200, desc: 'Your bar no longer bounces at the bottom.' },
  treasurer: { name: 'Treasure hunter', sell: 250, desc: 'Treasure turns up more and its meter never drains.' },
};
export const TACKLE_USES = 20;
export const ANGLING_ITEMS = Object.fromEntries([...Object.entries(BAIT), ...Object.entries(TACKLE)]
  .map(([k, t]) => [k, { name: t.name, sell: t.sell, material: true, [BAIT[k] ? 'bait' : 'tackle']: true }]));

// Bobber styles (Stardew 1.6): cosmetic; a new one every 25 fish caught.
export const BOBBERS = [
  { name: 'Red and white', top: '#f4ead2', body: '#d8484a' },
  { name: 'Reed green',    top: '#e9c46a', body: '#5d8a4a' },
  { name: 'Pond blue',     top: '#f4ead2', body: '#3d6a8f' },
  { name: 'Ember',         top: '#ffd98a', body: '#e9862a' },
  { name: 'Violet',        top: '#f4ead2', body: '#8a5aa8' },
  { name: 'Midnight',      top: '#e9c46a', body: '#2b2a2e' },
];
export const BOBBER_EVERY = 25;

// Trash (Stardew: driftwood, soggy newspaper, broken glasses, broken CD, joja cola): caught instead of a fish
// TRASH_CHANCE of the time, at once and without the minigame. The recycler turns it into something useful.
export const TRASH = {
  driftwood: { name: 'Driftwood',     sell: 0 },
  wetpaper:  { name: 'Sodden letter', sell: 0 },
  glass:     { name: 'Broken glass',  sell: 0 },
  oldboot:   { name: 'Old boot',      sell: 0 },
};
export const TRASH_ITEMS = Object.fromEntries(Object.entries(TRASH).map(([k, t]) => [k, { name: t.name, sell: t.sell, trash: true }]));
export const TRASH_CHANCE = 0.08;
// Stardew's recycling machine: driftwood -> wood or coal, newspaper -> cloth or torch, glass -> refined quartz, trash -> stone, coal or ore.
export const RECYCLE = {
  driftwood: [['wood', 0.75], ['coal', 0.25]],
  wetpaper:  [['fiber', 0.9], ['cloth', 0.1]],
  glass:     [['quartz', 1]],
  oldboot:   [['stone', 0.5], ['coal', 0.3], ['iron', 0.2]],
};

// Fishing treasure (Stardew: bait, ores, coal, geodes, gems, rarely rings and books): [item, chance, min, max].
export const FISH_TREASURE = [
  ['bait', 0.2, 5, 10], ['coal', 0.15, 2, 5], ['copper', 0.12, 3, 8], ['iron', 0.1, 3, 6], ['geode', 0.12, 1, 3],
  ['frostgeode', 0.06, 1, 2], ['quartz', 0.08, 1, 3], ['tidestone', 0.05, 1, 1], ['bk_fishing', 0.06, 1, 1],
  ['wildbait', 0.04, 3, 5], ['tidering', 0.02, 1, 1],
];

// ---- v42: crab pots, legendary fish, the gold pan ----
// Crab pots (Stardew: 40 wood and 3 iron bars; baited, each morning a catch; Stardew's freshwater pot finds
// crayfish, snails and periwinkles, and trash now and then). Placed on the Wilds pond.
export const POT_CATCH = [['crayfish', 0.35], ['snail', 0.3], ['winkle', 0.2], ['trash', 0.15]];
export const LEGEND_CHANCE = 0.05;   // a bite is the season's legend this often, once you qualify
export const BAIT_PRICE = 5;         // Stardew's fish shop sells bait for 5g
// The gold pan (Stardew 1.6: copper pan, upgraded to steel, gold and iridium for more finds). Shimmering spots
// turn up in the pond some days; panning one costs PAN.energy and rolls PAN.loot once per pan level (+1).
export const PAN = {
  energy: 4, spotChance: 0.5, again: 0.3,
  loot: [['copper', 0.35, 3, 8], ['iron', 0.25, 2, 6], ['coal', 0.15, 2, 5], ['gold', 0.12, 1, 4], ['quartz', 0.08, 1, 2], ['umbrite', 0.03, 1, 2], ['geode', 0.02, 1, 1]],
};
