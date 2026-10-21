// Footsteps (v109): a soft step for every few pixels you walk, sounding like what is underfoot (data/atmosphere.js
// STEPS): grass, dirt path, sand, stone, wooden floors and the pier, snow in winter, wet ground in rain; hooves on
// horseback. On the ambient bus, so the Ambience slider sets their volume; Steps in the menu turns them off.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { PLACEABLES } from '../data/crafting.js';
import { STEPS, STEP_EVERY, HOOF_EVERY } from '../data/atmosphere.js';
import { noise, settings, stats } from './engine.js';
import { placeKey } from '../systems/world.js';

stats.steps = 0;

// What the player is standing on.
export function surfaceAt(mapId, x, y) {
  const map = MAPS[mapId];
  if (!map) return 'grass';
  if (map.base === 'house' || map.base === 'greenhouse') return 'wood';
  if (map.base === 'cave') return 'stone';
  const placed = G.S.placed?.[placeKey(mapId, x, y)]?.kind;   // a path laid on the farm
  if (PLACEABLES[placed]?.kind === 'floor') return placed === 'stonepath' ? 'stone' : 'wood';
  const t = map.grid[y]?.[x];
  if ((t === 'P' || t === 'E') && mapId === 'beach' && y >= 10) return 'wood';   // the pier
  if (t === 'z' || (map.ground === 'z' && t !== 'P' && t !== 'E')) return 'sand';
  if (t === 'q' || map.ground === 'q') return 'stone';
  const soft = t === 'P' || t === 'E' ? 'path' : 'grass';
  if (today().season === 'Winter') return 'snow';
  if (G.S.weather === 'rain' || G.S.weather === 'storm') return 'wet';
  return soft;
}

function step(kind) {
  const vary = 0.85 + Math.random() * 0.3;
  for (const [filter, freq, dur, vol, sweep] of STEPS[kind] || STEPS.grass) {
    noise({ filter, freq: freq * vary, dur, vol: vol * (0.8 + Math.random() * 0.4), sweep: sweep ? sweep * vary : null, bus: 'ambient' });
  }
  stats.steps++;
}

let last = null, walked = 0;
addUpdater(() => {
  const S = G.S, here = { map: S.map, x: S.x, y: S.y };
  if (!last || last.map !== here.map || !G.moving) { last = here; walked = G.moving ? walked : 0; return; }
  walked += Math.hypot(here.x - last.x, here.y - last.y);
  last = here;
  const every = G.riding ? HOOF_EVERY : STEP_EVERY;
  if (walked < every) return;
  walked -= every;
  if (settings.steps === false || !settings.sfx) return;
  step(G.riding ? 'hoof' : surfaceAt(S.map, Math.floor(S.x / T), Math.floor(S.y / T)));
});
