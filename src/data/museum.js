// v68: the museum and collections. Stardew by role: artifacts from artifact spots and geodes (sells 20g to 500g),
// the museum taking one of each artifact and mineral with a reward at set counts and a stardrop for all of them,
// secret notes found while digging and foraging, achievements, and a perfection-style completion tracker.
// Original names, finds and text.

// Artifacts. Stardew's sell prices by role: rusty spoon 25, glass shards 20, arrowhead and amphora 40, chewing
// stick 50, ancient doll 60, nautilus fossil 80, bone flute and anchor 100, palm fossil 100, elvish jewelry 200,
// dinosaur egg 350, golden mask 500.
export const ARTIFACTS = {
  tinspoon:    { name: 'Tarnished spoon',  sell: 25,  artifact: true },
  seaglass:    { name: 'Sea glass',        sell: 20,  artifact: true },
  claysherd:   { name: 'Clay sherd',       sell: 40,  artifact: true },
  flintpoint:  { name: 'Flint point',      sell: 40,  artifact: true },
  marshcoin:   { name: 'Marsh coin',       sell: 50,  artifact: true },
  strawdoll:   { name: 'Straw doll',       sell: 60,  artifact: true },
  coilfossil:  { name: 'Coil fossil',      sell: 80,  artifact: true },
  fernfossil:  { name: 'Fern fossil',      sell: 100, artifact: true },
  bonewhistle: { name: 'Bone whistle',     sell: 100, artifact: true },
  hornedskull: { name: 'Horned skull',     sell: 100, artifact: true },
  oldanchor:   { name: 'Barnacled anchor', sell: 100, artifact: true },
  bronzebell:  { name: 'Bronze bell',      sell: 100, artifact: true },
  runetablet:  { name: 'Rune tablet',      sell: 200, artifact: true },
  elderegg:    { name: 'Elder egg',        sell: 350, artifact: true },
  sunmask:     { name: 'Sun mask',         sell: 500, artifact: true },
};
// The minerals the museum takes: the gems (data/minerals.js).
export const MUSEUM_MINERALS = ['quartz', 'violet', 'ambergem', 'frosttear', 'emberquartz', 'tidestone', 'heartstone', 'starstone'];
export const MUSEUM_ITEMS = [...Object.keys(ARTIFACTS), ...MUSEUM_MINERALS];

// Artifact spots: wriggling marks in the ground, one a morning on each of these maps (Stardew spawns a few a day per
// area). Dig with the hoe (2 energy, like any hoe use). Each row: [item, weight]. The elder egg can turn up anywhere.
export const SPOTS = {
  wilds:    [['claysherd', 4], ['flintpoint', 3], ['marshcoin', 3], ['tinspoon', 3], ['geode', 3]],
  beach:    [['seaglass', 5], ['coilfossil', 3], ['oldanchor', 2], ['tinspoon', 2], ['geode', 2]],
  forest:   [['claysherd', 3], ['strawdoll', 3], ['fernfossil', 3], ['tinspoon', 2], ['geode', 3]],
  mountain: [['flintpoint', 3], ['bonewhistle', 3], ['hornedskull', 2], ['tinspoon', 2], ['frostgeode', 3]],
};
export const SPOT_TILES = ['g', 'z'];
export const SPOT_ENERGY = 2;
export const ELDER_EGG = 0.02;   // chance per dig (Stardew's dinosaur egg is a rare artifact spot find)
// Cracking a geode at Bram's sometimes turns up an old thing too (Stardew: artifact troves and omni geodes).
export const GEODE_ARTIFACT = { chance: 0.08, loot: [['bronzebell', 5], ['runetablet', 3], ['sunmask', 1]] };

// Rewards by number of donations (Stardew's curator rewards by count, a stardrop for the full collection).
export const REWARDS = [
  { at: 5, label: '10 Strong growth tonic', kit: { tonic2: 10 } },
  { at: 10, label: 'Steel sprinkler', kit: { sprinkler3: 1 } },
  { at: 15, label: '10 Heirloom booster', kit: { booster3: 10 } },
  { at: 20, label: '2 Steel sprinklers', kit: { sprinkler3: 2 } },
  { at: MUSEUM_ITEMS.length, label: 'A wishfruit', wish: true },
];

// Secret notes: one turns up now and then while digging artifact spots or foraging (Stardew: secret notes from
// artifact spots, digging and foraging once found). Two lead to buried treasure, dug with the hoe once read.
export const NOTE_CHANCE = { dig: 0.15, forage: 0.02 };
export const NOTES = [
  { id: 1, text: 'Marks in the ground that seem to wriggle are old digging spots. A hoe turns up what the valley forgot. One appears each morning in the Wilds, on the beach, in the forest and on the mountain.' },
  { id: 2, text: 'Bram cracks geodes for a few coins. Every so often, there is more than stone inside: bells, tablets, and once, they say, a mask of beaten sun.' },
  { id: 3, text: 'The beach keeps a secret. Where the pier meets the sand, look west to the rock by the water. Dig one step north of it.', dig: { map: 'beach', x: 2, y: 7 }, loot: { starstone: 1 } },
  { id: 4, text: 'The curator keeps a wishfruit in a locked case. It goes to whoever fills every case in the museum.' },
  { id: 5, text: 'Deep in the Hollow, on the fiftieth floor, something sweet grows out of the rock.' },
  { id: 6, text: 'In the forest, by the fallen log in the west, count three steps east and dig. Someone buried a face there.', dig: { map: 'forest', x: 4, y: 12 }, loot: { sunmask: 1 } },
  { id: 7, text: 'Fish bite best for the patient. A good bait and a calm rod hook the ones that dart.' },
  { id: 8, text: 'Be kind to the neighbours: a gift a day, and twice on a birthday, opens more doors than any key.' },
];

// Achievements: a stat and the number it must reach (Stardew's: Greenhorn 15k, Cowpoke 50k, Homesteader 250k,
// Millionaire 1M earned; 10 and all fish; 40 and all museum items; 5 hearts with one and 5 neighbours; 8 hearts
// with 8 neighbours; 10 recipes; the mines' bottom; one and every skill at 10).
export const ACHIEVEMENTS = [
  { id: 'earn1', name: 'Pocket money', desc: 'Earn 15,000g.', stat: 'earned', n: 15000 },
  { id: 'earn2', name: 'Steady trade', desc: 'Earn 50,000g.', stat: 'earned', n: 50000 },
  { id: 'earn3', name: 'Landholder', desc: 'Earn 250,000g.', stat: 'earned', n: 250000 },
  { id: 'earn4', name: 'Gold in the soil', desc: 'Earn 1,000,000g.', stat: 'earned', n: 1000000 },
  { id: 'fish1', name: 'Line and hook', desc: 'Catch 10 kinds of fish.', stat: 'fish', n: 10 },
  { id: 'fish2', name: 'Every fin', desc: 'Catch every kind of fish.', stat: 'fish', n: 'all' },
  { id: 'mus1', name: 'Curious finds', desc: 'Donate 10 things to the museum.', stat: 'donated', n: 10 },
  { id: 'mus2', name: 'Full cases', desc: 'Complete the museum collection.', stat: 'donated', n: 'all' },
  { id: 'friend1', name: 'A friend in town', desc: 'Reach 5 hearts with a neighbour.', stat: 'friends5', n: 1 },
  { id: 'friend2', name: 'Well liked', desc: 'Reach 5 hearts with 5 neighbours.', stat: 'friends5', n: 5 },
  { id: 'friend3', name: 'Beloved', desc: 'Reach 8 hearts with 8 neighbours.', stat: 'friends8', n: 8 },
  { id: 'cook1', name: 'Home cook', desc: 'Learn 10 recipes.', stat: 'recipes', n: 10 },
  { id: 'deep1', name: 'Bottom of the Hollow', desc: 'Reach floor 100 of the Hollow.', stat: 'deepest', n: 100 },
  { id: 'skill1', name: 'Master of one', desc: 'Reach level 10 in a skill.', stat: 'skills10', n: 1 },
  { id: 'skill2', name: 'Master of all', desc: 'Reach level 10 in every skill.', stat: 'skills10', n: 'all' },
  { id: 'notes1', name: 'Paper trail', desc: 'Find every secret note.', stat: 'notes', n: 'all' },
];

// The completion tracker: each part's share of 100% (Stardew's perfection tracker by role).
export const COMPLETION = [
  { key: 'museum', label: 'Museum collection', weight: 15 },
  { key: 'fish', label: 'Fish caught', weight: 15 },
  { key: 'friends', label: 'Friendship (8 hearts each)', weight: 15 },
  { key: 'skills', label: 'Skill levels', weight: 15 },
  { key: 'recipes', label: 'Recipes known', weight: 10 },
  { key: 'achievements', label: 'Achievements', weight: 20 },
  { key: 'notes', label: 'Secret notes', weight: 10 },
];
