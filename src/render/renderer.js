// Composes a frame: cached background, ground layers, facing outline, y-sorted entities, overlays, night tint.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { on } from '../core/events.js';
import { drawLayers, collectEntities } from '../core/registry.js';
import { today, dayEnd } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { PAL } from '../data/seasons.js';
import { drawGrass, drawPath, drawTree, drawWater, drawRock, drawCaveFloor, drawGreenhouseFloor, drawGlassWall, drawQuarry, drawSand, drawBowl, drawHouseTile, HOUSE_ART, OBJECT_ART, CAVE_ART } from './tiles.js';
import { facing, tileAt } from '../systems/world.js';
import { WALLPAPERS, FLOORS } from '../data/furniture.js';

let cache = {};
on('season:changed', () => { cache = {}; });
on('game:reset', () => { cache = {}; });
on('world:changed', () => { cache = {}; });

const TILE_ART = { b: drawBowl, O: drawWater, T: drawTree, R: drawRock, w: drawGlassWall, ...CAVE_ART };

function renderBackground(mapId, season) {
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), map = MAPS[mapId], p = map.theme ? { ...PAL[season], theme: map.theme } : PAL[season];   // v38: theme (the cavern's sand)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = map.grid[y][x];
    if (map.base === 'house') { drawHouseTile(g, x, y, t, map.grid[y + 1]?.[x], WALLPAPERS, FLOORS, map.decor); continue; }
    if (map.base === 'cave') drawCaveFloor(g, x, y, p);
    else if (map.base === 'greenhouse' && t !== 'E') drawGreenhouseFloor(g, x, y, t);
    else if (t === 'P' || t === 'E') drawPath(g, x, y, p);
    else if (t === 'q') drawQuarry(g, x, y, p);
    else if (t === 'z' || (map.ground === 'z' && t !== 'T')) drawSand(g, x, y, p);   // v43: the beach's rocks sit on sand
    else drawGrass(g, x, y, p, map.salt);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (map.base === 'house') { const ha = HOUSE_ART[map.grid[y][x]]; if (ha) ha(g, x, y, map.grid); continue; }
    const art = TILE_ART[map.grid[y][x]]; if (art) art(g, x, y, p);
  }
  map.objects.forEach((o) => OBJECT_ART[o.art](g, p, o));
  return c;
}

function background() {
  const key = G.S.map + '-' + today().season + (MAPS[G.S.map].theme || '');
  return cache[key] || (cache[key] = renderBackground(G.S.map, today().season));
}

export function draw(c) {
  c.imageSmoothingEnabled = false;
  c.drawImage(background(), 0, 0);
  drawLayers(c, 0, 49);
  const f = facing(), t = tileAt(f.tx, f.ty);
  if (t && !['T', 'X', 'w', 'I', '.'].includes(t)) { c.strokeStyle = 'rgba(255,246,214,.6)'; c.lineWidth = 1; c.strokeRect(f.tx * T + 0.5, f.ty * T + 0.5, T - 1, T - 1); }
  collectEntities().sort((a, b) => a.y - b.y).forEach((e) => e.draw(c));
  drawLayers(c, 50, 999);
  if (G.S.time > 18 * 60 && MAPS[G.S.map].base !== 'cave' && MAPS[G.S.map].base !== 'house') {
    const a = Math.min(0.5, (G.S.time - 18 * 60) / (dayEnd() - 18 * 60) * 0.55);
    c.fillStyle = `rgba(18,22,58,${a})`; c.fillRect(0, 0, W * T, H * T);
  }
}
