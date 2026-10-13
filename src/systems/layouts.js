// Farm layouts: rebuilds the farm grid for G.S.layout whenever a game loads. Imported first in
// main.js so its game:loaded runs before the systems that write runtime tiles (coop, barn,
// greenhouse, placed objects, debris) into the grid. The layouts' perks live in systems/farmPerks.js.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { MAPS, farmGrid } from '../data/maps.js';
import { LAYOUTS } from '../data/layouts.js';
import { COOP } from '../data/upgrades.js';

export const layout = () => LAYOUTS[G.S.layout] || LAYOUTS.open;

on('game:loaded', () => {
  const fresh = farmGrid(), grid = MAPS.farm.grid;
  layout().apply(fresh);
  for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[y].length; x++) grid[y][x] = fresh[y][x];   // in place: other modules hold the rows
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
