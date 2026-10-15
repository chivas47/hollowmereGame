// Family (v53). Stardew by role: a married couple with the nursery (our second farmhouse upgrade) and 10+ hearts may
// be asked at bedtime about a child; a yes brings a baby 14 days later. Up to two children: a baby in the crib, a
// crawler from 13 days, a toddler from 27 days. Divorce at the town hall (Stardew: 50,000g at the mayor's), and the
// roommate: the Lamplighter (Stardew's Krobus) moves in for a shadow lantern (Stardew: void ghost pendant, 200,000g).
export const CHILD = { hearts: 10, houseTier: 2, askChance: 0.05, days: 14, max: 2, crawl: 13, toddler: 27, hug: 10 };
export const CHILD_NAMES = ['Ash', 'Bee', 'Clem', 'Dory', 'Elm', 'Fen', 'Gil', 'Hazel', 'Iver', 'June', 'Kip', 'Linnet'];
export const DIVORCE = { cost: 50000 };
export const ROOMMATE = { id: 'lamp', item: 'shadowlantern', cost: 200000, hearts: 10 };
export const FAMILY_ITEMS = { shadowlantern: { name: 'Shadow lantern', sell: 0 } };
export const HALL = { name: 'Town hall', keeper: 'the clerk', open: 9 * 60, close: 17 * 60 };
