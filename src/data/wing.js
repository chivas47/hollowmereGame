// v108: the town reacts to the old wing (data/restoration.js). Until the workroom is restored the hall's windows are
// boarded and rubble lies beside it; each room then changes something you can see. On the rival route the wing is
// fixed in Ashgrove's style instead (grey paint, the company board, crates), with no planter, flowers or bunting.
// The boiler room, restored or bought, opens the cart line (Stardew's minecarts): free rides between three stops.
// Positions are tiles; the hall is the town's storefront.hall object.
export const HALL = { map: 'town', x: 9, y: 1 };
export const WING_SPOTS = {
  rubble: { map: 'town', x: 7, y: 1 },      // until the workroom
  planter: { map: 'town', x: 12, y: 1 },    // the larder (or Ashgrove's crates there)
  plaque: { map: 'town', x: 13, y: 3 },     // all five rooms, restored
  fountain: { map: 'village', x: 11, y: 8 },   // the fish tank: the fountain runs
};
export const PLAQUE = 'The old wing of Hollowmere Hall, restored by the people of the valley and {name} of {farm} Farm.';

// The cart line. Each stop: where the cart stands (solid once open) and where a ride sets you down, facing it.
export const WING = 'Ž';   // the wing's props on the ground: rubble, planter or crates, plaque (solid)
export const CART = 'Ç';
export const CART_ROOM = 'boiler';
export const CART_STOPS = {
  town: { name: 'Hollowmere Town', map: 'town', x: 8, y: 2, arrive: [8, 3, 'up'] },
  hollow: { name: 'The Hollow', map: 'wilds', x: 9, y: 3, arrive: [9, 4, 'up'] },
  quarry: { name: 'The quarry', map: 'quarry', x: 2, y: 6, arrive: [2, 7, 'up'] },
};
