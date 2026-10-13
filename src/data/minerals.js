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
};
// Each stone rock has this chance of giving a piece of coal too.
export const COAL_FROM_STONE = 0.06;

// Rock tiles in the mine: tile code -> what it drops and how many pickaxe hits it takes.
export const ROCKS = {
  r: { item: 'stone',  hp: 1, amount: [1, 2], ore: null },
  c: { item: 'copper', hp: 2, amount: [1, 2], ore: '#d0874a' },
  i: { item: 'iron',   hp: 3, amount: [1, 2], ore: '#c9ccd6' },
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
