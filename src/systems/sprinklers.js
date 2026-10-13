// Sprinklers water the tilled soil around them every morning, and right away when placed.
import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { PLACEABLES, sprinklerTiles } from '../data/crafting.js';
import { soilOf, parsePlaceKey } from './world.js';

function water(map, x, y, def) {
  const soil = soilOf(map);
  let n = 0;
  for (const [a, b] of sprinklerTiles(def, x, y)) {
    const s = soil?.[`${a},${b}`];
    if (s && !s.w) { s.w = true; n++; }
  }
  return n;
}

function waterAll() {
  let n = 0;
  for (const [k, p] of Object.entries(G.S.placed)) {
    const def = PLACEABLES[p.kind];
    if (def.kind !== 'sprinkler') continue;
    const { map, x, y } = parsePlaceKey(k);
    n += water(map, x, y, def);
  }
  return n;
}

// day:end in farming.js grows crops and dries the soil; this runs after, on the new day.
on('day:start', (report) => { report.sprinkled = waterAll(); });
on('placed', ({ map, x, y, kind }) => { if (PLACEABLES[kind].kind === 'sprinkler') { water(map, x, y, PLACEABLES[kind]); changed(); } });
