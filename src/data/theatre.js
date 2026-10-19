// Minigames and theatre (v70). Stardew 1.6 by role, original names, films and games.

// The picture house opens on the lane south of the clinic once the old wing is whole, by bundles or by the rival
// (Stardew's movie theater after the Community Center or Joja). Stardew's: 9:00 to 21:00, a ticket 1,000g, one film a
// day for the farmer, each villager once a week. A film loved by a guest is 200 points, liked 100, disliked 0, out of
// 250 a heart; a snack loved 50, liked 25. Ours are 100 a heart, so 80, 40, 0 and 20, 10.
export const THEATRE = {
  name: 'The Starlight Picture House', at: { x: 11, y: 13 }, open: 9 * 60, close: 21 * 60, ticket: 1000,
  film: { loved: 80, liked: 40, disliked: 0 }, snack: { loved: 20, liked: 10, disliked: 0 },
};

// One film a season, a second set in even years (Stardew rotates eight). Each has a kind that guests love or dislike.
export const FILMS = [
  { name: 'The Lantern Keeper', kind: 'drama', text: 'A lighthouse keeper writes letters to ships that never answer, until one does.' },
  { name: 'Ninety Days of Rain', kind: 'comedy', text: 'Two rival farmers share one umbrella for a whole wet summer.' },
  { name: 'Under the Hollow', kind: 'adventure', text: 'A miner follows a glowing beetle down past the deepest ladder.' },
  { name: 'The Frost Waltz', kind: 'romance', text: 'A skater and a stove-mender meet on a frozen mill pond.' },
  { name: 'Seedlings', kind: 'nature', text: 'A year in a meadow, from the first shoot to the last seed carried off by the wind.' },
  { name: 'The Clockwork Thief', kind: 'mystery', text: 'Every clock in a hill town stops at noon, and a tinker sets out to learn why.' },
  { name: 'Night at the Old Mill', kind: 'spooky', text: 'Three friends bet they can stay the night in the mill. The millstone has other plans.' },
  { name: 'Salt and Sails', kind: 'adventure', text: 'A boatwright patches a wreck and sails it round the cape in a storm.' },
];

// Snacks at the counter (Stardew's concessions run 30 to 250g). Each has a kind a guest loves or dislikes.
export const SNACKS = {
  popcorn:   { name: 'Buttered popcorn', cost: 60, kind: 'salty' },
  pretzel:   { name: 'Twisted pretzel', cost: 50, kind: 'salty' },
  floss:     { name: 'Berry floss', cost: 50, kind: 'sweet' },
  toffee:    { name: 'Toffee apple', cost: 120, kind: 'sweet' },
  icedtea:   { name: 'Iced mint tea', cost: 80, kind: 'drink' },
  fizz:      { name: 'Ginger fizz', cost: 60, kind: 'drink' },
  fruitcup:  { name: 'Fruit cup', cost: 150, kind: 'fresh' },
  nutmix:    { name: 'Roasted nut mix', cost: 200, kind: 'fresh' },
};

// Who can be invited and what they think. Any other film or snack kind is liked.
export const TASTES = {
  ines:   { loves: 'nature', hates: 'spooky', snack: 'sweet', nosnack: 'salty' },
  bram:   { loves: 'drama', hates: 'romance', snack: 'salty', nosnack: 'fresh' },
  odile:  { loves: 'adventure', hates: 'comedy', snack: 'drink', nosnack: 'sweet' },
  tavi:   { loves: 'adventure', hates: 'drama', snack: 'sweet', nosnack: 'drink' },
  wren:   { loves: 'comedy', hates: 'spooky', snack: 'fresh', nosnack: 'salty' },
  corvin: { loves: 'mystery', hates: 'romance', snack: 'salty', nosnack: 'sweet' },
  hob:    { loves: 'comedy', hates: 'nature', snack: 'salty', nosnack: 'fresh' },
  maren:  { loves: 'drama', hates: 'spooky', snack: 'fresh', nosnack: 'sweet' },
  hale:   { loves: 'nature', hates: 'comedy', snack: 'drink', nosnack: 'sweet' },
  lio:    { loves: 'romance', hates: 'mystery', snack: 'sweet', nosnack: 'fresh' },
  pell:   { loves: 'mystery', hates: 'adventure', snack: 'drink', nosnack: 'salty' },
  juno:   { loves: 'adventure', hates: 'drama', snack: 'fresh', nosnack: 'drink' },
  nell:   { loves: 'spooky', hates: 'romance', snack: 'salty', nosnack: 'drink' },
  rook:   { loves: 'adventure', hates: 'nature', snack: 'drink', nosnack: 'fresh' },
  esme:   { loves: 'romance', hates: 'adventure', snack: 'fresh', nosnack: 'salty' },
  kit:    { loves: 'spooky', hates: 'drama', snack: 'sweet', nosnack: 'fresh' },
};

// The two arcade cabinets in the tavern (Stardew's two in the Saloon pay nothing but bragging rights). Ours give a
// prize ticket the first time each target score is beaten.
export const ARCADE = {
  crows:  { name: 'Crow Patrol', target: 2000, text: 'Guard the rows: move the scarecrow and throw seeds at the crows before they reach the crops. Arrow keys or A and D to move, Space to throw. Tap or hold on a touch screen.' },
  runner: { name: 'Lantern Run', target: 1500, text: 'Ride the mine cart: jump the gaps and rocks and catch the lanterns. Space, W or the up arrow to jump. Tap on a touch screen.' },
};
