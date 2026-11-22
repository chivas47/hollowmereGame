// Roadmap 85c: the Bestiary, the journal's Creatures tab. Where each monster lives and how to fight it, worked out
// from its data (data/weapons.js MONSTERS) so a new kind gets a card without a new entry here.
import { MONSTERS } from './weapons.js';

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

// Where a kind turns up, in words: the same rules as the spawns in systems/monsters.js.
export function whereLives(kind) {
  const d = MONSTERS[kind], out = [];
  if (d.lives) return d.lives;   // v303: the Duskmarch's creatures
  if (d.surfaceOnly) return `Comes out after dark in the Wilds and on the farms, on ${d.season.toLowerCase()} nights.`;   // v261
  if (!d.cavernOnly && !d.ventOnly) out.push(d.to ? `the Hollow, floors ${d.from} to ${d.to}` : d.from > 1 ? `the Hollow from floor ${d.from}` : 'the Hollow');   // v253: to
  if (d.cavern || d.cavernOnly) out.push('the Sunken Cavern');
  if (d.vent || d.ventOnly) out.push('the Ember Vent', 'Smoke Peak');
  if (kind === 'slime') out.push('the wild farm after dark');
  return `Lives in ${out.length > 1 ? `${out.slice(0, -1).join(', ')} and ${out[out.length - 1]}` : out[0]}.`;
}

// The Bestiary's order: the Hollow's kinds by the floor they start on, then the Cavern's, then the Vent's.
export const BESTIARY_ORDER = Object.keys(MONSTERS).sort((a, b) => {
  const rank = (k) => (MONSTERS[k].wildOnly ? 4 : MONSTERS[k].surfaceOnly ? 3 : MONSTERS[k].ventOnly ? 2 : MONSTERS[k].cavernOnly ? 1 : 0);   // v261: the night creatures last
  return rank(a) - rank(b) || MONSTERS[a].from - MONSTERS[b].from;
});
