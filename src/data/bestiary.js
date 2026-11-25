// Roadmap 85c: the Bestiary, the journal's Creatures tab. Where each monster lives and how to fight it, worked out
// from its data (data/monsters.js MONSTERS) so a new kind gets a card without a new entry here.
import { MONSTERS, statAt } from './monsters.js';
import { CAVERN } from './cavern.js';
import { VENT } from './forge.js';
import { PEAK } from './nuts.js';

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
// the night creatures, the Duskmarch's, v347 the bosses), the Hollow's by the floor they start on.
const RANK = { hollow: 0, cavern: 1, vent: 2, wildfarm: 0, night: 3, duskmarch: 4, lair: 5 };   // v347: the bosses last
const rank = (k) => Math.min(...MONSTERS[k].zones.map((z) => RANK[z]));
export const BESTIARY_ORDER = Object.keys(MONSTERS).sort((a, b) => rank(a) - rank(b) || (MONSTERS[a].from ?? 0) - (MONSTERS[b].from ?? 0));

// v351: how strong a kind is where you meet it, for its card. Stats grow with the Hollow-floor strength of where it
// spawns (data/monsters.js statAt): a Hollow kind's floors, the Sunken Cavern's from its first floor down (no
// bottom), the Ember Vent's and the Smoke Peak's ten floors. Kinds that only live above ground or in a lair are met
// at strength 1. Returns [lo, hi] floors, hi null when there is no deepest.
export function strengthRange(kind) {
  const d = MONSTERS[kind], spans = [];
  if (d.zones.includes('hollow')) spans.push([d.from, d.to ?? null]);
  if (d.zones.includes('cavern')) spans.push([CAVERN.eff(1), null]);
  if (d.zones.includes('vent')) spans.push([Math.min(VENT.eff(1), PEAK.eff(1)), Math.max(VENT.eff(VENT.floors - 1), PEAK.eff(PEAK.floors - 1))]);
  if (!spans.length) return [1, 1];
  return [Math.min(...spans.map((s) => s[0])), spans.some((s) => s[1] === null) ? null : Math.max(...spans.map((s) => s[1]))];
}
// The card's line: "Health 7, hits for 9." or with a range where it grows ("Health 7 to 20"), or "or more" where
// it keeps growing deeper. Base numbers: the challenge brazier and the catacombs' tougher dead add to them.
export function strengthLine(kind) {
  const [lo, hi] = strengthRange(kind);
  const part = (stat) => {
    const a = statAt(kind, stat, lo);
    if (hi === null) return statAt(kind, stat, lo + 200) > a ? `${a} or more` : `${a}`;
    const b = statAt(kind, stat, hi);
    return b > a ? `${a} to ${b}` : `${a}`;
  };
  return `Health ${part('hp')}, hits for ${part('dmg')}.`;
}
