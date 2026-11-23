// v308 (roadmap 100): the guided first day (systems/guide.js, ui/guide.js). A new farmer is walked through the core
// loop one small step at a time: one short line with the key to press, an arrow on the spot in the world and a
// pulse on the hotbar slot to pick. Each step moves on by itself once done; Skip ends it. Stardew has no such guide
// (its first-week quests are data/firstweek.js here); this follows today's cozy games instead. Pays nothing.
// Each step: say (a few words), slot (a hotbar tool to pick) or use (press Use), map (where it happens: off it, the
// line says how to get back), aim (what the arrow points at, found in systems/guide.js), from (not shown before this
// minute of the day), done(f) with the facts systems/guide.js works out.
export const GUIDE = [
  { id: 'hoe',     say: 'Take the hoe', slot: 'hoe', done: (f) => f.held === 'hoe' || f.tilled > 0 },
  { id: 'till',    say: 'Face the grass and till it', use: true, map: 'farm', aim: 'grass', done: (f) => f.tilled > 0 },
  { id: 'seeds',   say: 'Take your seeds', slot: 'seeds', done: (f) => f.held === 'seeds' || f.crops > 0 },
  { id: 'plant',   say: 'Plant a seed on the soil', use: true, map: 'farm', aim: 'soil', done: (f) => f.crops > 0 },
  { id: 'can',     say: 'Take the watering can', slot: 'can', done: (f) => f.held === 'can' || f.wet > 0 },
  { id: 'water',   say: 'Water the seed', use: true, map: 'farm', aim: 'dry', done: (f) => f.wet > 0 },
  { id: 'rest',    say: 'Till, plant and water the rest', map: 'farm', aim: 'next', done: (f) => f.seeds === 0 || f.wet >= 6 },
  { id: 'village', say: 'Meet the neighbours: the village is west', map: 'farm', aim: 'village', done: (f) => f.map === 'village' || f.talked > 0 },
  { id: 'hello',   say: 'Say hello to someone', use: true, done: (f) => f.talked > 0 },
  { id: 'bed',     say: 'Go home to bed: it ends the day', from: 18 * 60, aim: 'bed', done: (f) => f.day >= 2 },
];
export const GUIDE_DONE = 'That is the basics. Each day a new goal shows in the corner; the journal has hints.';
export const GUIDE_BACK = 'Head back to your farm';
