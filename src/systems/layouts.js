// Farm layouts: rebuilds the farm grid for G.S.layout (and the farmhouse grid for the house upgrade)
// whenever a game loads. Imported first in
// main.js so its game:loaded runs before the systems that write runtime tiles (coop, barn,
// greenhouse, placed objects, debris) into the grid. The layouts' perks live in systems/farmPerks.js.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { MAPS, farmGrid, houseGrid, joinFarm } from '../data/maps.js';
import { LAYOUTS, farmPlan } from '../data/layouts.js';
import { forgetRoutes } from './routes.js';
import { COOP } from '../data/upgrades.js';

export const layout = () => LAYOUTS[G.S.layout] || LAYOUTS.open;
// v340 (roadmap 118b): this farm's size, land and perks (small or big by G.S.bigFarm).
export const plan = (S = G.S) => farmPlan(S.layout, S.bigFarm);

// keep: leave furniture tiles ('Y') where the new grid has floor (a house change during play).
// v320 (roadmap 112a): the grid takes the fresh one's size too (a farm of another layout, or another slot), still in
// place: other modules hold the grid and its rows.
function copyInto(grid, fresh, keep) {
  grid.length = Math.min(grid.length, fresh.length);
  while (grid.length < fresh.length) grid.push([]);
  for (let y = 0; y < grid.length; y++) {
    grid[y].length = fresh[y].length;
    for (let x = 0; x < grid[y].length; x++) {
      if (!(keep && grid[y][x] === 'Y' && fresh[y][x] === 'h')) grid[y][x] = fresh[y][x];
    }
  }
}

// The farmhouse grid follows the house upgrade and renovations; decor is the wallpaper and flooring.
export function rebuildHouse(keep = false) {
  const h = G.S.house || {};
  copyInto(MAPS.house.grid, houseGrid(G.S.upgrades?.house || 0, h.renos || []), keep);
  MAPS.house.decor = { wall: h.wall || 0, floor: h.floor || 0 };
  emit('world:changed', 'house');
}

// v320 (roadmap 112a): the farm at its layout's size, with its edges joined to the wilds and the forest.
export function buildFarm(id = G.S.layout) {
  const p = farmPlan(id, G.S.bigFarm), { w, h } = p.size, fresh = farmGrid(w, h);
  p.apply(fresh);
  copyInto(MAPS.farm.grid, fresh, false);
  joinFarm(w, h);
  forgetRoutes();
}

on('game:loaded', () => {
  buildFarm();
  rebuildHouse(false);
  emit('world:changed');
});

// The layout's one-off start, applied when the new game screen is finished (before the farm loads).
// v340 (roadmap 118b): every farm started from now on is big.
export function startLayout(S) {
  S.bigFarm = true;
  const st = plan(S).perks.start;
  if (!st) return;
  if (st.coop) S.built.coop = true;
  for (let i = 0; i < (st.hens || 0); i++) S.chickens.push({ name: COOP.names[i], pet: 0 });
  S.feed += st.feed || 0;
}
