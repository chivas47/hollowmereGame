// v160 (roadmap 75d): the mere, the lake the valley is named for, east of the village's lower lane. Nuno's picks
// (October 2026): it joins the village's south-east corner, has one fish a season, and the boathouse is a dock to
// fish from until its keeper comes with the new neighbours (75e); the lakeside homes go up with their people.
export const MERE = {
  size: { w: 40, h: 28 },
  lake: { cx: 24, cy: 11, rx: 12, ry: 7 },     // the open water, an ellipse
  boathouse: { x: 14, y: 17 },                  // 3 x 2, shut until 75e
  dock: { x: 17, from: 14, to: 19 },            // out over the water from the boathouse
  shut: 'The boathouse is shut. Garrow keeps it 9:00 to 17:00, every day but Thursday.',
  cottages: [[4, 18], [30, 19]],                // v161: Ysolde's and Ferran's (data/homes.js)
  // v161 (roadmap 75e): Garrow's counter. Stardew's fish shop (Willy) by role: bait 5g, tackle 500g to 750g, the
  // crab pot 1,500g; refit to our tackle's sell values (2.5x to 3x, Stardew's buy-to-sell gap).
  shop: { open: 9 * 60, close: 17 * 60, closedDay: 3, keeper: 'Garrow' },   // closedDay: (day - 1) % 7, 3 = Thursday
  stock: [
    { item: 'bait', n: 10, price: 50 },
    { item: 'trapbob', n: 1, price: 500 }, { item: 'leadbob', n: 1, price: 500 },
    { item: 'spinner', n: 1, price: 600 }, { item: 'corkbob', n: 1, price: 600 },
    { item: 'treasurer', n: 1, price: 750 },
    { item: 'crabpot', n: 1, price: 1500, kit: true },   // a placeable: it goes to the kit
  ],
};
