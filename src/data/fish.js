// Fish caught in pond water. difficulty 1 to 5: smaller green zone and a faster marker.
// Rarer fish (higher difficulty) also bite less often. spot: 'ice' fish only bite at the winter ice hole, 'pot' ones
// only come up in crab pots (v42). legendary: one of a kind (systems/fishing.js), difficulty 6.
export const FISH = {
  minnow:   { name: 'Silver minnow',   sell: 35,  difficulty: 1, color: '#b9c7cf', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'] },
  gudgeon:  { name: 'Stone gudgeon',   sell: 30,  difficulty: 1, color: '#a39a86', seasons: ['Spring', 'Summer'] },
  loach:    { name: 'Mud loach',       sell: 45,  difficulty: 2, color: '#7a6a4f', seasons: ['Autumn', 'Winter'] },
  dace:     { name: 'Spotted dace',    sell: 50,  difficulty: 2, color: '#9fb0a3', seasons: ['Spring', 'Autumn'] },
  perch:    { name: 'Reed perch',      sell: 55,  difficulty: 2, color: '#8fae5a', seasons: ['Spring', 'Summer'] },
  rudd:     { name: 'Copper rudd',     sell: 75,  difficulty: 3, color: '#c97a3e', seasons: ['Summer'] },
  trout:    { name: 'Brook trout',     sell: 100,  difficulty: 3, color: '#c98a6a', seasons: ['Spring', 'Autumn'] },
  char:     { name: 'Frost char',      sell: 105, difficulty: 3, color: '#d9898f', seasons: ['Winter'] },
  pike:     { name: 'Ice pike',        sell: 150, difficulty: 4, color: '#7f9db3', seasons: ['Winter'] },
  grayling: { name: 'Dusk grayling',   sell: 200, difficulty: 4, color: '#8b86b0', seasons: ['Autumn'] },
  carp:     { name: 'Golden carp',     sell: 300, difficulty: 5, color: '#e9b44c', seasons: ['Summer'] },
  koi:      { name: 'Lantern koi',     sell: 300, difficulty: 5, color: '#f0e6d8', seasons: ['Winter'] },
  snoweel:  { name: 'Snow eel',        sell: 85,  difficulty: 3, color: '#dfe7ea', seasons: ['Winter'], spot: 'ice' },
  whitefish:{ name: 'Rime whitefish',  sell: 120, difficulty: 4, color: '#c9e2ee', seasons: ['Winter'], spot: 'ice' },
  // v42: crab pot catches (spot 'pot': never on the rod). Stardew's freshwater pot: crayfish 75g, snail 65g, periwinkle 20g.
  crayfish: { name: 'Pond crayfish',   sell: 75,  difficulty: 1, color: '#c8553f', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], spot: 'pot' },
  snail:    { name: 'Mud snail',       sell: 65,  difficulty: 1, color: '#8a6a44', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], spot: 'pot' },
  winkle:   { name: 'Reed winkle',     sell: 20,  difficulty: 1, color: '#6b7a8a', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], spot: 'pot' },
  // v42: legendary fish, each caught once (Stardew: Legend 5,000g spring rain level 10; Crimsonfish 1,500g summer
  // level 5; Angler 900g autumn level 3; Glacierfish 1,000g winter level 6). level: fishing level needed; rain: only in rain.
  mossjaw:   { name: 'Old Mossjaw',   sell: 5000, difficulty: 6, color: '#4f6b3a', seasons: ['Spring'], legendary: true, level: 10, rain: true },
  sunfin:    { name: 'Sunfin',        sell: 1500, difficulty: 6, color: '#e9862a', seasons: ['Summer'], legendary: true, level: 5 },
  duskangler:{ name: 'Dusk angler',   sell: 900,  difficulty: 6, color: '#5a4a6e', seasons: ['Autumn'], legendary: true, level: 3 },
  frostcrown:{ name: 'Frostcrown',    sell: 1000, difficulty: 6, color: '#bfe0f2', seasons: ['Winter'], legendary: true, level: 6, ice: true },
};

// In winter the Wilds pond freezes; this edge tile is the only place to fish.
export const ICE_HOLE = { map: 'wilds', x: 15, y: 10 };
