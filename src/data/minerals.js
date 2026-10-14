// Mine drops. material: true means the shipping bin keeps it for upgrades instead of selling it.
export const MINERALS = {
  stone:  { name: 'Stone',      sell: 2,  material: true },
  copper: { name: 'Copper ore', sell: 5, material: true },
  iron:   { name: 'Iron ore',   sell: 10, material: true },
  gel:    { name: 'Slime gel',  sell: 5 },
  // v26: smelted at the furnace (Stardew: 5 ore + 1 coal a bar; bars sell 60 and 120; coal 15).
  coal:      { name: 'Coal',       sell: 15,  material: true },
  copperbar: { name: 'Copper bar', sell: 60,  material: true },
  ironbar:   { name: 'Iron bar',   sell: 120, material: true },
  // v38: gold and umbrite (Stardew: gold ore 25g, gold bar 250g; iridium ore 100g, iridium bar 1,000g).
  gold:       { name: 'Gold ore',     sell: 25,   material: true },
  goldbar:    { name: 'Gold bar',     sell: 250,  material: true },
  umbrite:    { name: 'Umbrite ore',  sell: 100,  material: true },
  umbritebar: { name: 'Umbrite bar',  sell: 1000, material: true },
  // v27 gems from Hollow rocks (Stardew: quartz 25g, amethyst 100g); the gem copier copies them.
  quartz:    { name: 'Hollow quartz', sell: 25,  gem: true },
  violet:    { name: 'Violet stone',  sell: 100, gem: true },
  // v37: gems from geodes (Stardew: topaz 80, frozen tear 75, fire quartz 100, aquamarine 180, ruby 250, diamond 750).
  ambergem:    { name: 'Hollow amber', sell: 80,  gem: true },
  frosttear:   { name: 'Frost tear',   sell: 75,  gem: true },
  emberquartz: { name: 'Ember quartz', sell: 100, gem: true },
  tidestone:   { name: 'Tidestone',    sell: 180, gem: true },
  heartstone:  { name: 'Heartstone',   sell: 250, gem: true },
  starstone:   { name: 'Starstone',    sell: 750, gem: true },
  // v37: geodes from Hollow rocks, cracked at Bram's workbench (Stardew: geode 50g on floors 1 to 39, frozen geode 100g
  // on 40 to 79, magma geode 150g from 80; cracking costs 25g).
  geode:      { name: 'Geode',        sell: 50,  geode: true },
  frostgeode: { name: 'Frost geode',  sell: 100, geode: true },
  magmageode: { name: 'Magma geode',  sell: 150, geode: true },
};
// v28: the two hatch-only eggs turn up in rocks too (Stardew finds them as island and mine treasures).
export const GEM_DROPS = [['mossegg', 0.001], ['bigegg', 0.003], ['violet', 0.007], ['quartz', 0.02]];   // chance per broken rock, rarest first
// Each stone rock has this chance of giving a piece of coal too.
export const COAL_FROM_STONE = 0.06;

// Rock tiles in the mine: tile code -> what it drops and how many pickaxe hits it takes.
export const ROCKS = {
  r: { item: 'stone',  hp: 1, amount: [1, 2], ore: null },
  c: { item: 'copper', hp: 2, amount: [1, 2], ore: '#d0874a' },
  i: { item: 'iron',   hp: 3, amount: [1, 2], ore: '#c9ccd6' },
  '%': { item: 'gold',    hp: 4, amount: [1, 2], ore: '#e9c46a' },   // v38
  '*': { item: 'umbrite', hp: 6, amount: [1, 2], ore: '#9a7ae0' },   // v38
};

// Slimes get tougher every floor; colour changes at floors 6 and 11.
export const SLIME = {
  hp: (floor) => 3 + Math.floor(floor / 3),
  damage: (floor) => 6 + floor,
  speed: (floor) => 18 + Math.min(20, floor * 2),
  count: (floor) => Math.min(8, 2 + Math.floor(floor / 2)),
  colors: ['#7fbf5a', '#5fa8d3', '#a070c8'],
  drop: 'gel', dropChance: 0.6,
};
export const SWORD_DAMAGE = 3;
