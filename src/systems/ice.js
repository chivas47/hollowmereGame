// v369 (roadmap 120d): ice in the Frost Halls (data/hollow.js ICE). Step onto it and you slide the way you stepped,
// keys or not, until something stops you or the ice ends; the ice cleats (found by the Frozen Lake, Hollow floor 50)
// stop the sliding. Creatures drift on it (systems/monsters.js step) and chargers skid past the end of a rush.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { changed, notify, emit, on } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { CLOTHES } from '../data/clothing.js';
import { ICE } from '../data/hollow.js';
import { moveBox, playerTile } from './world.js';
import { giveFind } from './gear.js';

// Whether the tile under a point on a map is ice.
export const iceAt = (map, px, py) => MAPS[map]?.grid[Math.floor(py / T)]?.[Math.floor(px / T)] === ICE.tile;
// Whether your shoes grip (the ice cleats).
export const grips = () => !!CLOTHES[G.S.outfit?.shoes]?.grip;

// Your move on ice, from player.js's updater: true when it moved you (a slide), false to walk as usual. dx, dy: the
// keys held; speed: walking speed in px a second.
export function slideTurn(dx, dy, dt, speed) {
  const S = G.S, { tx, ty } = playerTile();
  if (MAPS[S.map]?.grid[ty]?.[tx] !== ICE.tile || grips()) { G.slide = null; return false; }
  if (!G.slide) {
    if (!dx && !dy) return false;   // standing still on ice is fine
    const sx = dx && !dy ? Math.sign(dx) : dy ? 0 : Math.sign(dx), sy = sx ? 0 : Math.sign(dy);
    G.slide = { dx: sx, dy: sy };
    S.dir = sx ? (sx < 0 ? 'left' : 'right') : sy < 0 ? 'up' : 'down';
    if (sx) S.y = ty * T + 12; else S.x = tx * T + 8;   // onto the middle of the row or column, so it runs clean
  }
  const step = speed * ICE.slide * dt, hit = moveBox(S, G.slide.dx * step, G.slide.dy * step);
  const p = playerTile();
  if (hit.x || hit.y || MAPS[S.map].grid[p.ty]?.[p.tx] !== ICE.tile) G.slide = null;   // stopped by something, or off the ice
  return true;
}

// A slide ends when you change floor or map, or load a farm.
for (const ev of ['mine:floor', 'map:changed', 'game:loaded']) on(ev, () => { G.slide = null; });

// The cleats' peg by the Frozen Lake: take them once; after that it hangs empty.
addInteraction(73, ({ tile, mapId }) => {
  if (mapId !== 'mine' || (tile !== ICE.peg && tile !== ICE.pegEmpty)) return false;
  if (tile === ICE.pegEmpty || G.S.wardrobe[ICE.cleats]) { notify('The peg is empty. The cleats are yours now.'); return true; }
  giveFind(ICE.cleats, 'On the old miners\' peg you found');
  MAPS.mine.grid.forEach((row) => row.forEach((t, x) => { if (t === ICE.peg) row[x] = ICE.pegEmpty; }));
  emit('world:changed', 'mine');
  notify('Spiked soles: in these you will not slide on ice. They guard your feet less than good boots.');
  changed();
  return true;
});
addPrompt(73, ({ tile, mapId }) => (mapId === 'mine' && tile === ICE.peg && !G.S.wardrobe[ICE.cleats] ? 'Take the cleats' : null));
