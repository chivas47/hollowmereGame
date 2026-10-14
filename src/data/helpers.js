// v32: helper huts, waystones, the home charm and the farm cave. Stardew counterparts by role, original names.
// Helper hut (Stardew: Junimo hut 20,000g, 200 stone, 100 fiber, 9 starfruit): small spirits harvest ripe crops
// within 8 tiles each morning, not in winter, and keep them in the hut.
export const HELPER_HUT = {
  cost: 20000, needs: { stone: 200, fiber: 100, gleamfruit: 9 }, footprint: { w: 2, h: 2 }, reach: 8,
  desc: 'Little spirits harvest ripe crops within 8 tiles every morning (not in winter) and keep them in the hut.',
};
// Waystones (Stardew: obelisks 500,000g with iridium bars and beach or mine materials; iron bars and stone or gems here).
export const WAYSTONES = {
  wayhollow:  { cost: 500000, needs: { ironbar: 10, quartz: 10 }, footprint: { w: 1, h: 2 }, to: { map: 'wilds', x: 12, y: 3, dir: 'down' },
    desc: 'Touch it to step out by the Hollow, in the Wilds.' },
  wayvillage: { cost: 500000, needs: { ironbar: 5, stone: 100 }, footprint: { w: 1, h: 2 }, to: { map: 'village', x: 11, y: 7, dir: 'down' },
    desc: 'Touch it to step out by the village fountain.' },
};
// The home charm (Stardew: warp totem, farm; 1 hardwood, 1 honey, 20 fiber) takes you home and is used up.
export const HOME = { map: 'farm', x: 3, y: 5, dir: 'down' };
// The farm cave (Stardew: Demetrius offers it once you have earned 25,000g; fruit bats or mushroom boxes).
export const CAVE = {
  opensAt: 25000,
  mouth: { x: 8, y: 0 },          // the tile in the farm's north edge
  inside: { x: 11, y: 11, dir: 'up' },
  bats: { chance: 0.6, max: 3 },  // each morning: up to 3 fruit, each 60%
  logs: { count: 6, chance: 0.5 },  // six mushroom logs, each 50% a mushroom each morning
};
