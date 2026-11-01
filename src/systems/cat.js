// v164 (roadmap 75f): Pudding, the village cat (data/atmosphere.js CAT). Drawn only and worked out from the date and
// the hour, so nothing is saved: where she is, where she is walking to, and whether she is asleep. Facing her and
// pressing Use pets her (priority 64: above the sword, below casting).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { notify } from '../core/events.js';
import { addEntities, addInteraction, addPrompt } from '../core/registry.js';
import { CAT } from '../data/atmosphere.js';
import { r, rng } from '../render/pixel.js';

const indoors = () => ['rain', 'storm', 'snow'].includes(G.S.weather);
const spotAt = (day, block) => CAT.spots[Math.floor(rng(day * 97 + block * 13)() * CAT.spots.length)];

// Where Pudding is at minute t of day d: null when she is in, else { x, y, asleep } in pixels, walking between spots
// for the first CAT.walk minutes of each block.
export function catAt(day, t, weather = 'sun') {
  if (t < CAT.from || t >= CAT.to || ['rain', 'storm', 'snow'].includes(weather)) return null;
  const block = Math.floor((t - CAT.from) / CAT.every), into = t - CAT.from - block * CAT.every;
  const [tx, ty] = spotAt(day, block), here = { x: tx * T + 8, y: ty * T + 9 };
  const asleep = t >= CAT.nap[0] && t < CAT.nap[1];
  if (!block || into >= CAT.walk) return { ...here, asleep, moving: false };
  const [fx, fy] = spotAt(day, block - 1), k = into / CAT.walk;
  return { x: fx * T + 8 + (here.x - fx * T - 8) * k, y: fy * T + 9 + (here.y - fy * T - 9) * k, asleep: false, moving: true };
}

const now = () => (G.S.map === CAT.map && !indoors() ? catAt(G.S.day, G.S.time, G.S.weather) : null);

function drawCat(c, p) {
  const x = p.x | 0, y = p.y | 0, grey = '#8a8f96', dark = '#5f646b';
  if (p.asleep) {   // curled up, tail round the nose
    r(c, x - 4, y - 3, 8, 4, grey); r(c, x - 3, y - 4, 6, 1, grey); r(c, x + 2, y - 5, 2, 2, grey); r(c, x - 4, y, 7, 1, dark);
    return;
  }
  const step = p.moving && Math.floor(performance.now() / 150) % 2;
  r(c, x - 3, y - 4, 6, 4, grey); r(c, x + 2, y - 7, 3, 3, grey); r(c, x + 2, y - 8, 1, 1, dark); r(c, x + 4, y - 8, 1, 1, dark);
  r(c, x - 5, y - 6 + (step ? 1 : 0), 2, 3, dark);   // the tail
  r(c, x - 2, y, 1, 1 + (step ? 0 : 1), dark); r(c, x + 1, y, 1, 1 + (step ? 1 : 0), dark);
  r(c, x + 3, y - 6, 1, 1, '#e9c46a');
}

addEntities(() => { const p = now(); return p ? [{ y: p.y + 4, draw: (c) => drawCat(c, p) }] : []; });

const facingCat = (tx, ty) => { const p = now(); return p && !p.moving && Math.floor(p.x / T) === tx && Math.floor(p.y / T) === ty; };
addInteraction(64, ({ tx, ty }) => {
  if (!facingCat(tx, ty)) return false;
  notify(CAT.pet[(G.S.day + G.S.time) % CAT.pet.length]);
  return true;
});
addPrompt(64, ({ tx, ty }) => (facingCat(tx, ty) ? `Pet ${CAT.name}` : null));
