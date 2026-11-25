// Roadmap 85c: the Bestiary, the journal's Creatures tab. Where each monster lives and how to fight it, worked out
// from its data (data/monsters.js MONSTERS) so a new kind gets a card without a new entry here.
import { MONSTERS } from './monsters.js';

// How each way of moving fights, and what to do about it. One plain line each.
export const HOW = {
  hop: 'Hops toward you in short bursts. Hit it between hops.',
  crawl: 'Crawls slowly after you. Easy to keep at a sword\'s length.',
  fly: 'Flies over walls and rocks and weaves as it comes. Wait for it to close in, then swing.',
  walk: 'Walks straight at you and hits hard. Keep moving and strike when it reaches you.',
  charge: 'Winds up and flashes, then charges, bending toward you as it comes. Sidestep late, then hit it while it stands winded.',   // v266
  dig: 'Travels under the floor as a mound you cannot hit. When the mound shakes it comes up and charges at once: sidestep late, then hit it while it stands winded.',   // v266: the burrow beetle
  mimic: 'Sits among the rocks looking like one. Step beside it or hit it to wake it; the first hit only cracks its shell.',
  burrow: 'Moves under the floor as a mound you cannot hit. When the mound shakes it comes up: hit it before it digs down again.',
  swarm: 'Comes in a pack, weak but quick. A club or a sword\'s spin catches several at once.',
  split: 'A big slime that hops like the small ones. When it falls it splits in two smaller ones, so finish them off.',
  phase: 'Drifts through walls and fades in and out. Faded, it can neither hurt you nor be hurt: strike while it is solid.',
  armored: 'Its shell turns a blade: swords and daggers do a quarter of their damage. A club or a bomb cracks it properly.',
  shoot: 'Keeps its distance and spits a glob at you after a short glow. Step aside, or block with the sword to send it back.',
};

// Where a kind turns up, in words, from its zones (the same list the spawns read). The night creatures and the
// Duskmarch's have a sentence of their own; the others list their places.
const PLACES = {
  hollow: (d) => (d.to ? `the Hollow, floors ${d.from} to ${d.to}` : d.from > 1 ? `the Hollow from floor ${d.from}` : 'the Hollow'),
  cavern: () => 'the Sunken Cavern',
  vent: () => ['the Ember Vent', 'Smoke Peak'],
  wildfarm: () => 'the wild farm after dark',
};
export function whereLives(kind) {
  const d = MONSTERS[kind];
  if (d.lives) return d.lives;   // v303: the Duskmarch's creatures
  if (d.zones.includes('night')) return `Comes out after dark in the Wilds and on the farms, on ${d.season.toLowerCase()} nights.`;   // v261
  const out = d.zones.flatMap((z) => PLACES[z]?.(d) ?? []);
  return `Lives in ${out.length > 1 ? `${out.slice(0, -1).join(', ')} and ${out[out.length - 1]}` : out[0]}.`;
}

// The Bestiary's order: by home zone (the first of ZONES a kind lives in: the Hollow's, then the Cavern's, the Vent's,
// the night creatures, the Duskmarch's), the Hollow's by the floor they start on.
const RANK = { hollow: 0, cavern: 1, vent: 2, wildfarm: 0, night: 3, duskmarch: 4 };
const rank = (k) => Math.min(...MONSTERS[k].zones.map((z) => RANK[z]));
export const BESTIARY_ORDER = Object.keys(MONSTERS).sort((a, b) => rank(a) - rank(b) || (MONSTERS[a].from ?? 0) - (MONSTERS[b].from ?? 0));
