// v145: a festival crowd. Instead of one spot from open to close, neighbours drift between places in the square
// (systems/crowd.js plans who stands where, and when): pairs who stop to chat, the fountain rim, the festival
// table, the notices by the quest board and, on dance day, the ring round the ribbon pole. Each place is a tile in
// the village and the way they face there. only: kinds of festival it is used on; not: kinds it is left out of.
// mood: an emote they show now and then while standing there.
export const STATIONS = [
  // pairs that face each other, for a chat
  { at: [8, 6], face: 'right' }, { at: [9, 6], face: 'left' },
  { at: [14, 6], face: 'right' }, { at: [15, 6], face: 'left' },
  { at: [16, 8], face: 'right' }, { at: [17, 8], face: 'left' },
  { at: [19, 8], face: 'right' }, { at: [20, 8], face: 'left' },
  { at: [8, 10], face: 'right' }, { at: [9, 10], face: 'left' },
  { at: [16, 10], face: 'right' }, { at: [17, 10], face: 'left' },
  { at: [4, 9], face: 'right' }, { at: [5, 9], face: 'left' },
  { at: [18, 5], face: 'down' }, { at: [18, 6], face: 'up' },
  // the fountain rim, looking at the water (the west side is the ribbon pole's on dance day)
  { at: [10, 8], face: 'right', not: ['dance'] }, { at: [10, 9], face: 'right', not: ['dance'] },
  { at: [13, 8], face: 'left' }, { at: [13, 9], face: 'left' },
  { at: [11, 10], face: 'up' }, { at: [12, 10], face: 'up' }, { at: [11, 7], face: 'down' },
  // round the festival table; the front of it is left free for you
  { at: [12, 11], face: 'right' }, { at: [15, 11], face: 'left' },
  // reading the notices
  { at: [11, 6], face: 'up' }, { at: [12, 6], face: 'up' },
  // the ring round the ribbon pole
  { at: [9, 8], face: 'right', mood: 'happy', only: ['dance'] }, { at: [9, 9], face: 'right', mood: 'happy', only: ['dance'] },
  { at: [10, 7], face: 'down', mood: 'happy', only: ['dance'] }, { at: [10, 10], face: 'up', mood: 'happy', only: ['dance'] },
  { at: [8, 8], face: 'right', mood: 'happy', only: ['dance'] }, { at: [8, 9], face: 'right', mood: 'happy', only: ['dance'] },
];

// Some neighbours have a job at a festival and keep to it. Keyed by festival kind ('*': every festival).
// at: one tile all day; roam: a loop they walk round all day (Kit hunting eggs).
export const ROLES = {
  '*': { lio: { at: [12, 7], face: 'down', mood: 'happy' } },   // Lio fiddles by the fountain
  pot: { hob: { at: [12, 11], face: 'right' } },                 // Hob stirs and tastes the soup
  market: { hob: { at: [15, 11], face: 'left' } },               // and keeps the stall at Frostlight
  hunt: { kit: { roam: [[3, 6], [20, 6], [20, 10], [12, 13], [3, 10]] } },
};

// Minutes at one place before moving on (rounded to `step`), and how much more likely a chat spot is
// when someone already stands next to it.
export const CROWD = { stayMin: 40, stayMax: 110, step: 10, company: 3, friend: 12 };   // v149: friend, beside a friend (data/friends.js)

// Two neighbours standing still side by side turn to each other and talk (anywhere, any day): one of them shows
// a chat bubble about once every `every` seconds.
export const CHAT = { every: 5 };
