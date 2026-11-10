// v218 (roadmap 78c): overnight surprises (data/surprises.js), rolled each morning after the night's growth, at most
// one a night, told in the morning report (report.surprise): a crop fairy ripens a patch of crops, a meteorite lands,
// a stone owl turns up by the house, or an odd stone figure appears in the field. Nothing is lost, and nothing new is
// saved: the meteorite is farm debris, the owl and the figure are placed decorations the player can pick up.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { CROPS } from '../data/crops.js';
import { SURPRISES, FAIRY_REACH, OWL_NEAR } from '../data/surprises.js';
import { addDebris, freeTile } from './clearing.js';
import { putBack } from './placeables.js';
import { isRipe } from './farming.js';
import { rng } from '../render/pixel.js';

// The night's own random numbers (see rollSurprise), so a surprise picks its tile from the same sequence it was rolled from.
let roll = Math.random;
const pick = (a) => a[Math.floor(roll() * a.length)];
const freeTiles = (x0 = 0, y0 = 0, x1 = Infinity, y1 = Infinity) => {
  const out = [];
  MAPS.farm.grid.forEach((row, y) => row.forEach((_, x) => { if (x >= x0 && x <= x1 && y >= y0 && y <= y1 && freeTile(x, y)) out.push([x, y]); }));
  return out;
};
const place = (kind, spots) => {
  if (!spots.length) return null;
  const [x, y] = pick(spots);
  G.S.kit[kind] = (G.S.kit[kind] || 0) + 1;
  if (putBack('farm', x, y, { kind })) { G.S.kit[kind]--; return null; }
  return { x, y };
};

// Each returns what happened (for the report), or null when there was no room for it.
export const HAPPEN = {
  fairy() {
    if (today().season === 'Winter') return null;
    const growing = Object.entries(G.S.soil).filter(([, s]) => s.crop && !s.crop.dead && !isRipe(s.crop));
    if (!growing.length) return null;
    const [x0, y0] = pick(growing)[0].split(',').map(Number);
    let n = 0;
    for (let dy = -FAIRY_REACH; dy <= FAIRY_REACH; dy++) for (let dx = -FAIRY_REACH; dx <= FAIRY_REACH; dx++) {
      const s = G.S.soil[`${x0 + dx},${y0 + dy}`];
      if (s?.crop && !s.crop.dead && !isRipe(s.crop)) { s.crop.age = s.crop.need || CROPS[s.crop.type].days; n++; }
    }
    return { crops: n };
  },
  meteorite() {
    const spots = freeTiles();
    if (!spots.length) return null;
    const [x, y] = pick(spots);
    addDebris(x, y, { kind: 'meteorite' });
    return G.S.debris[`${x},${y}`]?.kind === 'meteorite' ? { x, y } : null;
  },
  owl: () => place('stoneowl', freeTiles(OWL_NEAR.x0, OWL_NEAR.y0, OWL_NEAR.x1, OWL_NEAR.y1)),
  figure: () => place('oddfigure', freeTiles()),
};

// Rolls the night's surprise from random, a function standing in for Math.random.
export function rollSurprise(random = Math.random) {
  roll = random;
  try {
    for (const { key, chance } of SURPRISES) {
      if (roll() >= chance) continue;
      const what = HAPPEN[key]();
      if (what) return { key, ...what };
    }
    return null;
  } finally { roll = Math.random; }
}

// Each farm's nights have their own sequence, from its name and the day: reloading a save cannot roll the night
// again, and the surprises draw nothing from Math.random, so they leave every other roll in the game as it was.
const farmSeed = () => [...(G.S.profile?.farm || G.S.profile?.name || 'Hollowmere')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 17);
export const nightRandom = (day = G.S.day) => rng((farmSeed() ^ Math.imul(day, 2654435761)) >>> 0);

on('day:start', (report) => {
  if (!G.S.debris || !G.S.soil) return;
  const s = rollSurprise(nightRandom());
  if (s) report.surprise = s;
});
