// Composes a frame: cached background, ground layers, facing outline, y-sorted entities, overlays, the light of the hour, layers above it.
import { G } from '../core/game.js';
import { T, H, DIRS } from '../core/constants.js';
import { on } from '../core/events.js';
import { drawLayers, collectEntities } from '../core/registry.js';
import { today, dayEnd } from '../core/time.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { PAL } from '../data/seasons.js';
import { LIGHT, NIGHT_FROM } from '../data/atmosphere.js';
import { drawGrass, drawPath, drawTree, drawWater, drawRock, drawCaveFloor, drawGreenhouseFloor, drawGlassWall, drawQuarry, drawSand, drawBowl, drawHouseTile, drawTerrain, drawFlowers, drawBuilding, drawProp, HOUSE_ART, CAVE_ART, PROP_ART, PROP_GROUND } from './tiles.js';
import { facing, tileAt } from '../systems/world.js';
import { WALLPAPERS, FLOORS } from '../data/furniture.js';
import { TERRAIN_SHEET, CAVE_SHEET } from '../data/sprites.js';
import { drawHomeTile } from './interiors.js';
import { ready, sheet, onSheet } from './sheets.js';
import { addLayer } from '../core/registry.js';
import { WIND } from '../data/atmosphere.js';
import { lean, shiftOf } from '../systems/wind.js';
import { outdoorLights } from '../systems/nightlights.js';
import { views, visible } from './views.js';

let cache = {};
on('season:changed', () => { cache = {}; });
on('game:reset', () => { cache = {}; });
on('world:changed', () => { cache = {}; });
onSheet(() => { cache = {}; });   // v85: redraw the background once a sheet arrives (ground, cave, wallpaper, floors)

const TILE_ART = { b: drawBowl, O: drawWater, T: drawTree, R: drawRock, w: drawGlassWall, ...CAVE_ART };

// v103: a map's tree tiles keep only their trunk foot in the background; their crowns go to a canvas of their own
// drawn every frame below, leaning in the wind (systems/wind.js).
const CROWN = 12;   // rows of a tree tile that sway (drawTree's crown and its shadow)
function renderBackground(mapId, season) {
  const { w: MW, h: MH } = sizeOf(mapId);   // v156: the map's own size (larger than the screen behind a camera)
  const c = document.createElement('canvas'); c.width = MW * T; c.height = MH * T;
  const crowns = document.createElement('canvas'); crowns.width = MW * T; crowns.height = MH * T;
  const k = crowns.getContext('2d'), trees = [];
  const g = c.getContext('2d'), map = MAPS[mapId], p = map.theme ? { ...PAL[season], theme: map.theme } : PAL[season];   // v38: theme (the cavern's sand)
  const ground = map.base === 'cave' ? CAVE_SHEET.sheet(map.theme) : TERRAIN_SHEET.sheet(season);
  const sheetGround = (!map.base || map.base === 'cave') && ready(ground);   // v85: outdoor ground (v87: and caves) from a tile set
  if (sheetGround && map.base === 'cave') drawTerrain(g, sheet(ground).img, CAVE_SHEET, (x, y) => (map.grid[y][x] === 'X' || PROP_GROUND[map.grid[y][x]] === 'wall' ? 'wall' : 'floor'), 'floor', MW, MH);
  else if (sheetGround) {
    drawTerrain(g, sheet(ground).img, TERRAIN_SHEET, (x, y) => groundOf(map, map.grid[y][x]), { q: 'quarry', z: 'sand' }[map.ground] || 'grass', MW, MH,
      (x, y) => { if (groundOf(map, map.grid[y][x]) === 'grass') drawFlowers(g, x, y, p, map.salt); });
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const t = map.grid[y][x];
    if (map.plan) { drawHomeTile(g, x, y, map); continue; }   // v97: a cottage's own rooms (v98: or a building's)
    if (map.base === 'house') { drawHouseTile(g, x, y, t, map.grid[y + 1]?.[x], WALLPAPERS, FLOORS, map.decor); continue; }
    if (sheetGround) continue;
    if (map.base === 'cave') drawCaveFloor(g, x, y, p);
    else if (map.base === 'greenhouse' && t !== 'E') drawGreenhouseFloor(g, x, y, t);
    else if (t === 'P' || t === 'E') drawPath(g, x, y, p);
    else if (t === 'q' || (map.ground === 'q' && t !== 'T')) drawQuarry(g, x, y, p);   // v44: the quarry's rocks sit on stone
    else if (t === 'z' || (map.ground === 'z' && t !== 'T')) drawSand(g, x, y, p);   // v43: the beach's rocks sit on sand
    else drawGrass(g, x, y, p, map.salt);
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (map.base === 'house') { const ha = HOUSE_ART[map.grid[y][x]]; if (ha) ha(g, x, y, map.grid); continue; }
    const t = map.grid[y][x], art = TILE_ART[t];
    if (sheetGround && PROP_ART[t]) drawProp(g, t, x, y, p);   // v89: the prop alone, its ground is in the tile set
    else if (art === drawTree) { art(k, x, y, p); g.drawImage(crowns, x * T, y * T + CROWN, T, T - CROWN, x * T, y * T + CROWN, T, T - CROWN); trees.push([x, y]); }
    else if (art && !(sheetGround && (map.base === 'cave' ? t === 'X' : t === 'O'))) art(g, x, y, p);   // v85: outdoor water (v87: cave walls) are in the tile set
  }
  map.objects.forEach((o) => drawBuilding(g, p, o));   // v88: from the building sheets
  // One canvas per wind band (data/atmosphere.js WIND.tree) holding that band of every crown, so a column of
  // trees leans with one copy per band.
  const bands = WIND.tree.map(([a, b]) => {
    const y0 = Math.round(a * CROWN), y1 = Math.round(b * CROWN), bc = document.createElement('canvas'); bc.width = MW * T; bc.height = MH * T;
    const bg = bc.getContext('2d');
    for (const [x, y] of trees) bg.drawImage(crowns, x * T, y * T + y0, T, y1 - y0, x * T, y * T + y0, T, y1 - y0);
    return bc;
  });
  return { bg: c, bands, cols: [...new Set(trees.map(([x]) => x))] };
}

// v85: the terrain each outdoor tile shows on the terrain sheet (the same choice as the code art above).
function groundOf(map, t) {
  if (t === 'P' || t === 'E') return 'path';
  if (t === 'O') return 'water';
  if (t === 'q' || (map.ground === 'q' && t !== 'T')) return 'quarry';
  if (t === 'z' || (map.ground === 'z' && t !== 'T') || PROP_GROUND[t] === 'sand') return 'sand';
  return 'grass';
}

function cached() {
  const key = G.S.map + '-' + today().season + (MAPS[G.S.map].theme || '');
  return cache[key] || (cache[key] = renderBackground(G.S.map, today().season));
}
const background = () => cached().bg;

// v103: the tree crowns, under everything else, each band of each column leaning with the wind there.
addLayer(4, (c) => {
  const { bands, cols } = cached(), h = sizeOf(G.S.map).h * T;
  for (const x of cols) {
    const X = x * T, l = lean(X);
    bands.forEach((bc, i) => c.drawImage(bc, X, 0, T, h, X + shiftOf(l, WIND.tree[i][2]), 0, T, h));
  }
});

// v139: one view per farmer (render/views.js); G.view is the farmer a view follows while it draws, so the light
// after dark, the dark of the mine and the facing outline open around them.
export function draw(c) {
  c.imageSmoothingEnabled = false;
  const list = views();
  for (const v of list) {
    c.save();
    if (list.length > 1) { c.beginPath(); c.rect(v.x0, 0, v.w, v.h); c.clip(); }
    c.translate(v.x0 - v.cam, -v.camY);   // v156: the camera moves both ways over a map larger than the screen
    // v140: their half draws their map: G.S.map is theirs while it draws, G.youMap keeps yours (so you are not
    // drawn on a map you are not on).
    const yours = G.S.map, apart = v.farmer !== G.S && v.farmer.map !== yours;
    G.view = v.farmer; G.drawing = v;
    if (apart) { G.youMap = yours; G.S.map = v.farmer.map; }
    try { drawWorld(c); } finally { G.view = null; G.drawing = null; if (apart) { G.S.map = yours; G.youMap = null; } c.restore(); }
  }
  if (list.length > 1) { c.fillStyle = '#1c1612'; c.fillRect(list[1].x0 - 1, 0, 2, H * T); }   // the line between the halves
}

// The tile the farmer a view follows is facing.
function facingOf(p) {
  if (p === G.S) return facing();
  const [dx, dy] = DIRS[p.dir];
  return { tx: Math.floor(p.x / T) + dx, ty: Math.floor((p.y - 2) / T) + dy };
}

function drawWorld(c) {
  const sk = G.shake;   // v74: screen shake (systems/animation.js)
  c.save();
  if (sk) { const m = sk.mag * Math.min(1, sk.t / sk.max * 1.5); const s = visible(); c.fillStyle = '#000'; c.fillRect(s.x, s.y, s.w, s.h); c.translate(Math.round((Math.random() - 0.5) * 2 * m), Math.round((Math.random() - 0.5) * 2 * m)); }
  c.drawImage(background(), 0, 0);
  drawLayers(c, 0, 49);
  const f = facingOf(G.view || G.S), t = tileAt(f.tx, f.ty);
  if (t && !['T', 'X', 'w', 'I', '.'].includes(t)) { c.strokeStyle = 'rgba(255,246,214,.6)'; c.lineWidth = 1; c.strokeRect(f.tx * T + 0.5, f.ty * T + 0.5, T - 1, T - 1); }
  collectEntities().sort((a, b) => a.y - b.y).forEach((e) => e.draw(c));
  drawLayers(c, 50, 999);
  if (MAPS[G.S.map].base !== 'cave' && MAPS[G.S.map].base !== 'house') tint(c);
  drawLayers(c, 1000, 1999);   // v72: above the tint (fireflies)
  c.restore();
}

// v72: the light of the hour (data/atmosphere.js LIGHT); after dark it opens around the player.
// v100: the blended keyframe of the hour, also for the indoor light (systems/indoors.js).
export function lightAt(minute) {
  const time = Math.min(minute, dayEnd()), k = LIGHT.findIndex((f) => f[0] > time);
  const [a, b] = k <= 0 ? [LIGHT[LIGHT.length - 1], LIGHT[LIGHT.length - 1]] : [LIGHT[k - 1], LIGHT[k]];
  const f = b[0] === a[0] ? 0 : (time - a[0]) / (b[0] - a[0]), mix = (i) => Math.round(a[i] + (b[i] - a[i]) * f);
  return { time, rgb: `${mix(1)},${mix(2)},${mix(3)}`, alpha: a[4] + (b[4] - a[4]) * f };
}
// v105: outdoor lights (systems/nightlights.js) cut pools out of it and glow warm over them. The pools and glows
// are drawn once into two canvases, redrawn only when a light comes on or goes out.
let shade = null, lit = { key: null, mask: null, glow: null };
// v156: as large as the map, so pools and glows sit where their lights are on a map larger than the screen.
const mapPx = () => { const s = sizeOf(G.S.map); return { width: s.w * T, height: s.h * T }; };
const canvas = () => Object.assign(document.createElement('canvas'), mapPx());
const fit = (cv) => { const p = mapPx(); if (cv.width !== p.width || cv.height !== p.height) Object.assign(cv, p); return cv; };
function pool(g, l, r, a0, a1) {
  const gr = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, r);
  gr.addColorStop(0, a0); gr.addColorStop(1, a1);
  g.fillStyle = gr; g.fillRect(l.x - r, l.y - r, r * 2, r * 2);
}
function lightCanvases(lights) {
  const key = G.S.map + lights.map((l) => `${l.x},${l.y}`).join(';');
  if (lit.key === key) return lit;
  const mask = fit(lit.mask || canvas()), glow = fit(lit.glow || canvas()), m = mask.getContext('2d'), g = glow.getContext('2d');
  m.clearRect(0, 0, mask.width, mask.height); g.clearRect(0, 0, glow.width, glow.height);
  g.globalCompositeOperation = 'lighter';
  for (const l of lights) { pool(m, l, l.r, 'rgba(0,0,0,.85)', 'rgba(0,0,0,0)'); pool(g, l, l.r * 0.8, `rgba(${l.rgb},.35)`, `rgba(${l.rgb},0)`); }
  return (lit = { key, mask, glow });
}
function tint(c) {
  const { time, rgb, alpha } = lightAt(G.S.time);
  if (alpha <= 0.01) return;
  const v = visible(), lights = outdoorLights(), k = lights.length ? fit(shade ||= canvas()).getContext('2d') : c;
  if (lights.length) { k.globalCompositeOperation = 'source-over'; k.clearRect(0, 0, shade.width, shade.height); }
  if (time < NIGHT_FROM) { k.fillStyle = `rgba(${rgb},${alpha})`; k.fillRect(v.x, v.y, v.w, v.h); }
  else {
    const p = G.view || G.S, g = k.createRadialGradient(p.x, p.y, T * 1.5, p.x, p.y, T * 7);
    g.addColorStop(0, `rgba(${rgb},${alpha * 0.55})`); g.addColorStop(1, `rgba(${rgb},${alpha})`);
    k.fillStyle = g; k.fillRect(v.x, v.y, v.w, v.h);
  }
  if (!lights.length) return;
  const { mask, glow } = lightCanvases(lights);
  k.globalCompositeOperation = 'destination-out'; k.drawImage(mask, 0, 0);
  c.drawImage(shade, 0, 0);
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = alpha; c.drawImage(glow, 0, 0); c.restore();
}
