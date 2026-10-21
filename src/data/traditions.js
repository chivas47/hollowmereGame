// v110: local traditions, the village's customs outside the festival calendar (systems/traditions.js).
//
// The wishing stone: once a day, touch the old stone east of the square for one blessing that lasts until bed.
// Stardew 1.6's Statue of Blessings (one random blessing a day, free), refitted to our own buffs: a blessing is
// a buff (data/cooking.js BUFF) at a good dish's strength, or energy back like warm cider, or talks that count double
// like a festival's. Its tile turns solid when a game loads, only on open grass.
export const STONE_TILE = 'Ӂ';
export const STONE = { map: 'village', x: 20, y: 6 };
export const BLESSINGS = [
  { id: 'luck', name: 'the hare', buff: { luck: 2 }, text: 'Luck +2 until bed.' },
  { id: 'speed', name: 'the swift', buff: { speed: 1 }, text: 'Speed +1 until bed.' },
  { id: 'fangs', name: 'the boar', buff: { attack: 2 }, text: 'Attack +2 until bed.' },
  { id: 'shell', name: 'the tortoise', buff: { defense: 2 }, text: 'Defense +2 until bed.' },
  { id: 'kin', name: 'the hearth', buff: { talk: 1 }, text: 'Talks count double until bed.' },
  { id: 'spring', name: 'the spring', energy: 60, text: '+60 energy.' },
];
export const STONE_LINES = {
  done: 'The stone is still warm from this morning. One blessing a day, the village says.',
  touch: 'You lay a hand on the wishing stone. It hums, very faintly. You feel the blessing of',
};

// The Lantern Float: on the last night of summer the village walks down to Saltreach Beach and sets paper
// lanterns on the sea. Stardew's Dance of the Moonlight Jellies (Summer 28, 22:00 to 24:00, on the beach): a
// gathering to watch, no prize. As at a festival, talks there count double. Face the sea and press Use to set
// your own lantern on the water, once a year.
export const FLOAT = {
  key: 'lanternfloat', name: 'Lantern Float', season: 'Summer', day: 28, map: 'beach',
  hours: { from: 22 * 60, to: 24 * 60 },
  intro: 'Tonight the village sets paper lanterns on the sea at Saltreach Beach, from 10 pm. Face the water to set yours.',
  set: 'You light your lantern and set it on the water. It turns once, then drifts out to join the others.',
  again: 'Your lantern is already out there, somewhere among the others.',
  early: 'The lanterns go on the water at 10 pm, when the whole village is here.',
  spots: { ines: [8, 9], bram: [15, 9], odile: [6, 9], tavi: [17, 9], wren: [9, 8], corvin: [13, 8], hob: [11, 9], maren: [12, 9], hale: [19, 9], lio: [10, 9], pell: [7, 8], juno: [16, 8], nell: [14, 9], rook: [5, 9], esme: [18, 8], kit: [4, 9] },
  lines: {
    ines: 'I fold mine from old seed packets. They float better than you would think.',
    bram: 'I made the first lantern frame here, years ago. Now everyone makes their own. Good.',
    odile: 'The tide takes them west. Every year, the same way. I have stopped asking why.',
    tavi: 'I tried to chart where they go. The sea does not want to be charted.',
    hob: 'One lantern each. Last year someone set out twelve. It looked like a fire.',
    nell: 'My mother set one for me the year I was born. I set one for her now.',
    rook: 'Out past the rocks the current turns. That is where they all go dark.',
    lio: 'No music tonight. It is the one quiet night of the year.',
    esme: 'I can never paint it. The light is gone before the brush is wet.',
    kit: 'Mine is the one with the face on it. It is smiling. Look.',
  },
  drift: 10,   // the village's lanterns on the water
};
export const floatOn = ({ season, d }) => (season === FLOAT.season && d === FLOAT.day ? FLOAT : null);
