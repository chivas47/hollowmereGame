// Economy extras (v69): the travelling cart, the bookseller, the ranch counter, prize tickets and the prize machine,
// mystery boxes. Stardew 1.6 by role, original names.

// The travelling cart (Stardew's: Fridays and Sundays, 6:00 to 20:00, in the forest; ten random goods, each at the
// higher of 100 to 1,000g or three to five times its sell price, a few of each).
export const CART = {
  name: "Odile's Wagon", keeper: 'Odile', days: ['Fri', 'Sun'], open: 6 * 60, close: 20 * 60,
  map: 'forest', at: { x: 12, y: 4 }, goods: 10, minPrice: [100, 1000], mult: [3, 5], stock: [1, 5],
};

// The bookseller (Stardew's visits a few days a season and sells skill books, the Book of Stars and power books).
// Ours comes to town on two days each season. Skill books 5,000g; the primer 15,000g, as at the sewer trader;
// power books 20,000g and not sold again once read.
export const BOOKSELLER = {
  name: 'The Paper Lantern', keeper: 'Quill', days: [5, 19], open: 9 * 60, close: 17 * 60,
  map: 'town', at: { x: 22, y: 10 }, skill: 5000, all: 15000, power: 20000,
};

// The ranch counter in town is a shop in data/town.js (SHOPS.ranch): feed, hay, the pail and shears, and the animals
// themselves; each coop and barn upgrade adds its animals to the stock.

// Prize tickets (Stardew 1.6: one for each finished quest from the board and each special order) and the prize
// machine by the town hall: one ticket a turn, prizes in a fixed order that repeats, like Stardew's.
export const MACHINE = { at: { x: 12, y: 2 } };
export const PRIZES = [
  { key: 'mysterybox', n: 1 }, { key: 'copperbar', n: 5 }, { key: 'frostgeode', n: 3 }, { key: 'mysterybox', n: 2 },
  { key: 'ironbar', n: 5 }, { key: 'tonic', n: 1 }, { key: 'magmageode', n: 3 }, { key: 'mysterybox', n: 3 },
  { key: 'goldbar', n: 3 }, { key: 'starstone', n: 1 },
];

// Mystery boxes (Stardew 1.6: found while working, about one in a few hundred actions, and from the prize machine;
// opened from the bag for a mix of materials, geodes and now and then something rare). Weights out of their sum.
export const MYSTERY = {
  find: 0.004,
  loot: [
    { key: 'coal', n: 5, w: 20 }, { key: 'copper', n: 15, w: 18 }, { key: 'iron', n: 10, w: 14 }, { key: 'geode', n: 3, w: 14 },
    { key: 'frostgeode', n: 2, w: 10 }, { key: 'magmageode', n: 2, w: 6 }, { key: 'hardwood', n: 5, w: 8 },
    { key: 'cloth', n: 1, w: 4 }, { key: 'heartstone', n: 1, w: 3 }, { key: 'starstone', n: 1, w: 1 }, { book: true, n: 1, w: 2 },
  ],
};

export const MARKET_ITEMS = {
  prizeticket: { name: 'Prize ticket', sell: 0, material: true },
  mysterybox:  { name: 'Mystery box',  sell: 0, material: true },
};
