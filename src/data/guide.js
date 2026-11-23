// v308 (roadmap 100): the guided first day (systems/guide.js, ui/guide.js). A new farmer is walked through the core
// loop one small step at a time: one short line with the key to press, an arrow on the spot in the world and a
// pulse on the hotbar slot to pick. Each step moves on by itself once done; Skip ends it. Stardew has no such guide
// (its first-week quests are data/firstweek.js here); this follows today's cozy games instead. Pays nothing.
// Each step: say (a few words), slot (a hotbar tool to pick) or use (press Use), map (where it happens: off it, the
// line says how to get back), aim (what the arrow points at, found in systems/guide.js), from (not shown before this
// minute of the day), done(f) with the facts systems/guide.js works out, end (said with a chime when it is done).
// v310: the field is one looping step (farm): it picks the next real action each moment and walks you through it
// again for every seed, so till, plant and water repeat until the seeds are in and watered. FARM: its lines; each
// action names the tool to take (take, with the slot pulsing) until it is in hand, then what to do with Use.
export const GUIDE = [
  { id: 'farm',    farm: true, map: 'farm', done: (f) => (f.seeds === 0 && f.dry === 0) || f.wet >= FIELD_GOAL, end: 'Seeds in! Watered crops grow a stage each night.' },
  { id: 'village', say: 'Meet the neighbours: the village is west', map: 'farm', aim: 'village', done: (f) => f.map === 'village' || f.talked > 0 },
  { id: 'hello',   say: 'Say hello to someone', use: true, done: (f) => f.talked > 0, end: 'First hello! Talk to neighbours each day to make friends.' },
  { id: 'bed',     say: 'Go home to bed: it ends the day', from: 18 * 60, aim: 'bed', done: (f) => f.day >= 2 },
];
export const FARM = {
  till:   { slot: 'hoe',   take: 'Take the hoe',          say: 'Till the grass', aim: 'till' },
  plant:  { slot: 'seeds', take: 'Take your seeds',       say: 'Plant a seed',   aim: 'soil' },
  water:  { slot: 'can',   take: 'Take the watering can', say: 'Water the seed', aim: 'dry' },
  refill: { slot: 'can',   take: 'Take the watering can', say: 'The can is empty: fill it at the well', aim: 'well' },
  swap:   { slot: 'seeds', take: 'Take your seeds',       say: 'Switch to your other seeds', key: 'seeds', aim: 'soil' },   // the type in hand ran out
};
export const FIELD_GOAL = 9;   // the field step ends once this many are watered (more seeds bought on day one do not keep it going)
export const GUIDE_VERSION = 2;   // v310: steps renumbered; a guide saved under v308's steps starts again from the top
export const GUIDE_DONE = 'That is the basics. Each day a new goal shows in the corner; the journal has hints.';
export const GUIDE_BACK = 'Head back to your farm';
