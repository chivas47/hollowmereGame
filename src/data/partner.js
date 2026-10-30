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
  // v138: they follow you onto every map (on the same screen). Item 73e turns this off for split screen.
  tethered: true,
  // v137: no two-player on a phone (Nuno, item 73b): a touch-only screen whose short side is under this many CSS
  // pixels. Tablets and touch laptops with a mouse or trackpad still play two.
  phone: { short: 600, note: 'Two-player needs a bigger screen than a phone. Play it on a computer or tablet.' },
  yours: { bed: "The first farmer's bed ends the day for you both." },   // v131: Nuno's call (v134 fishing and v136 riding are theirs too)
};
