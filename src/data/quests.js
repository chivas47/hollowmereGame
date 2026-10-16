// Quest board requests. A request asks for n of one item for a neighbour, pays gold and friendship.
export const QUEST = {
  max: 3,              // open requests on the board at once
  lasts: 5,            // days a request stays up
  markup: 3,         // reward = sell value x n x markup + base, rounded to 5g
  base: 0,
  friendship: 50,      // points for the neighbour who asked
  maxFishDifficulty: 3,
};

// What each neighbour's request note says. {n} {item} are filled in.
export const QUEST_NOTES = {
  ines:  'Ines: Could someone spare {n} {item}? For the kitchen, not the bees.',
  bram:  'Bram: Need {n} {item}. Will pay fair. Leave them with me.',
  odile: 'Odile: Looking for {n} {item} before my next trip south.',
  tavi:  'Tavi: Wanted, {n} {item}, for a map legend I am drawing. Truly.',
  // v61: the villagers who came later (v49, v50) post requests too.
  wren:   'Wren: {n} {item}, please. Leave them by my door if I am out walking.',
  corvin: 'Corvin: Need {n} {item}. Bring them to the Anvil.',
  hob:    'Hob: The Lantern\'s kitchen is short of {n} {item}. Supper depends on you.',
  maren:  'Doctor Maren: {n} {item} for the clinic, if you can spare them.',
  hale:   'Warden Hale: Requesting {n} {item} for the lodge stores.',
  lio:    'Lio: Could I trade a song for {n} {item}? Or gold. Gold is fine.',
  pell:   'Pell: The schoolroom needs {n} {item} for a lesson. Thank you!',
  juno:   'Juno: {n} {item}, please. I will deliver your thanks myself.',
  nell:   'Nell: My old hands want {n} {item}. Bring them round for tea.',
  rook:   'Rook: {n} {item} for the boat. No rush. Some rush.',
  esme:   'Esme: I need {n} {item} to paint. Do not ask why.',
  kit:    'Kit: I bet you cannot find {n} {item}. Prove me wrong!',
};
