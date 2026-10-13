// Sprinklers water the tilled soil around them every morning, and right away when placed.
import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { PLACEABLES, sprinklerTiles } from '../data/crafting.js';

function water(x, y, def) {
  let n = 0;
  for (const [a, b] of sprinklerTiles(def, x, y)) {
    const s = G.S.soil[`${a},${b}`];
    if (s && !s.w) { s.w = true; n++; }
  }
  return n;
}

function waterAll() {
  let n = 0;
  for (const [k, p] of Object.entries(G.S.placed)) {
    const def = PLACEABLES[p.kind];
    if (def.kind !== 'sprinkler') continue;
    const [x, y] = k.split(',').map(Number);
    n += water(x, y, def);
  }
  return n;
}

// day:end in farming.js grows crops and dries the soil; this runs after, on the new day.
on('day:start', (report) => { report.sprinkled = waterAll(); });
on('placed', ({ x, y, kind }) => { if (PLACEABLES[kind].kind === 'sprinkler') { water(x, y, PLACEABLES[kind]); changed(); } });
