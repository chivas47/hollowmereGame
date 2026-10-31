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
  // v43: sea fish at the beach and river fish in the forest (water). Stardew's ocean: anchovy 30g, sardine 40g,
  // red snapper 50g, flounder 100g, tuna 100g, squid 80g, pufferfish 200g, octopus 150g; river: sunfish 30g,
  // smallmouth bass 50g, shad 60g, salmon 75g, catfish 200g (rain), tiger trout 150g, dorado 100g.
  sprat:     { name: 'Salt sprat',      sell: 30,  difficulty: 1, color: '#b9c7cf', seasons: ['Spring', 'Autumn'], water: 'sea' },
  pilchard:  { name: 'Harbour pilchard', sell: 40, difficulty: 1, color: '#9fb0c3', seasons: ['Spring', 'Autumn', 'Winter'], water: 'sea' },
  snapper:   { name: 'Coral snapper',   sell: 50,  difficulty: 2, color: '#c8553f', seasons: ['Summer', 'Autumn'], water: 'sea' },
  flatfish:  { name: 'Sand flatfish',   sell: 100, difficulty: 3, color: '#b08a5a', seasons: ['Spring', 'Summer'], water: 'sea' },
  bluefin:   { name: 'Bluefin',         sell: 100, difficulty: 4, color: '#3d6a8f', seasons: ['Summer', 'Winter'], water: 'sea' },
  inkfish:   { name: 'Inkfish',         sell: 80,  difficulty: 3, color: '#e8e0d0', seasons: ['Winter'], water: 'sea' },
  blowfish:  { name: 'Spiny blowfish',  sell: 200, difficulty: 5, color: '#e9c46a', seasons: ['Summer'], water: 'sea' },
  octopus:   { name: 'Rock octopus',    sell: 150, difficulty: 5, color: '#a5432f', seasons: ['Summer'], water: 'sea' },
  // v64: the dunes' oasis pond (Stardew's desert: sandfish 75g, scorpion carp 150g; any season).
  dunedarter:  { name: 'Dune darter',   sell: 75,  difficulty: 3, color: '#d9b16a', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], water: 'desert' },
  stingcarp:   { name: 'Stinger carp',  sell: 150, difficulty: 5, color: '#b5652a', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], water: 'desert' },
  redfin:    { name: 'Redfin',          sell: 30,  difficulty: 1, color: '#d9898f', seasons: ['Spring', 'Summer'], water: 'river' },
  riverbass: { name: 'River bass',      sell: 50,  difficulty: 2, color: '#5d8a4a', seasons: ['Spring', 'Autumn'], water: 'river' },
  shad:      { name: 'Silver shad',     sell: 60,  difficulty: 2, color: '#c9ccd6', seasons: ['Spring', 'Summer', 'Autumn'], water: 'river' },
  runsalmon: { name: 'Run salmon',      sell: 75,  difficulty: 3, color: '#e8862a', seasons: ['Autumn'], water: 'river' },
  stripetrout:{ name: 'Striped trout',  sell: 150, difficulty: 4, color: '#c98a6a', seasons: ['Autumn', 'Winter'], water: 'river' },
  goldfin:   { name: 'Goldfin',         sell: 100, difficulty: 5, color: '#e9b44c', seasons: ['Summer'], water: 'river' },
  mudcat:    { name: 'Mud catfish',     sell: 200, difficulty: 5, color: '#6b5a48', seasons: ['Spring', 'Autumn'], water: 'river', rain: true },
  // v44: lake fish on the mountain (Stardew's mountain lake: carp 30g, bullhead 75g, chub 50g, largemouth bass
  // 100g, sturgeon 200g in summer and winter, midnight carp 150g in autumn and winter).
  lakecarp:  { name: 'Lake carp',       sell: 30,  difficulty: 1, color: '#8a7a5a', seasons: ['Spring', 'Summer', 'Autumn'], water: 'lake' },
  bullhead:  { name: 'Stone bullhead',  sell: 75,  difficulty: 2, color: '#6b5a48', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], water: 'lake' },
  chub:      { name: 'Ridge chub',      sell: 50,  difficulty: 2, color: '#9fb0a3', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], water: 'lake' },
  lakebass:  { name: 'Big-mouth bass',  sell: 100, difficulty: 3, color: '#5d8a4a', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], water: 'lake' },
  mooncarp:  { name: 'Moon carp',       sell: 150, difficulty: 4, color: '#8b86b0', seasons: ['Autumn', 'Winter'], water: 'lake' },
  sturgeon:  { name: 'Old sturgeon',    sell: 200, difficulty: 5, color: '#5a6a7a', seasons: ['Summer', 'Winter'], water: 'lake' },
  // v160 (roadmap 75d): the mere, one fish a season (Nuno's pick). Stardew's lake and river fish by role: perch 55g,
  // eel 85g, pike 100g; names and looks ours.
  reedperch: { name: 'Reed perch',      sell: 55,  difficulty: 2, color: '#a0a45a', seasons: ['Spring', 'Summer'], water: 'mere' },
  mereel:    { name: 'Mere eel',        sell: 85,  difficulty: 3, color: '#4a5a3a', seasons: ['Autumn'], water: 'mere' },
  frostpike: { name: 'Frost pike',      sell: 100, difficulty: 3, color: '#8aa6b8', seasons: ['Winter'], water: 'mere' },
  // v45: the grove pond (Stardew's secret woods: woodskip 75g) and the sewer (Stardew: mutant carp, a legend, 1,000g).
  glideskip: { name: 'Glade skipper',   sell: 75,  difficulty: 3, color: '#7a8a5a', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], water: 'grove' },
  gutterpike:{ name: 'Gutter pike',     sell: 60,  difficulty: 3, color: '#5a6a4a', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], water: 'sewer' },
  crookcarp: { name: 'Crooked carp',    sell: 1000, difficulty: 6, color: '#8aa05a', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], legendary: true, level: 0, water: 'sewer' },
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
