// Clearing the farm: debris, wild trees and the materials they drop. Values follow the Stardew scale:
// 2 energy a swing, a tree takes 10 axe swings and gives about 12 wood, large stumps need the copper axe.
// Materials (material: true) stay in the bag for crafting and are never shipped.
export const WOODS = {
  wood:     { name: 'Wood',     sell: 2,  material: true },
  hardwood: { name: 'Hardwood', sell: 15, material: true },
  fiber:    { name: 'Fiber',    sell: 1,  material: true },
};

export const SWING = 2;   // energy per swing of the axe, pickaxe or hoe

// Debris on the farm. tools: what clears it (the sword cuts weeds for free, like a scythe).
// hp: swings at axe power 1. axe: the axe upgrade tier needed (1 = copper). drops: item -> [min, max].
export const DEBRIS = {
  weeds: { name: 'Weeds',       tools: ['sword', 'hoe', 'axe', 'pick'], hp: 1, drops: { fiber: [1, 1] } },
  stone: { name: 'Stone',       tools: ['pick'], hp: 1, drops: { stone: [1, 2] } },
  twig:  { name: 'Twig',        tools: ['axe'],  hp: 1, drops: { wood: [1, 2] } },
  stump: { name: 'Large stump', tools: ['axe'],  hp: 10, axe: 1, drops: { hardwood: [2, 2] } },
  // Wild trees (kind 'alder'): stage 0 seed, 1 to 3 young, 4 grown. A felled tree leaves a stump.
  alder: { name: 'Alder',       tools: ['axe'],  hp: 10, drops: { wood: [10, 14] } },
  alderstump: { name: 'Alder stump', tools: ['axe'], hp: 5, drops: { wood: [2, 4] } },
};

export const ALDER = {
  stages: 4,          // nights of luck to grow up: each night a young tree has GROW chance to grow a stage
  grow: 0.2,          // Stardew: 20% a night, never in winter
  seedChance: 0.5,    // a felled tree drops an alder cone half the time
  spread: 0.05,       // a grown tree seeds a free tile nearby 5% of nights
  maxTrees: 20,
};

// Debris that appears overnight on free farm grass (Stardew: weeds and stones creep back in).
export const CREEP = { perNight: 2, chance: 0.6, cap: 30, weights: { weeds: 6, stone: 3, twig: 2 } };

// Starting clutter. new: a new farm. old: saves from before v19 get a lighter grove.
export const START_CLUTTER = {
  new: { alder: 8, stump: 3, weeds: 25, stone: 15, twig: 10 },
  old: { alder: 4, stump: 1, weeds: 6, stone: 4, twig: 4 },
};
