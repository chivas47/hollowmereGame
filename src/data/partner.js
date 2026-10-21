// v129: local two-player, part one (systems/partner.js): a second farmer on a second controller. Same screen
// (every map fits one), same speed as you; they go where you go when you change map. Not saved yet: the
// second farmer joins each session with A and leaves when their controller does (tools and energy come in 33b).
export const PARTNER = {
  name: 'Farmer two',
  speed: 62,   // as systems/player.js
  look: { skin: '#d9a37e', hair: '#2b2a2e', shirt: '#6a9a4a', pants: '#3f4a5a', shoes: '#2b211a', long: false },
  // Where they stand when they follow you onto a map: the first free tile among these, beside you.
  beside: [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, 1], [1, 1], [-1, -1], [1, -1]],
};
