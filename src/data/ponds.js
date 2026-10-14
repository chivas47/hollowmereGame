// Fish ponds and the slime pen (v31). Stardew scale: the fish pond costs 5,000g, 200 stone, 5 seaweed and 5 green
// algae (fiber stands in for both); a pond starts with room for 3 fish and grows to 5, 7 and 10 as you bring what it
// asks for. Roe sells for 30g plus half the fish; aged roe (the brine crock) for twice the roe. The slime hutch costs
// 10,000g, 500 stone, 10 refined quartz and an iridium bar (ours: Hollow quartz and an iron bar) and holds 20 slimes.
import { FISH } from './fish.js';

export const POND = {
  cost: 5000, needs: { stone: 200, fiber: 10 }, footprint: { w: 3, h: 3 },
  desc: 'Raise one kind of fish. They multiply and leave roe; bring what the pond asks for and it holds more.',
  caps: [3, 5, 7, 10],
  // Nights between new fish: cheap fish breed fast, rare ones slowly (Stardew: 1 to 5 days by fish).
  spawnEvery: (sell) => (sell < 50 ? 2 : sell < 100 ? 3 : sell < 200 ? 4 : 5),
  roeChance: (n) => Math.min(0.95, 0.15 + 0.08 * n),   // each night, more fish, more roe
  asks: [   // one of these at each full step, picked at random
    [{ fiber: 10 }, { stone: 25 }, { coal: 3 }],
    [{ copperbar: 2 }, { gel: 20 }, { quartz: 2 }],
    [{ ironbar: 2 }, { violet: 1 }, { stormcell: 1 }],
  ],
};

export const SLIME_PEN = {
  cost: 10000, needs: { stone: 500, quartz: 10, ironbar: 1 }, footprint: { w: 4, h: 3 },
  desc: 'A fenced pen for up to 20 slimes, hatched from slime eggs. Fill the trough with the can; slimes leave gel.',
  room: 20,
  ballChance: 0.25,   // each slime, on a night the trough was full
  gel: [10, 20],      // gel in a slime ball
};

export const PONDS_ITEMS = {
  ...Object.fromEntries(Object.entries(FISH).map(([k, f]) => [`roe_${k}`, { name: `${f.name} roe`, sell: 30 + Math.floor(f.sell / 2) }])),
  slimeegg: { name: 'Slime egg', sell: 1000 },   // Stardew: green slime egg
};
export const AGED_ROE = Object.fromEntries(Object.entries(FISH).map(([k, f]) => [`aged_${k}`, { name: `Aged ${f.name.toLowerCase()} roe`, sell: 2 * (30 + Math.floor(f.sell / 2)), artisan: true }]));
