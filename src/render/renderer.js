// Composes a frame: cached background, ground layers, facing outline, y-sorted entities, overlays, the light of the hour, layers above it.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { on } from '../core/events.js';
import { drawLayers, collectEntities } from '../core/registry.js';
import { today, dayEnd } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { PAL } from '../data/seasons.js';
import { LIGHT, NIGHT_FROM } from '../data/atmosphere.js';
import { drawGrass, drawPath, drawTree, drawWater, drawRock, drawCaveFloor, drawGreenhouseFloor, drawGlassWall, drawQuarry, drawSand, drawBowl, drawHouseTile, drawTerrain, drawFlowers, drawBuilding, drawProp, HOUSE_ART, CAVE_ART, PROP_ART, PROP_GROUND } from './tiles.js';
import { facing, tileAt } from '../systems/world.js';
import { WALLPAPERS, FLOORS } from '../data/furniture.js';
import { TERRAIN_SHEET, CAVE_SHEET } from '../data/sprites.js';
import { drawHomeTile } from './interiors.js';
import { ready, sheet, onSheet } from './sheets.js';

let cache = {};
on('season:changed', () => { cache = {}; });
on('game:reset', () => { cache = {}; });
on('world:changed', () => { cache = {}; });
onSheet(() => { cache = {}; });   // v85: redraw the background once a sheet arrives (ground, cave, wallpaper, floors)

const TILE_ART = { b: drawBowl, O: drawWater, T: drawTree, R: drawRock, w: drawGlassWall, ...CAVE_ART };

function renderBackground(mapId, season) {
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), map = MAPS[mapId], p = map.theme ? { ...PAL[season], theme: map.theme } : PAL[season];   // v38: theme (the cavern's sand)
  const ground = map.base === 'cave' ? CAVE_SHEET.sheet(map.theme) : TERRAIN_SHEET.sheet(season);
  const sheetGround = (!map.base || map.base === 'cave') && ready(ground);   // v85: outdoor ground (v87: and caves) from a tile set
  if (sheetGround && map.base === 'cave') drawTerrain(g, sheet(ground).img, CAVE_SHEET, (x, y) => (map.grid[y][x] === 'X' || PROP_GROUND[map.grid[y][x]] === 'wall' ? 'wall' : 'floor'), 'floor', W, H);
  else if (sheetGround) {
    drawTerrain(g, sheet(ground).img, TERRAIN_SHEET, (x, y) => groundOf(map, map.grid[y][x]), { q: 'quarry', z: 'sand' }[map.ground] || 'grass', W, H,
      (x, y) => { if (groundOf(map, map.grid[y][x]) === 'grass') drawFlowers(g, x, y, p, map.salt); });
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = map.grid[y][x];
    if (map.home) { drawHomeTile(g, x, y, map); continue; }   // v97: a cottage's own rooms
    if (map.base === 'house') { drawHouseTile(g, x, y, t, map.grid[y + 1]?.[x], WALLPAPERS, FLOORS, map.decor); continue; }
    if (sheetGround) continue;
    if (map.base === 'cave') drawCaveFloor(g, x, y, p);
    else if (map.base === 'greenhouse' && t !== 'E') drawGreenhouseFloor(g, x, y, t);
    else if (t === 'P' || t === 'E') drawPath(g, x, y, p);
    else if (t === 'q' || (map.ground === 'q' && t !== 'T')) drawQuarry(g, x, y, p);   // v44: the quarry's rocks sit on stone
    else if (t === 'z' || (map.ground === 'z' && t !== 'T')) drawSand(g, x, y, p);   // v43: the beach's rocks sit on sand
    else drawGrass(g, x, y, p, map.salt);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (map.base === 'house') { const ha = HOUSE_ART[map.grid[y][x]]; if (ha) ha(g, x, y, map.grid); continue; }
    const t = map.grid[y][x], art = TILE_ART[t];
    if (sheetGround && PROP_ART[t]) drawProp(g, t, x, y, p);   // v89: the prop alone, its ground is in the tile set
    else if (art && !(sheetGround && (map.base === 'cave' ? t === 'X' : t === 'O'))) art(g, x, y, p);   // v85: outdoor water (v87: cave walls) are in the tile set
  }
  map.objects.forEach((o) => drawBuilding(g, p, o));   // v88: from the building sheets
  return c;
}

// v85: the terrain each outdoor tile shows on the terrain sheet (the same choice as the code art above).
function groundOf(map, t) {
  if (t === 'P' || t === 'E') return 'path';
  if (t === 'O') return 'water';
  if (t === 'q' || (map.ground === 'q' && t !== 'T')) return 'quarry';
  if (t === 'z' || (map.ground === 'z' && t !== 'T') || PROP_GROUND[t] === 'sand') return 'sand';
  return 'grass';
}

function background() {
  const key = G.S.map + '-' + today().season + (MAPS[G.S.map].theme || '');
  return cache[key] || (cache[key] = renderBackground(G.S.map, today().season));
}

export function draw(c) {
  c.imageSmoothingEnabled = false;
  const sk = G.shake;   // v74: screen shake (systems/animation.js)
  c.save();
  if (sk) { const m = sk.mag * Math.min(1, sk.t / sk.max * 1.5); c.fillStyle = '#000'; c.fillRect(0, 0, W * T, H * T); c.translate(Math.round((Math.random() - 0.5) * 2 * m), Math.round((Math.random() - 0.5) * 2 * m)); }
  c.drawImage(background(), 0, 0);
  drawLayers(c, 0, 49);
  const f = facing(), t = tileAt(f.tx, f.ty);
  if (t && !['T', 'X', 'w', 'I', '.'].includes(t)) { c.strokeStyle = 'rgba(255,246,214,.6)'; c.lineWidth = 1; c.strokeRect(f.tx * T + 0.5, f.ty * T + 0.5, T - 1, T - 1); }
  collectEntities().sort((a, b) => a.y - b.y).forEach((e) => e.draw(c));
  drawLayers(c, 50, 999);
  if (MAPS[G.S.map].base !== 'cave' && MAPS[G.S.map].base !== 'house') tint(c);
  drawLayers(c, 1000, 1999);   // v72: above the tint (fireflies)
  c.restore();
}

// v72: the light of the hour (data/atmosphere.js LIGHT); after dark it opens around the player.
function tint(c) {
  const time = Math.min(G.S.time, dayEnd()), k = LIGHT.findIndex((f) => f[0] > time);
  const [a, b] = k <= 0 ? [LIGHT[LIGHT.length - 1], LIGHT[LIGHT.length - 1]] : [LIGHT[k - 1], LIGHT[k]];
  const f = b[0] === a[0] ? 0 : (time - a[0]) / (b[0] - a[0]), mix = (i) => Math.round(a[i] + (b[i] - a[i]) * f);
  const alpha = a[4] + (b[4] - a[4]) * f;
  if (alpha <= 0.01) return;
  const rgb = `${mix(1)},${mix(2)},${mix(3)}`, w = W * T, h = H * T;
  if (time < NIGHT_FROM) { c.fillStyle = `rgba(${rgb},${alpha})`; c.fillRect(0, 0, w, h); return; }
  const g = c.createRadialGradient(G.S.x, G.S.y, T * 1.5, G.S.x, G.S.y, T * 7);
  g.addColorStop(0, `rgba(${rgb},${alpha * 0.55})`); g.addColorStop(1, `rgba(${rgb},${alpha})`);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}
