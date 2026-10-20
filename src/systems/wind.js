// Wind (v103): how far things lean downwind, in a wave that rolls across the map, stronger in rain and storms and
// breezier on some days than others. No drawing and no registration here, so the balance bot can load the systems
// that use it: tree crowns (render/renderer.js), fruit trees (trees.js), alders and grass patches (clearing.js),
// tufts and washing (sway.js) draw themselves with lean(x) and render/sway.js.
import { G } from '../core/game.js';
import { MAPS } from '../data/maps.js';
import { WIND } from '../data/atmosphere.js';
import { rng } from '../render/pixel.js';

const outdoors = () => !!MAPS[G.S.map] && !MAPS[G.S.map].base;

// Today's wind: [strength, speed], from the weather and the day's breeziness.
let day = { key: null, strength: 0, speed: 1 };
function wind() {
  const key = `${G.S.day}-${G.S.weather}`;
  if (day.key !== key) {
    const [s, v] = WIND.weather[G.S.weather] || WIND.weather.sun, [lo, hi] = WIND.daily;
    day = { key, strength: s * (lo + (hi - lo) * rng(G.S.day * 7 + 3)()), speed: v };
  }
  return day;
}

// How far things at pixel column x lean right now: about 0 (still) to 1 (full), 0 indoors.
export function lean(x) {
  if (!outdoors()) return 0;
  const { strength, speed } = wind(), t = performance.now() / 1000;
  const wave = 0.5 + 0.5 * Math.sin(t * speed * 1.7 - x / WIND.length), gust = 1 - WIND.gust + WIND.gust * Math.sin(t * 0.31 + 1.7);
  return strength * wave * gust;
}
export const shiftOf = (l, m) => Math.round(Math.max(-0.5, Math.min(1, l)) * m);
