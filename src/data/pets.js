// The farm pet (chosen on the new game screen) and its hats. Friendship follows Stardew's pets:
// +12 for a pat once a day, +6 for a night with a filled water bowl, up to 1000 (5 hearts of 200).
// At 800 or more a pet sometimes leaves a gift in the morning.
export const PET = { pat: 12, bowl: 6, max: 1000, heart: 200, giftFrom: 800, giftChance: 0.2, bowlAt: { x: 6, y: 5 }, roam: [2, 5, 10, 9] };

// Looks per kind: [body, accent].
export const PET_LOOKS = {
  cat:    [['#e8a35e', '#fff3e0'], ['#5a5048', '#d9d4cc'], ['#f4ead2', '#b5452f']],
  dog:    [['#a5753f', '#f4ead2'], ['#2b211a', '#c9b68e'], ['#e9c46a', '#fff8e0']],
  turtle: [['#5d8a4a', '#c9b68e'], ['#7a5a3a', '#e9c46a'], ['#3f6b6e', '#bfe0d8']],
};
export const PET_NAMES = { cat: 'Whisk', dog: 'Bramble', turtle: 'Pebble' };

// Hats from the seed stall, worn by the pet (Stardew's hat shop sells hats around 1000g).
export const PET_HATS = {
  bow:   { name: 'Ribbon bow',    cost: 1000, color: '#e2707a' },
  straw: { name: 'Little sunhat', cost: 1000, color: '#d9a441' },
  crown: { name: 'Flower crown',  cost: 1000, color: '#f4ead2' },
  party: { name: 'Party hat',     cost: 1000, color: '#5fa8d3' },
};
