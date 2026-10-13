// The seed slot: one hotbar slot plants whichever crop G.S.seedSel names.
// Select the slot again, or press Q, to switch to the next seed type you own.
import { G } from '../core/game.js';
import { changed, notify } from '../core/events.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';

const inSeasonNow = (k) => CROPS[k].seasons.includes(today().season);

// Next crop after the current one: owned and in season first, then owned, then any.
export function cycleSeed() {
  const S = G.S, keys = Object.keys(CROPS), start = keys.indexOf(S.seedSel);
  const order = keys.map((_, i) => keys[(start + 1 + i) % keys.length]);   // current one last
  S.seedSel = order.find((k) => S.seeds[k] > 0 && inSeasonNow(k)) || order.find((k) => S.seeds[k] > 0) || order[0];
  announce();
  changed();
}

// When the slot is picked with an empty or out-of-season packet, jump to a useful one.
export function ensureUsefulSeed() {
  const S = G.S;
  if (S.seeds[S.seedSel] > 0 && inSeasonNow(S.seedSel)) return;
  const k = Object.keys(CROPS).find((c) => S.seeds[c] > 0 && inSeasonNow(c));
  if (k) { S.seedSel = k; changed(); }
}

export function announce() {
  const S = G.S, c = CROPS[S.seedSel];
  const when = inSeasonNow(S.seedSel) ? '' : ` Grows in ${c.seasons.join(' or ')}.`;
  notify(`Seeds: ${c.name}, ${S.seeds[S.seedSel]} left. Press Q to switch.${when}`);
}
