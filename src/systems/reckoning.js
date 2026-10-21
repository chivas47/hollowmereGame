// v128: Bram's reckoning (data/reckoning.js). On Spring 1 of year three, and the morning after you give Bram a
// starstone, he scores the farm and lights 1 to 4 lamps; ui/reckoning.js shows it after the morning report.
// Four lamps carve the shipping bin's lid, which leaves a gleamfruit each morning from then on.
// G.S.reckoning = { done: day first judged | 0, points, lamps, pending: to show, again: day to look again | 0, lid }.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { addLayer } from '../core/registry.js';
import { ITEMS } from '../data/items.js';
import { FISH } from '../data/fish.js';
import { DISHES } from '../data/cooking.js';
import { SKILLS, levelFor } from '../data/skills.js';
import { MUSEUM_ITEMS } from '../data/museum.js';
import { RECKONING, RECKON_POINTS } from '../data/reckoning.js';
import { stats } from './museum.js';
import { addItem } from './quality.js';
import { r as px } from '../render/pixel.js';

const R = () => G.S.reckoning;

// Every point with whether it is met, the total and the lamps it lights.
export function score(S = G.S) {
  const st = { ...stats(), levels: Object.keys(SKILLS).reduce((a, k) => a + levelFor(S.skills[k] || 0), 0),
    museumAll: MUSEUM_ITEMS.length, fishAll: Object.keys(FISH).length, recipesAll: Object.keys(DISHES).length };
  const rows = RECKON_POINTS.map((p) => ({ ...p, ok: !!p.met(S, st) }));
  const points = rows.reduce((a, p) => a + (p.ok ? p.points : 0), 0);
  return { rows, points, lamps: RECKONING.lamps.filter((n) => points >= n).length };
}

function judge() {
  const { points, lamps } = score(), r = R();
  Object.assign(r, { done: r.done || G.S.day, points, lamps, pending: true, again: 0 });
  if (lamps === 4) r.lid = true;
}

on('day:start', () => {
  const r = R();
  if ((!r.done && G.S.day >= RECKONING.day) || (r.again && G.S.day >= r.again)) judge();
  if (r.lid) { addItem(RECKONING.reward, 1); notify(`A ${ITEMS[RECKONING.reward].name.toLowerCase()} waits on the carved bin lid.`); }
});

// Giving Bram a starstone once he has judged the farm: he looks again the next morning. Returns his reply, or null
// when this gift is not that (systems/npcs.js then treats it as an ordinary gift).
export function askAgain(npcId, item) {
  const r = R();
  if (npcId !== 'bram' || item !== RECKONING.askItem || !r.done || r.lamps === 4) return null;
  G.S.bag[item]--; r.again = G.S.day + 1;
  return 'A starstone? For me? ...All right. I will come by in the morning and have another look at the place.';
}

// The porch lamps, left of the farmhouse door, once Bram has judged the farm: lit ones glow, the rest stay dark.
addLayer(20, (c) => {
  const r = R();
  if (G.S.map !== 'farm' || !r.done) return;
  RECKONING.porch.forEach(([x, y], i) => {
    const lit = i < r.lamps;
    px(c, x, y, 4, 1, '#3f3226'); px(c, x, y + 1, 1, 4, '#3f3226'); px(c, x + 3, y + 1, 1, 4, '#3f3226'); px(c, x, y + 5, 4, 1, '#3f3226');
    px(c, x + 1, y + 1, 2, 4, lit ? '#ffd36a' : '#5a4a3a');
    if (lit) px(c, x + 1, y + 1, 1, 1, '#fff1b8');
  });
});
