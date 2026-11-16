// Roadmap 85c: the Bestiary, the journal's Creatures tab. Where each monster lives and how to fight it, worked out
// from its data (data/weapons.js MONSTERS) so a new kind gets a card without a new entry here.
import { MONSTERS } from './weapons.js';

// How each way of moving fights, and what to do about it. One plain line each.
export const HOW = {
  hop: 'Hops toward you in short bursts. Hit it between hops.',
  crawl: 'Crawls slowly after you. Easy to keep at a sword\'s length.',
  fly: 'Flies over walls and rocks and weaves as it comes. Wait for it to close in, then swing.',
  walk: 'Walks straight at you and hits hard. Keep moving and strike when it reaches you.',
  charge: 'Winds up and flashes before it charges. Step aside, then hit it while it stands winded.',
};

// Where a kind turns up, in words: the same rules as the spawns in systems/monsters.js.
export function whereLives(kind) {
  const d = MONSTERS[kind], out = [];
  if (!d.cavernOnly && !d.ventOnly) out.push(d.from > 1 ? `the Hollow from floor ${d.from}` : 'the Hollow');
  if (d.cavern || d.cavernOnly) out.push('the Sunken Cavern');
  if (d.vent || d.ventOnly) out.push('the Ember Vent', 'Smoke Peak');
  if (kind === 'slime') out.push('the wild farm after dark');
  return `Lives in ${out.length > 1 ? `${out.slice(0, -1).join(', ')} and ${out[out.length - 1]}` : out[0]}.`;
}

// The Bestiary's order: the Hollow's kinds by the floor they start on, then the Cavern's, then the Vent's.
export const BESTIARY_ORDER = Object.keys(MONSTERS).sort((a, b) => {
  const rank = (k) => (MONSTERS[k].ventOnly ? 2 : MONSTERS[k].cavernOnly ? 1 : 0);
  return rank(a) - rank(b) || MONSTERS[a].from - MONSTERS[b].from;
});
