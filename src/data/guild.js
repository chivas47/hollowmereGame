// Combat expansion, part 2 (v37): the Wardens' Lodge in the Wilds, bombs, Hollow treasure chests and geodes.
// Stardew by role, original names: the lodge is the adventurers' guild, Warden Hale its keeper.
import { CHEST_BOOKS } from './books.js';

// The lodge opens once you have been down the Hollow. tile: the cabin's tiles in the Wilds (data/maps.js).
export const LODGE = {
  name: "Wardens' Lodge", keeper: 'Warden Hale',
  look: { skin: '#c99a74', hair: '#8d939a', shirt: '#4f6b3a', pants: '#3f3226', shoes: '#2b211a', beard: true },
  opensAt: 1,   // deepest floor reached
};

// What Hale sells: a weapon or boots, its price and the deepest floor you must have reached.
// Stardew's guild: wooden blade 250, silver saber 750, cutlass 1,500, claymore and wood mallet 2,000; boots 750 to 1,250.
export const LODGE_SHOP = [
  { key: 'club',       cost: 250,  floor: 1 },
  { key: 'dirk',       cost: 500,  floor: 10 },
  { key: 'shortsword', cost: 500,  floor: 10 },
  { key: 'saber',      cost: 750,  floor: 20 },
  { key: 'tunnelboots', cost: 750, floor: 30 },
  { key: 'cutlass',    cost: 1500, floor: 40 },
  { key: 'mallet',     cost: 2000, floor: 50 },
  { key: 'emberboots', cost: 1250, floor: 60 },
  { key: 'greatsword', cost: 2000, floor: 70 },
];

// Slaying goals (Stardew's monster eradication goals): defeat n of a kind, then claim the reward from Hale once.
// Stardew: 1,000 slimes (slime charmer ring), 80 cave insects (insect head), 200 bats (vampire ring),
// 50 skeletons (skeleton mask), 250 serpents (napalm ring).
export const GOALS = {
  slime:    { n: 1000, reward: 'slimeward', label: 'slimes' },
  mite:     { n: 80,   reward: 'mitefang',  label: 'Hollow mites' },
  bat:      { n: 200,  reward: 'leechring', label: 'cave bats' },
  skeleton: { n: 50,   reward: 'bonemask',  label: 'bone walkers' },
  serpent:  { n: 250,  reward: 'blastring', label: 'Hollow serpents' },
  // v38. Stardew: 100 mummies (arcane hat), 50 pepper rex (knight's helmet).
  wraith:   { n: 100,  reward: 'veilhat',   label: 'sand wraiths' },
  rex:      { n: 50,   reward: 'crestedhelm', label: 'scorch rex' },
  // v39. Stardew: 150 magma sprites (a phone for Marlon); ours gives a trinket.
  sprite:   { n: 150,  reward: 'magpie',    label: 'magma sprites' },
};

// Bombs: radius in tiles (Stardew's 3, 5 and 7, fitted to our smaller floors), damage to monsters; you take half.
export const BOMBS = {
  emberbomb: { radius: 2, damage: 15 },
  blastbomb: { radius: 3, damage: 30 },
  greatbomb: { radius: 4, damage: 60 },
};
export const FUSE = 1.6;        // seconds before it goes off
export const BLAST_RING = { radius: 1.5, damage: 12 };   // the blast ring's burst; never hurts you

// Geodes: the chance a broken rock gives one (doubled by the excavator), which kind by floor, what is inside.
// Stardew: about half resources and half minerals; deeper geodes hold rarer gems. [item, chance, min, max]
export const GEODE_CHANCE = 0.015;
export const geodeFor = (floor) => (floor >= 80 ? 'magmageode' : floor >= 40 ? 'frostgeode' : 'geode');
export const CRACK_COST = 25;
export const GEODE_LOOT = {
  geode: [['stone', 0.25, 5, 10], ['copper', 0.15, 3, 5], ['coal', 0.1, 1, 3], ['iron', 0.05, 1, 3], ['quartz', 0.2], ['ambergem', 0.12], ['violet', 0.08], ['tidestone', 0.03], ['heartstone', 0.02]],
  frostgeode: [['stone', 0.15, 5, 10], ['iron', 0.15, 2, 4], ['coal', 0.1, 2, 4], ['quartz', 0.12], ['frosttear', 0.2], ['ambergem', 0.08], ['violet', 0.08], ['tidestone', 0.08], ['heartstone', 0.04]],
  magmageode: [['iron', 0.2, 3, 5], ['coal', 0.1, 2, 5], ['stone', 0.05, 5, 10], ['emberquartz', 0.25], ['quartz', 0.08], ['violet', 0.08], ['tidestone', 0.08], ['heartstone', 0.12], ['starstone', 0.04]],
};

// Treasure chests. Floors in FLOOR_FINDS (data/weapons.js) hold a chest with their find until it is opened.
// From floor 10 any other floor may hold a chest (Stardew's rare treasure floors): what is in it by depth.
export const CHEST_CHANCE = 0.03;
export const CHEST_SPOT = { x: 4, y: 3 };   // the find chest stands by the landing
export const chestLoot = (floor) => [
  [floor >= 80 ? 'magmageode' : floor >= 40 ? 'frostgeode' : 'geode', 2, 4],
  floor >= 110 ? ['umbritebar', 1, 2] : floor >= 80 ? ['goldbar', 1, 3] : [floor >= 40 ? 'ironbar' : 'copperbar', 2, 4],   // v38
  ...(floor >= 100 ? [['duneblade', 1, 1]] : []),
  ['coal', 5, 10],
  [floor >= 60 ? 'blastbomb' : 'emberbomb', 2, 4],
  [floor >= 50 ? 'heartstone' : floor >= 25 ? 'tidestone' : 'violet', 1, 2],
  ...(floor >= 100 ? [[['lanternmoth', 'magpie', 'frostrod', 'toad'][Math.floor(Math.random() * 4)], 1, 1]] : []),   // v39: trinkets
  ...(floor >= 130 ? [['cinder', 8, 15], ['starstone', 1, 1]] : []),
  ...(floor >= 20 ? [[CHEST_BOOKS[Math.floor(Math.random() * CHEST_BOOKS.length)], 1, 1]] : []),   // v40: books
];
