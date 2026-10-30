// v129: local two-player (systems/partner.js): a second farmer on a second controller. Same screen (every map
// fits one), same speed as you; they go where you go when you change map. They join each session with A and
// leave with B or when their controller does. v130: they use tools and talk with their own energy (saved, as
// G.S.partner) and hotbar slot; the bag, gold and everything else are shared. v131: their own prompt and
// energy bar; your bed ends the day for both.
export const PARTNER = {
  name: 'Farmer two',
  speed: 62,   // as systems/player.js
  look: { skin: '#d9a37e', hair: '#2b2a2e', shirt: '#6a9a4a', pants: '#3f4a5a', shoes: '#2b211a', long: false },
  // Where they stand when they follow you onto a map: the first free tile among these, beside you.
  beside: [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, 1], [1, 1], [-1, -1], [1, -1]],
  // v130: what only the first farmer does for now: fishing (one catch bar on screen) and riding the horse.
  // v138: they followed you onto every map (on the same screen). v140 (item 73e): with split screen each farmer
  // goes their own way; true again brings back following (tests, and a fallback).
  tethered: false,
  // v137: no two-player on a phone (Nuno, item 73b): a touch-only screen whose short side is under this many CSS
  // pixels. Tablets and touch laptops with a mouse or trackpad still play two.
  phone: { short: 600, note: 'Two-player needs a bigger screen than a phone. Play it on a computer or tablet.' },
  // v142 (item 73g): their own bed in the farmhouse once they have played on this farm, on the first free pair
  // of floor tiles (head, foot) among these, so no furniture is ever moved. The day ends when both are in bed.
  beds: [[[9, 3], [9, 4]], [[6, 3], [6, 4]], [[9, 6], [9, 7]], [[6, 6], [6, 7]], [[9, 9], [9, 10]], [[6, 9], [6, 10]]],
  // v142: the first time they join on a farm they pick a look (shirt and hair from data/profile.js LOOKS).
  // Maps they never come back to on loading (rebuilt every visit): they start beside you instead.
  fresh: ['mine', 'maze'],
  waitYou: 'You lie down and wait for farmer two.',
  waitThem: 'Farmer two lies down and waits for you.',
};
