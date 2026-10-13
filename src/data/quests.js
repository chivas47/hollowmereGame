// Quest board requests. A request asks for n of one item for a neighbour, pays gold and friendship.
export const QUEST = {
  max: 3,              // open requests on the board at once
  lasts: 5,            // days a request stays up
  markup: 1.4,         // reward = sell value x n x markup + base, rounded to 5g
  base: 25,
  friendship: 50,      // points for the neighbour who asked
  maxFishDifficulty: 3,
};

// What each neighbour's request note says. {n} {item} are filled in.
export const QUEST_NOTES = {
  ines:  'Ines: Could someone spare {n} {item}? For the kitchen, not the bees.',
  bram:  'Bram: Need {n} {item}. Will pay fair. Leave them with me.',
  odile: 'Odile: Looking for {n} {item} before my next trip south.',
  tavi:  'Tavi: Wanted, {n} {item}, for a map legend I am drawing. Truly.',
};
