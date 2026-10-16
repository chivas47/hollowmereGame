// v61: special orders (Stardew's special orders board, which goes up outside Pierre's on Fall 2 of year 1).
// Each Monday two orders are offered on the quest board; you take one at a time and hand in what it asks for
// before its time runs out, a few at a time if you like. Stardew's orders pay 1,000g to 3,000g or so and last a week
// or two; completing one earns the asker's thanks (ours: a heart, 100 points).
// item: one item; kind: any item of a kind (systems/festivals.js grangeKind: crop, fruit, forage, fish, animal,
// artisan, dish, mineral).
export const ORDERS = {
  pierfry:   { npc: 'odile',  name: 'Fish for the pier supper', kind: 'fish', n: 10, days: 7, gold: 1500, text: 'The pier supper is in a week. I need ten fish, any kind, and I am not catching them all myself.' },
  honey:     { npc: 'ines',   name: 'Honey for the market', item: 'honey', n: 10, days: 7, gold: 1800, text: 'A buyer from the city wants ten jars of meadow honey. My bees are slow this year.' },
  timber:    { npc: 'bram',   name: 'Hardwood for the bridge', item: 'hardwood', n: 50, days: 14, gold: 2500, text: 'The old footbridge needs new boards. Fifty hardwood, and I will owe you.' },
  barstock:  { npc: 'corvin', name: 'Iron for the forge', item: 'ironbar', n: 10, days: 7, gold: 2500, text: 'Big order from the coast. Ten iron bars. I cannot smelt fast enough alone.' },
  omelets:   { npc: 'hob',    name: 'Eggs for the kitchen', item: 'egg', n: 20, days: 7, gold: 1200, text: 'Omelet week at the Lantern. Twenty eggs, please, and fresh.' },
  remedies:  { npc: 'maren',  name: 'Herbs for the clinic', kind: 'forage', n: 10, days: 7, gold: 1500, text: 'I make my tonics from wild things. Ten of anything you forage, please.' },
  samples:   { npc: 'tavi',   name: 'Stones for the survey', kind: 'mineral', n: 5, days: 14, gold: 2500, text: 'I am mapping the Hollow\'s seams. Five gems, any kind, so I can mark where they come from.' },
  garden:    { npc: 'pell',   name: 'Vegetables for the school', kind: 'crop', n: 30, days: 7, gold: 1500, text: 'The children are learning to cook. Thirty vegetables, whatever you grow.' },
  stilllife: { npc: 'esme',   name: 'Fruit for a still life', kind: 'fruit', n: 15, days: 7, gold: 1500, text: 'I want a table heaped with fruit to paint. Fifteen pieces. I promise to eat them after.' },
  hull:      { npc: 'rook',   name: 'Gel for the hull', item: 'gel', n: 50, days: 7, gold: 1500, text: 'Slime gel makes a fine seal for a boat. Fifty of it, if you can stand the smell.' },
};
export const ORDER_POINTS = 100;   // friendship with the asker
export const ORDERS_FROM = 57;     // Autumn 1 of year 1: the board's orders start (Stardew: Fall 2)
export const ORDERS_OFFERED = 2;
