// Farm layouts: rebuilds the farm grid for G.S.layout (and the farmhouse grid for the house upgrade)
// whenever a game loads. Imported first in
// main.js so its game:loaded runs before the systems that write runtime tiles (coop, barn,
// greenhouse, placed objects, debris) into the grid. The layouts' perks live in systems/farmPerks.js.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { MAPS, farmGrid, houseGrid } from '../data/maps.js';
import { LAYOUTS } from '../data/layouts.js';
import { COOP } from '../data/upgrades.js';

export const layout = () => LAYOUTS[G.S.layout] || LAYOUTS.open;

// keep: leave furniture tiles ('Y') where the new grid has floor (a house change during play).
function copyInto(grid, fresh, keep) {
  for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[y].length; x++) {
    if (!(keep && grid[y][x] === 'Y' && fresh[y][x] === 'h')) grid[y][x] = fresh[y][x];   // in place: other modules hold the rows
  }
}

// The farmhouse grid follows the house upgrade and renovations; decor is the wallpaper and flooring.
export function rebuildHouse(keep = false) {
  const h = G.S.house || {};
  copyInto(MAPS.house.grid, houseGrid(G.S.upgrades?.house || 0, h.renos || []), keep);
  MAPS.house.decor = { wall: h.wall || 0, floor: h.floor || 0 };
  emit('world:changed');
}

on('game:loaded', () => {
  const fresh = farmGrid();
  layout().apply(fresh);
  copyInto(MAPS.farm.grid, fresh, false);
  rebuildHouse(false);
  emit('world:changed');
});

// The layout's one-off start, applied when the new game screen is finished (before the farm loads).
export function startLayout(S) {
  const st = LAYOUTS[S.layout]?.perks?.start;
  if (!st) return;
  if (st.coop) S.built.coop = true;
  for (let i = 0; i < (st.hens || 0); i++) S.chickens.push({ name: COOP.names[i], pet: 0 });
  S.feed += st.feed || 0;
}
